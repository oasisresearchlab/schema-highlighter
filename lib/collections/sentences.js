Sentences = new Mongo.Collection('sentences');

Sentence = function(docID, content, psn) {

    this.docID = docID;
    this.psn = psn;

    this.content = content;

    // array of word ids
    this.wordIDs = [];
}

SentenceFactory = (function() {
    return {
        createSentence: function(docID, content, psn, lastGlobal) {
            var sent1 = new Sentence(docID, content, psn);
            var sent1ID = Sentences.insert(sent1);
            sent1 = Sentences.findOne({_id: sent1ID});
            // var words = sent1.content.split(" ");
            var words = treebankTokenizer.tokenize(sent1.content)
            var wordIDs = [];
            var lastLocal = 1;
            for (i=0; i < words.length; i++) {
              var word = new Word(words[i], i+1, lastGlobal+i+1, sent1);
              wordID = Words.insert(word);
              wordIDs.push(wordID);
              lastLocal += 1;
            }
            Sentences.update({_id: sent1ID},{$push: {wordIDs: wordIDs}});
            Documents.update({_id: docID}, {$addToSet: {sentences: sent1ID}});
            return lastGlobal + lastLocal;
        },
    };
}());
