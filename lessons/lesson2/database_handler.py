import sqlite3 
from flask import g   # global object of information

DATABASE_URI = 'database.db'

def disconnect():
    db = getattr(g, 'db', None)

    if db is not None:
        g.db.disconnect()
        g.db = None

def get_db():
    db = getattr(g, 'db', None)  # is there any value to 'db' if there is not, return None

    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)

    return db

def get_contact(name):
    try:
        cursor = get_db().execute('select * from contact where name like ?', [name])
        matches = cursor.fetchall()
        cursor.close()

        result = []
        for index in range(len(matches)):
            result.append({'name' : matches[index][0], 'number' : matches[index][1]})

        return result 
    except:
        return False

def create_contact(name, number):
    try:
        #get_db().execute("insert into contact values (" + name + ', ' + number + ')') # sql injection prone
        get_db().execute("insert into contact values (?,?)", [name, number]) # Will not concatenate and therefore solve sql injection(?)
        get_db().commit()
        return True
    except:
        return False