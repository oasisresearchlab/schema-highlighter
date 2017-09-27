var logger = new Logger('Client:tutorial');

Logger.setLevel('Client:tutorial', 'trace');
// Logger.setLevel('Client:tutorial', 'debug');
// Logger.setLevel('Client:tutorial', 'info');
// Logger.setLevel('Client:tutorial', 'warn');

LocalWords = new Mongo.Collection(null);
var currentStart = 0;
var currentEnd = 0;

Template.tutorial.rendered = function() {
  Session.set("highlightState", "none");


}

Template.tutorial.helpers({
  testWords: function() {
    return LocalWords.find().fetch();;
  },
  goldWords: function() {
    return goldTutorialWords;
  },
  highlightDescription: function() {
    if (!Session.equals("highlightState", "none")) {
      return highlightDescriptions[Session.get("highlightState")]
    } else {
      return "are just words";
    }
  },
  statusBackground: function() {
    if (Session.equals("highlightState", "background")) {
      return "ing";
    } else {
      return "";
    }
  },
  statusPurpose: function() {
    if (Session.equals("highlightState", "purpose")) {
      return "ing";
    } else {
      return "";
    }
  },
  statusMechanism: function() {
    if (Session.equals("highlightState", "mechanism")) {
      return "ing";
    } else {
      return "";
    }
  },
  statusFinding: function() {
    if (Session.equals("highlightState", "finding")) {
      return "ing";
    } else {
      return "";
    }
  },
  statusUnmark: function() {
    if (Session.equals("highlightState", "unmark")) {
      return "ing";
    } else {
      return "";
    }
  },
  score: function() {
    return scoreTutorial();
  }
})

Template.goldWord.helpers({
    keyType: function() {
      var userID = "gold";
      if (isInList(userID, this.highlightsPurpose)) {
          // logger.debug("isPurpose is true");
          return "key-purpose";
      } else if (isInList(userID, this.highlightsMechanism)) {
          return "key-mechanism"
      } else if (isInList(userID, this.highlightsFindings)) {
          return "key-finding"
      } else if (isInList(userID, this.highlightsBackground)) {
          return "key-background"
      } else {
        return "key-neutral"
      }
    },
});

Template.tutorial.events({
    'mouseup': function(event) {
      // catch mouseups that happen if ppl are too quick when switching highlights
      if (Session.equals("isHighlighting", true)) {
        logger.debug("Mouse up out of the doc, ending highlight...");
        Session.set("isHighlighting", false);
      }
    },
    'click .test' : function() {
      var user = Session.get("currentUser");
      var score = scoreTutorial();
      var highlights = LocalWords.find().fetch();
      EventLogger.logCheckTutorialAccuracy(user, score, highlights)
      // var dataStatus = checkData();
      var dataStatus = "allGood";
      if (dataStatus === "allGood") {
        $('.gold-example').toggle();
        // $('trial-result-filler').hide();
        $('.trial-result').show();
        $('.trial-names').show();
        $('.continue').prop('disabled', false);
        UserManager.recordTutorialAccuracy(user, score, highlights)
      } else {
        alert(checkWarnings[dataStatus])
      }
      // // var dataOk = true;
      // if (isAnnotatedBy(Session.get("currentUser")) && mostlyAnnotatedBy(Session.get("currentUser"))) {
      //   alert("")
      // } else if (!isAnnotatedBy(Session.get("currentUser"))) {
      //   alert("Please use all of the highlight types! " +
      //   "If you really think one of the highlight types is missing from the abstract, just mark a random punctuation with it.");
      // } else if (!mostlyAnnotatedBy(Session.get("currentUser"))) {
      //   alert("Please highlight all of the relevant parts of the abstract! " +
      //   "Most abstracts only have 1 sentence at most that doesn't fit into our highlight types.");
      // } else {
      //   $('.gold-example').toggle();
      //   $('.trial-result').toggle();
      // }
    },
    'click .continue' : function() {
        logger.debug("User clicked continue");
        EventLogger.logFinishTutorial();
        var user = Session.get("currentUser");
        if (user) {
            var doc = DocumentManager.sampleDocument(user._id);
            logger.trace("Sending user to annotation task with document " + JSON.stringify(doc));
            Router.go("Annotate", {userID: user._id,
                                    docID: doc._id});
        } else {
            logger.warn("User is not logged in");
            alert("You need to have entered your MTurkID to continue");
            Router.go("Land")
        }
    },
    'click .init-highlight': function(event) {
      var button = event.currentTarget;
      $('.init-highlight').removeClass("active-" + Session.get("highlightState"));
      $('.highlight-description').show();
      $('.highlight-description').removeClass("key-" + Session.get("highlightState"));
      if (!isInList("unmark", button.classList)) {
        if (isInList("purpose", button.classList)) {
          Session.set("highlightState", "purpose");
        } else if (isInList("mechanism", button.classList)) {
          Session.set("highlightState", "mechanism");
        } else if (isInList("finding", button.classList)) {
          Session.set("highlightState", "finding");
        } else if (isInList("background", button.classList)) {
          Session.set("highlightState", "background");
        } else {
        }
        // button.classList.add("active-" + Session.get("highlightState"));
        $('.highlight-description').addClass("key-" + Session.get("highlightState"));
      } else {
        Session.set("highlightState", "unmark");
        $('.highlight-description').hide();
      }
      button.classList.add("active-" + Session.get("highlightState"));
    },
});

