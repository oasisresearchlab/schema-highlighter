var logger = new Logger('collections:WordManager');

Logger.setLevel('collections:WordManager', 'trace');
// Logger.setLevel('collections:WordManager', 'debug');
// Logger.setLevel('collections:WordManager', 'info');
// Logger.setLevel('collections:WordManager', 'warn');

Words = new Mongo.Collection('words');

Word = function (content, sequence, globalPsn, sentence) {

    this.sentenceID = sentence._id;
    this.docID = sentence.docID;

    // the word (string)
    this.content = content;

    // the word's position in the sentence
    this.sequence = sequence;

    // the word's global position in the document
    this.globalPsn = globalPsn;

    // highlights - array of userIDs
    // who have highlighted this word
    this.highlightsPurpose = [];
    this.highlightsMechanism = [];
    this.highlightsFindings = [];
    this.highlightsBackground = [];
}

WordManager = (function() {
    return {
        markWord: function(wordID, userID, type) {
            /******************************************************************
             * Mark the word with appropriate annotation for that user
             * @params
             *    wordID - the id of the word being annotated
             *    userID - the user making the annotation
             *    type (str) - problem, mechanism, or neither
             *****************************************************************/
            var previousState = this.getCurrentState(wordID, userID);
            if (type === "Purpose") {
                logger.debug("Adding " + userID + " to highlightsPurpose for " + wordID);
                Words.update({_id: wordID},{$addToSet: {highlightsPurpose: userID}});
                Words.update({_id: wordID},{$pull: {highlightsMechanism: userID}});
                Words.update({_id: wordID},{$pull: {highlightsFindings: userID}});
                Words.update({_id: wordID},{$pull: {highlightsBackground: userID}});
                // EventLogger.logMarkPurpose(wordID, previousState);
            } else if (type === "Mechanism") {
                logger.debug("Adding " + userID + " to highlightsMechanism for " + wordID);
                Words.update({_id: wordID},{$pull: {highlightsPurpose: userID}});
                Words.update({_id: wordID},{$addToSet: {highlightsMechanism: userID}});
                Words.update({_id: wordID},{$pull: {highlightsFindings: userID}});
                Words.update({_id: wordID},{$pull: {highlightsBackground: userID}});
                // EventLogger.logMarkMechanism(wordID, previousState);
            } else if (type === "Finding"){
                logger.debug("Adding " + userID + " to highlightsFinding for " + wordID);
                Words.update({_id: wordID},{$pull: {highlightsPurpose: userID}});
                Words.update({_id: wordID},{$pull: {highlightsMechanism: userID}});
                Words.update({_id: wordID},{$addToSet: {highlightsFindings: userID}});
                Words.update({_id: wordID},{$pull: {highlightsBackground: userID}});
                // EventLogger.logMarkFinding(wordID, previousState);
            } else if (type === "Background"){
                logger.debug("Adding " + userID + " to highlightsBackground for " + wordID);
                Words.update({_id: wordID},{$pull: {highlightsPurpose: userID}});
                Words.update({_id: wordID},{$pull: {highlightsMechanism: userID}});
                Words.update({_id: wordID},{$pull: {highlightsFindings: userID}});
                Words.update({_id: wordID},{$addToSet: {highlightsBackground: userID}});
                // EventLogger.logMarkBackground(wordID, previousState);
            } else {
                logger.debug("Neither: un-annotating");
                Words.update({_id: wordID},{$pull: {highlightsPurpose: userID}});
                Words.update({_id: wordID},{$pull: {highlightsMechanism: userID}});
                Words.update({_id: wordID},{$pull: {highlightsFindings: userID}});
                Words.update({_id: wordID},{$pull: {highlightsBackground: userID}});
                // EventLogger.logUnmarkWord(wordID, previousState);
            }
            return true;
        },
        updateWords: function(doc, localWords, user) {
          // hack to update the server-side words collection on the server side post-hoc so we don't have to
          // queue up 100's of write requests from the client while highlighting words
          logger.debug("Updating " + localWords.length + " words on the server side...");

          localWords.forEach(function(word) {
            if (isInList(user._id, word.highlightsPurpose)) {//word.highlightsPurpose.length > 0) {
              logger.trace("User " + user._id + " highlighted purpose word in localWords: " + word.content);
              Words.update({_id: word._id},{$addToSet: {highlightsPurpose: user._id}})
            }
            if (isInList(user._id, word.highlightsMechanism)) {
              logger.trace("User " + user._id + " highlighted mechanism word in localWords: " + word.content);
              Words.update({_id: word._id},{$addToSet: {highlightsMechanism: user._id}})
            }
            if (isInList(user._id, word.highlightsFindings)) {
              logger.trace("User " + user._id + " highlighted findings word in localWords: " + word.content);
              Words.update({_id: word._id},{$addToSet: {highlightsFindings: user._id}})
            }
            if (isInList(user._id, word.highlightsBackground)) {
              logger.trace("User " + user._id + " highlighted background word in localWords: " + word.content);
              Words.update({_id: word._id},{$addToSet: {highlightsBackground: user._id}})
            }
          });
          logger.debug("Updated!");
          var highlightedWords = "";
          Words.find({docID: doc._id}).forEach(function(word){
            ["highlightsPurpose", "highlightsMechanism", "highlightsBackground", "highlightsFindings"].forEach(function(field) {
              if (isInList(user._id, word[field])) {
                var toAdd = word.content + " ";
                highlightedWords += toAdd;
              }
            })
          });
          logger.trace("Highlighted words after words update: " + highlightedWords);
        },
        getCurrentState: function(wordID, userID) {
            var word = Words.findOne({_id: wordID});
            if (isInList(userID, word.highlightsPurpose)) {
                return "Purpose";
            } else if (isInList(userID, word.highlightsMechanism)) {
                return "Mechanism";
            } else if (isInList(userID, word.highlightsFindings)) {
                return "Findings";
            } else if (isInList(userID, word.highlightsBackground)) {
                return "Background";
            } else {
                return "Unmarked";
            }
        },
    }
}());
