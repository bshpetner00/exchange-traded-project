from pymongo import MongoClient
import os
from decouple import config
import bcrypt, csv, pprint, requests, json
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
dbtool = db.ETFData

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

def cacheTiingoData(ticker, index, bigTicker):
    # ETFDict = {
    config = {}
    config['api_key'] = "e6d87822c7f79c6478f784b5af320ac0c96beda7"
    try:
        headers = {
            'Content-Type': 'application/json'
            }
        requestResponse = requests.get("https://api.tiingo.com/tiingo/daily/SOXX/prices?token=" + config['api_key'], headers=headers).json()
        print(requestResponse)
        if requestResponse['detail']== "Error: You have run over your hourly request allocation. Please upgrade at https://api.tiingo.com/pricing to have your limits increased.":
            return False
    except:
        print("\nFailed api call\n")
        return False

    tickerholder = bigTicker
    ticker = ticker.strip()
    # fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    # x = 0
    # print(ticker)

    # To reuse the same HTTP Session across API calls (and have better performance), include a session key.
    config['session'] = True

    # If you don't have your API key as an environment variable,
    # pass it in via a configuration dictionary.

    client = TiingoClient(config)
    checkIfWorked = False
    try:
        beeper = client.get_ticker_price(ticker,fmt='json', frequency='weekly',startDate='2015-01-01', endDate='2020-01-01')
        print('\n')
        printer.pprint(beeper)
        print('\n')
        checkIfWorked = True
    except:
        checkIfWorked = False
        # print('\n')
        # printer.pprint(beeper)
        # print('\n')

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
        dbtool.update_one({"Ticker":tickerholder},{"$set":{"Holdings." + str(index) + ".noTiingo": True}})
        return False

def getETFDict(ticker):
    fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    # dbid = db.ObjectId(fromdb['_id'])
    # print(len(ticker))
    tickerholder = ticker
    ticker = ticker.strip().replace('\\','')
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
    x = 0
    for holding in fromdb['Holdings']:
        hTicker = holding['Ticker'].strip().replace('\\','')
        filePath = ""
        if ticker == "PRN":
            filePath = f"static/csv/c{hTicker}.csv"
        elif "OMFL" in ticker:
            filePath = f'static/csv/OMFL.csv'
        else:
            filePath = f"static/csv/{hTicker}.csv"
        if not path.exists(filePath) and "noTiingo" not in holding:
            succeeble = cacheTiingoData(hTicker, x, tickerholder)
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
        elif "noTiingo" in holding:
            excludedWeight += holding['Weight']
        else:
            includedWeight+=holding['Weight']
            holdingsList[holding['Ticker']] = {}
            holdingsList[holding['Ticker']]['Weight'] = holding['Weight']
            with open(filePath, newline='') as holdingFile:
                readler = csv.reader(holdingFile)
                holdingsList[holding['Ticker']]['data'] = list(readler)
                if len(holdingsList[holding['Ticker']]['data']) > numberPoints:
                    numberPoints = len(holdingsList[holding['Ticker']]['data'])
        x+=1
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

getETFDict("AOR")
# for tick in getETFNames():
#     getETFDict(tick)
# printer.pprint(getETFDict("SOXX"))


# allTickers = db.ETFData.distinct('Ticker')
# for ticker in allTickers:
#     if ticker == "PRN" and not path.exists('static/csv/cPRN.csv'):
#         getETFData(ticker)
#     if not path.exists(f'static/csv/{ticker}.csv'):
#         getETFData(ticker)
