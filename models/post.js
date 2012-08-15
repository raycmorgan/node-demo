var async = require('async');


exports.findById = findById;
exports.findNewest = findNewest;
exports.findCommentsWithPostIds = findCommentsWithPostIds;
exports.findNewestWithComments = findNewestWithComments;
exports.findByIdWithComments = findByIdWithComments;


// Public

function findById(id, callback) {
  exports.db.collection('posts')
    .findOne({_id: id}, callback);
}

function findNewest(callback) {
  exports.db.collection('posts')
    .find()
    .limit(10)
    .sort([['createdAt', -1]])
    .toArray(callback);
}

function findCommentsWithPostIds(postIds, callback) {
  exports.db.collection('comments')
    .find({postId: {$in: postIds}})
    .toArray(callback);
}

function findNewestWithComments(callback) {
  exports.findNewest(function (err, posts) {
    if (err) return callback(err);

    var postIds = posts.map(gather('_id'));

    exports.findCommentsWithPostIds(postIds, function (err, comments) {
      if (err) return callback(err);

      callback(null, zipPostAndComments(posts, comments));
    });
  });
}

function findByIdWithComments(id, callback) {
  async.parallel({
    post: findById.bind(this, id),
    comments: findCommentsWithPostIds.bind(this, [id])
  }, function (err, result) {
    if (err) return callback(err);
    result.post.comments = result.comments;

    callback(null, result.post);
  });
}


// Private Helpers

function gather(key) {
  return function (obj) {
    return obj[key];
  };
}

function zipPostAndComments(posts, comments) {
  posts.forEach(function (post) {
    post.comments = comments.filter(function (comment) {
      return comment.postId == post._id;
    });
  });

  return posts;
}
