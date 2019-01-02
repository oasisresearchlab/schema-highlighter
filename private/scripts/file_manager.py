#!/usr/bin/env python

# Author: Steven Dang & Joel Chan

import logging
import pandas as pd
import json
import csv
from os import mkdir, listdir, path, walk


logging.basicConfig(format='%(levelname)s:%(message)s',
                    level=logging.DEBUG)


def date_handler(obj):
        return obj.isoformat() if hasattr(obj, 'isoformat') else obj


def trim_ext(file_name):
    """
    Trim the file extension from a given file

    """
    return file_name[:file_name.rindex('.')]


def crawl_for_files(dir_path, filt=None):
    """
    Crawl a given directory for files that meet the given criteria
    defined by filt

    """
    for root, dirs, files in walk(dir_path):
        file_names = [path.join(root, file_name) for file_name in files]
        for name in file_names:
            if filt is not None:
                if filt(name):
                    yield name
            else:
                yield name


def import_from_csv(file_path, processor):
    """
    Import data from csv file where each line is processed with given
    processor function

    """
    csvfile = open(file_path, 'rU')
    reader = csv.DictReader(csvfile)
    result = [processor(row) for row in reader]
    csvfile.close()
    return result


def write_json_to_file(data='', dir_path='data', file_name='default'):
    print("writing to directory: " + dir_path)
    if not path.exists(dir_path):
        # mkdir(dir_path, 0774)
        mkdir(dir_path)
    # Create file path
    file_path = path.join(dir_path, file_name + '.json')
    print("writing to: " + file_path)
    # Write data to file
    resultsFile = open(file_path,'w')
    resultsFile.write(
        json.dumps(data, indent=2, default=date_handler)
    )
    resultsFile.close()


def decode_json_file(file_path):
    json_file = open(file_path, 'r')
    decode_data = json.load(json_file)
    if len(decode_data) > 0:
        # Handle isodate
        if 'time' in decode_data[0]:
            print("data has time field")
            try:
                datetime_data = dateutil.parser.parse(decode_data[0]['time'])
            except:
                print("Couldn't convert to datetime")
                pass
            else:
                print("converted to datetime object")
                for doc in decode_data:
                    doc['time'] = dateutil.parser.parse(doc['time'])
    return decode_data


def read_data(filename):
    """
    Read in data from a file and return a list with each element being one line from the file.
    Parameters:
    1) filename: name of file to be read from
    Note: the code now opens as a binary and replaces carriage return characters with newlines because python's read and readline functions don't play well with carriage returns.
    However, this will no longer be an issue with python 3.
    """
    with open(filename, "rb") as f:
        s = f.read().replace('\r\n', '\n').replace('\r', '\n')
        data = s.split('\n')
    return data


def data_to_csv(data, file_path, fields=None):
    """
    Convert a list of uniform data objects be written to a csv file

    """

    dataDF = pd.DataFrame(data)
    dataDF.to_csv(file_path)
