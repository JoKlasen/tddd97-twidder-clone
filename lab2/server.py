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
        return '', 400

    result = db.add_user(data)
    print(result)
    return result

# Maybe not POST?
@app.route("/sign_in", methods = ['POST'])
def sign_in():
    data = request.get_json()

    if data is None:
        return '', 400

    if hf.is_valid_email(data['email']) and hf.is_within_range(data['password'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN):
        result = db.sign_in_user(data['email'], data['password'])
        return result
    
    return '', 400

@app.route("/sign_out", methods = ['DELETE']) # Är detta rätt metod?
def sign_out():
    token = request.headers.get('Authorization')
    print(request.headers)
    print(token)

    result = db.sign_out_user(token)

    return result

@app.route("/change_password", methods = ['PUT'])
def change_password():
    token = request.headers.get('Authorization')
    data = request.get_json()

    result = db.change_user_password(token, data)

    return result

@app.route("/get_user_data_by_token", methods = ['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return '', 401

    result = db.get_user_data(user)    
    return result


@app.route("/get_user_data_by_email/<email>", methods = ['GET'])
def get_user_data_by_email(email):
    if not hf.is_valid_email(email):
        return '', 400
        
    result = db.get_user_data(email)
    return result

@app.route("/get_user_messages_by_token", methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return '', 401

    result = db.get_messages(user)
    return result

@app.route("/get_user_messages_by_email/<email>", methods = ['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return '', 401
    if not hf.is_valid_email(email):
        return '', 400

    result = db.get_messages(email)
    return result

if __name__ == '__main__':
    app.debug = True
    app.run()