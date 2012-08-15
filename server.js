var express = require('express')
  , mongo = require('mongoskin')
  , mu = require('mu2')
  , async = require('async')
  , Post = require('./models/post')
  , app = express.createServer();

var db = mongo.db('mongo://localhost/test');
Post.db = db;


mu.root = __dirname + '/templates';


APP_DIR = __dirname;



// Add some middleware
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.logger());


app.use(function (req, res, next) {
  var token = req.cookies.token;

  db.collection('sessions')
    .findOne({_id: token}, function (err, user) {
      if (err) return next(err);

      req.user = user;
      next();
    });
});


// Setup a route
app.get('/posts', function (req, res, next) {
  Post.findNewestPostsWithComments(function (err, posts) {
    if (err) return next(err);

    var view = {
      user: req.user,
      posts: posts
    };

    res.writeHead(200, {});
    var stream = mu.compileAndRender('posts.html', view);
    stream.pipe(res);
  });
});


app.get('/posts/:postId', function (req, res, next) {
  var postId = req.params.postId;

  Post.findByIdWithComments(postId, function (err, post) {
    if (err) return next(err);

    var view = {
      user: req.user,
      post: post
    };

    res.writeHead(200, {});
    mu.compileAndRender('post.html', view).pipe(res);
  });
});



app.post('/posts', function (req, res, next) {
  var id = 'post-' + Date.now();

  db.collection('posts')
    .insert({
      _id: id,
      createdAt: new Date(),
      title: req.body.title
    }, {
      safe: true
    }, function (err) {
      if (err) {
        res.send(500, {error: 'Something blew up: ' + err.message});
      } else {
        res.header('Location', '/posts/' + id);
        res.json({ok: true, id: id}, 201);
      }
    })
});


app.post('/posts/:postId/comments', function (req, res, next) {
  var id = 'comment-' + Date.now();

  db.collection('comments')
    .insert({
      _id: id,
      postId: req.params.postId,
      createdAt: new Date(),
      comment: req.body.comment
    }, {
      safe: true
    }, function (err) {
      if (err) {
        res.send(500, {error: 'Something blew up: ' + err.message});
      } else {
        res.json({ok: true, id: id}, 201);
      }
    })
});


app.error(function (req, res, next, error) {

});


app.listen(process.env.PORT || 8000);
