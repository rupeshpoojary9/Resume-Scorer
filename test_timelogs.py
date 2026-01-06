import gitlab
import os
from datetime import datetime, timedelta

# Hardcoded credentials for testing
TOKEN = os.getenv("GITLAB_TOKEN")
URL = os.getenv("GITLAB_URL", "https://gitlabproxy.lightinfosys.com")
PROJECT_ID = int(os.getenv("GITLAB_PROJECT_ID", "192"))

print(f"Connecting to {URL}...")
gl = gitlab.Gitlab(URL, private_token=TOKEN)
gl.auth()

try:
    project = gl.projects.get(PROJECT_ID)
    print(f"Project: {project.name}")

    # Get recent issues
    issues = project.issues.list(state='all', order_by='updated_at', per_page=50)
    
    found_time_log = False
    for issue_partial in issues:
        if found_time_log: break
        
        # Fetch full issue object
        issue = project.issues.get(issue_partial.iid)
        
        # Check time stats
        stats = issue.time_stats()
        if stats.get('total_time_spent', 0) == 0:
            continue
            
        print(f"\nFound Issue #{issue.iid} with time spent: {stats['total_time_spent']}s")
        
        # Inspect notes for time tracking
        print("  Checking notes for time logs...")
        notes = issue.notes.list(per_page=50)
        for note in notes:
            if getattr(note, 'system', False):
                # Look for time tracking text
                if "added" in note.body and "of time spent" in note.body:
                    print(f"    - Note ({note.created_at}): {note.body}")
                    found_time_log = True


            # Fallback: check notes?
            
except Exception as e:
    print(f"Error: {e}")
