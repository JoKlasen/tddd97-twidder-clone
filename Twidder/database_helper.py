from flask import g, jsonify
import sqlite3
import help_functions as hf
from help_functions import UseError


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
def post_message(data, fromEmail):
    toEmail = data['email']
    message = data['message']

    if not hf.is_within_range(message, 1, 400):
        return 'Message either empty or too long', 400

    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [toEmail])
        
        if match is None:
            return 'Not posting to a valid user', 400

        execute_and_commit("INSERT INTO messages values (?, ?, ?, ?)", [None, toEmail, fromEmail, message])
    except Exception as e:
        hf.print_except(e)
        return 'Internal server error', 500

    return '', 201


def get_messages(email):
    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [email])
        
        if match is None:
            return 'Invalid email', 400

        matches = select_all_matches("SELECT * FROM messages WHERE email LIKE ?", [email])
        
        result = []
        for tuple in matches:
            result.append( 
                            {
                                'messageNo' : tuple[0],
                                'email' : tuple[1],
                                'fromEmail' : tuple[2],
                                'content' : tuple[3]
                            }
                         )
                         
    except Exception as e:
        hf.print_except(e)
        return 'Internal server error', 500
        
    return jsonify(result), 200

def get_user_data(email):
    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [email])
        
        if match is None:
            return 'Invalid email', 400
        
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
        return 'Internal server error', 500

    return jsonify(result)  

def add_user(data):
    try:
        match = select_one_match("SELECT email FROM users WHERE email LIKE ?", [data['email']])

        # User all ready exists
        if match is not None:
            return 'User already exists', 409

        execute_and_commit("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?);",  [data['email'], data['password'], data['firstname'], 
                                                                                data['familyname'], data['gender'], data['city'],    
                                                                                data['country'] ])
    except Exception as e:
        hf.print_except(e)
        return 'Internal server error', 500
    
    return '', 201      

def sign_in_user(email, password):

    try:
        match = select_one_match("SELECT email, pass FROM users WHERE email LIKE ? AND pass LIKE ?", [email, password])

        if match is None:
            return 'Invalid email and/or password', 400

        token = hf.generate_token()

        match = select_one_match("SELECT email FROM loggedInUsers WHERE email LIKE ?", [email])

        if match is None:
            execute_and_commit("INSERT INTO loggedInUsers VALUES (?, ?)", [email, token])
        else:
            execute_and_commit("UPDATE loggedInUsers SET token = ? WHERE email = ?", [token, email])
        
        result = {"token" : token}

    except Exception as e:
        hf.print_except(e)
        return 'Internal server error', 500

    # returnera tuple för att avsluta socket connection
    return jsonify(result)

def sign_out_user(token):
    user = validate_token_and_get_user(token)

    if user is None:
        return 'Invalid token', 401
    
    try:
        execute_and_commit("DELETE FROM loggedInUsers WHERE email LIKE ?", [user])

    except Exception as e:
        hf.print_except(e)
        return 'Internal server error', 500

    return '', 200 

def change_user_password(token, data, user):

    try:
        execute_and_commit("UPDATE users SET pass = ? WHERE email LIKE ?", [data['newPassword'], user])
    except Exception as e:
        hf.print_except(e)
        return False 
    
    return True


def validate_token_and_get_user(token):
    match = select_one_match("SELECT email FROM loggedInUsers WHERE token LIKE ?", [token])

    if match is None:
        return None
    else:
        return match[0]


def correct_pass(password):
    match = select_one_match("SELECT pass FROM users WHERE pass LIKE ?", [password])
    print(match)
    print(password)
    if match is None:
        print("correct pass?")
        return False
    return True

# _________Database/Server Interface_________
