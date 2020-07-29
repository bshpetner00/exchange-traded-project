from pymongo import MongoClient
import os
from decouple import config
import bcrypt, csv, pprint
from tiingo import TiingoClient
from os import path
import pandas as pd

username = config('user')
password = config('pass')

printer = pprint.PrettyPrinter(width=200, compact=True)

mongolink = "mongodb+srv://{}:{}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority".format(username,password)
# -- Initialization section --
client = MongoClient(mongolink)
db = client['BKA']

def authUser(user,pw):
    users = db.users
    userList = list(users.find({'user':user}))
    # print(userList)
    if userList == []:
        return "wrong user"
    elif bcrypt.checkpw(pw.encode("utf-8"), userList[0]['pw']):
        return "success"
    else:
        return "wrong pw"

def createUser(user,pw):
    users = db.users
    userList = list(users.find({"user":user}))
    x = 0
    # print(userList)
    if userList != []:
        return "Name already taken"
    else:
        hashed = bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(14))
        users.insert_one({"user":user,"pw":hashed})
        return "Made user"

def cacheTiingoData(ticker):
    # ETFDict = {}
    ticker = ticker.strip()
    # fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    # x = 0
    # print(ticker)
    config = {}

    # To reuse the same HTTP Session across API calls (and have better performance), include a session key.
    config['session'] = True

    # If you don't have your API key as an environment variable,
    # pass it in via a configuration dictionary.
    config['api_key'] = "e6d87822c7f79c6478f784b5af320ac0c96beda7"

    client = TiingoClient(config)
    checkIfWorked = False
    try:
        beeper = client.get_ticker_price(ticker,fmt='json', frequency='weekly',startDate='2015-01-01', endDate='2020-01-01')
        checkIfWorked = True
    except:
        checkIfWorked = False

    if checkIfWorked:
        # print(beeper)
        # tempDict = {}
        filePath = ''
        if ticker == 'PRN':
            filePath = f'static/csv/c{ticker}.csv'
        elif "OMFL" in ticker:
            filePath = f'static/csv/OMFL.csv'
        else:
            filePath = f'static/csv/{ticker}.csv'
        with open(filePath, 'w', newline='') as csvfile:
            fieldnames = ['date', 'value']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for beep in beeper:
                writer.writerow({"date":beep['date'][0:10], 'value': beep['close']})
        return True
    else:
        print(f'Unable to get tiingo data for {ticker}')
        return False

def getETFDict(ticker):
    fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    # print(len(ticker))
    ticker = ticker.strip()
    # print(len(ticker))
    # printer.pprint(fromdb)
    excludedWeight = 0
    ETFDict = {"Ticker":ticker}
    holdingsList = {}
    includedWeight = 0
    numberPoints = 0
    fp = ''
    if ticker == "PRN":
        fp = 'static/csv/cPRN.csv'
    else:
        fp = f'static/csv/{ticker}.csv'
    with open(fp, newline='') as ratio:
        readler = csv.reader(ratio)
        listler = list(readler)
        ETFDict['startVal'] = listler[1][1]
        # printer.pprint(listler)
    for holding in fromdb['Holdings']:
        hTicker = holding['Ticker'].strip()
        filePath = ""
        if ticker == "PRN":
            filePath = f"static/csv/c{hTicker}.csv"
        elif "OMFL" in ticker:
            filePath = f'static/csv/OMFL.csv'
        else:
            filePath = f"static/csv/{hTicker}.csv"
        if not path.exists(filePath):
            succeeble = cacheTiingoData(hTicker)
            if not succeeble:
                excludedWeight+=holding['Weight']
            else:
                includedWeight+=holding['Weight']
                holdingsList[holding['Ticker']] = {}
                holdingsList[holding['Ticker']]['Weight'] = holding['Weight']
                with open(filePath, newline='') as holdingFile:
                    readler = csv.reader(holdingFile)
                    holdingsList[holding['Ticker']]['data'] = list(readler)
                    if len(holdingsList[holding['Ticker']]['data']) > numberPoints:
                        numberPoints = len(holdingsList[holding['Ticker']]['data'])
        else:
            includedWeight+=holding['Weight']
            holdingsList[holding['Ticker']] = {}
            holdingsList[holding['Ticker']]['Weight'] = holding['Weight']
            with open(filePath, newline='') as holdingFile:
                readler = csv.reader(holdingFile)
                holdingsList[holding['Ticker']]['data'] = list(readler)
                if len(holdingsList[holding['Ticker']]['data']) > numberPoints:
                    numberPoints = len(holdingsList[holding['Ticker']]['data'])
    # print(f'{excludedWeight}% of the holdings were not available from Tiingo unfortunately')
    ETFDict['points'] = numberPoints

    ETFDict['holdings'] = holdingsList
    ETFDict['excludedWeight'] = excludedWeight
    ETFDict['includedWeight'] = includedWeight
    return ETFDict

def getETFNames():
    allTickers = db.ETFData.distinct('Ticker')
    # print(allTickers)
    return allTickers



# printer.pprint(getETFDict('SOXX'))


# allTickers = db.ETFData.distinct('Ticker')
# for ticker in allTickers:
#     if ticker == "PRN" and not path.exists('static/csv/cPRN.csv'):
#         getETFData(ticker)
#     if not path.exists(f'static/csv/{ticker}.csv'):
#         getETFData(ticker)
