from flask import g, jsonify
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
    
def select_all_matches(query, columns):
    cursor = get_db().execute(query, columns)
    matches = cursor.fetchall()
    cursor.close()
    return matches
    
def execute_and_commit(query, columns):
    get_db().execute(query, columns)
    get_db().commit()

# _________Database wrapper functions_________




# _________Database/Server Interface_________
def get_messages(email):
    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [email])
        
        if match is None:
            return '', 400

        matches = select_all_matches("SELECT * FROM messages WHERE email LIKE ?", [email])
        print("matches: ")
        print(matches)
        
        result = []
        for tuple in matches:
            result.append( 
                            {
                                'email' : tuple[0],
                                'messageNo' : tuple[1],
                                'fromEmail' : tuple[2],
                                'content' : tuple[3]
                            }
                         )
        print("result!")
        print(result)
    except Exception as e:
        hf.print_except(e)
        return '', 400
        
    return jsonify(result), 200

def get_user_data(email):
    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [email])
        
        if match is None:
            return '', 400
        
        # Excluding password
        result =    {
                        'email' : match[0],
                        'firstName' : match[2],
                        'surName' : match[3],
                        'gender' : match[4],
                        'city' : match[5],
                        'country' : match[6],
                    }

    except Exception as e:
        hf.print_except(e)
        return '', 400

    return jsonify(result)  # jsonify sorts the keys in alphabetic order probably

def add_user(data):
    try:
        match = select_one_match("SELECT email FROM users WHERE email LIKE ?", [data['email']])

        # User all ready exists
        if match is not None:
            return '', 409

        execute_and_commit("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?);",  [data['email'], data['password'], data['firstname'], 
                                                                                data['familyname'], data['gender'], data['city'],    
                                                                                data['country'] ])
        return '', 201
    except Exception as e:
        hf.print_except(e)
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
        hf.print_except(e)
        return '', 400

    return token, 200 # /201 Skilja på insert/update?

def sign_out_user(token):
    user = validate_token_and_get_user(token)
    print(user)

    if user is None:
        return '', 401
    
    try:
        execute_and_commit("DELETE FROM loggedInUsers WHERE email LIKE ?", [user]) # eller LIKE token

    except Exception as e:
        hf.print_except(e)
        return '', 400 # ?? Möjliga felscenarion?

    return '', 204 # eller bara 200?

def change_user_password(token, data):

    user = validate_token_and_get_user(token)

    if user is None:
        return '', 401

    if data is None or not (hf.is_within_range(data['newPassword'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN)):
        return '', 400

    match = select_one_match("SELECT pass FROM users WHERE pass LIKE ?", [data['oldPassword']])

    if match is None:
        return '', 401 # eller 403? Fel oldPassword

    try:
        execute_and_commit("UPDATE users SET pass = ? WHERE email LIKE ?", [data['newPassword'], user])

    except Exception as e:
        hf.print_except(e)
        return '', 400 # ?? Möjliga felscenarion?

    return '', 200


def validate_token_and_get_user(token):
    match = select_one_match("SELECT email FROM loggedInUsers WHERE token LIKE ?", [token])

    if match is None:
        return None
    else:
        return match[0]

# _________Database/Server Interface_________
