
You need to boot mongodb on you local host to get this to work.

To add data:

```
$ curl localhost:9000/posts -d 'title=#VegasTech on the rise.'
-> {"ok":true,"id":"post-1344987701692"}

curl localhost:9000/posts/post-1344987701692/comments -d 'comment=Year over year, way up!'
-> {"ok":true,"id":"comment-1344990183230"}
```
