// Configure logger for event logging
var logger = new Logger('Managers:Logging');
// Comment out to use global logging level
Logger.setLevel('Managers:Logging', 'trace');
//Logger.setLevel('Managers:Logging', 'debug');
// Logger.setLevel('Managers:Logging', 'info');
//Logger.setLevel('Managers:Logging', 'warn');

Events = new Meteor.Collection("events");

Event = function (msg, user) {
  //time stamp for the event
  this.time = new Date().getTime();
  //type of the event
  //this.type = type;
  /*********** Leaving description in for legacy reasons *******/
  //description of the event
  this.description = msg
  //_id of user generating the event
  this.userID = user._id;
  //Name of user generating the event
  this.userName = user.userName;
  //There are additional fields that can be added
  //See logger for details
}

EventLogger = (function () {
  return {
    /*****************************************************************
    * Global object for logging high level system events to database
    ******************************************************************/
    log: function(msg, data) {
      /*
      *  log any event. If insufficient data is given, warning is
      *  logged, but does not throw error
      *   Input:
      *   type - the EventType associated with this event
      *   data - (Optional) the data to be associated with the event
      *       Specified as an object where only fieldNames specified
      *       in type are stored
      */
      //The current user is assumed to have generated the event
      var user = Session.get("currentUser");
      var event = new Event(msg, user);

      //Set each field provided in data
      if (typeof data != undefined) {
        for (var field in data) {
          event[field] = data[field];
        }
      }
      //Insert into db
      event._id = Events.insert(event);
      return event;
    },

    remove: function(events) {
      /**************************************************************
       * Remove a set of logged events
       *    This is primarily to support tests and needs to eventually
       *    be secured.
       * @params
       *    events: an array or cursor of events to be removed
       * @return
       *    n/a
       *************************************************************/
      if (hasForEach(events)) {
        ids = getIDs(events);
        if (Meteor.isServer) {
          Events.remove({_id: {$in: ids}});
        } else {
          events.forEach(function(event) {
            Events.remove({_id: event._id});
          });
        }
      } else {
        Events.remove({_id: events._id});
      }

    },
    logBegin: function() {
      var msg = "User logged in";
      this.log(msg)
    },
    logMarkTutorialWord: function(word, type) {
      var msg = "User marked word in tutorial";
      var data = {'word': word, 'type': type}
      this.log(msg, data);
    },
    logCheckTutorialAccuracy: function(user, score, words) {
      var msg = "User checked tutorial accuracy";
      var data = {
        'score': score,
        'highlights': words,
      }
      this.log(msg, data);
    },
    logFinishTutorial: function() {
      var msg = "User finished tutorial";
      this.log(msg);
    },
    logMarkPurpose: function (wordID, previousState) {
      var word = Words.findOne({_id: wordID});
      var msg = "User marked word as purpose keyword";
      var data = {'word': word.content,
                  'wordID': word._id,
                  'wordSeq': word.sequence,
                  'sentenceID': word.sentenceID,
                  'docID': word.docID,
                  'previousState': previousState}
      this.log(msg, data);
    },
    logMarkMechanism: function (wordID, previousState) {
      var word = Words.findOne({_id: wordID});
      var msg = "User marked word as mechanism keyword";
      var data = {'word': word.content,
                  'wordID': word._id,
                  'wordSeq': word.sequence,
                  'sentenceID': word.sentenceID,
                  'docID': word.docID,
                  'previousState': previousState}
      this.log(msg, data);
    },
    logMarkFinding: function (wordID, previousState) {
      var word = Words.findOne({_id: wordID});
      var msg = "User marked word as finding keyword";
      var data = {'word': word.content,
                  'wordID': word._id,
                  'wordSeq': word.sequence,
                  'sentenceID': word.sentenceID,
                  'docID': word.docID,
                  'previousState': previousState}
      this.log(msg, data);
    },
    logMarkBackground: function (wordID, previousState) {
      var word = Words.findOne({_id: wordID});
      var msg = "User marked word as background keyword";
      var data = {'word': word.content,
                  'wordID': word._id,
                  'wordSeq': word.sequence,
                  'sentenceID': word.sentenceID,
                  'docID': word.docID,
                  'previousState': previousState}
      this.log(msg, data);
    },
    logUnmarkWord: function (wordID, previousState) {
      var word = Words.findOne({_id: wordID});
      var msg = "User unmarked word";
      var data = {'word': word.content,
                  'wordID': word._id,
                  'wordSeq': word.sequence,
                  'sentenceID': word.sentenceID,
                  'docID': word.docID,
                  'previousState': previousState}
      this.log(msg, data);
    },
    logBeginDocument: function(docID) {
      var msg = "User began annotating a document";
      var data = {"docID": docID}
      this.log(msg, data);
    },
    logFinishDocument: function(docID) {
      var msg = "User finished annotating a document";
      var data = {"docID": docID}
      this.log(msg, data);
    },
 };
}());
