from flask import g
import sqlite3
import help_functions as hf

DATABASE_URI = 'database.db'

# _________Database wrapper functions_________
def disconnect():
    db = getattr(g, 'db', None)

    if db is not None:
        g.db.close()
        g.db = None

def get_db():
    db = getattr(g, 'db', None)

    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
        db.execute("PRAGMA case_sensitive_like = true;")
    return db

def select_one_match(query, columns):
    cursor = get_db().execute(query, columns)
    match = cursor.fetchone()
    cursor.close()
    return match
    
def execute_and_commit(query, columns):
    get_db().execute(query, columns)
    get_db().commit()

# _________Database wrapper functions_________




# _________Database/Server Interface_________
def add_user(data):
    try:
        match = select_one_match("SELECT email from user WHERE email LIKE ?", [data['email']])

        # User all ready exists
        if match is not None:
            return '', 409

        execute_and_commit("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?);",  [data['email'], data['password'], data['firstname'], 
                                                                                data['familyname'], data['gender'], data['city'],    
                                                                                data['country'] ])
        # get_db().execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?);",  \
        #                 [data['email'], data['password'], data['firstname'], \
        #                 data['familyname'], data['gender'], data['city'],    \
        #                 data['country'] ])
        # get_db().commit()
        return '', 201
    except Exception as e:
        print(e)
        return '', 400

def sign_in_user(email, password):

    try:
        match = select_one_match("SELECT email, pass FROM users WHERE email LIKE ? AND pass LIKE ?", [email, password])

        if match is None:
            return '', 400

        token = hf.generate_token()

        match = select_one_match("SELECT email FROM loggedInUsers WHERE email LIKE ?", [email])

        if match is None:
            execute_and_commit("INSERT INTO loggedInUsers VALUES (?, ?)", [email, token])
        else:
            execute_and_commit("UPDATE loggedInUsers SET token = ? WHERE email = ?", [token, email])
        
    except Exception as e:
        print(e)
        return '', 400

    return token, 200 # /201 Skilja på insert/update?

def sign_out_user(token):
    user = validate_token(token)
    print(user)

    if user is None:
        return '', 401
    
    try:
        execute_and_commit("DELETE FROM loggedInUsers WHERE email LIKE ?", [user]) # eller LIKE token

    except Exception as e:
        print(e)
        return '', 400 # ?? Möjliga felscenarion?

    return '', 204 # eller bara 200?

def change_user_password(user, oldPassword, newPassword):

    match = select_one_match("SELECT pass FROM users WHERE pass LIKE ?")

    if match is None:
        return '', 401 # eller 403? Fel oldPassword

    try:
        execute_and_commit("UPDATE users SET pass = ? WHERE email LIKE ?" [newPassword, user])

    except Exception as e:
        print(e)
        return '', 400 # ?? Möjliga felscenarion?

    return '', 200


def validate_token(token):
    match = select_one_match("SELECT email FROM loggedInUsers WHERE token LIKE ?", [token])

    print(match)
    print(type(match))

    # if match is None:
    #     return '', 403
    # else:
        # return match[0], 200

    if match is None:
        return None
    else:
        return match[0]

# _________Database/Server Interface_________
