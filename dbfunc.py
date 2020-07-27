from pymongo import MongoClient
import os
from decouple import config

username = config('username')
password = config('password')

mongolink = "mongodb+srv://{}:{}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority".format(username,password)
# -- Initialization section --
client = MongoClient(mongolink)
db = client['BKA']

def authUser(user,pw):
    users = db.users
    userList = users.find({"user":user,"pw":pw})
    if userList == []:
        return "stonk"
    else:
        return "successful stonk"

def createUser(user,pw):
    users = db.users
    userList = users.find({"user":user})
    if userList != {}:
        return "Name already taken"
    else:
        users.insert_one({"user":user,"pw":pw})
        return "Make user"

print (createUser("scrappy","doo"))
print (authUser("scooby","doo"))
