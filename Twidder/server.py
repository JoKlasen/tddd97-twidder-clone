from flask import Flask, request, jsonify
import database_helper as db
import help_functions  as hf

app = Flask(__name__)


@app.teardown_request
def teardown(exception):
    db.disconnect()


@app.route("/", methods = ['GET'])
def send_page():
    return app.send_static_file("client.html"), 200


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


@app.route("/sign_out", methods = ['DELETE'])
def sign_out():
    token = request.headers.get('Authorization')

    result = db.sign_out_user(token)                            # Validation of token is done within "sign_out_user"
    return result


@app.route("/change_password", methods = ['PUT'])
def change_password():
    print("kom hit!")
    token = request.headers.get('Authorization')
    data = request.get_json()
    print(data)
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
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return 'Invalid token', 401

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


@app.route('/post_message', methods = ['POST'])
def post_message():
    token = request.headers.get('Authorization')
    fromEmail = db.validate_token_and_get_user(token)
    data = request.get_json()
    
    if fromEmail is None:
        return 'Invalid token', 401

    if data is None:
        return 'Body data is missing', 400

    if not hf.is_valid_email(data['email']):
        return 'Invalid email in body', 400

    result = db.post_message(data, fromEmail)
    return result
    

if __name__ == '__main__':
    app.debug = True
    app.run(host = "localhost", port = 5000)