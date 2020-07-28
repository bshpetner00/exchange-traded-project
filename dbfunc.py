from pymongo import MongoClient
import os
from decouple import config
import bcrypt, csv
from tiingo import TiingoClient
from os import path

username = config('user')
password = config('pass')

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

def getETFData(ticker):
    ETFDict = {}
    fromdb = list(db.ETFData.find({'Ticker':ticker}))[0]
    x = 0
    config = {}

    # To reuse the same HTTP Session across API calls (and have better performance), include a session key.
    config['session'] = True

    # If you don't have your API key as an environment variable,
    # pass it in via a configuration dictionary.
    config['api_key'] = "ea50972bedbd1a99dfd3593d0aa78e51e01a9e2b"

    client = TiingoClient(config)

    # print(beeper)
    # tickerList = []
    # for holding in fromdb['Holdings']:
    #     t = holding['Ticker']
    #     if t != '':
    #         tickerList.append(holding['Ticker'])
    beeper = client.get_ticker_price(ticker,fmt='json', frequency='weekly',startDate='2015-01-01', endDate='2020-01-01')
    # print(beeper)
    tempDict = {}
    with open(f'static/csv/{ticker}.csv', 'w', newline='') as csvfile:
        fieldnames = ['date', 'value']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for beep in beeper:
            writer.writerow({"date":beep['date'][0:10], 'value': beep['close']})


allTickers = db.ETFData.distinct('Ticker')
for ticker in allTickers:
    if not path.exists(f'static/csv/{ticker}.csv'):
        getETFData(ticker)
# getETFData("SOXX")
# print(username)
# print(password)
# print (createUser("scray","doasdaso"))
# print (authUser("scray","doasdaso"))
# print (authUser("scray","dasdasdas"))
