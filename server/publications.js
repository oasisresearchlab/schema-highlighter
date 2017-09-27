Meteor.publish('posts', function() {
  return Posts.find();
});

Meteor.publish('documents', function() {
  return Documents.find();
});

Meteor.publish('sentences', function() {
  return Sentences.find();
});

Meteor.publish('words', function() {
  return Words.find();
});

Meteor.publish('myUsers', function() {
    return MyUsers.find();
})