Template.tutorialWord.rendered = function(){
  // var doc = Session.get("currentDoc");
  // logger.trace("Current doc: " + JSON.stringify(doc));
  // var dbWords = Words.find({docID: doc._id}).fetch();
  // logger.trace(dbWords.length + "dbWords");
  // if (LocalWords.find().count() < 1) { // newly created local
  //   // LocalWords = new Mongo.Collection(null);
  //   dbWords.forEach(function(word) {
  //     // logger.trace("Inserting word " + JSON.stringify(word) + " into local words collection");
  //     LocalWords.insert(word);
  //   });
  // } else { // refreshed, or going from next page
  //   var randomWord = LocalWords.findOne();
  //   if (!randomWord.hasOwnProperty("sentenceID")) {
  //     // reset if we're coming from the tutorial page
  //     LocalWords = new Mongo.Collection(null);
  //     dbWords.forEach(function(word) {
  //       // logger.trace("Inserting word " + JSON.stringify(word) + " into local words collection");
  //       LocalWords.insert(word);
  //     });
  //   }
  // }
  // logger.trace(LocalWords.find().count() + "local words");
  logger.debug("Rendered word...");
}

Template.tutorialWord.helpers({
    keyType: function() {
      var userID = Session.get("currentUser")._id;
      if (isInList(userID, this.highlightsPurpose)) {
          // logger.debug("isPurpose is true");
          return "key-purpose";
      } else if (isInList(userID, this.highlightsMechanism)) {
          return "key-mechanism"
      } else if (isInList(userID, this.highlightsFindings)) {
          return "key-finding"
      } else if (isInList(userID, this.highlightsBackground)) {
          return "key-background"
      } else {
        return "key-neutral"
      }
    },
});

Template.tutorialWord.events({
    'mousedown .token': function(event) {
      if (Session.get("highlightState") != "none") {
          logger.debug("Begin highlight");
          Session.set("isHighlighting", true);
          var word = event.currentTarget;
          logger.trace(word.innerHTML);
          var wordID = trimFromString(word.id, "word-");
          // currentStart.s = Sentences.findOne(Words.findOne(wordID).sentenceID).psn;
          currentStart = LocalWords.findOne(wordID).globalPsn;
          markWord(wordID);
      }
    },

    'mouseup .token': function(event) {
      logger.debug("End highlight");
      Session.set("isHighlighting", false);
    },

    'mouseover .token': function(event) {
      logger.debug("Hovering over token");
      if (Session.get("isHighlighting")) {
        var word = event.currentTarget;
        logger.trace(word.innerHTML);
        var wordID = trimFromString(word.id, "word-");
        // currentEnd.s = Sentences.findOne(Words.findOne(wordID).sentenceID).psn;
        // currentEnd.w = Words.findOne(wordID).sequence;
        currentEnd = LocalWords.findOne(wordID).globalPsn;
        logger.trace("Current start: " + currentStart);
        logger.trace("Current end: " + currentEnd);

        var selectedWords = LocalWords.find({//docID: Session.get("currentDoc")._id,
                                        globalPsn: {$gte: currentStart,
                                                    $lte: currentEnd}
                                        }).fetch();
        logger.trace("Selected words: " + selectedWords);
        // mark all of these words
        selectedWords.forEach(function(w) {
          markWord(w._id);
        });
      }
    },
})

