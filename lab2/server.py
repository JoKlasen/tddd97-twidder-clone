from flask import Flask, request, jsonify
import database_helper as db
import help_functions  as hf

app = Flask(__name__)

@app.teardown_request
def teardown(exception):
    db.disconnect()

@app.route("/sign_up", methods = ['POST'])
def sign_up():
    data = request.get_json()

    if not hf.is_valid_sign_up(data):
        return 'Body data is not correctly formatted', 400

    result = db.add_user(data)
    print(result)
    return result

@app.route("/sign_in", methods = ['POST'])
def sign_in():
    data = request.get_json()

    if data is None:
        return 'No body data sent', 400

    if not( hf.is_valid_email(data['email']) and hf.is_within_range(data['password'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN) ):
        return 'Body data is not correctly formatted', 400
    
    result = db.sign_in_user(data['email'], data['password'])
    return result

@app.route("/sign_out", methods = ['DELETE']) # Är detta rätt metod?
def sign_out():
    token = request.headers.get('Authorization')

    result = db.sign_out_user(token)                            # Validation of token is done within "sign_out_user"
    return result

@app.route("/change_password", methods = ['PUT'])
def change_password():
    token = request.headers.get('Authorization')
    data = request.get_json()

    if data is None:
        return 'No body data sent', 400

    result = db.change_user_password(token, data)               # Validation of token is done within "change_user_password"
    return result

@app.route("/get_user_data_by_token", methods = ['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return 'Invalid token', 401

    result = db.get_user_data(user)    
    return result


@app.route("/get_user_data_by_email/<email>", methods = ['GET'])
def get_user_data_by_email(email):
    if not hf.is_valid_email(email):
        return 'Invalid email', 400
        
    result = db.get_user_data(email)
    return result

@app.route("/get_user_messages_by_token", methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return 'Invalid token', 401

    result = db.get_messages(user)
    return result

@app.route("/get_user_messages_by_email/<email>", methods = ['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return 'Invalid token', 401

    if not hf.is_valid_email(email):
        return 'Invalid email', 400

    result = db.get_messages(email)
    return result


# Artikel om att sanitera input https://benhoyt.com/writings/dont-sanitize-do-escape/
#                               https://semgrep.dev/docs/cheat-sheets/flask-xss/

@app.route('/post_message', methods = ['POST'])
def post_message():
    token = request.headers.get('Authorization')
    fromEmail = db.validate_token_and_get_user(token)
    data = request.get_json()
    
    # Status koder här är nog fel, jag höftade
    if fromEmail is None:
        return 'Invalid token', 401

    if data is None:
        return 'Body data is missing', 401

    if not hf.is_valid_email(data['email']):
        return 'Invalid email in body', 401

    # Hur ska man validate message?
    # if not hf.is_valid_message(data['message']):
    #     return '', 401

    result = db.post_message(data, fromEmail)
    return result
    
if __name__ == '__main__':
    app.debug = True
    app.run()