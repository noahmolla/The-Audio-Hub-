import random
import string
import requests

BASE_URL = "http://127.0.0.1:8000/auth"

def generate_random_user():
    username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"{username}@test.com"
    password = "password123"
    return {
        "user_name": username,
        "email": email,
        "password": password
    }
def register_user(user_data):
    response = requests.post(f"{BASE_URL}/make_user", json=user_data)
    assert response.status_code == 200, f"Failed to register user: {response.json()}"
    return response.json()

def test_user_creation():
    user_data = generate_random_user()
    register_user(user_data)

def test_user_verification():
    user_data = generate_random_user()
    register_user(user_data)


def test_user_exists():
    user_data = generate_random_user()
    register_user(user_data)

    response = requests.get(f"{BASE_URL}/user/exists", params={"username": user_data["user_name"]})
    assert response.status_code == 200, f"Failed to check user existence: {response.json()}"
    assert response.json()["exists"] is True
def test_token_get_audio():
    user_data = generate_random_user()
    # Register the user first to ensure they exist
    register_user(user_data)

    # Get the token using form data with the correct content type
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(
        f"{BASE_URL}/token", 
        data={"username": user_data["user_name"], "password": user_data["password"]},
        headers=headers
    )
    
    assert response.status_code == 200, f"Failed to get token: {response.content}"
    token1 = response.json()["access_token"]
    
    # Pass the token in the "token" header
    headers = {"token": token1}
    
    # Get the audio data using the token header
    response = requests.get(f"{BASE_URL}/audio/get_audios", headers=headers)
    assert response.status_code == 200, f"Failed to get audio data: {response.content}"

def test_delete_token():
        user_data = generate_random_user()
        register_user(user_data)
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = requests.post(
        f"{BASE_URL}/token", 
        data={"username": user_data["user_name"], "password": user_data["password"]},
        headers=headers)
        assert response.status_code == 200, f"Failed to get token: {response.content}"
        token1 = response.json()["access_token"]
        # Pass the token in the "token" header
        headers = {"token": token1}
        response = requests.delete(f"{BASE_URL}/user/delete", headers=headers)
        assert response.status_code == 200, "Failed to delete"