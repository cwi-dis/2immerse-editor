import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = "postgresql://docker@db:5432/2immerse_editor"
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, "migrations")
SQLALCHEMY_TRACK_MODIFICATIONS = False
