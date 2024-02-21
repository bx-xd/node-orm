# Node Base ORM

## Intention

This is a humble beat of code inspired by Rails' ActiveRecord. My goal was to rebuild skeleton of ActiveRecord in plain Javascript ! I know, I know, there's a lot of it already...

## Setup

To run and try this ORM, run in your terminal :

To install depencies : `yarn install` or `npm install` or `pnpm install`

To try it run `node`

`const orm = await import('./main.js')`

`const Post = orm.Post`

And ready to run

## To play

###### List all Post

```javascript
let posts = await Post.all()
```

###### To Create a Post

```javascript
let p1 = await Post.create({title: 'hello from terminal !', content: 'This is very fun !'})
```

###### To update a Post

```javascript
let last = await Post.last()
let p2 = await Post.find(last.id)
p2 // return the last Post instance
await p2.update({title: 'New Funny Title !'})
```

###### To Find a Post

```javascript
let last = await Post.all()
let post = await Post.find(last.id)
```

###### To Delete a Post

```javascript
let last = await Post.all()
last.delete()
```