var scoreTutorial = function() {
  var highlightedWords = LocalWords.find().fetch();
  var numCorrect = 0;
  for (i=0; i < highlightedWords.length; i++) {
    if (highlightType(highlightedWords[i]) === highlightType(goldTutorialWords[i])) {
      numCorrect += 1;
    }
  }
  var score = numCorrect/highlightedWords.length*100;
  return score.toString().substring(0,4) + "%";
}

var highlightType = function(word) {
  /*
  Might regret writing this. Dumb greedy function that just
  returns the last highlight field in the list of fields that has any user who marked it.
  */
  var fields = [
    "highlightsPurpose",
    "highlightsMechanism",
    "highlightsFindings",
    "highlightsBackground",
  ]
  var result = "none";
  fields.forEach(function(field) {
    if (word[field].length > 0) {
      result = field;
    }
  });
  return result;
}

highlightDescriptions = {
  "purpose": "What do the paper's authors want to do or know?",
  "mechanism": "How did the paper's authors do it or find out?",
  "finding": "Did it work? What did the paper's authors find out?",
  "background": "What is the intellectual context of this work? What other (higher-level) goals/questions can be furthered by this work? How might this help other research(ers)?",
  "unmark": "",
}

goldTutorialWords = [
  {
    "globalPsn": 0,
    "highlightsFindings": [],
    "content": "Though",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-0"
  },
  {
    "globalPsn": 1,
    "highlightsFindings": [],
    "content": "toolkits",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-1"
  },
  {
    "globalPsn": 2,
    "highlightsFindings": [],
    "content": "exist",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-2"
  },
  {
    "globalPsn": 3,
    "highlightsFindings": [],
    "content": "to",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-3"
  },
  {
    "globalPsn": 4,
    "highlightsFindings": [],
    "content": "create",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-4"
  },
  {
    "globalPsn": 5,
    "highlightsFindings": [],
    "content": "complex",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-5"
  },
  {
    "globalPsn": 6,
    "highlightsFindings": [],
    "content": "crowdsourced",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-6"
  },
  {
    "globalPsn": 7,
    "highlightsFindings": [],
    "content": "workflows,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-7"
  },
  {
    "globalPsn": 8,
    "highlightsFindings": [],
    "content": "there",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-8"
  },
  {
    "globalPsn": 9,
    "highlightsFindings": [],
    "content": "is",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-9"
  },
  {
    "globalPsn": 10,
    "highlightsFindings": [],
    "content": "limited",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-10"
  },
  {
    "globalPsn": 11,
    "highlightsFindings": [],
    "content": "support",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-11"
  },
  {
    "globalPsn": 12,
    "highlightsFindings": [],
    "content": "for",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-12"
  },
  {
    "globalPsn": 13,
    "highlightsFindings": [],
    "content": "management",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-13"
  },
  {
    "globalPsn": 14,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-14"
  },
  {
    "globalPsn": 15,
    "highlightsFindings": [],
    "content": "those",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-15"
  },
  {
    "globalPsn": 16,
    "highlightsFindings": [],
    "content": "workflows.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [
      "gold"
    ],
    "_id": "word-16"
  },
  {
    "globalPsn": 17,
    "highlightsFindings": [],
    "content": "Managing",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-17"
  },
  {
    "globalPsn": 18,
    "highlightsFindings": [],
    "content": "crowd",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-18"
  },
  {
    "globalPsn": 19,
    "highlightsFindings": [],
    "content": "workers",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-19"
  },
  {
    "globalPsn": 20,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-20"
  },
  {
    "globalPsn": 21,
    "highlightsFindings": [],
    "content": "tasks",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-21"
  },
  {
    "globalPsn": 22,
    "highlightsFindings": [],
    "content": "requires",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-22"
  },
  {
    "globalPsn": 23,
    "highlightsFindings": [],
    "content": "significant",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-23"
  },
  {
    "globalPsn": 24,
    "highlightsFindings": [],
    "content": "iteration",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-24"
  },
  {
    "globalPsn": 25,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-25"
  },
  {
    "globalPsn": 26,
    "highlightsFindings": [],
    "content": "experimentation",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-26"
  },
  {
    "globalPsn": 27,
    "highlightsFindings": [],
    "content": "on",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-27"
  },
  {
    "globalPsn": 28,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-28"
  },
  {
    "globalPsn": 29,
    "highlightsFindings": [],
    "content": "instructions,",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-29"
  },
  {
    "globalPsn": 30,
    "highlightsFindings": [],
    "content": "rewards,",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-30"
  },
  {
    "globalPsn": 31,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-31"
  },
  {
    "globalPsn": 32,
    "highlightsFindings": [],
    "content": "flows.",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-32"
  },
  {
    "globalPsn": 33,
    "highlightsFindings": [],
    "content": "We",
    "highlightsMechanism": [],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-33"
  },
  {
    "globalPsn": 34,
    "highlightsFindings": [],
    "content": "present",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-34"
  },
  {
    "globalPsn": 35,
    "highlightsFindings": [],
    "content": "CrowdWeaver,",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-35"
  },
  {
    "globalPsn": 36,
    "highlightsFindings": [],
    "content": "a",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-36"
  },
  {
    "globalPsn": 37,
    "highlightsFindings": [],
    "content": "system",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-37"
  },
  {
    "globalPsn": 38,
    "highlightsFindings": [],
    "content": "to",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-38"
  },
  {
    "globalPsn": 39,
    "highlightsFindings": [],
    "content": "visually",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-39"
  },
  {
    "globalPsn": 40,
    "highlightsFindings": [],
    "content": "manage",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-40"
  },
  {
    "globalPsn": 41,
    "highlightsFindings": [],
    "content": "complex",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-41"
  },
  {
    "globalPsn": 42,
    "highlightsFindings": [],
    "content": "crowd",
    "highlightsMechanism": [
    ],
    "highlightsPurpose": [
      "gold"
    ],
    "highlightsBackground": [],
    "_id": "word-42"
  },
  {
    "globalPsn": 43,
    "highlightsFindings": [],
    "content": "work.",
    "highlightsMechanism": [

    ],
    "highlightsPurpose": ["gold"],
    "highlightsBackground": [],
    "_id": "word-43"
  },
  {
    "globalPsn": 44,
    "highlightsFindings": [],
    "content": "The",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-44"
  },
  {
    "globalPsn": 45,
    "highlightsFindings": [],
    "content": "system",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-45"
  },
  {
    "globalPsn": 46,
    "highlightsFindings": [],
    "content": "supports",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-46"
  },
  {
    "globalPsn": 47,
    "highlightsFindings": [],
    "content": "the",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-47"
  },
  {
    "globalPsn": 48,
    "highlightsFindings": [],
    "content": "creation",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-48"
  },
  {
    "globalPsn": 49,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-49"
  },
  {
    "globalPsn": 50,
    "highlightsFindings": [],
    "content": "reuse",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-50"
  },
  {
    "globalPsn": 51,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-51"
  },
  {
    "globalPsn": 52,
    "highlightsFindings": [],
    "content": "crowdsourcing",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-52"
  },
  {
    "globalPsn": 53,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-53"
  },
  {
    "globalPsn": 54,
    "highlightsFindings": [],
    "content": "computational",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-54"
  },
  {
    "globalPsn": 55,
    "highlightsFindings": [],
    "content": "tasks",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-55"
  },
  {
    "globalPsn": 56,
    "highlightsFindings": [],
    "content": "into",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-56"
  },
  {
    "globalPsn": 57,
    "highlightsFindings": [],
    "content": "integrated",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-57"
  },
  {
    "globalPsn": 58,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-58"
  },
  {
    "globalPsn": 59,
    "highlightsFindings": [],
    "content": "flows,",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-59"
  },
  {
    "globalPsn": 60,
    "highlightsFindings": [],
    "content": "manages",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-60"
  },
  {
    "globalPsn": 61,
    "highlightsFindings": [],
    "content": "the",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-61"
  },
  {
    "globalPsn": 62,
    "highlightsFindings": [],
    "content": "flow",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-62"
  },
  {
    "globalPsn": 63,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-63"
  },
  {
    "globalPsn": 64,
    "highlightsFindings": [],
    "content": "data",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-64"
  },
  {
    "globalPsn": 65,
    "highlightsFindings": [],
    "content": "between",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-65"
  },
  {
    "globalPsn": 66,
    "highlightsFindings": [],
    "content": "tasks,",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-66"
  },
  {
    "globalPsn": 67,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-67"
  },
  {
    "globalPsn": 68,
    "highlightsFindings": [],
    "content": "allows",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-68"
  },
  {
    "globalPsn": 69,
    "highlightsFindings": [],
    "content": "tracking",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-69"
  },
  {
    "globalPsn": 70,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-70"
  },
  {
    "globalPsn": 71,
    "highlightsFindings": [],
    "content": "notification",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-71"
  },
  {
    "globalPsn": 72,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-72"
  },
  {
    "globalPsn": 73,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-73"
  },
  {
    "globalPsn": 74,
    "highlightsFindings": [],
    "content": "progress,",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-74"
  },
  {
    "globalPsn": 75,
    "highlightsFindings": [],
    "content": "with",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-75"
  },
  {
    "globalPsn": 76,
    "highlightsFindings": [],
    "content": "support",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-76"
  },
  {
    "globalPsn": 77,
    "highlightsFindings": [],
    "content": "for",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-77"
  },
  {
    "globalPsn": 78,
    "highlightsFindings": [],
    "content": "real-time",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-78"
  },
  {
    "globalPsn": 79,
    "highlightsFindings": [],
    "content": "modification.",
    "highlightsMechanism": [
      "gold"
    ],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-79"
  },
  {
    "globalPsn": 80,
    "highlightsFindings": [
      "gold"
    ],
    "content": "We",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-80"
  },
  {
    "globalPsn": 81,
    "highlightsFindings": [
      "gold"
    ],
    "content": "describe",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-81"
  },
  {
    "globalPsn": 82,
    "highlightsFindings": [
      "gold"
    ],
    "content": "the",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-82"
  },
  {
    "globalPsn": 83,
    "highlightsFindings": [
      "gold"
    ],
    "content": "system",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-83"
  },
  {
    "globalPsn": 84,
    "highlightsFindings": [
      "gold"
    ],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-84"
  },
  {
    "globalPsn": 85,
    "highlightsFindings": [
      "gold"
    ],
    "content": "demonstrate",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-85"
  },
  {
    "globalPsn": 86,
    "highlightsFindings": [
      "gold"
    ],
    "content": "its",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-86"
  },
  {
    "globalPsn": 87,
    "highlightsFindings": [
      "gold"
    ],
    "content": "utility",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-87"
  },
  {
    "globalPsn": 88,
    "highlightsFindings": [
      "gold"
    ],
    "content": "through",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-88"
  },
  {
    "globalPsn": 89,
    "highlightsFindings": [
      "gold"
    ],
    "content": "case",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-89"
  },
  {
    "globalPsn": 90,
    "highlightsFindings": [
      "gold"
    ],
    "content": "studies",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-90"
  },
  {
    "globalPsn": 91,
    "highlightsFindings": [
      "gold"
    ],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-91"
  },
  {
    "globalPsn": 92,
    "highlightsFindings": [
      "gold"
    ],
    "content": "user",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-92"
  },
  {
    "globalPsn": 93,
    "highlightsFindings": [
      "gold"
    ],
    "content": "feedback.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "word-93"
  }
]

