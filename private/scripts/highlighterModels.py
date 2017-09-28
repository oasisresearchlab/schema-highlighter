"""
Mirrors data models from the highlighter app
Last updated: 2017-9-28
"""

class HighlighterObject(object):
    """
    Convenience class for highlighter mongo objects

    """
    def __init__(self, data=None):
        if data is not None:
            for key in data.keys():
                # print "Setting attribute: " + str(key) + " with " + str(data[key])
                setattr(self, key, data[key])

        #set an _id param if it was not already given
        if not hasattr(self, "_id"):
            self._id = str(ObjectId());

    def __str__(self):
        result = self.__class__.__name__ + " with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

    def __getitem__(self, key):
        return self.__dict__[key]

    def __setitem__(self, key, item):
        self.__dict__[key] = item

class Document(HighlighterObject):
    def __init__(self, docPackage, data=None):
        super(Document, self).__init__(data)
        self.extID = docPackage['extID']
        self.title = docPackage['title']
        self.sentences = []
        self.sampledBy = []
        self.annotatedBy = []
        self.summaries = []

    def __str__(self):
        result = "Document with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

    def __getitem__(self, key):
        return self.__dict__[key]

    def __setitem__(self, key, item):
        self.__dict__[key] = item

class Sentence(HighlighterObject):
    def __init__(self, docID, content, psn, data=None):
        super(Sentence, self).__init__(data)
        self.docID = docID
        self.psn = psn
        self.content = content
        self.wordIDs = []

    def __str__(self):
        result = "Sentence with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

    def __getitem__(self, key):
        return self.__dict__[key]

    def __setitem__(self, key, item):
        self.__dict__[key] = item

class Word(HighlighterObject):
    def __init__(self, content, sequence, globalPsn, sentence, data=None):
        super(Word, self).__init__(data)
        self.docID = sentence['docID']
        self.sentenceID = sentence['_id']
        self.content = content
        self.sequence = sequence
        self.globalPsn = globalPsn

        self.highlightsPurpose = []
        self.highlightsMechanism = []
        self.highlightsFindings = []
        self.highlightsBackground = []

    def __str__(self):
        result = "Word with: "
        attrs = self.__dict__
        for key in attrs.keys():
            result += str(key) + ": " + str(attrs[key]) + " "
        return result

    def __getitem__(self, key):
        return self.__dict__[key]

    def __setitem__(self, key, item):
        self.__dict__[key] = item
