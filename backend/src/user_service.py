import datetime
import os
import random
import re
import secrets
from functools import wraps
from bson.objectid import ObjectId

import bcrypt
import jwt
from dotenv import load_dotenv
from flask import Blueprint, request, session, json, jsonify

import database_service
import exceptions
import notification_service as ns

base_url = "https://127.0.0.1:3000"
days_until_expire = 2

user_service = Blueprint('app_user_service', __name__)
db = database_service.connect_to_database("database")
users = db["users"]

user_tokens = db["user tokens"]
email_verification_codes = db['email verification codes']
phone_verification_codes = db['phone verification codes']
unverified_accounts = db['unverified accounts']
admins = db['admins']
bug_reports = db['Bug Reports']

email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
password_regex = re.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$")
phone_regex = "\w{3}-\w{3}-\w{4}"

load_dotenv()
my_secret = os.getenv("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'access' in request.headers:
            token = request.headers['access']
        if not token:
            raise exceptions.NotLoggedIn
        try:
            header_data = jwt.get_unverified_header(token)
            data = jwt.decode(token, key=my_secret, algorithms=[header_data['alg']])
            user = users.find_one({"_id": ObjectId(data['id'])})
            if not user:
                raise exceptions.NotLoggedIn
        except Exception:
            print("decode error")
            raise exceptions.NotLoggedIn
        return f(user, *args, **kwargs)

    return decorated


@user_service.route('/auth', methods=['POST'])
@token_required
def authenticate(user):
    if user:
        return "Authenticated", 200
    return "Not authorized", 400


@user_service.route('/user/info', methods=['POST'])
@token_required
def get_user_profile(user):
    return json.dumps({'email': user['email'], 'phone': user['phone']}), 200


@user_service.route('/login/get', methods=['POST'])
@token_required
def get_user_login(user):
    if 'remember' in user and user['remember']:
        return "redirect", 200
    return "User info isn't remembered", 400


@user_service.route('/settings/get', methods=['POST'])
@token_required
def get_user_settings(user):
    if 'startTime' in user and 'endTime' in user:
        return json.dumps(
            {
                "emailNotifications": user['emailNotifications'],
                "smsNotifications": user['smsNotifications'],
                "notifications": user['notifications'],
                "startTime": user['startTime'],
                "endTime": user['endTime']
            }
        ), 200
    else:
        return json.dumps(
            {
                "emailNotifications": user['emailNotifications'],
                "smsNotifications": user['smsNotifications'],
                "notifications": user['notifications'],
            }
        ), 200


@user_service.route('/signup/submit', methods=['POST', 'GET'])
def sign_up():
    # if "email" in session:
    #     return "Already logged in", 402
    if request.method == 'POST':
        email = request.json["email"]
        password = request.json["password"]
        phone = request.json["phone"]

        # validate email, phone, and password
        if not re.fullmatch(email_regex, email):
            return json.dumps({"message": "Not a valid email"}), 400
        if not re.search(password_regex, password):
            raise exceptions.PasswordFormatException
        # if not re.search(phone_regex, phone):
        #     return "Not a valid phone number", 400

        emailNotificationsOn = True
        smsNotificationsOn = True
        notifications = {}
        # Uncomment this section when database is established
        unverified_user = unverified_accounts.find_one({"email": email})
        user = users.find_one({"email": email})
        if user:
            # email already taken
            raise exceptions.DuplicateEmailError
        if unverified_user:
            unverified_accounts.delete_many({'email': email})

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_input = {'email': email,
                      'password': hashed,
                      'phone': phone}
        unverified_accounts.insert_one(user_input)

        # generate and send verification codes
        email_verification_codes.delete_many({'email': email})
        phone_verification_codes.delete_many({'phone': phone})
        email_code = generate_email_verification_code(email)
        # ns.send_email(email, "Verify your email", "Your email verification code is {}".format(email_code))
        # ns.send_text(phone, "Your phone number verification code is {}".format(phone_code))

        return "Redirect to verification page to verify email and phone", 200
    return json.dumps({'message': "Could not create account"}), 400


@user_service.route('/email/verify/submit', methods=['POST'])
def verify_email():
    email_verification_code = request.json['emailCode']
    email_entry = email_verification_codes.find_one({'code': email_verification_code})
    if email_entry:
        email = email_entry['email']

        account = unverified_accounts.find_one({'email': email})
        if not account:
            raise exceptions.UserNotFound

        emailNotificationsOn = True
        smsNotificationsOn = True
        notifications = {}

        # remove verification codes for user
        email_verification_codes.delete_many({'email': email})

        return "verified email", 200
    else:
        raise exceptions.VerificationCodeError


@user_service.route('/phone/verify/submit', methods=['POST'])
def verify_phone():
    phone_verification_code = request.json['phoneCode']
    phone_entry = phone_verification_codes.find_one({'code': phone_verification_code})
    if phone_entry:
        phone = phone_entry['phone']

        account = unverified_accounts.find_one({'phone': phone})
        if not account:
            raise exceptions.UserNotFound

        emailNotificationsOn = True
        smsNotificationsOn = True
        notifications = {}

        user_input = {'email': account['email'],
                      'password': account['password'],
                      'phone': account['phone'],
                      'emailNotifications': emailNotificationsOn,
                      'smsNotifications': smsNotificationsOn,
                      'notifications': notifications,
                      'favoriteRooms': []}
        users.insert_one(user_input)
        user = users.find_one({'email': account['email']})

        # remove user from unverified collection
        unverified_accounts.delete_many({'phone': phone})
        # remove verification codes for user
        phone_verification_codes.delete_many({'phone': phone})

        access_payload = {
            "id": str(user['_id']),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }
        access_token = jwt.encode(
            payload=access_payload,
            key=my_secret
        )
        refresh_payload = {
            "id": str(user['_id']),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
        }
        refresh_token = jwt.encode(
            payload=refresh_payload,
            key=my_secret
        )
        # session["email"] = user_email
        return json.dumps(
            {'access_token': access_token.decode("UTF-8"), 'refresh_token': refresh_token.decode("UTF-8")}), 200
    else:
        raise exceptions.VerificationCodeError


@user_service.route('/login/submit', methods=['post', 'get'])
def login():
    # if "email" in session:
    #     return "Already logged in", 402

    email = request.json["email"]
    password = request.json["password"]
    remember = request.json["remember"]

    unverified = unverified_accounts.find_one({'email': email})
    if unverified:
        if bcrypt.checkpw(password.encode('utf-8'), unverified['password']):
            return {'message': "redirect to verify account page"}, 400
        else:
            raise exceptions.AuthError

    # Uncomment when db established
    user = users.find_one({"email": email})
    if user:
        user_email = user['email']
        user_password = user['password']
        if bcrypt.checkpw(password.encode('utf-8'), user_password):
            users.find_one_and_update({"email": email}, {"$set": {'remember': remember}})
            access_payload = {
                "id": str(user['_id']),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
            }
            access_token = jwt.encode(
                payload=access_payload,
                key=my_secret
            )
            refresh_payload = {
                "id": str(user['_id']),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
            }
            refresh_token = jwt.encode(
                payload=refresh_payload,
                key=my_secret
            )
            # session["email"] = user_email
            return json.dumps(
                {'access_token': access_token.decode("utf-8"), 'refresh_token': refresh_token.decode("utf-8")}), 200
        else:
            raise exceptions.AuthError
    else:
        raise exceptions.AuthError


@user_service.route('/googlelogin', methods=['post'])
def googleLogin():
    # if "email" in session:
    #     return json.dumps("already logged in")

    if request.method == "POST":
        email = request.json["email"]

        # Uncomment when db established
        user = users.find_one({"email": email})
        if not user:
            emailNotificationsOn = True
            smsNotificationsOn = True
            notifications = {}
            user_input = {'email': email,
                          'phone': None,
                          'emailNotifications': emailNotificationsOn,
                          'smsNotifications': smsNotificationsOn,
                          'notifications': notifications,
                          'favoriteRooms': []}
            users.insert_one(user_input)

        access_payload = {
            "id": str(user['_id']),
            "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(minutes=30)
        }
        access_token = jwt.encode(
            payload=access_payload,
            key=my_secret
        )
        refresh_payload = {
            "id": str(user['_id']),
            "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(hours=6)
        }
        refresh_token = jwt.encode(
            payload=refresh_payload,
            key=my_secret
        )
        return {'access_token': str(access_token, encoding='utf-8'),
                'refresh_token': str(refresh_token, encoding='utf-8')}, 200

    raise exceptions.AuthError


@user_service.route('/logout', methods=['POST', "GET"])
@token_required
def logout(user):
    users.find_one_and_update({'email': user['email']}, {"$set": {"remember": False}})
    return "Logged out successfully", 200


@user_service.route('/account/delete', methods=["POST", "DELETE"])
@token_required
def delete_account(user):
    password = request.json['password']
    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        users.delete_one({'email': user['email']})
        return "account deleted", 200
    raise exceptions.AuthError


@user_service.route('/email/update/verify', methods=['POST', 'GET'])
@token_required
def update_email(user):
    old_email = request.json['oldEmail']
    new_email = request.json['newEmail']
    code = request.json['code']
    token = email_verification_codes.find_one({'$and': [{'code': code}, {'email': new_email}]})
    if token:
        email = token['email']
        users.find_one_and_update({'email': old_email},
                                  {'$set': {
                                      'email': new_email
                                  }})
        email_verification_codes.delete_many({'email': new_email})
        return "Email updated", 200
        # access_payload = {
        #     "email": new_email,
        #     "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        # }
        # access_token = jwt.encode(
        #     payload=access_payload,
        #     key=my_secret
        # )
        # refresh_payload = {
        #     "email": new_email,
        #     "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
        # }
        # refresh_token = jwt.encode(
        #     payload=refresh_payload,
        #     key=my_secret
        # )
        # # session["email"] = user_email
        # return json.dumps(
        #     {'access_token': access_token.decode("utf-8"), 'refresh_token': refresh_token.decode("utf-8")}), 200
    else:
        raise exceptions.VerificationCodeError


@user_service.route('/email/send-code', methods=['POST'])
def send_email_code():
    new_email = request.json['email']
    if users.find_one({'email': new_email}):
        raise exceptions.DuplicateEmailError
    generate_email_verification_code(new_email)
    return "email sent", 200


@user_service.route('/phone/update/verify', methods=['POST', 'GET'])
@token_required
def update_phone(user):
    new_phone = request.json['phone']
    code = request.json['code']
    token = phone_verification_codes.find_one({'$and': [{'code': code}, {'phone': new_phone}]})
    if token:
        phone = token['phone']
        users.find_one_and_update({'phone': user['phone']},
                                  {'$set': {
                                      'phone': phone
                                  }})
        phone_verification_codes.delete_many({'phone': new_phone})
        return "Phone updated", 200
    else:
        raise exceptions.VerificationCodeError


@user_service.route('/phone/send-code', methods=['POST'])
@token_required
def send_phone_code(user):
    old_phone = user['phone']
    new_phone = request.json['phone']
    if new_phone == old_phone:
        raise exceptions.DuplicateEmailError
    else:
        generate_phone_verification_code(new_phone)
    return "text sent", 200


@user_service.route('/account/password/update', methods=['POST', 'GET'])
@token_required
def update_password(user):
    # user = users.find_one({'email': session['email']})
    old_password = user['password']
    password = request.json['password']
    new_password = request.json['newPassword']
    if not re.search(password_regex, new_password):
        raise exceptions.PasswordFormatException
    if not bcrypt.checkpw(password.encode('utf-8'), old_password):
        raise exceptions.AuthError
    if bcrypt.checkpw(new_password.encode('utf-8'), old_password):
        raise exceptions.SamePasswordError
    else:
        hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        users.find_one_and_update({'email': user['email']},
                                  {'$set': {
                                      'password': hashed
                                  }})
        return "Password updated", 200


@user_service.route('/settings/notifications/update', methods=['POST'])
@token_required
def update_notifications(user):
    email = user['email']
    emailNotifications = request.json['emailNotifications']
    smsNotifications = request.json['smsNotifications']
    updated_notifications = request.json['notifications']
    users.find_one_and_update({'email': email},
                              {'$set': {'notifications': updated_notifications,
                                        'emailNotifications': emailNotifications,
                                        'smsNotifications': smsNotifications,
                                        'startTime': request.json['startTime'],
                                        'endTime': request.json['endTime']}})
    return "Notifications updated", 200


@user_service.route('/forgot-password/submit', methods=['POST'])
def forgot_password():
    email = request.json['email']
    if not re.fullmatch(email_regex, email):
        return json.dumps({'message': 'Not a valid email'}), 400
    user = users.find_one({'email': email})
    if not user:
        raise exceptions.UserNotFound
    token = generate_token(email)
    link = "{}/password/reset/{}".format(base_url, token)
    body = "Here's the link to reset your password: {}".format(link)
    ns.send_email(email, "Reset your password", body)
    return json.dumps({'token': token}), 200


def generate_token(email):
    token = secrets.token_urlsafe()
    user_tokens.delete_many({'email': email})
    entry = {
        'token': token,
        'email': email,
        'time': datetime.datetime.utcnow()
    }
    user_tokens.insert_one(entry)
    return token


@user_service.route('/password/reset/submit', methods=['POST'])
def reset_password():
    token = request.args.get('token')
    entry = user_tokens.find_one({'token': token})
    if not entry:
        raise exceptions.UserNotFound
    elif entry['time'] < datetime.datetime.today() - datetime.timedelta(days=days_until_expire):
        raise exceptions.ExpiredToken
    email = entry['email']
    new_password = request.json['password']
    password_confirm = request.json['passwordConfirm']
    if new_password != password_confirm:
        return json.dumps({"message": "Passwords don't match"}), 400
    if not re.search(password_regex, new_password):
        raise exceptions.PasswordFormatException
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    users.find_one_and_update({'email': email},
                              {'$set': {
                                  'password': hashed
                              }})
    user_tokens.find_one_and_delete({'token': token})
    # log user in
    # session['email'] = email
    return "Password updated", 200


@user_service.route('/favorites/get', methods=['POST'])
@token_required
def get_favorites(user):
    # email = user['email']
    # user = users.find_one({'email': email})
    print(user)
    if user is None:
        raise exceptions.UserNotFound
    favorite_rooms = user['favoriteRooms']
    return jsonify({'rooms': favorite_rooms})


@user_service.route('/favorites/add', methods=['POST'])
@token_required
def add_to_favorites(user):
    room = request.json['room']
    user_email = user['email']
    query = {'email': user_email}
    room_list = user["favoriteRooms"]
    if room in room_list:
        # room already in favorites
        return {'message': "room already in favorites"}, 400
    else:
        room_list.append(room)
        new_entry = {"favoriteRooms": room_list}
        users.update_one(query, {'$set': new_entry})
        return json.dumps({"rooms": room_list}), 200


@user_service.route('/favorites/remove', methods=['POST'])
@token_required
def remove_favorite(user):
    room = request.json['room']
    # user is logged in
    user_email = user['email']
    query = {'email': user_email}
    # user = users.find_one(query)
    if user is None:
        raise exceptions.UserNotFound
    room_list = user["favoriteRooms"]
    if room not in room_list:
        return "Room was not favorited to begin with!", 400
    else:
        room_list.remove(room)
        users.update_one(query, {'$set': {'favoriteRooms': room_list}})
        return json.dumps({"rooms": room_list}), 200


@user_service.route('/admin/login/submit', methods=['POST'])
def admin_login():
    username = request.json['username']
    password = request.json['password']
    admin = admins.find_one({'username': username})
    if admin and bcrypt.checkpw(password.encode('utf-8'), admin['password']):
        access_payload = {
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }
        access_token = jwt.encode(
            payload=access_payload,
            key=my_secret
        )
        refresh_payload = {
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=6)
        }
        refresh_token = jwt.encode(
            payload=refresh_payload,
            key=my_secret
        )
        # session["email"] = user_email
        return json.dumps(
            {'access_token': access_token.decode("utf-8"), 'refresh_token': refresh_token.decode("utf-8")}), 200
    raise exceptions.AuthError


