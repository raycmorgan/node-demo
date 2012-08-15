function gatherIds(obj) {
  return obj._id;
}


function findNewestPosts(callback) {
  db.collection('posts')
    .find()
    .limit(10)
    .sort([['createdAt', -1]])
    .toArray(callback);
}


function findCommentsWithPostIds(postIds, callback) {
  db.collection('comments')
    .find({postId: {$in: postIds}})
    .toArray(callback);
}

function findNewestPostsWithComments(callback) {
  findNewestPosts(function (err, posts) {
    if (err) return callback(err);

    var postIds = posts.map(gatherIds);

    findCommentsWithPostIds(function (err, comments) {
      if (err) return callback(err);

      posts.forEach(function (post) {
        post.comments = comments.filter(function (comment) {
          return comment.postId == post._id;
        });
      });

      callback(null, posts);
    });
  });
}

exports.findNewestPosts = findNewestPosts;
exports.findCommentsWithPostIds = findCommentsWithPostIds;
exports.findNewestPostsWithComments = findNewestPostsWithComments;























