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
def update_user_location(user, data):
    location = data['location']

    try:
        execute_and_commit("UPDATE users SET location = ? WHERE email = ?", [location, user])
    except Exception as e:
        hf.print_except(e)
        return False

    return True
    

def post_message(data, fromEmail):
    toEmail = data['email']
    message = data['message']

    try:
        execute_and_commit("INSERT INTO messages values (?, ?, ?, ?)", [None, toEmail, fromEmail, message])
    except Exception as e:
        hf.print_except(e)
        return False

    return True


def get_messages(email):
    response = ()
    result = []
    try:
        matches = select_all_matches("SELECT * FROM messages WHERE email LIKE ?", [email])
        
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
        response = (result, False)
        return response
        
    response = (result, True)
    return response 

def get_user_data(email):
    result = {}
    try:
        match = select_one_match("SELECT * FROM users WHERE email = ?", [email])
        
        # Excluding password
        result =    {
                        'email' : match[0],
                        'firstName' : match[2],
                        'surName' : match[3],
                        'gender' : match[4],
                        'city' : match[5],
                        'country' : match[6],
                        'location' : match[7],
                        'success' : True
                    }

    except Exception as e:
        hf.print_except(e)
        result['success'] = False
        return result

    return result  

def add_user(data):
    try:
        execute_and_commit("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?);",  [data['email'], data['password'], data['firstname'], 
                                                                                data['familyname'], data['gender'], data['city'],    
                                                                                data['country'], "None" ])
    except Exception as e:
        hf.print_except(e)
        return False
    
    return True    

def sign_in_user(email):
    updated = False
    result = {}
    try:
        token = hf.generate_token()

        match = select_one_match("SELECT email FROM loggedInUsers WHERE email LIKE ?", [email])

        if match is None:
            execute_and_commit("INSERT INTO loggedInUsers VALUES (?, ?)", [email, token])
        else:
            execute_and_commit("UPDATE loggedInUsers SET token = ? WHERE email = ?", [token, email])
            updated = True

        result = {"token" : token,
                   "success" : True}

    except Exception as e:
        hf.print_except(e)
        result['success'] = False
        return result, updated

    return result, updated

def sign_out_user(user):

    try:
        execute_and_commit("DELETE FROM loggedInUsers WHERE email LIKE ?", [user])
    except Exception as e:
        hf.print_except(e)
        return False

    return True 

def change_user_password(data, user):

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


def existing_user (email = None, password = None):
    if email is None and password is None:
        raise Exception("Using function incorrectly!")

    if not (email is None or password is None):
        return correct_user(email, password)
    else:
        return correct_email(email)


def correct_email(email):
    match = select_one_match("SELECT pass FROM users WHERE email LIKE ?", [email])
    if match is None:
        return False
    return True


def correct_user(email, password):
    match = select_one_match("SELECT pass FROM users WHERE email LIKE ? AND pass LIKE ?", [email, password])
    if match is None:
        return False
    return True



# _________Database/Server Interface_________
