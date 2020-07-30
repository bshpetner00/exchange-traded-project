from pymongo import MongoClient
import os, glob
from decouple import config
import bcrypt, csv, pprint, requests, json
from tiingo import TiingoClient
from os import path
import pandas as pd

printer = pprint.PrettyPrinter(width=200, compact=True)

# printer.pprint(os.listdir("static/csv/"))

username = config('user')
password = config('pass')

keyIndex = 0
tries = 0
prev = ""

api_keys = ["e6d87822c7f79c6478f784b5af320ac0c96beda7", "dc9097b20844830087fbc1b6e6c0606c6500b077", "c33735801203bfad3c2be383e2a092aed3af97c3", "66aa1fbcd15f0d1adf3e21ae25382d198deaeea3"]


mongolink = "mongodb+srv://{}:{}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority".format(username,password)
# -- Initialization section --
client = MongoClient(mongolink)
db = client['BKA']
dbtool = db.ETFData


def cleanGitBS():
    allFiles = os.listdir("static/csv/")
    for file in allFiles:
        convertedFile = []
        mustConvert = False
        with open("static/csv/" + file) as csvbler:
            readler = csv.reader(csvbler)
            readable = list(readler)
            for line in readable:
                # print(line)
                if len(line) > 0:
                    if line[0] == "<<<<<<< HEAD":
                        mustConvert = True
                    elif line[0] == "=======":
                        mustConvert = True
                        break
                    elif line[0] == 'date':
                        #do nothing
                        mustConvert = mustConvert
                    else:
                        convertedFile.append(line)
        # printer.pprint(convertedFile)
        with open("static/csv/" + file, 'w') as csvfixer:
            fieldnames = ['date', 'value']
            writer = csv.DictWriter(csvfixer, fieldnames=fieldnames)
            writer.writeheader()
            for row in convertedFile:
                writer.writerow({"date":row[0], 'value': row[1]})


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

def cacheTiingoData(ticker, index, bigTicker, keyIndex, tries):
    # ETFDict = {
    config = {}
    config['api_key'] = api_keys[keyIndex]
    print(config['api_key'])
    try:
        headers = {
            'Content-Type': 'application/json'
            }
        requestResponse = requests.get("https://api.tiingo.com/tiingo/daily/SOXX/prices?token=" + config['api_key'], headers=headers).json()
        # print(requestResponse)
        if requestResponse['detail']== "Error: You have run over your hourly request allocation. Please upgrade at https://api.tiingo.com/pricing to have your limits increased.":
            if tries < 2:
                keyIndex +=1
                tries+=1
                # prev = ticker
                return cacheTiingoData(ticker, index, bigTicker, keyIndex, tries)
                # return 0;
            elif tries==2:
                # prev=''
                # tries=0
                return 0
    except:
        print("\nFailed api call\n")
        if tries < 2:
            keyIndex +=1
            tries+=1
            # prev = ticker
            return cacheTiingoData(ticker, index, bigTicker, keyIndex, tries)
                # return 0;
        elif tries==2:
            # prev=''
            # tries=0
            return 0

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
        # print('\n')
        # printer.pprint(beeper)
        # print('\n')
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

def hasNumbers(inputString):
     return any(char.isdigit() for char in inputString)

def getETFDict(ticker):
    fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    # dbid = db.ObjectId(fromdb['_id'])
    # print(len(ticker))
    tickerholder = ticker
    ticker = ticker.strip().replace('\\','')
    ETFDict['countErrors'] = 0
    # print(len(ticker))
    # printer.pprint(fromdb)
    excludedWeight = 0
    ETFDict = {"Ticker":ticker}
    holdingsList = {}
    includedWeight = 0
    numberPoints = 0
    fp = ''
    ETFDict['pFormatted'] = "False"
    if ticker == "PRN":
        fp = 'static/csv/cPRN.csv'
    else:
        fp = f'static/csv/{ticker}.csv'
    with open(fp, newline='') as ratio:
        readler = csv.reader(ratio)
        listler = list(readler)
        listler = [x for x in listler if x != []]
        # printer.pprint(listler)
        ETFDict['startVal'] = listler[1][1]
        # printer.pprint(listler)
    x = 0
    if len(fromdb['Holdings']) > 250:
        return {"error":"Too many holdings"}
    for holding in fromdb['Holdings']:
        if hasNumbers(holding['Ticker']):
            excludedWeight += holding['Weight']
            continue
        hTicker = holding['Ticker'].strip().replace('\\','')
        filePath = ""
        if ticker == "PRN":
            filePath = f"static/csv/c{hTicker}.csv"
        elif "OMFL" in ticker:
            filePath = f'static/csv/OMFL.csv'
        else:
            filePath = f"static/csv/{hTicker}.csv"
        if not path.exists(filePath) and "noTiingo" not in holding:
            succeeble = cacheTiingoData(hTicker, x, tickerholder, 0,0)
            if succeeble == 0:
                ETFDict['error'] = "API key failure"
                ETFDict['countErrors'] += 1
                continue
                # return {"error":"API key failure"}
            if not succeeble:
                excludedWeight+=holding['Weight']
            else:
                includedWeight+=holding['Weight']
                if holding['Weight'] > 1:
                    ETFDict['pFormatted'] = "True"
                holdingsList[holding['Ticker']] = {}
                holdingsList[holding['Ticker']]['Weight'] = holding['Weight']
                with open(filePath, newline='') as holdingFile:
                    readler = csv.reader(holdingFile)
                    templist = list(readler)
                    holdingsList[holding['Ticker']]['data'] = [x for x in templist if x != []]
                    if len(holdingsList[holding['Ticker']]['data']) > numberPoints:
                        numberPoints = len(holdingsList[holding['Ticker']]['data'])
        elif "noTiingo" in holding:
            excludedWeight += holding['Weight']
        else:
            if holding['Weight'] > 1:
                ETFDict['pFormatted'] = "True"
            includedWeight+=holding['Weight']
            holdingsList[holding['Ticker']] = {}
            holdingsList[holding['Ticker']]['Weight'] = holding['Weight']
            with open(filePath, newline='') as holdingFile:
                readler = csv.reader(holdingFile)
                templist = list(readler)
                holdingsList[holding['Ticker']]['data'] = [x for x in templist if x != []]
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

# getETFDict("AOR")
# for tick in getETFNames():
#     getETFDict(tick)
# printer.pprint(getETFDict("SOXX"))
# cleanGitBS()

# allTickers = db.ETFData.distinct('Ticker')
# for ticker in allTickers:
#     if ticker == "PRN" and not path.exists('static/csv/cPRN.csv'):
#         getETFData(ticker)
#     if not path.exists(f'static/csv/{ticker}.csv'):
#         getETFData(ticker)
