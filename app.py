# ---- YOUR APP STARTS HERE ----
# -- Import section --
from flask import Flask
from flask import render_template
from flask import request
import os
from flask_pymongo import MongoClient


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
    return render_template('index.html')


# CONNECT TO DB, ADD DATA

@app.route('/add')

def add():
    # connect to the database

    # insert new data

    # return a message to the user
    return ""

if __name__  == "__main__":
    app.debug = True
    app.run()
