from pymongo import MongoClient
import os
from decouple import config
import bcrypt

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
    for holding in fromdb['Holdings']:
        if x ==0:
            response = list(requests.get(f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={holding['Ticker']}&apikey={key}"))
            print(response[0])
            x+=1
        else:
            return

# print(username)
# print(password)
# print (createUser("scray","doasdaso"))
print (authUser("scray","doasdaso"))
print (authUser("scray","dasdasdas"))