def generate_email_verification_code(email):
    email_verification_codes.delete_many({'email': email})
    code = str(random.randint(0, 999999))
    code = code.zfill(6)
    while email_verification_codes.find({'code': code}).count() > 0:
        code = str(random.randint(0, 999999))
        code = code.zfill(6)
    token = email_verification_codes.find_one({'email': email})
    if not token:
        email_verification_codes.insert_one({
            'code': code,
            'email': email
        })
        ns.send_email(email, "Verify your new email", "Your verification code is {}".format(code))
        return code
    return token['code']


@user_service.route("/phone/code/send", methods=['POST'])
def send_phone_code_SMS():
    phone = request.json['phone']
    generate_phone_verification_code(phone)
    return "Phone code sent", 200


def generate_phone_verification_code(phone):
    code = str(random.randint(0, 999999))
    code = code.zfill(6)
    while phone_verification_codes.find({'code': code}).count() > 0:
        code = str(random.randint(0, 999999))
        code = code.zfill(6)
    token = phone_verification_codes.find_one({'phone': phone})
    if not token:
        phone_verification_codes.insert_one({
            'code': code,
            'phone': phone
        })
        ns.send_text(phone, "Your verification code is {}".format(code))
        return code
    return token['code']


@user_service.route("/report/send", methods=["POST"])
@token_required
def send_bug_report(user):
    email = user['email']
    bug = request.json['bug']
    time = datetime.datetime.utcnow() - datetime.timedelta(hours=1)
    sent_reports = bug_reports.find({'$and': [{'time': {'$gt': time}}, {'email': email}]})
    if sent_reports.count() >= 3:
        raise exceptions.BugReportSpamError
    ns.send_email('corec-tracker@outlook.com', 'Bug Report [{}]'.format(str(datetime.datetime.utcnow())), bug)
    bug_reports.insert_one({'email': email, 'time': datetime.datetime.utcnow()})
    return "Bug Report Sent", 200
