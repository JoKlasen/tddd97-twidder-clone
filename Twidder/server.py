from flask import Flask, request, jsonify
from flask_sock import Sock
import database_helper as db
import help_functions  as hf
from help_functions import UseError

app = Flask(__name__)

# Komplettering: status koder inte i database helper 


# -------------------- WebSocket --------------------
socket = Sock(app)
active_sockets = {}

# ConnectionClosed exception to handle do custom cleanup

def logout_user(user):
    print("i socket logouts")
    logout_sock = active_sockets[user]
    logout_sock.send("logout")
    # del active_sockets[user]

@socket.route("/echo")
def echo_socket(ws):
    while True:
        data = ws.receive()
        print(data)
        ws.send(data)

@socket.route("/sign_in_websocket")
def sign_in_websocket(ws):
    while True:
        try:
            token = ws.receive()
            user = db.validate_token_and_get_user(token)
            active_sockets[user] = (ws, token)
        
        except Exception as e:
            print(e)
            break
        
        
        
        
        
        
        
        try:
            token = ws.receive()
            user = db.validate_token_and_get_user(token)

            # print(user)
            if user in active_sockets:
                logout_user(user)
            
            active_sockets[user] = ws
            # print(active_sockets)
            # print(token)
            ws.send(token)

        except Exception as e:
            print(e)
            break
    # while True:
    #     try:
    #         token = ws.receive()
    #         user = db.validate_token_and_get_user(token)

    #         # print(user)
    #         if user in active_sockets:
    #             logout_user(user)
            
    #         active_sockets[user] = ws
    #         # print(active_sockets)
    #         # print(token)
    #         ws.send(token)

    #     except Exception as e:
    #         print(e)
    #         break

# -------------------- /WebSocket --------------------


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
    token = request.headers.get('Authorization')
    data = request.get_json()

    if data is None:
        return jsonify('No body data sent'), 400

    user = db.validate_token_and_get_user(token)

    if user is None:
        return jsonify('Invalid token'), 401
    
    if data is None or not (hf.is_within_range(data['newPassword'], hf.PSW_MIN_LEN, hf.PSW_MAX_LEN)):
        return jsonify('Password too short or too long'), 400
    
    if not db.correct_pass(data['oldPassword']):
        return jsonify('Wrong old password'), 403

    if not db.change_user_password(token, data, user):
        return jsonify('Internal server error'), 500
    
    return jsonify(''), 200


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