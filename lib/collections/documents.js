var logger = new Logger('collections:DocumentManager');

Logger.setLevel('collections:DocumentManager', 'trace');
// Logger.setLevel('collections:DocumentManager', 'debug');
// Logger.setLevel('collections:DocumentManager', 'info');
// Logger.setLevel('collections:DocumentManager', 'warn');

Documents = new Mongo.Collection('documents');
Summaries = new Mongo.Collection('summaries');

Document = function(fileName) {

    this.title = fileName;

    // array of sentence IDs
    this.sentences = [];

    this.sampledBy = [];

    // array of userIDs that have seen this document
    // and made at least one annotation
    this.annotatedBy = [];

    // array of summary IDs
    this.summaries = [];
}

Summary = function(doc, sumType, content, user) {

    this.docID = doc._id;

    this.sumType = sumType;

    this.content = content;

    this.userID = user._id;
}

DocumentManager = (function() {
    return {
        sampleDocument: function(userID) {
            /******************************************************************
             * Sample a document for a given user to annotate
             * and make sure that the document hasn't been annotated
             * by that person already
             * @params
             *    userID - the id of the user we want to serve
             *****************************************************************/
            logger.debug("Sampling a document...");
            var documents = Documents.find().fetch();
            logger.trace(documents.length + " available documents")
            indices = []
            documents.forEach(function(doc) {
                indices.push({'index': documents.indexOf(doc),
                              'numAnnotations': doc.annotatedBy.length,
                              'numSamples': doc.sampledBy.length});
            })
            // indices.sort(function(a, b) {return a.numAnnotations-b.numAnnotations});
            indices.sort(function(a, b) {return a.numSamples-b.numSamples});
            logger.trace("Indices: " + JSON.stringify(indices));
            for (i=0; i<indices.length; i++) {
                sampledDoc = documents[indices[i].index];
                logger.trace(JSON.stringify(sampledDoc));
                logger.trace("Sampled " + sampledDoc.title + " with " +
                    // sampledDoc.annotatedBy.length + " annotations");
                    sampledDoc.sampledBy.length + " samples");
                if (!isInList(userID, sampledDoc.annotatedBy)) {
                    logger.debug("User hasn't finished this doc");
                    break;
                } else {
                    logger.debug("User has finished this doc");
                }
            }
            DocumentManager.markSampledBy(sampledDoc, MyUsers.findOne(userID));
            return sampledDoc;
            // var hasAnnotated = true;
            // do {
            //     var randDoc = getRandomElement(documents);
            //     if (!isInList(userID, randDoc.annotatedBy)) {
            //         hasAnnotated = false;
            //     }
            // } while (hasAnnotated);
            // return randDoc;
        },
        createDocument: function(docPackage) {
            /******************************************************************
             * Create a document
             * @params
             *    docPackage - a JSON object with fields "title" and
             *                 "sentences" (an array of sentences)
             *****************************************************************/
             var doc;
             if (docPackage.hasOwnProperty("title")) {
               doc = new Document(docPackage.title);
             } else {
               doc = new Document(docPackage.paperID);
             }

             var docID = Documents.insert(doc);
             if (docID) {
               var seq = 1;
               var lastGlobal = 0;
               docPackage.sentences.forEach(function(sentence) {
                  lastGlobal = SentenceFactory.createSentence(docID, sentence, seq, lastGlobal);
                  seq += 1;
               });
               logger.trace("Successfully inserted doc: " + JSON.stringify(doc));
             } else {
               logger.trace("FAILED to insert doc: " + JSON.stringify(doc));
             }

        },
        addSummary: function(doc, sumType, content, user) {
            var summary = new Summary(doc, sumType, content, user);
            sumID = Summaries.insert(summary, function() {});
            logger.trace("Successfully inserted new summary: " + JSON.stringify(summary));
            Documents.update({_id: doc._id}, {$addToSet: {summaries: sumID}}, {}, function() {}); // add empty callback so we don't hold up the client when we call this server-side
            return summary;
        },
        isAnnotatedBy: function(doc, user) {
            var docWords = Words.find({docID: doc._id}).fetch();

            var hasPurpose = false;
            var hasMechanism = false;
            docWords.forEach(function(docWord) {
                if (isInList(user._id, docWord.highlightsPurpose)) {
                    hasPurpose = true;
                }
                if (isInList(user._id, docWord.highlightsMechanism)) {
                    hasMechanism = true;
                }
            });

            if (hasPurpose && hasMechanism) {
                return true;
            } else {
                return false;
            }
        },
        markSampledBy: function(doc, user) {
          Documents.update({_id: doc._id},
                          {$addToSet: {sampledBy: user._id}});
        },
        markAnnotatedBy: function(doc, user) {
            Documents.update({_id: doc._id},
                            {$addToSet: {annotatedBy: user._id}});
        }
    }
}());
