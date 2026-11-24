from flask import Flask
from flask_cors import CORS
from app.routes.generate import generate_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(generate_bp, url_prefix="/ai")

    return app
