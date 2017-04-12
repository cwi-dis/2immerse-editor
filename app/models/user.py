from app import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)

    def __repr__(self):
        return "<User id=%d, name=%s, email=%s>" % (
            self.id,
            self.name,
            self.email
        )
