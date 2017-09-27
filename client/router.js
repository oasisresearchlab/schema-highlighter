var logger = new Logger('Client:router');

Logger.setLevel('Client:router', 'trace');
// Logger.setLevel('Client:annotate', 'debug');
// Logger.setLevel('Client:annotate', 'info');
// Logger.setLevel('Client:annotate', 'warn');

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [
        Meteor.subscribe('posts'),
        Meteor.subscribe('myUsers'),
        // Meteor.subscribe('documents'),
        // Meteor.subscribe('sentences'),
        // Meteor.subscribe('words')
    ];
  }
});

Router.map(function() {

    // this.route('/', {name: 'postsList'});

    this.route('/posts/:_id', {
        name: 'postPage',
        data: function() { return Posts.findOne(this.params._id); }
    });

    this.route('Land', {
        name: 'Land',
        path: '/',
        template: 'land',
        subscriptions: function()  {
            this.subscribe("documents");
        },
        onBeforeAction: function() {
            if (this.ready()) {
                $('.navbar-brand').text("Annotator: Welcome");
                this.next();
            }
        }
    });

    this.route('Tutorial', {
        name: 'Tutorial',
        path: '/tutorial/:userID',
        template: 'tutorial',
        subscriptions: function() {
            this.subscribe("documents");
        },
        onBeforeAction: function() {
            if(this.ready()) {
                $('.navbar-brand').text("Annotator: Welcome >> Tutorial");
                setCurrentUser(this.params.userID);
                if (LocalWords.find().count() > 0) {
                  var randomWord = LocalWords.findOne();
                  if (randomWord.hasOwnProperty("sentenceID")) {
                    // coming back from main page
                    LocalWords = new Mongo.Collection(null);
                    trainTutorialWords.forEach(function(word) {
                      LocalWords.insert(word);
                    });
                  }
                } else {
                  LocalWords = new Mongo.Collection(null);
                  trainTutorialWords.forEach(function(word) {
                    LocalWords.insert(word);
                  });
                }
                this.next();
            }
        },
    });

    this.route('Annotate', {
        name: 'Annotate',
        path: '/annotate/:userID/:docID',
        template: 'annotationPage',
        subscriptions: function() {
            // this.subscribe("documents", {_id: this.params.docID});
            this.subscribe("summaries");
            this.subscribe("sentences", {docID: this.params.docID});
            // this.subscribe("words", {docID: this.params.docID});
        },
        waitOn: function() {
            // logger.trace("From waitOn, current words: " + JSON.stringify(Words.find({docID: doc._id}).fetch()));
            logger.debug("Subscribing to documents and words collection in waitOn...")
            return [
              Meteor.subscribe("documents", {_id: this.params.docID}),
              Meteor.subscribe("words", {docID: this.params.docID}),
              // Meteor.subscribe("summaries"),
              // Meteor.subscribe("sentences", {docID: this.params.docID})
          ];
          this.next();
        },
        onBeforeAction: function() {
            if(this.ready()) {
                // var doc = DocumentManager.sampleDocument();
                logger.debug("Ready! Setting session variables...");
                var doc = Documents.findOne({_id: this.params.docID});
                Session.set("currentDoc", doc);
                $('.navbar-brand').text("Annotator: Welcome >> Tutorial >> Main Task");
                setCurrentUser(this.params.userID);
                logger.trace("Current doc: " + JSON.stringify(doc));
                var dbWords = Words.find({docID: doc._id}).fetch();
                logger.trace("From beforeAction, " + dbWords + " current words: ");
                // logger.trace(dbWords.length + "dbWords");
                if (LocalWords.find().count() < 1) { // newly created local
                  // LocalWords = new Mongo.Collection(null);
                  dbWords.forEach(function(word) {
                    // logger.trace("Inserting word " + JSON.stringify(word) + " into local words collection");
                    LocalWords.insert(word);
                  });
                } else { // refreshed, or going from next page
                  var randomWord = LocalWords.findOne();
                  if (!randomWord.hasOwnProperty("sentenceID")) {
                    // reset if we're coming from the tutorial page
                    LocalWords = new Mongo.Collection(null);
                    dbWords.forEach(function(word) {
                      // logger.trace("Inserting word " + JSON.stringify(word) + " into local words collection");
                      LocalWords.insert(word);
                    });
                  }
                }
                logger.trace(LocalWords.find().count() + "local words");
                EventLogger.logBeginDocument(this.params.docID);
                this.next();
            }
        },
    })

    this.route('Finish', {
        name: 'Finish',
        path: '/finish/',
        template: 'finishPage',
        onBeforeAction: function() {
            if(this.ready()) {
                $('.navbar-brand').text("Annotator: Welcome >> Tutorial >> Main Task >> Finish");
                this.next();
            }
        },
    })

})

var setCurrentUser = function(userID) {
    var user = MyUsers.findOne({_id: userID});
    Session.set("currentUser", user);
}
