import gitlab
import os
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from .ai_service import get_llm

class GitLabService:
    def __init__(self, token: str, url: str = "https://gitlabproxy.lightinfosys.com"):
        self.gl = gitlab.Gitlab(url, private_token=token)
        self.gl.auth()

    def list_projects(self, search: str = None) -> List[Dict[str, Any]]:
        """List projects accessible by the user."""
        whitelist = ["neil", "eddie", "autobots", "eddie-v2", "marvin"]
        found_projects = []
        seen_ids = set()

        # Optimization: Fetch only whitelisted projects specifically
        print(f"DEBUG: Starting project fetch for whitelist: {whitelist}", flush=True)
        for name in whitelist:
            try:
                print(f"DEBUG: Searching for project: {name}", flush=True)
                # Search specifically for this name
                projects = self.gl.projects.list(
                    search=name,
                    simple=True,
                    per_page=20
                )
                print(f"DEBUG: Found {len(projects)} projects for search '{name}'", flush=True)
                
                for p in projects:
                    # Exact matching: check if name matches exactly (case insensitive)
                    if name.lower() == p.name.lower():
                        if p.id not in seen_ids:
                            found_projects.append(p)
                            seen_ids.add(p.id)
                            print(f"DEBUG: Added project {p.name} (ID: {p.id})", flush=True)
            except Exception as e:
                print(f"Error fetching project {name}: {e}", flush=True)
                continue
        
        return [{"id": p.id, "name": p.name, "path_with_namespace": p.path_with_namespace} for p in found_projects]

    def list_milestones(self, project_id: int) -> List[Dict[str, Any]]:
        """List milestones for a project."""
        print(f"DEBUG: Fetching milestones for project {project_id}")
        try:
            project = self.gl.projects.get(project_id)
            # Optimized: Fetch first 100 active milestones instead of ALL
            # This avoids timeouts on large projects. 
            # If more than 100 active milestones, we might need a search or pagination UI, 
            # but for a dropdown, 100 is a reasonable limit.
            milestones = project.milestones.list(state='active', per_page=100, include_ancestors=True)
            print(f"DEBUG: Found {len(milestones)} active milestones")
            return [{"id": m.id, "title": m.title, "due_date": m.due_date} for m in milestones]
        except Exception as e:
            import traceback
            with open("backend_error.log", "w") as f:
                f.write(traceback.format_exc())
            print(f"ERROR listing milestones: {e}")
            raise e

    def _get_milestone(self, project, milestone_id: int):
        """
        Efficiently fetch a milestone by ID, checking project and ancestor groups.
        """
        # 1. Try project milestone
        try:
            return project.milestones.get(milestone_id)
        except gitlab.exceptions.GitlabGetError as e:
            if e.response_code != 404:
                raise e

        # 2. Check group hierarchy
        if hasattr(project, 'namespace') and project.namespace.get('kind') == 'group':
            try:
                group_id = project.namespace['id']
                while group_id:
                    group = self.gl.groups.get(group_id)
                    try:
                        return group.milestones.get(milestone_id)
                    except gitlab.exceptions.GitlabGetError as e:
                        if e.response_code != 404:
                            raise e
                    
                    # Move to parent
                    group_id = group.parent_id
            except Exception as e:
                print(f"Error traversing groups: {e}")
        
        return None

    def get_milestone_summary(self, project_id: int, milestone_id: int, api_key: str = None) -> Dict[str, Any]:
        """
        Fetches issues for a milestone, filters by labels, and generates an AI summary.
        """
        project = self.gl.projects.get(project_id)
        
        # Optimized fetch: Try to get milestone directly instead of listing all
        milestone = self._get_milestone(project, milestone_id)
        
        if not milestone:
            # Fallback to list if direct fetch failed (unlikely but safe)
            print("DEBUG: Direct milestone fetch failed, falling back to list")
            all_milestones = project.milestones.list(state='all', all=True, include_ancestors=True)
            milestone = next((m for m in all_milestones if m.id == milestone_id), None)
        
        if not milestone:
            raise Exception(f"Milestone with ID {milestone_id} not found in project or ancestors")
        issues = project.issues.list(milestone=milestone.title, state='all', per_page=100)

        # Categorize issues
        categories = {
            "Req::Feature": [],
            "Req::Enhancement": [],
            "Req::Bug": [],
            "Other": []
        }
        
        assignee_counts = {}
        unassigned_count = 0
        
        # Define statuses to track
        tracked_statuses = [
            "Status::Open", "Status::Discussion required", "Status::Progress", 
            "Status::Merge Request", "Status::QA Testing", "Signoff::Solutions", 
            "Signoff::Development", "Status::Closed"
        ]

        for issue in issues:
            # Categorization
            labels = issue.labels
            categorized = False
            for label in labels:
                if label in categories:
                    categories[label].append(f"- {issue.title} (State: {issue.state})")
                    categorized = True
                    break
            if not categorized:
                categories["Other"].append(f"- {issue.title} (State: {issue.state})")
            
            # DEBUG: Print labels to identify status mismatch
            print(f"DEBUG: Issue '{issue.title}' Labels: {labels}")

            # Determine status for this issue based on priority
            # Issues might have multiple labels (e.g. "Status::Open" and "Status::Progress")
            # We want to pick the most specific/advanced status.
            
            status_priority = [
                "Status::Closed",
                "Status::QA Testing",
                "Status::Merge Request",
                "Status::Progress",
                "Signoff::Development",
                "Signoff::Solutions",
                "Status::Discussion required",
                "Status::Open"
            ]
            
            issue_status = "Status::Open" # Default
            
            # Check for matches in priority order
            found_status = False
            for status in status_priority:
                if status in labels:
                    issue_status = status
                    found_status = True
                    break
            
            # If no priority status found, check for any other Status:: or Signoff:: label
            if not found_status:
                for label in labels:
                    if label.startswith("Status::") or label.startswith("Signoff::"):
                        issue_status = label
                        break
            
            # Assignee counting with detailed breakdown
            # Handle both single assignee and multiple assignees
            assignees = []
            if hasattr(issue, 'assignees') and issue.assignees:
                assignees = issue.assignees
            elif hasattr(issue, 'assignee') and issue.assignee:
                assignees = [issue.assignee]
            
            # Check time stats and daily compliance
            # User Requirement: Only check for "progress lane" (Status::Progress)
            # For other lanes, we consider them compliant/having stats to avoid alerts.
            
            has_time_stats = True
            is_daily_compliant = True
            
            if issue_status == "Status::Progress":
                # 1. Check if ANY time is spent (has_time_stats)
                has_time_stats = False
                try:
                    time_stats = getattr(issue, 'time_stats', None)
                    if callable(time_stats):
                        time_stats = time_stats()
                    
                    if isinstance(time_stats, dict):
                        if time_stats.get('total_time_spent', 0) > 0:
                            has_time_stats = True
                except Exception as e:
                    print(f"Error checking time_stats: {e}")
                
                # 2. Check for daily compliance (time logged yesterday or today before 9am)
                is_daily_compliant = False
                try:
                    # Fetch recent notes to check for time logs
                    # Limit to 20 to avoid performance hit
                    notes = issue.notes.list(per_page=20)
                    
                    today = date.today()
                    yesterday = today - timedelta(days=1)
                    
                    for note in notes:
                        if getattr(note, 'system', False):
                            if "added" in note.body and "of time spent" in note.body:
                                # Parse date from note body "at YYYY-MM-DD"
                                import re
                                match = re.search(r'at (\d{4}-\d{2}-\d{2})', note.body)
                                log_date = None
                                
                                if match:
                                    try:
                                        log_date = datetime.strptime(match.group(1), '%Y-%m-%d').date()
                                    except ValueError:
                                        pass
                                
                                # Fallback to created_at
                                if not log_date:
                                    try:
                                        created_dt = datetime.strptime(note.created_at[:10], '%Y-%m-%d').date()
                                        log_date = created_dt
                                    except ValueError:
                                        pass
                                
                                if log_date:
                                    # Check if logged for yesterday or today
                                    if log_date == yesterday or log_date == today:
                                        is_daily_compliant = True
                                        break
                except Exception as e:
                    print(f"Error checking daily compliance: {e}")

            # DEBUG LOGGING TO FILE
            try:
                with open("debug.log", "a") as f:
                    f.write(f"Issue: {issue.title}\n")
                    f.write(f"  Labels: {labels}\n")
                    f.write(f"  Detected Status: {issue_status}\n")
                    f.write(f"  Has Time Stats: {has_time_stats}\n")
                    f.write(f"  Is Daily Compliant: {is_daily_compliant}\n")
                    f.write(f"  Time Stats Data: {time_stats if 'time_stats' in locals() else 'N/A'}\n")
                    f.write("-" * 30 + "\n")
            except Exception as e:
                print(f"Error writing to debug log: {e}")

            # Check due date
            # User Requirement: Do not count as overdue if in "Merge Request Status" (Status::Merge Request)
            is_overdue = False
            if issue.due_date and issue.state == 'opened' and issue_status == "Status::Progress":
                try:
                    due_date = datetime.strptime(issue.due_date, '%Y-%m-%d').date()
                    if due_date < date.today():
                        is_overdue = True
                except ValueError:
                    pass

            issue_detail = {
                "title": issue.title,
                "web_url": issue.web_url,
                "state": issue.state,
                "labels": labels,
                "status": issue_status,
                "has_time_stats": has_time_stats,
                "is_daily_compliant": is_daily_compliant,
                "is_overdue": is_overdue,
                "due_date": issue.due_date
            }

            if assignees:
                for assignee in assignees:
                    name = assignee.get('name', 'Unknown')
                    if name not in assignee_counts:
                        assignee_counts[name] = []
                    
                    assignee_counts[name].append(issue_detail)
            else:
                unassigned_count += 1

        # Prepare prompt for AI
        prompt = f"""
        You are a Project Manager. Summarize the progress of the following milestone: "{milestone.title}".
        
        Issues by Category:
        
        **Features (Req::Feature):**
        {chr(10).join(categories["Req::Feature"]) or "None"}
        
        **Enhancements (Req::Enhancement):**
        {chr(10).join(categories["Req::Enhancement"]) or "None"}
        
        **Bugs (Req::Bug):**
        {chr(10).join(categories["Req::Bug"]) or "None"}
        
        **Other Tasks:**
        {chr(10).join(categories["Other"]) or "None"}
        
        Task:
        1. Provide a high-level summary of what is being delivered.
        2. Highlight key features and enhancements.
        3. Mention any critical bugs being addressed.
        4. Assess the overall status based on issue states (Open/Closed).
        
        Return a concise markdown summary.
        """

        llm = get_llm(api_key)
        
        # Get history data
        history = self.get_milestone_history(project_id)

        if not llm:
            return {
                "milestone": milestone.title,
                "error": "No valid AI API key configured", 
                "issues": categories, 
                "history": history,
                "assignees": assignee_counts,
                "unassigned": unassigned_count
            }

        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content="You are a helpful project manager assistant."),
                HumanMessage(content=prompt)
            ]
            response = llm.invoke(messages)
            summary = str(response.content)
            
            return {
                "milestone": milestone.title,
                "summary": summary,
                "issues": categories,
                "history": history,
                "assignees": assignee_counts,
                "unassigned": unassigned_count
            }
        except Exception as e:
            import traceback
            with open("backend_error.log", "w") as f:
                f.write(traceback.format_exc())
            print(f"Error generating summary: {e}")
            return {
                "milestone": milestone.title,
                "error": str(e), 
                "issues": categories, 
                "history": history,
                "assignees": assignee_counts,
                "unassigned": unassigned_count
            }

    def get_milestone_history(self, project_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Fetches the last N milestones and counts issues by category.
        """
        try:
            project = self.gl.projects.get(project_id)
            
            # Optimized: Fetch recent milestones using API sorting instead of fetching ALL
            # We search for "Development" in title to narrow it down if possible, 
            # but list() search param might be strict.
            # Let's just get recent milestones and filter in memory, but limit the fetch.
            
            # Fetch last 20 milestones, sorted by due_date desc
            # Note: 'search' param can filter by title, but might be fuzzy.
            # We'll fetch a bit more than limit to allow for filtering.
            milestones = project.milestones.list(
                state='all', 
                per_page=20, 
                include_ancestors=True,
                sort='desc',
                order_by='due_date'
            )
            
            # Filter for "Development" milestones only
            # And ensure they have a due date (though sorting by due_date usually implies it)
            recent_milestones = [
                m for m in milestones 
                if m.title and m.title.startswith("Development")
            ]
            
            # Take top N
            recent_milestones = recent_milestones[:limit]
            history_data = []

            for m in recent_milestones:
                # We need to fetch issues for each to count them. This might be slow.
                # Optimization: Use statistics API if available, but issue count by label is specific.
                # We'll fetch issues with specific labels.
                
                # Actually, iterating 5 milestones and fetching issues might be too slow if many issues.
                # Let's try to do it efficiently.
                
                counts = {
                    "Req::Feature": 0,
                    "Req::Enhancement": 0,
                    "Req::Bug": 0
                }
                
                # Fetch only issues with these labels? Or all and count?
                # fetching all for a milestone is probably okay if < 100.
                issues = project.issues.list(milestone=m.title, state='all', per_page=100)
                
                for issue in issues:
                    for label in issue.labels:
                        if label in counts:
                            counts[label] += 1
                
                history_data.append({
                    "milestone": m.title,
                    "due_date": m.due_date,
                    "counts": counts
                })
            
            # Return in chronological order for the chart
            return history_data[::-1]
            
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []
    def get_multi_project_summary(self, project_ids: List[int], milestone_title: str, api_key: str = None) -> Dict[str, Any]:
        """
        Fetches issues for a milestone across multiple projects and generates an aggregated AI summary.
        """
        aggregated_categories = {
            "Req::Feature": [],
            "Req::Enhancement": [],
            "Req::Bug": [],
            "Other": []
        }
        aggregated_assignees = {}
        total_unassigned = 0
        projects_found = []

        for project_id in project_ids:
            try:
                project = self.gl.projects.get(project_id)
                projects_found.append(project.name)
                
                # Find milestone by title
                milestones = project.milestones.list(title=milestone_title, state='all', include_ancestors=True)
                if not milestones:
                    print(f"DEBUG: Milestone '{milestone_title}' not found in project {project.name}")
                    continue
                
                milestone = milestones[0] # Take the first match
                
                issues = project.issues.list(milestone=milestone.title, state='all', per_page=100)
                
                # Process issues (Reuse logic from get_milestone_summary ideally, but duplicating for safety/speed)
                for issue in issues:
                    # Categorization
                    labels = issue.labels
                    categorized = False
                    for label in labels:
                        if label in aggregated_categories:
                            aggregated_categories[label].append(f"- [{project.name}] {issue.title} (State: {issue.state})")
                            categorized = True
                            break
                    if not categorized:
                        aggregated_categories["Other"].append(f"- [{project.name}] {issue.title} (State: {issue.state})")
                    
                    # Status determination (simplified for aggregation, or full logic?)
                    # Let's use the full logic to be consistent
                    status_priority = [
                        "Status::Closed", "Status::QA Testing", "Status::Merge Request",
                        "Status::Progress", "Signoff::Development", "Signoff::Solutions",
                        "Status::Discussion required", "Status::Open"
                    ]
                    issue_status = "Status::Open"
                    found_status = False
                    for status in status_priority:
                        if status in labels:
                            issue_status = status
                            found_status = True
                            break
                    if not found_status:
                        for label in labels:
                            if label.startswith("Status::") or label.startswith("Signoff::"):
                                issue_status = label
                                break
                    
                    # Assignee
                    assignees = []
                    if hasattr(issue, 'assignees') and issue.assignees:
                        assignees = issue.assignees
                    elif hasattr(issue, 'assignee') and issue.assignee:
                        assignees = [issue.assignee]
                    
                    # Time stats / Compliance / Overdue (Simplified for summary view, or full?)
                    # The SummaryView expects specific fields in assignees list.
                    
                    has_time_stats = True
                    is_daily_compliant = True
                    
                    if issue_status == "Status::Progress":
                        has_time_stats = False
                        try:
                            time_stats = getattr(issue, 'time_stats', None)
                            if callable(time_stats): time_stats = time_stats()
                            if isinstance(time_stats, dict) and time_stats.get('total_time_spent', 0) > 0:
                                has_time_stats = True
                        except: pass
                        
                        # Daily compliance check is expensive (API calls per issue). 
                        # For multi-project, this might be too slow. 
                        # Let's SKIP daily compliance check for multi-project summary to ensure speed,
                        # or we can implement it if performance allows. 
                        # Let's implement it but be wary.
                        
                        is_daily_compliant = False
                        try:
                            notes = issue.notes.list(per_page=20)
                            today = date.today()
                            yesterday = today - timedelta(days=1)
                            for note in notes:
                                if getattr(note, 'system', False) and "added" in note.body and "of time spent" in note.body:
                                    import re
                                    match = re.search(r'at (\d{4}-\d{2}-\d{2})', note.body)
                                    log_date = None
                                    if match:
                                        try: log_date = datetime.strptime(match.group(1), '%Y-%m-%d').date()
                                        except: pass
                                    if not log_date:
                                        try: log_date = datetime.strptime(note.created_at[:10], '%Y-%m-%d').date()
                                        except: pass
                                    if log_date and (log_date == yesterday or log_date == today):
                                        is_daily_compliant = True
                                        break
                        except: pass

                    is_overdue = False
                    if issue.due_date and issue.state == 'opened' and issue_status == "Status::Progress":
                        try:
                            due_date = datetime.strptime(issue.due_date, '%Y-%m-%d').date()
                            if due_date < date.today():
                                is_overdue = True
                        except: pass

                    issue_detail = {
                        "title": issue.title,
                        "web_url": issue.web_url,
                        "state": issue.state,
                        "labels": labels,
                        "status": issue_status,
                        "has_time_stats": has_time_stats,
                        "is_daily_compliant": is_daily_compliant,
                        "is_overdue": is_overdue,
                        "due_date": issue.due_date,
                        "project": project.name # Add project name for context
                    }

                    if assignees:
                        for assignee in assignees:
                            name = assignee.get('name', 'Unknown')
                            if name not in aggregated_assignees:
                                aggregated_assignees[name] = []
                            aggregated_assignees[name].append(issue_detail)
                    else:
                        total_unassigned += 1

            except Exception as e:
                print(f"Error processing project {project_id}: {e}")
                continue

        # Generate AI Summary
        prompt = f"""
        You are a Project Manager. Summarize the progress of the milestone "{milestone_title}" across these projects: {', '.join(projects_found)}.
        
        Issues by Category:
        
        **Features (Req::Feature):**
        {chr(10).join(aggregated_categories["Req::Feature"]) or "None"}
        
        **Enhancements (Req::Enhancement):**
        {chr(10).join(aggregated_categories["Req::Enhancement"]) or "None"}
        
        **Bugs (Req::Bug):**
        {chr(10).join(aggregated_categories["Req::Bug"]) or "None"}
        
        **Other Tasks:**
        {chr(10).join(aggregated_categories["Other"]) or "None"}
        
        Task:
        1. Provide a high-level summary of what is being delivered across all projects.
        2. Highlight key features and enhancements.
        3. Mention any critical bugs being addressed.
        4. Assess the overall status.
        
        Return a concise markdown summary.
        """

        llm = get_llm(api_key)
        summary = "No AI Summary Available"
        
        if llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                messages = [
                    SystemMessage(content="You are a helpful project manager assistant."),
                    HumanMessage(content=prompt)
                ]
                response = llm.invoke(messages)
                summary = str(response.content)
            except Exception as e:
                print(f"Error generating summary: {e}")
                summary = f"Error generating summary: {str(e)}"

        # Get aggregated history
        history = self.get_multi_project_history(project_ids)

        return {
            "milestone": milestone_title,
            "summary": summary,
            "issues": aggregated_categories,
            "history": history,
            "assignees": aggregated_assignees,
            "unassigned": total_unassigned
        }

    def get_multi_project_history(self, project_ids: List[int], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Aggregates milestone history across multiple projects.
        Matches milestones by title.
        """
        aggregated_history = {} # title -> {due_date, counts}
        
        for project_id in project_ids:
            project_history = self.get_milestone_history(project_id, limit)
            
            for item in project_history:
                title = item['milestone']
                if title not in aggregated_history:
                    aggregated_history[title] = {
                        "milestone": title,
                        "due_date": item['due_date'],
                        "counts": {
                            "Req::Feature": 0,
                            "Req::Enhancement": 0,
                            "Req::Bug": 0
                        }
                    }
                
                # Sum counts
                for category, count in item['counts'].items():
                    if category in aggregated_history[title]['counts']:
                        aggregated_history[title]['counts'][category] += count
        
        # Convert to list
        history_list = list(aggregated_history.values())
        
        # Sort by due date (ascending)
        history_list.sort(key=lambda x: x['due_date'] or "")
        
        return history_list
