import requests
import os

BASE_URL = "http://localhost:8001"

def test_flow():
    # 1. Upload JD
    print("Uploading JD...")
    with open("dummy_jd.txt", "rb") as f:
        response = requests.post(f"{BASE_URL}/upload/jd", files={"file": f})
    print(f"JD Upload Response: {response.status_code} - {response.json()}")
    if response.status_code != 200:
        return

    # 2. Upload Resume
    print("\nUploading Resume...")
    with open("dummy_resume.txt", "rb") as f:
        response = requests.post(f"{BASE_URL}/upload/resumes", files=[("files", f)])
    print(f"Resume Upload Response: {response.status_code} - {response.json()}")
    if response.status_code != 200:
        return

    # 3. Score
    print("\nScoring Candidates...")
    response = requests.post(f"{BASE_URL}/score")
    print(f"Score Response: {response.status_code} - {response.json()}")

    # 4. Get Analysis
    print("\nGetting Analysis...")
    response = requests.get(f"{BASE_URL}/analysis")
    print(f"Analysis Response: {response.status_code}")
    data = response.json()
    if data:
        print(f"Top Candidate Score: {data[0].get('score_json', {}).get('score')}")
        print(f"Verdict: {data[0].get('verdict')}")
    else:
        print("No analysis data found.")

if __name__ == "__main__":
    test_flow()
