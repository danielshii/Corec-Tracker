import cv2
import numpy as np
import time
import datetime
from flask import Blueprint, jsonify, request
import record_service as rs
import person_counter as pc
import database_service
import person_counter as pc
import record_service as rs
import json
import traceback
import logging

# dictionary for mapping room name to the camera that's
# scanning that room (only has one room for now)

room_to_camera = {
    'Room 1': 0,
    'Room 2': 1,
    'Room 3': 2,
    'Room 4': 3
}

camera_service = Blueprint('app_camera_service', __name__)

db = database_service.connect_to_database("database")
records = db['records']


@camera_service.route('/process-room', methods=['POST'])
def process_room():
    room = request.json['room']
    try:
        cap = cv2.VideoCapture(room_to_camera[room])
        image_path = '../images/{}.jpg'.format(str(datetime.datetime.now().date()))
        if not cap:
            return json.dumps(handle_camera_failure(room)), 200
        while cap.isOpened():
            ret, frame = cap.read()
            cv2.normalize(frame, frame, 0, 80, cv2.NORM_MINMAX)

            if not ret:
                # failed to capture image, return the last recorded occupancy
                return json.dumps(handle_camera_failure(room)), 200

            cv2.imwrite(image_path, frame)

            cap.release()
            cv2.destroyAllWindows()
            occupancy = pc.count_people_in_image(image_path)
            rs.create_and_notify(room, occupancy, records)
            return json.dumps({'occupancy': occupancy}), 200
        return json.dumps(handle_camera_failure(room)), 200
    except Exception as e:
        # logging.error(traceback.format_exc())
        print(e)
        return json.dumps(handle_camera_failure(room)), 200


def handle_camera_failure(room):
    print("Could not capture video, returning most recently recorded occupancy...")
    record = list(records.find({'room': room}).sort([('time', -1)]).limit(1))
    occupancy = 0
    if record:
        occupancy = record[0]['occupancy']
    return {'occupancy': occupancy}