trainTutorialWords = [
  {
    "globalPsn": 0,
    "highlightsFindings": [],
    "content": "Though",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w0"
  },
  {
    "globalPsn": 1,
    "highlightsFindings": [],
    "content": "toolkits",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w1"
  },
  {
    "globalPsn": 2,
    "highlightsFindings": [],
    "content": "exist",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w2"
  },
  {
    "globalPsn": 3,
    "highlightsFindings": [],
    "content": "to",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w3"
  },
  {
    "globalPsn": 4,
    "highlightsFindings": [],
    "content": "create",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w4"
  },
  {
    "globalPsn": 5,
    "highlightsFindings": [],
    "content": "complex",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w5"
  },
  {
    "globalPsn": 6,
    "highlightsFindings": [],
    "content": "crowdsourced",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w6"
  },
  {
    "globalPsn": 7,
    "highlightsFindings": [],
    "content": "workflows,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w7"
  },
  {
    "globalPsn": 8,
    "highlightsFindings": [],
    "content": "there",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w8"
  },
  {
    "globalPsn": 9,
    "highlightsFindings": [],
    "content": "is",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w9"
  },
  {
    "globalPsn": 10,
    "highlightsFindings": [],
    "content": "limited",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w10"
  },
  {
    "globalPsn": 11,
    "highlightsFindings": [],
    "content": "support",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w11"
  },
  {
    "globalPsn": 12,
    "highlightsFindings": [],
    "content": "for",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w12"
  },
  {
    "globalPsn": 13,
    "highlightsFindings": [],
    "content": "management",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w13"
  },
  {
    "globalPsn": 14,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w14"
  },
  {
    "globalPsn": 15,
    "highlightsFindings": [],
    "content": "those",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w15"
  },
  {
    "globalPsn": 16,
    "highlightsFindings": [],
    "content": "workflows.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w16"
  },
  {
    "globalPsn": 17,
    "highlightsFindings": [],
    "content": "Managing",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w17"
  },
  {
    "globalPsn": 18,
    "highlightsFindings": [],
    "content": "crowd",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w18"
  },
  {
    "globalPsn": 19,
    "highlightsFindings": [],
    "content": "workers",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w19"
  },
  {
    "globalPsn": 20,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w20"
  },
  {
    "globalPsn": 21,
    "highlightsFindings": [],
    "content": "tasks",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w21"
  },
  {
    "globalPsn": 22,
    "highlightsFindings": [],
    "content": "requires",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w22"
  },
  {
    "globalPsn": 23,
    "highlightsFindings": [],
    "content": "significant",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w23"
  },
  {
    "globalPsn": 24,
    "highlightsFindings": [],
    "content": "iteration",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w24"
  },
  {
    "globalPsn": 25,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w25"
  },
  {
    "globalPsn": 26,
    "highlightsFindings": [],
    "content": "experimentation",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w26"
  },
  {
    "globalPsn": 27,
    "highlightsFindings": [],
    "content": "on",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w27"
  },
  {
    "globalPsn": 28,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w28"
  },
  {
    "globalPsn": 29,
    "highlightsFindings": [],
    "content": "instructions,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w29"
  },
  {
    "globalPsn": 30,
    "highlightsFindings": [],
    "content": "rewards,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w30"
  },
  {
    "globalPsn": 31,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w31"
  },
  {
    "globalPsn": 32,
    "highlightsFindings": [],
    "content": "flows.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w32"
  },
  {
    "globalPsn": 33,
    "highlightsFindings": [],
    "content": "We",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w33"
  },
  {
    "globalPsn": 34,
    "highlightsFindings": [],
    "content": "present",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w34"
  },
  {
    "globalPsn": 35,
    "highlightsFindings": [],
    "content": "CrowdWeaver,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w35"
  },
  {
    "globalPsn": 36,
    "highlightsFindings": [],
    "content": "a",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w36"
  },
  {
    "globalPsn": 37,
    "highlightsFindings": [],
    "content": "system",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w37"
  },
  {
    "globalPsn": 38,
    "highlightsFindings": [],
    "content": "to",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w38"
  },
  {
    "globalPsn": 39,
    "highlightsFindings": [],
    "content": "visually",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w39"
  },
  {
    "globalPsn": 40,
    "highlightsFindings": [],
    "content": "manage",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w40"
  },
  {
    "globalPsn": 41,
    "highlightsFindings": [],
    "content": "complex",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w41"
  },
  {
    "globalPsn": 42,
    "highlightsFindings": [],
    "content": "crowd",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w42"
  },
  {
    "globalPsn": 43,
    "highlightsFindings": [],
    "content": "work.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w43"
  },
  {
    "globalPsn": 44,
    "highlightsFindings": [],
    "content": "The",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w44"
  },
  {
    "globalPsn": 45,
    "highlightsFindings": [],
    "content": "system",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w45"
  },
  {
    "globalPsn": 46,
    "highlightsFindings": [],
    "content": "supports",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w46"
  },
  {
    "globalPsn": 47,
    "highlightsFindings": [],
    "content": "the",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w47"
  },
  {
    "globalPsn": 48,
    "highlightsFindings": [],
    "content": "creation",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w48"
  },
  {
    "globalPsn": 49,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w49"
  },
  {
    "globalPsn": 50,
    "highlightsFindings": [],
    "content": "reuse",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w50"
  },
  {
    "globalPsn": 51,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w51"
  },
  {
    "globalPsn": 52,
    "highlightsFindings": [],
    "content": "crowdsourcing",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w52"
  },
  {
    "globalPsn": 53,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w53"
  },
  {
    "globalPsn": 54,
    "highlightsFindings": [],
    "content": "computational",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w54"
  },
  {
    "globalPsn": 55,
    "highlightsFindings": [],
    "content": "tasks",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w55"
  },
  {
    "globalPsn": 56,
    "highlightsFindings": [],
    "content": "into",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w56"
  },
  {
    "globalPsn": 57,
    "highlightsFindings": [],
    "content": "integrated",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w57"
  },
  {
    "globalPsn": 58,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w58"
  },
  {
    "globalPsn": 59,
    "highlightsFindings": [],
    "content": "flows,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w59"
  },
  {
    "globalPsn": 60,
    "highlightsFindings": [],
    "content": "manages",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w60"
  },
  {
    "globalPsn": 61,
    "highlightsFindings": [],
    "content": "the",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w61"
  },
  {
    "globalPsn": 62,
    "highlightsFindings": [],
    "content": "flow",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w62"
  },
  {
    "globalPsn": 63,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w63"
  },
  {
    "globalPsn": 64,
    "highlightsFindings": [],
    "content": "data",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w64"
  },
  {
    "globalPsn": 65,
    "highlightsFindings": [],
    "content": "between",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w65"
  },
  {
    "globalPsn": 66,
    "highlightsFindings": [],
    "content": "tasks,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w66"
  },
  {
    "globalPsn": 67,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w67"
  },
  {
    "globalPsn": 68,
    "highlightsFindings": [],
    "content": "allows",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w68"
  },
  {
    "globalPsn": 69,
    "highlightsFindings": [],
    "content": "tracking",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w69"
  },
  {
    "globalPsn": 70,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w70"
  },
  {
    "globalPsn": 71,
    "highlightsFindings": [],
    "content": "notification",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w71"
  },
  {
    "globalPsn": 72,
    "highlightsFindings": [],
    "content": "of",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w72"
  },
  {
    "globalPsn": 73,
    "highlightsFindings": [],
    "content": "task",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w73"
  },
  {
    "globalPsn": 74,
    "highlightsFindings": [],
    "content": "progress,",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w74"
  },
  {
    "globalPsn": 75,
    "highlightsFindings": [],
    "content": "with",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w75"
  },
  {
    "globalPsn": 76,
    "highlightsFindings": [],
    "content": "support",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w76"
  },
  {
    "globalPsn": 77,
    "highlightsFindings": [],
    "content": "for",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w77"
  },
  {
    "globalPsn": 78,
    "highlightsFindings": [],
    "content": "real-time",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w78"
  },
  {
    "globalPsn": 79,
    "highlightsFindings": [],
    "content": "modification.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w79"
  },
  {
    "globalPsn": 80,
    "highlightsFindings": [],
    "content": "We",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w80"
  },
  {
    "globalPsn": 81,
    "highlightsFindings": [],
    "content": "describe",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w81"
  },
  {
    "globalPsn": 82,
    "highlightsFindings": [],
    "content": "the",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w82"
  },
  {
    "globalPsn": 83,
    "highlightsFindings": [],
    "content": "system",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w83"
  },
  {
    "globalPsn": 84,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w84"
  },
  {
    "globalPsn": 85,
    "highlightsFindings": [],
    "content": "demonstrate",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w85"
  },
  {
    "globalPsn": 86,
    "highlightsFindings": [],
    "content": "its",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w86"
  },
  {
    "globalPsn": 87,
    "highlightsFindings": [],
    "content": "utility",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w87"
  },
  {
    "globalPsn": 88,
    "highlightsFindings": [],
    "content": "through",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w88"
  },
  {
    "globalPsn": 89,
    "highlightsFindings": [],
    "content": "case",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w89"
  },
  {
    "globalPsn": 90,
    "highlightsFindings": [],
    "content": "studies",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w90"
  },
  {
    "globalPsn": 91,
    "highlightsFindings": [],
    "content": "and",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w91"
  },
  {
    "globalPsn": 92,
    "highlightsFindings": [],
    "content": "user",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w92"
  },
  {
    "globalPsn": 93,
    "highlightsFindings": [],
    "content": "feedback.",
    "highlightsMechanism": [],
    "highlightsPurpose": [],
    "highlightsBackground": [],
    "_id": "w93"
  }
]

