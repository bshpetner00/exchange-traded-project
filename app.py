# ---- YOUR APP STARTS HERE ----
# -- Import section --
from flask import Flask,render_template,request,flash
import os
from dbfunc import *


# -- Initialization section --
app = Flask(__name__)
app.secret_key = os.urandom(32)

# -- Routes section --
# INDEX
@app.route('/')
def index():
    # if "username" in session:
    return render_template('index.html')


@app.route('/comparison')
def comparison():
    ETFDict = getETFDict("SOXX")
    tickers = getETFNames()
    return render_template("compTool.html",options=tickers,ETFDict = ETFDict)

@app.route('/login',methods=["GET","POST"])
def login():
    if request.method == "POST":
        user = request.form["loginUser"]
        password = request.form["loginPassword"]
        message = "Password or username incorrect"
        #Auth User
        rauth = authUser(user,password)
        if rauth == "success":
            message = "Succesful login"
            # flash(message)
            return render_template("index.html", message="logged in successfully")
        elif rauth == "wrong pw":
            # flash("Wrong Password")
            return render_template("index.html", message="password worng")
    return render_template("login.html")


@app.route('/register',methods=["GET","POST"])
def register():
    user = request.form["signUpUser"]
    password0 = request.form["signUpPassword1"]
    password1 = request.form["signUpPassword2"]
    #Create User
    if createUser(user,password) == "Name already taken":
        flash("Username already taken")
        return "retry register"
    if not password0 == password1:
        flash("Passwords didn't match")
        return "retry register"
    else:
        return render_template("index.html", message="Successfully created account!")
    flash("Account creation successful")
    return "login page"

@app.route('/admin')

def admin():
    #check usernames with sessin to see if you're allowed to be this route
    #If not redirect to the regular homepage
    return

@app.route('/getetf/<ticker>/',methods=["POST","GET"])
def getetf(ticker):
    ## Use a function from dbfunctions to get etf data
    ##render etf template
    return "darn"


if __name__  == "__main__":
    app.debug = True
    app.run()
