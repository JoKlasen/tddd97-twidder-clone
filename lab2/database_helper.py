from flask import g
import sqlite3

DATABASE_URI = 'database.db'

def disconnect():
    db = getattr(g, 'db', None)

    if db is not None:
        g.db.close()
        g.db = None

def get_db():
    db = getattr(g, 'db', None)

    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db


def add_user(data):
    print(data)
    try:
        get_db().execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?);", [data['email'], data['password'], data['firstname'], data['familyname'], data['gender'], data['city'], data['country'] ])
        get_db().commit()
        return '', 200
    except Exception as e:
        return '', 409

def testFun():
    return True