// Template.tutorialSentence.helpers({
//     sampleWords : function() {
//         var sentence = "Suntime has advantages over each of these because it records the intensity of sun exposure with the time of day of that exposure, provides a permanent paper record and operates with no batteries or electronics."
//         var words = sentence.split(" ");
//         var wordObjects = [];
//         for (i=0; i < words.length; i++) {
//             var w = {_id: i, content: words[i]}
//             wordObjects.push(w);
//         }
//         logger.trace("Tutorial words: " + JSON.stringify(wordObjects))
//         return wordObjects;
//     }
// });

// Template.tutorialSentence.events({
//     'click .key-option': function(event) {
//         var selection = event.currentTarget;
//         // var keyType = selection.innerText;
//         // console.log(selection);
//         var word = selection.parentNode.previousElementSibling;
//         // console.log(word);
//         var wordID = "#" + word.id;
//         var wordText = $(wordID).text().trim();
//         userID = Session.get("currentUser")._id;
//         logger.trace(userID + " clicked on " + wordText + " with id " + wordID);
//         if (selection.classList.contains("purp")) {
//             $(wordID).addClass('key-purpose');
//             $(wordID).removeClass('key-mechanism');
//             $(wordID).removeClass('key-neutral');
//             EventLogger.logMarkTutorialWord(wordText, "Purpose");
//         } else if (selection.classList.contains("mech")) {
//             $(wordID).removeClass('key-purpose');
//             $(wordID).addClass('key-mechanism');
//             $(wordID).removeClass('key-neutral');
//             EventLogger.logMarkTutorialWord(wordText, "Mechanism");
//         } else {
//             $(wordID).removeClass('key-purpose');
//             $(wordID).removeClass('key-mechanism');
//             $(wordID).addClass('key-neutral');
//             EventLogger.logMarkTutorialWord(wordText, "Unmark");
//         }
//     }
// });
