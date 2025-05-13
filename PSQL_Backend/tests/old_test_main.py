from fastapi.testclient import TestClient
from src.app.main import app

client = TestClient(app)

import random
randomNumber = random.randint(100000, 999999)  # Generate a random number for testing
# Test creating a user
def test_create_user():
    response = client.post(
        "/auth/make_user",
        json={
            "user_name": "testuser" + str(randomNumber),
            #email with a random number:
            "email": "testuser" + str(randomNumber) + "@example.com",
            "password": "Securepassword1"
        }
    )
    assert response.status_code == 200

# Test getting a user by ID
def test_get_user():
    response = client.get("/auth/user/1")
    assert response.status_code == 200

# Test updating a user's information
def test_update_user():
    response = client.put(
        "/auth/user/update/1",
        json={
            "user_name": "updateduser",
            "email": "updateduser@example.com",
            "password": "newpassword"
        }
    )
    assert response.status_code == 200

# Test deleting a user
#def test_delete_user():
#    response = client.delete("/auth/user/delete/2")
#    assert response.status_code == 200

# Test creating an audio record
def test_create_audio():
    response = client.post(
        "/auth/audio/create/1",
        json={
            "audio_name": "testaudio",
            "file_path": "/path/to/audio/file.mp3"
        }
    )
    assert response.status_code == 200

# Test getting all audio records for a user
def test_get_audios():
    response = client.get("/auth/audio/get_audios/1")
    assert response.status_code == 200

# Test updating an audio record
def test_update_audio():
    response = client.put(
        "/auth/audio/update/1",
        json={
            "audio_name": "updatedaudio",
            "file_path": "/path/to/updated/audio/file.mp3"
        }
    )
    assert response.status_code == 200

# Test deleting an audio record
def test_delete_audio():
    response = client.delete("/auth/audio/delete/1")
    assert response.status_code == 200

# Test verifying a user
#def test_verify_user():
#    response = client.put("/auth/user/verify/1", params={"verification_code": "123456"})
#    assert response.status_code == 200

# Test requesting a new verification code
def test_request_new_verification_code():
    response = client.put("/auth/user/verify/newcoderequest/1")
    assert response.status_code == 200

# Test logging in
def test_login():
    response = client.post(
        "/auth/token",
        data={
            "username": "testuser",
            "password": "Securepassword1"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200