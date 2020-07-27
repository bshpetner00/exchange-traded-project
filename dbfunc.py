from pymongo import MongoClient
import os
from decouple import config

username = config('user')
password = config('pass')

mongolink = "mongodb+srv://{}:{}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority".format(username,password)
# -- Initialization section --
client = MongoClient(mongolink)
db = client['BKA']

def authUser(user,pw):
    users = db.users
    userList = list(users.find({'user':user,'pw':pw}))
    print(userList)
    if userList == []:
        return "stonk"
    else:
        return "successful stonk"

def createUser(user,pw):
    users = db.users
    userList = list(users.find({"user":user}))
    x = 0
    # print(userList)
    if userList != []:
        return "Name already taken"
    else:
        users.insert_one({"user":user,"pw":pw})
        return "Make user"

# print(username)
# print(password)
# print (createUser("scrappy","doo"))
print (authUser("scrappy","doo"))
print (authUser("sc","doo"))
