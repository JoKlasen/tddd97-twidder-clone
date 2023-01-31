from flask import Flask, request, jsonify

import database_handler

app = Flask(__name__)

# Having POST instead of GET would generate a error by flask
@app.route('/', methods = ['GET']) # Could add more methods but in this case only GET (therefore an array)
def root():
    return 'hello TDDD97', 201

@app.teardown_request
def teardown(exception):            # 
    database_handler.disconnect()

@app.route('/contact/create', methods = ['POST'])
def save_contact():
    data = request.get_json()
    
    if 'name' not in data or 'number' not in data:
        return '', 400

    if len(data['name']) > 120 or len(data['number']) > 20:
        return '', 400

    response = database_handler.create_contact(data['name'], data['number']);

    if response is False:
        return '', 400
    else:
        return '', 200




@app.route('/contact/find/<name>', methods = ['GET'])
def query_contact(name):
    if name is None:
        return '', 400

    response = database_handler.get_contact(name)
    return jsonify(response), 200


if __name__ == '__main__':
    app.debug = True
    app.run()