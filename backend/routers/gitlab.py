from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional, List
try:
    from ..services.gitlab_service import GitLabService
except ImportError:
    from services.gitlab_service import GitLabService

router = APIRouter()

import os

def get_gitlab_service(
    x_gitlab_token: Optional[str] = Header(None),
    x_gitlab_url: Optional[str] = Header(None)
):
    token = x_gitlab_token or os.getenv("GITLAB_TOKEN")
    url = x_gitlab_url or os.getenv("GITLAB_URL") or "https://gitlab.com"

    print(f"DEBUG: Using Token: {'Yes' if token else 'No'}")
    print(f"DEBUG: Using URL: {url}")

    if not token:
        print("DEBUG: Token missing")
        raise HTTPException(status_code=401, detail="GitLab Token is required (Header or Env Var)")
    
    try:
        service = GitLabService(token=token, url=url)
        # Verify connection
        user = service.gl.user
        print(f"DEBUG: GitLab connection successful. User: {user.username if user else 'Unknown'}")
        return service
    except Exception as e:
        print(f"DEBUG: GitLab connection failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"GitLab connection failed: {str(e)}")

@router.get("/projects")
def list_projects(service: GitLabService = Depends(get_gitlab_service)):
    try:
        return service.list_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}/milestones")
def list_milestones(project_id: int, service: GitLabService = Depends(get_gitlab_service)):
    try:
        return service.list_milestones(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}/milestones/{milestone_id}/summary")
def get_milestone_summary(
    project_id: int, 
    milestone_id: int, 
    service: GitLabService = Depends(get_gitlab_service),
    x_openai_key: Optional[str] = Header(None)
):
    try:
        return service.get_milestone_summary(project_id, milestone_id, api_key=x_openai_key)
    except Exception as e:
        import traceback
        with open("backend_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
from pydantic import BaseModel
from typing import List

class MultiProjectSummaryRequest(BaseModel):
    project_ids: List[int]
    milestone_title: str

@router.post("/summary")
def get_multi_project_summary(
    request: MultiProjectSummaryRequest,
    service: GitLabService = Depends(get_gitlab_service),
    x_openai_key: Optional[str] = Header(None)
):
    try:
        return service.get_multi_project_summary(
            project_ids=request.project_ids, 
            milestone_title=request.milestone_title, 
            api_key=x_openai_key
        )
    except Exception as e:
        import traceback
        with open("backend_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
