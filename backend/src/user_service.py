from flask import Blueprint, request, session, json
import bcrypt
import database_service
import pymongo
import ssl

user_service = Blueprint('app_user_service', __name__)
db = database_service.connect_to_database("database")


@user_service.route('/signup', methods=['post', 'get'])
def create_account():
    if "email" in session:
        return json.dumps(False)
    if request.method == 'POST':
        email = request.form.get("email")
        password = request.form.get("password")
        emailNotificationsOn = True;
        smsNotificationsOn = True
        notifications = {}

        # Uncomment this section when database is established
        user = users.find_one({"email": email})
        if user:
            # email already taken
            return json.dumps(False)

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_input = {'email': email,
                      'password': hashed,
                      'emailNotifications': emailNotificationsOn,
                      'smsNotifications': smsNotificationsOn,
                      'notfications': notifications,
                      'favoriteRooms': []}
        users.insert_one(user_input)
        session['email'] = email
        return json.dumps(True)
    return json.dumps(False)


@user_service.route('/login', methods=['post', 'get'])
def login():
    if "email" in session:
        return json.dumps(True)

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        # Uncomment when db established
        user = users.find_one({"email": email})
        if user:
            user_email = user['email']
            user_password = user['password']

            if bcrypt.checkpw(password.encode('utf-8'), user_password):
                session["email"] = user_email
                return json.dumps(True)
            else:
                return json.dumps(False)
        else:
            return json.dumps(False)
    return json.dumps(False)


@user_service.route('/logout')
def logout():
    session.pop('email', None)
    return json.dumps(True)
