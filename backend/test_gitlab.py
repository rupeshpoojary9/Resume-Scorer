import os
import sys
from services.gitlab_service import GitLabService

# Mock get_llm to avoid import issues if any
import services.gitlab_service
services.gitlab_service.get_llm = lambda x: None

def test():
    token = os.getenv("GITLAB_TOKEN")
    url = os.getenv("GITLAB_URL", "https://gitlabproxy.lightinfosys.com")
    
    print(f"Testing GitLab connection to {url}")
    print(f"Token present: {bool(token)}")
    
    if not token:
        print("ERROR: GITLAB_TOKEN not set")
        return

    try:
        service = GitLabService(token, url)
        print("Auth successful")
        
        print("Listing projects...")
        projects = service.list_projects()
        print(f"Found {len(projects)} projects:")
        for p in projects:
            print(f" - {p['name']} ({p['path_with_namespace']})")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
