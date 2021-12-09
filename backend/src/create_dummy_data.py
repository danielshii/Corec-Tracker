import database_service
import random
import record_service
from datetime import datetime, timedelta
import bcrypt

db = database_service.connect_to_database("database")
records = db["records"]
admins = db['admins']
users = db['users']


def create():
    for i in range(0, 101):
        occ = random.randint(10, 70)
        room = "Room " + str(random.randint(1, 5))
        hour = random.randint(5, 24)
        day = random.randint(0, 7)
        new_record = {
            "room": room,
            "occupancy": occ,
            "hour": hour,
            "day": day,
            "time": datetime.utcnow() - timedelta(weeks=random.randint(0, 4))
        }
        records.insert_one(new_record)

        new_record = {
            "room": room,
            "occupancy": occ,
            "hour": hour,
            "day": day,
            "time": datetime.utcnow() - timedelta(hours=random.randint(-4, 4))
        }
        records.insert_one(new_record)
        # record_service.create_record(room,occ,records)
    print("done")


def remove():
    records.delete_many({})
    print("done")


def clean_users():
    users.delete_many({})


if __name__ == '__main__':
    print("deleting...")
    remove()
    create()
    print("data added")
    # password = 'pass123'
    # admins.insert_one({
    #     'username': 'admin123',
    #     'password': bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    # })
