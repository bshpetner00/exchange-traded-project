# ---- YOUR APP STARTS HERE ----
# -- Import section --
from flask import Flask
from flask import render_template
from flask import request
import os
from flask_pymongo import MongoClient
from dbfunc import *


# -- Initialization section --
app = Flask(__name__)
client = MongoClient(
    f"mongodb+srv://{user}:{pw}@stockler.7bkls.mongodb.net/BKA?retryWrites=true&w=majority")
db = client['BKA']

# -- Routes section --
# INDEX
@app.route('/')
@app.route('/index')

def index():
    if "username" in session:
        
    return render_template('index.html')


# CONNECT TO DB, ADD DATA

@app.route('/add')
def add():
    # connect to the database
    # insert new data

    # return a message to the user
    return ""

@app.route('/comparison')
def comparison:
    return ""

@app.route('/login',methods=["GET","POST"])
def login():
    user = request.form["user"]
    password = request.form["pass"]
    message = "Password or username incorrect"
    #Auth User
    if authUser(user,password) == "successful stonk":
        message = "Succesful login"
        flash(message)
        return "homepage"
    return "retry page"


@app.route('/register',methods=["GET","POST"])
def register():
    user = request.form["user"]
    password0 = request.form["password0"]
    password1 = request.form["password1"]
    #Create User
    if createUser(user,password) == "Name already taken":
        flash("Username already taken")
        return "retry register"
    if not password0 == password1:
        flash("Passwords didn't match")
        return "retry register"
    flash("Account creation successful")
    return "login page"

@app.route('/admin')

def admin():
    #check usernames with sessin to see if you're allowed to be this route
    #If not redirect to the regular homepage


@app.route('/getetf/<ticker>/',methods=["POST","GET"])
def getetf(ticker):
    ## Use a function from dbfunctions to get etf data
    ##render etf template
    return "darn"


if __name__  == "__main__":
    app.debug = True
    app.run()
