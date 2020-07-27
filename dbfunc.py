from pymongo import MongoClient


# -- Initialization section --
client = MongoClient("mongodb+srv://{user}:{pw}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority")
db = client['BKA']

def authUser(user,pw):
    users = db.users
    userList = users.find({"user":user,"pw":pw})
    if userList == {}:
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

createUser("scooby","doo")
print (authUser("scooby","doo"))

