#!/usr/bin/env python

# Author: Steven Dang stevencdang.com

from mongo_credentials import *

########## MongoHQ databases ##############
# Need to modify this so that the user and password are stored separately
fac_exp = {'url': "ds043981.mongolab.com",
        'port': 43981,
        'dbName': 'joelcprotolab',
        'user': mongolab['user'],
        'pswd': mongolab['pswd'],
        }

annotator = {'url': "ds045242.mongolab.com",
               'port': 45242,
               'dbName': 'joelc-crowd',
               'user': mongolab['user'],
               'pswd': mongolab['pswd'],
               }

kc_authors = {'url': "ds149069.mlab.com",
               'port': 49069,
               'dbName': 'heroku_jpqmxq3r',
               'user': "kitturlab",
               'pswd': "kitturlab",
               }

# Info for connecting to a local instance of meteor's mongo.
# Meteor must be running to connect
local_meteor = {'url': "localhost",
                'port': 3001,
                'dbName': 'meteor',
                'user': '',
                'pswd': '',
                }

ALL_DBs = {'local': local_meteor,
            'fac_exp': fac_exp,
            'annotator': annotator,
            'kc_authors': kc_authors
          }
