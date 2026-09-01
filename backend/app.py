from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "OK"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
