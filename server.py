from flask import Flask, request, jsonify
from flask_sock import Sock
import database_helper as db
import help_functions  as hf
from help_functions import UseError

app = Flask(__name__)

# Projekt prioriteringar:
#   1. Deploy your solution
#   2. Live data / secure password
#   3. Geolocation



# -------------------- WebSocket --------------------
socket = Sock(app)
active_sockets = {}


def disconnect_socket(user):
    if not user in active_sockets:
        print("No active websocket for: ")
        print(user)
        return
    
    logout_sock = active_sockets[user]
    try:
        logout_sock.send("logout")
        logout_sock.close()
        del active_sockets[user]
    except Exception as e:
        print("exception i disconnect socket:")
        print(e)


@socket.route("/echo")
def echo_socket(ws):
    while True:
        data = ws.receive()
        print(data)
        ws.send(data)


@socket.route("/connect")
def connect(ws):
    while True:
        try:
            token = ws.receive()
            user = db.validate_token_and_get_user(token)
            
            if user is None:
                print("email in connect:")
                print(user)
                continue

            active_sockets[user] = ws
            print("(i connect) active sockets!")
            print(active_sockets)
        except Exception as e:
            print("Exception i connect")
            print(e)
            break

# -------------------- /WebSocket --------------------


@app.teardown_request
def teardown(exception):
    db.disconnect()


@app.route("/", methods = ['GET'])
def send_page():
    print("skickar hemsida")
    return app.send_static_file("client.html"), 200


@app.route("/sign_up", methods = ['POST'])
def sign_up():
    print("i sign_up")
    data = request.get_json()

    if not hf.is_valid_sign_up(data):
        return jsonify('Body data is not correctly formatted'), 400

    if db.existing_user(data['email']):
        return jsonify('User already exists'), 409

    if not db.add_user(data):
        return jsonify('Internal server error'), 500
    
    return jsonify(''), 201


@app.route("/sign_in", methods = ['POST'])
def sign_in():
    data = request.get_json()
    print("i sign in, sockets:")
    print(active_sockets)
    if data is None:
        return jsonify('No body data sent'), 400

    if not( hf.is_valid_email(data['email']) and hf.is_within_range(data['password'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN) ):
        return jsonify('Body data is not correctly formatted'), 400
    
    if not db.existing_user(data['email'], data['password']):
        return jsonify('Invalid email and/or password'), 400

    result, updated  = db.sign_in_user(data['email'])
    
    if not result['success']:
        return jsonify('Internal server error'), 500

    if updated:
        disconnect_socket(data['email'])

    del result['success']
    return jsonify(result), 200


@app.route("/sign_out", methods = ['DELETE'])
def sign_out():
    print("i sign_out")
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401

    if not db.sign_out_user(user):
        return jsonify('Internal server error'), 500
    
    if user in active_sockets:
        try:
            ws = active_sockets[user]
            ws.close()
            del active_sockets[user]
        except Exception as e:
            print("Exception in sign_out cleanup")
            print(e)

    return jsonify(''), 200

    

@app.route("/change_password", methods = ['PUT'])
def change_password():
    token = request.headers.get('Authorization')
    data = request.get_json()

    if data is None:
        return jsonify('No body data sent'), 400

    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401
    
    if data is None or not (hf.is_within_range(data['newPassword'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN)):
        return jsonify('Password too short or too long'), 400
    
    if not db.existing_user(user, data['oldPassword']):
        return jsonify('Wrong old password'), 403

    if not db.change_user_password(data, user):
        return jsonify('Internal server error'), 500
    
    return jsonify(''), 200


@app.route("/get_user_data_by_token", methods = ['GET'])
def get_user_data_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401

    if not db.existing_user(user):
        return jsonify('Invalid email'), 404

    result = db.get_user_data(user)

    if not result['success']:
        return jsonify('Internal server error'), 500 

    del result['success']
    ## Only send users location if they are currently connected
    if not user in active_sockets:
        result['location'] = "None"

    return jsonify(result), 200


@app.route("/get_user_data_by_email/<email>", methods = ['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401

    if not hf.is_valid_email(email):
        return jsonify('Invalid email'), 404
    
    result = db.get_user_data(email)
    
    if not result['success']:
        return jsonify('Internal server error'), 500 

    del result['success']
    ## Only send users location if they are currently connected
    if not email in active_sockets:
        result['location'] = "None"

    return jsonify(result), 200


@app.route("/get_user_messages_by_token", methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401

    if not db.existing_user(user):
        return jsonify('Invalid email'), 404

    result = db.get_messages(user)
    if not result[1]:
        return jsonify('Internal server error'), 500
    
    return jsonify(result[0]), 200


@app.route("/get_user_messages_by_email/<email>", methods = ['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('Authorization')
    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401

    if not (hf.is_valid_email(email) or db.existing_user(email)):
        return jsonify('Invalid email'), 404


    result, success = db.get_messages(email)
    if not success:
        return jsonify('Internal server error'), 500

    return jsonify(result), 200


@app.route('/post_message', methods = ['POST'])
def post_message():
    token = request.headers.get('Authorization')
    fromEmail = db.validate_token_and_get_user(token)
    data = request.get_json()
    
    if fromEmail is None:
        return jsonify('Invalid token'), 401

    if data is None:
        return jsonify('Body data is missing'), 400

    if not hf.is_valid_email(data['email']):
        return jsonify('Invalid email in body'), 400

    if not hf.is_within_range(data['message'], 1, 400):
        return jsonify('Message either empty or too long'), 400

    if not db.existing_user(data['email']):
        return jsonify('Could not find the user posted to'), 404

    if not db.post_message(data, fromEmail):
        return jsonify('Internal server error'), 500

    return jsonify(''), 201

@app.route('/update_location', methods = ['PUT'])
def update_location():
    token = request.headers.get('Authorization')
    data = request.get_json()
    user = db.validate_token_and_get_user(token)

    if data is None:
        return jsonify('No body data sent'), 400

    if user is None:
        return jsonify('Invalid token'), 401
    
    if not db.update_user_location(user, data):
        return jsonify('Internal server error'), 500
    
    return jsonify(''), 200


if __name__ == '__main__':
    app.debug = True
    app.run(host = "localhost", port = 5000)