import os
from dotenv import load_dotenv

load_dotenv()

JOINLY_API_KEY = os.getenv("JOINLY_API_KEY", "test-key")
JOINLY_API_URL = os.getenv("JOINLY_API_URL", "http://localhost:3000")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
