var logger = new Logger('Server:server-functions');

Logger.setLevel('Server:server-functions', 'trace');
// Logger.setLevel('Client:annotate', 'debug');
// Logger.setLevel('Client:annotate', 'info');
// Logger.setLevel('Client:annotate', 'warn');

Meteor.methods({
    writeSummary: function(doc, sumType, content, user) {
        logger.trace("Calling write summary on the server");
        if (sumType === "Highlights") {
          return [
            DocumentManager.addSummary(doc, sumType, content, user),
            WordManager.updateWords(doc, content, user)
          ];
        } else {
          return [
            DocumentManager.addSummary(doc, sumType, content, user),
          ];
        }
    },
    addWordsHighlightField: function(fieldName) {
      var allWords = Words.find().fetch();
      allWords.forEach(function(word) {
        var operation = {}
        operation[fieldName] = [];
        Words.update({_id: word._id},{$set: operation})
      })
    }
});
