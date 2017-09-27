var logger = new Logger('Server:fixtures');

Logger.setLevel('Server:fixtures', 'trace');
// Logger.setLevel('Server:fixtures', 'debug');
// Logger.setLevel('Server:fixtures', 'info');
// Logger.setLevel('Server:fixtures', 'warn');

if (Posts.find().count() === 0) {
  Posts.insert({
    title: 'Introducing Telescope',
    url: 'http://sachagreif.com/introducing-telescope/'
  });

  Posts.insert({
    title: 'Meteor',
    url: 'http://meteor.com'
  });

  Posts.insert({
    title: 'The Meteor Book',
    url: 'http://themeteorbook.com'
  });
}

if (Documents.find().count() == 0) {
  // var doc = new Document("Dummy");
  // var docID = Documents.insert(doc);
  // SentenceFactory.createSentence(docID, "This is a sentence", 1);
  // SentenceFactory.createSentence(docID, "Another dummy sentence", 2);
  // SentenceFactory.createSentence(docID, "A third dummy sentence", 3);
  // var desiredNum = 20;
  // console.log(desiredNum);
  // for (i=0; i<20; i++) {
  //   console.log("Creating document " + i);
  //   DocumentManager.createDocument(quirkyDocs[i]);
  // }

  // var desiredNum = 5;
  // // var desiredNum = quirkyDocs.length;
  // logger.debug("Documents empty, inserting first " + desiredNum + " docs from Quirky data");
  // var quirkyDocsSubset = quirkyDocs.slice(0,desiredNum);
  // quirkyDocsSubset.forEach(function(doc) {
  //   DocumentManager.createDocument(doc);
  // });

  // quirkyDocs.forEach(function(doc) {
  kcDocs.forEach(function(doc) {
    // if (doc.sample == 1) {
      DocumentManager.createDocument(doc);
    // }
  });
  logger.debug("Successfully inserted " + Documents.find().count() + " documents!");

  // index for hopefully faster performance!
  // Sentences._ensureIndex({docID: 1});
  // Words._ensureIndex({sentenceID: 1});
}
