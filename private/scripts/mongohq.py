#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

# Requires pymongo
from sets import Set
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from os import mkdir, listdir, path
import sys
import file_manager
from db_params import *
import logging
import optparse


logging.basicConfig(format='%(levelname)s:%(message)s',
                    level=logging.INFO)

logger = logging.getLogger("mongodb utility")

# parser = optparse.OptionParser()
# parser.add_option('--operation', '-o', action="store", dest="operation", help="operation", default=None)
# parser.add_option('--db', '-d', action="store", dest="db", help="db name", default=None)
# parser.add_option('--path', '-p', action="store", dest="path", help="where to store data", default=None)

def get_db(db=None):
  """
  Returns a handle to an open connection to the mongo db

  """
  if db is None:
      db = ideagenstest
  return get_mongodb(db['url'],
                     db['port'],
                     db['dbName'],
                     db['user'],
                     db['pswd'])

def get_mongodb(dbUrl, dbPort, dbName, dbUser=None, dbPswd=None):
  """
  takes db parameters and returns a connected db object usign those
  parameters

  """
  if ((dbUser == None) and (dbPswd == None)):
    dbURI = "mongodb://" + dbUrl + ":" + \
        str(dbPort) + "/" + dbName
  elif ((dbUser == "") and (dbPswd == "")):
    dbURI = "mongodb://" + dbUrl + ":" + \
        str(dbPort) + "/" + dbName
  else:
    dbURI = "mongodb://" + dbUser + ":" + dbPswd + "@" + dbUrl + ":" + \
        str(dbPort) + "/" + dbName
  client = MongoClient(dbURI)
  return client[dbName]


# collections to ignore
default_collections = [
    'system.indexes',
    'system.users',
    'meteor_accounts_loginServiceConfiguration',
]


class Data_Utility:
    """
    Utility functions for mass database operations

    """
    # Reference to all db paramters
    db_params = ALL_DBs

    def __init__(self, data_path='data', db_params=local_meteor):
        """
        Constructor that sets the data root directory of the utility
        and the parameters of the database to operate on

        """
        my_path = path.abspath(data_path)
        self.path = my_path

        self.db_params = db_params
        self.db = get_db(self.db_params)

    def set_path(self, data_path='data'):
        """
        Set the path for read/write of data from db

        """
        my_path = path.abspath(data_path)
        self.path = my_path

    def dump_db(self, data_dir=None):
        # Ensure data dump directory exists
        if data_dir is None:
            data_dir = self.path
        if not path.exists(data_dir):
            mkdir(data_dir, 0774)

        # set up the connnection
        allCollections = [col for col in self.db.collection_names() if col not in default_collections]
        print "list of collections: "
        for col in allCollections:
            print "collection name: " + col
            docs = self.db[col].find()
            data = [doc for doc in docs]
            file_manager.write_json_to_file(data, data_dir, col)

    def restore_db(self):
        files = listdir(self.path)
        # col_names = [file.split('.json')[0] for file in files]
        existing_cols = self.db.collection_names()
        for file_name in files:
            file_path = path.join(self.path, file_name)
            col = file_name.split('.json')[0]
            print "writing to data to collection " + col + \
                " in db: " + self.db_params['dbName']
            if col != 'users':
                data = file_manager.decode_json_file(file_path)
                if col not in existing_cols:
                    print "creating collection: " + col
                    self.db.create_collection(col)
                else:
                    print "inserting into existing collection"
                try:
                    if data:
                        self.db[col].insert(data, continue_on_error=True)
                except DuplicateKeyError:
                    print "Attempted insert of document with duplicate key"
                else:
                    print "success"
            else:
                print "not writing users to db"

    def clear_db(self):
        cols = self.db.collection_names()
        clear_cols = [col for col in cols if col not in default_collections]
        for col in clear_cols:
            # Remove all docs from collection
            self.db[col].remove()

    def get_data(self, collection, fields=None, filters=None, sorters=None):
        """
        Get a list of documents from the db collection for specified
        fields only. fields is list of field names for each document.

        """
        data = self.db[collection].find(filters, sort=sorters)
        if fields is None:
            return data
        else:
            filtered_data = []
            for doc in data:
                rowDict = {}
                for field in fields:
                    rowDict[field] = doc[unicode(field)]
                filtered_data.append(rowDict)
            return filtered_data

    def join_data(self, base_data, join_data, base_field, join_fields):
        """
        Perform a similar operation to a sql join for 2 sets of data.

        @Params
        base_data - list of fields to extend with joined data
        join_data - dictionary of data, indexed by base_field value
        base_field - value to use as key in lookup in join_data
            dictionary
        join_fields - list of field data to replace the base_field id

        @Return
        The modified base_data list of data

        """
        for data in base_data:
          extra = join_data[data[base_field]]
          for field in join_fields:
            data[field] = extra[field]

        return base_data

    def insert(self, col, docs):
        """
        Perform insert or bulk insert of documents given

        @params
            col - the collection to insert documents
            docs - a single or list of documents to insert into the db

        @return
            docs with updated ids

        """
        # for doc in docs:
            # d = doc.__dict__
            # for key in d.keys():
                # print key + ": " + d[key]
        try:
            if docs:
                data = [doc.__dict__ for doc in docs]
                results = self.db[col].insert(data,
                                              continue_on_error=True)
                return results
        except DuplicateKeyError:
            print "Attempted insert of document with duplicate key"
        else:
            print "Error while inserting into collection"

    def update(self, col, sel, update):
        """
        Update the documents in the specified collection according to
        the given selector and update statement

        """
        results = self.db[col].update(sel, update)
        return results

    @staticmethod
    def get_db(db_name):
        """
        Allows for db retrieval by name

        """
        try:
            return ALL_DBs[db_name]
        except KeyError:
            logger.warning("Could not find db with name: " + db_name);


def parse_args(args):
    """
    Parse arguments passed to the script

    @params
      first arg is a database name
      Each pair of args following is a path and an operation:
        dump - raw dump all the data in the db to the path given
        restore - restore data to the db from the files in the path
        clear - empty the db (ignores the path)

    """
    db_params = Data_Utility.get_db(args[0])
    logger.debug(db_params)
    db = None
    for i in range(len(args[1:])/2):
        data_path = path.abspath(args[1+2*i])
        logger.info("db path: " + data_path)
        operation = args[2+2*i]
        logger.debug(operation)
        if db is None:
            db = Data_Utility(data_path, db_params)
        else:
            db.set_path(data_path)

        if operation == 'clear':
            logger.info("clearing db")
            db.clear_db()
        elif operation == 'dump':
            logger.info("dumping db data to file")
            db.dump_db()
        elif operation == 'restore':
            logger.info("restoring data to db from file")
            db.restore_db()


if __name__ == '__main__':

    parser = optparse.OptionParser()
    parser.add_option('--operation', '-o', action="store", dest="operation", help="operation", default=None)
    parser.add_option('--db', '-d', action="store", dest="db", help="db name", default=None)
    parser.add_option('--path', '-p', action="store", dest="path", help="where to store data", default=None)
    # print parser
    # print sys.argv

    options, args = parser.parse_args()

    # print args

    # get_amd_data(sys.argv[1:])
    if len(sys.argv[1:]) >= 1:
    # if len(args) >= 1:
      # Perform desired db operations based on command line arguments
    #   parse_args(sys.argv[1:])
      parse_args([
        options.db,
        options.path,
        options.operation
      ])
    else:
      # Rudimentary script to dump to db as we previously were doing
      util = Data_Utility('data/amd3-2', ALL_DBs['ideagensscd'])
      util.clear_db()
      util.restore_db()
      # util.dump_db()
