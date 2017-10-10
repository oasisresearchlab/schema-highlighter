Meteor.publish('posts', function() {
  return Posts.find();
});

Meteor.publish('documents', function() {
  return Documents.find();
});

Meteor.publish("document", function(docID) {
  return Documents.find({_id: docID});
})

Meteor.publish('sentences', function() {
  return Sentences.find();
});

Meteor.publish('docSentences', function(docID) {
  return Sentences.find({docID: docID})
})

Meteor.publish('words', function() {
  return Words.find();
});

Meteor.publish('docWords', function(docID) {
  return Words.find({docID: docID})
})

Meteor.publish('myUsers', function() {
    return MyUsers.find();
})
