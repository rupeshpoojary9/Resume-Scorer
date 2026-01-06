import gitlab
import os

TOKEN = os.getenv("GITLAB_TOKEN")
URL = os.getenv("GITLAB_URL", "https://gitlab.com")

print(f"Testing token: {TOKEN[:5]}... on {URL}")

try:
    gl = gitlab.Gitlab(URL, private_token=TOKEN)
    gl.auth()
    print(f"Success! Authenticated as: {gl.user.username}")
except Exception as e:
    print(f"Failed: {e}")
