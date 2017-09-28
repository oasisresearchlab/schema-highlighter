import pandas as pd # deal with the csvs because i'm lazy
from nltk.tokenize import sent_tokenize # to break document text into sentences
from nltk.tokenize.treebank import TreebankWordTokenizer # to break sentences into tokens (this mirrors the tokenizer used to import documents on the highlighter app)
import optparse # for parsing arguments and filepaths
from highlighterModels import Document, Sentence, Word
import db_params # mongodb credentials
import mongohq # pymongo utils for interacting with mongo db
from bson.objectid import ObjectId

"""
ABOUT:
------
This script uploads documents from a csv file into a specified mongo db
Usage:
python upload-new-docs.py -s <file_name> -d <db_name>
file_name must be a valid FULL ABSOLUTE PATH to a csv file (i.e., contain the expected column fields {extID, title, content})
db_name must match one of the db_param keys in db_params.py (so we don't have to manually specify access credentials)

This script also replicates the following models and functions from the highlighter app:
- DocumentManager.createDocument(docPackage), which creates a Document object, and calls
- SentenceFactory.createSentence(docID, content, psn, lastGlobal), which in turn
   - creates both a Sentence object and a Word object
"""

# initialize word tokenizer
word_tokenizer = TreebankWordTokenizer()

# TODO: might make sense to move these functions into a
# factory class in highlighterModels.py
def create_document(docPackage):

    # create the doc
    # docPackage is going to be a row in the pandas df
    new_id = str(ObjectId())
    docObj = Document(docPackage, {'_id': new_id})
    print "Attempting to create doc:", docObj
    docID = db_util.insert("documents", [docObj])

    if docID is not None:
        print "Successfully inserted doc:", docID, docObj
        seq = 1
        lastGlobal = 0
        # create sentences in the doc
        for sentence in docPackage['sentences']:
            lastGlobal = create_sentence(docID, sentence, seq, lastGlobal);
            seq += 1
    else:
        print "FAILED to insert doc:", docID, docObj

def create_sentence(docID, content, psn, lastGlobal):

    # create the sentence
    new_id = str(ObjectId())
    sentObject = Sentence(docID, content, psn, {'_id': new_id})
    sentID = db_util.insert("sentences", [sentObject])
    if sentID is not None:
        print "Successfully created sentence:", sentID, sentObject
        # Using the new_id because insert function from mongohq returns a list of ids
        # TODO: fix or make more transparent
        dbSent = db.sentences.find_one({'_id': new_id})

        # update document with sentence info
        db.documents.update(
            {"_id": docID},
            {"$addToSet": {"sentences": sentID}}
        )

        # tokenize the sentence
        tokens = word_tokenizer.tokenize(dbSent['content'])

        # create the words
        wordIDs = []
        lastLocal = 1
        for idx, token in enumerate(tokens):
            new_id = str(ObjectId())
            word = Word(token, idx+1, lastGlobal+idx+1, dbSent, {'_id': new_id})
            wordID = db_util.insert("words", [word])
            wordIDs.append(wordID)
            lastLocal += 1

        # update sentences with wordID info
        db.sentences.update(
            {"_id": sentID},
            {"$push": {"wordIDs": wordIDs}}
        )

        return lastGlobal + lastLocal

    else:
        print "FAILED to insert sentence:", sentID, sentObject


# define command-line args
parser = optparse.OptionParser()
parser.add_option('--source', '-s', action="store", dest="source", help="FULL ABSOLUTE PATH (yes because i'm lazy for now) to source csv with documents to add.", default=None)
parser.add_option('--dest', '-d', action="store", dest="db", help="destination db", default=None)

# parse command-line args
options, args = parser.parse_args()

# get the documents
# remember: we expect the following fields: {extID, title, content}
# note also: by using pandas read, we automatically get
# the first half of the unicode sandwich, i.e., all text is in unicode (the equivalent of calling theString.decode('utf-8'))
# source: https://stackoverflow.com/questions/23594878/pandas-dataframe-and-character-encoding-when-reading-excel-file
source_docs = pd.read_csv(options.source)
print source_docs.count()

# break the content into sentences
source_docs['sentences'] = [sent_tokenize(t) for t in source_docs['content']]

# create db connection
db_name = options.db
db = mongohq.get_db(db_params.ALL_DBs[db_name])
db_util = mongohq.Data_Utility('data', db_params.ALL_DBs[db_name])

# TODO: add a better dupe check. here we skip if the title is literally duplicated by another doc already in the db
# won't work for slight inconsistencies due to encoding, etc.
for index, doc in source_docs.iterrows():

    print "Inserting doc", doc['extID'], doc['title']
    create_document(doc)

    # dupeDoc = db.documents.find_one({"title": doc['title']})
    # if dupeDoc:
    #     print "Inserting doc", doc['extID'], doc['title']
    #     create_document(doc)
    # else:
    #     print "Skipping duplicated doc", doc['extID'], doc['title']
