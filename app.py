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

@app.route("/about")
def about():
    return render_template("about.html")

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
        #Auth User
        rauth = authUser(user,password)
        if rauth == "success":
            flash("Logged In Successfully")
            return render_template("login.html")
        elif rauth == "wrong pw":
            flash("Password or Username Incorrect")
            return render_template("login.html")
    return render_template("login.html")


@app.route('/register',methods=["GET","POST"])
def register():
    user = request.form["signUpUser"]
    password0 = request.form["signUpPassword1"]
    password1 = request.form["signUpPassword2"]
    #Create User
    if createUser(user,password) == "Name already taken":
        flash("Username already taken")
        return render_template("login.html")
    if not password0 == password1:
        flash("Passwords didn't match")
        return render_template("login.html")
    flash("Account creation successful")
    return render_template("login.html")

@app.route('/admin')

def admin():
    #check usernames with sessin to see if you're allowed to be this route
    #If not redirect to the regular homepage
    return

@app.route('/getetfdata',methods=["POST","GET"])
def getetf():
    if request.method == "POST":
        etf = request.get_json()
        ETFDict = getETFDict(etf['ETF'])
        return ETFDict
    return {"It":"Did not work"}

if __name__  == "__main__":
    app.debug = True
    app.run()
