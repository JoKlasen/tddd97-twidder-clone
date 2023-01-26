from flask import Flask
import sqlite3
import database_helper as db

conn = sqlite3.connect('database.db')
c = conn.cursor()

app = Flask(__name__)

@app.route("/")
def hello_world():
    if (db.testFun()):
        return "<p>Hello, Campus!</p>"
    else:
        return "Error"

@app.route("/db_test")
def dbTest():
    result = c.execute('''CREATE TABLE stocks
                        (date text, trans text, symbol text, qty real, price real)''')
    conn.commit()
    print(db.testFun())
    return result


@app.route("/sign_in")
def sign_in(email, password):
    return "<p>Something else!</p>"

