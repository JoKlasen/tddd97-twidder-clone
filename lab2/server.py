from flask import Flask
import sqlite3

conn = sqlite3.connect('database.db')
c = conn.cursor()

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, Campus!</p>"

@app.route("/db_test")
def dbTest():
    result = c.execute('''CREATE TABLE stocks
                        (date text, trans text, symbol text, qty real, price real)''')
    conn.commit()
    return result


@app.route("/sign_in")
def sign_in(email, password):
    return "<p>Something else!</p>"

