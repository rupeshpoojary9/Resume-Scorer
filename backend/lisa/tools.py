import os
from typing import Optional, List
from dotenv import load_dotenv
from langchain_core.tools import tool
try:
    from backend.services.gitlab_service import GitLabService
except ImportError:
    from services.gitlab_service import GitLabService

# Load environment variables from backend/.env
# Assuming we are running from the project root
load_dotenv("backend/.env")

# Initialize GitLab Service
# We assume env vars are set: GITLAB_TOKEN, GITLAB_URL, GITLAB_PROJECT_ID
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN")
GITLAB_URL = os.getenv("GITLAB_URL", "https://gitlabproxy.lightinfosys.com")
PROJECT_ID = int(os.getenv("GITLAB_PROJECT_ID", "192"))

gitlab_service = GitLabService(token=GITLAB_TOKEN, url=GITLAB_URL)

@tool
def list_issues(state: str = "opened") -> str:
    """
    List issues from the GitLab project.
    Args:
        state: "opened", "closed", or "all" (default: "opened")
    """
    if not PROJECT_ID:
        return "Error: GITLAB_PROJECT_ID not set."
    
    try:
        # We might need to adjust list_milestones or add a list_issues method to GitLabService
        # For now, let's assume we can access the project directly or add a method to the service.
        # Looking at gitlab_service.py, it has list_milestones. Let's add list_issues support if needed.
        # Or better, let's use the service's internal gl object if exposed, or add a wrapper.
        # Actually, let's check gitlab_service.py content again to be sure.
        # For now, I will implement a direct call using the service instance if possible, 
        # or I will modify GitLabService to expose what I need.
        
        # Let's assume we modify GitLabService to have a generic get_issues or similar, 
        # or we just use the existing list_milestones to get a summary.
        
        # Let's try to get the project and list issues directly for now using the service's client
        project = gitlab_service.gl.projects.get(PROJECT_ID)
        issues = project.issues.list(state=state, per_page=20)
        
        result = []
        for issue in issues:
            assignee_name = "None"
            if issue.assignee:
                # DEBUG LOGGING
                print(f"DEBUG: issue {issue.iid} assignee type: {type(issue.assignee)}")
                print(f"DEBUG: issue {issue.iid} assignee content: {issue.assignee}")
                
                if isinstance(issue.assignee, dict):
                    assignee_name = issue.assignee.get('name', 'Unknown')
                else:
                    # It might be a RESTObject or similar
                    try:
                        assignee_name = getattr(issue.assignee, 'name', 'Unknown')
                    except AttributeError:
                        assignee_name = str(issue.assignee)

            result.append(f"#{issue.iid}: {issue.title} (Status: {issue.state}, Assignee: {assignee_name})")
        
        return "\n".join(result) if result else "No issues found."
    except Exception as e:
        return f"Error listing issues: {str(e)}"

@tool
def create_issue(title: str, description: str = "", assignee_id: Optional[int] = None) -> str:
    """
    Create a new issue in the GitLab project.
    Args:
        title: Title of the issue
        description: Description of the issue
        assignee_id: Optional ID of the user to assign
    """
    if not PROJECT_ID:
        return "Error: GITLAB_PROJECT_ID not set."
    
    try:
        project = gitlab_service.gl.projects.get(PROJECT_ID)
        issue_data = {'title': title, 'description': description}
        if assignee_id:
            issue_data['assignee_ids'] = [assignee_id]
            
        issue = project.issues.create(issue_data)
        return f"Created issue #{issue.iid}: {issue.title} ({issue.web_url})"
    except Exception as e:
        return f"Error creating issue: {str(e)}"

@tool
def add_comment(issue_iid: int, comment: str) -> str:
    """
    Add a comment to an existing issue.
    Args:
        issue_iid: The IID (internal ID) of the issue (e.g. 1 for issue #1)
        comment: The text of the comment
    """
    if not PROJECT_ID:
        return "Error: GITLAB_PROJECT_ID not set."
    
    try:
        project = gitlab_service.gl.projects.get(PROJECT_ID)
        issue = project.issues.get(issue_iid)
        note = issue.notes.create({'body': comment})
        return f"Added comment to issue #{issue_iid}."
    except Exception as e:
        return f"Error adding comment: {str(e)}"

@tool
def get_milestone_summary_tool(milestone_id: int) -> str:
    """
    Get a summary of a specific milestone.
    Args:
        milestone_id: The ID of the milestone
    """
    try:
        summary = gitlab_service.get_milestone_summary(PROJECT_ID, milestone_id)
        # Format summary for LLM
        return str(summary)
    except Exception as e:
        return f"Error getting milestone summary: {str(e)}"

@tool
def list_milestones(state: str = "active") -> str:
    """
    List milestones in the project.
    Args:
        state: "active" or "all" (default: "active")
    """
    if not PROJECT_ID:
        return "Error: GITLAB_PROJECT_ID not set."
    
    try:
        project = gitlab_service.gl.projects.get(PROJECT_ID)
        milestones = project.milestones.list(state=state)
        
        if not milestones:
            return "No milestones found."
            
        result = []
        for m in milestones:
            result.append(f"ID: {m.id}, Title: {m.title}, Due: {m.due_date}")
        return "\n".join(result)
    except Exception as e:
        return f"Error listing milestones: {str(e)}"

@tool
def update_issue(issue_iid: int, milestone_id: Optional[int] = None, due_date: Optional[str] = None, assignee_ids: Optional[List[int]] = None, labels: Optional[List[str]] = None) -> str:
    """
    Update an existing issue.
    Args:
        issue_iid: The IID of the issue to update
        milestone_id: Optional ID of the milestone to set
        due_date: Optional due date (YYYY-MM-DD)
        assignee_ids: Optional list of user IDs to assign
        labels: Optional list of labels to set (replaces existing labels)
    """
    if not PROJECT_ID:
        return "Error: GITLAB_PROJECT_ID not set."
    
    try:
        project = gitlab_service.gl.projects.get(PROJECT_ID)
        issue = project.issues.get(issue_iid)
        
        updates = {}
        if milestone_id is not None:
            updates['milestone_id'] = milestone_id
        if due_date is not None:
            updates['due_date'] = due_date
        if assignee_ids is not None:
            updates['assignee_ids'] = assignee_ids
        if labels is not None:
            updates['labels'] = labels
            
        if not updates:
            return "No updates provided."
            
        # Apply updates
        for key, value in updates.items():
            setattr(issue, key, value)
            
        issue.save()
        return f"Updated issue #{issue_iid}. Changes: {', '.join(updates.keys())}"
    except Exception as e:
        return f"Error updating issue: {str(e)}"

GITLAB_TOOLS = [list_issues, create_issue, add_comment, get_milestone_summary_tool, list_milestones, update_issue]
