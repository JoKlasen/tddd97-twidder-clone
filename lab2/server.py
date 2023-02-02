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
    
    return "<p>Something else!</p>"


if __name__ == '__main__':
    app.debug = True
    app.run()








# @app.route("/")
# def hello_world():
#     if (db.testFun()):
#         return "<p>Hello, Campus!</p>"
#     else:
#         return "Error"

# @app.route("/db_test")
# def dbTest():
#     result = c.execute('''CREATE TABLE stocks
#                         (date text, trans text, symbol text, qty real, price real)''')
#     conn.commit()
#     print(db.testFun())
#     return result