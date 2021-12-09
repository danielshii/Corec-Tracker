import datetime
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os
from twilio.rest import Client
import database_service as ds
from urllib.parse import quote

EMAIL = 'corec-tracker@outlook.com'
load_dotenv()
PASSWORD = os.getenv('EMAIL_PASSWORD')

SID = os.getenv('ACCOUNT_SID')
AUTH = os.getenv("AUTH")
PHONE = os.getenv('PHONE')

client = Client(SID, AUTH)

db = ds.connect_to_database("database")
notifications = db['notifications']

NOTIF_INTERVAL = 10


def send_email(email, subject, body):
    smtp_server = "smtp-mail.outlook.com"
    port = 587
    server = smtplib.SMTP(smtp_server, port)
    context = ssl.create_default_context()

    # Try to log in to server and send email
    try:
        server.ehlo()  # Can be omitted
        server.starttls(context=context)  # Secure the connection
        server.ehlo()  # Can be omitted
        server.login(EMAIL, PASSWORD)

        # create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server.send_message(msg)
        print("email sent")
    except Exception as e:
        # Print any error messages to stdout
        print(e)
    finally:
        server.quit()


def send_email_alert(email, occupancy, room):
    recent_emails = notifications.find(
        {'$and': [{'time': {'$gt': datetime.datetime.utcnow() - datetime.timedelta(minutes=NOTIF_INTERVAL)}},
                  {'email': email}]
         })
    if recent_emails.count() > 0:
        print("Email already sent within the last 10 minutes")
    else:
        body = "{} is at {} people, time to get those gains up!\nhttps://127.0.0.1:3000/room/{}".format(room, occupancy, quote(room))
        send_email(email, "Let's work out!", body)
        notifications.delete_many({"email" : email})
        notifications.insert_one({
            'email': email,
            'phone': None,
            'time': datetime.datetime.utcnow()
        })


def send_text(phone, message):
    try:
        message = client.messages.create(
            body=message,
            from_=PHONE,
            to=phone
        )
    except Exception as e:
        print(e)


def send_text_alert(to_phone, occupancy, room):
    recent_texts = notifications.find(
        {'$and': [{'time': {'$gt': datetime.datetime.utcnow() - datetime.timedelta(minutes=NOTIF_INTERVAL)}},
                  {'phone': to_phone}]
         })
    if recent_texts.count() > 0:
        print("Text already sent in the last 10 minutes")
    else:
        send_text(to_phone, "{} is at {} people, time to get those gains up!".format(room, occupancy))
        notifications.delete_many({"phone": to_phone})
        notifications.insert_one({
            'phone': to_phone,
            'email': None,
            'time': datetime.datetime.utcnow()
        })
