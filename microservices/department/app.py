from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# A simple in-memory list of departments
DEPARTMENTS = [
    {"id": 1, "name": "Engineering"},
    {"id": 2, "name": "Human Resources"},
    {"id": 3, "name": "Sales"},
    {"id": 4, "name": "Marketing"},
]

@app.route('/departments', methods=['GET'])
def get_departments():
    """Returns the list of all departments."""
    return jsonify(DEPARTMENTS)

@app.route('/healthz', methods=['GET'])
def healthz():
    """A simple health check endpoint."""
    return jsonify({"status": "ok", "service": "department"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
