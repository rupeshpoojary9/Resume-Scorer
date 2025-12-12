import requests

BASE_URL = "http://localhost:8001"

def test_cors():
    headers = {
        "Origin": "http://localhost:5175",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "x-openai-key",
    }
    
    print("Sending OPTIONS request...")
    response = requests.options(f"{BASE_URL}/upload/jd", headers=headers)
    print(f"Response Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    print(f"Content: {response.text}")

if __name__ == "__main__":
    test_cors()
