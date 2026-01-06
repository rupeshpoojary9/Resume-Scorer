import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitMerge, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import ProjectSelector from './ProjectSelector';
import MilestoneSelector from './MilestoneSelector';
import SummaryView from './SummaryView';

export default function GitLabTracker() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('gitlab_projectIds');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedMilestoneTitle, setSelectedMilestoneTitle] = useState<string | null>(() => {
        return localStorage.getItem('gitlab_milestoneTitle') || null;
    });

    const [loading, setLoading] = useState(false);

    const [summaryData, setSummaryData] = useState<any | null>(() => {
        const saved = sessionStorage.getItem('gitlab_summaryData');
        return saved ? JSON.parse(saved) : null;
    });

    // Save selection to local storage
    useEffect(() => {
        localStorage.setItem('gitlab_projectIds', JSON.stringify(selectedProjectIds));
    }, [selectedProjectIds]);

    useEffect(() => {
        if (selectedMilestoneTitle) {
            localStorage.setItem('gitlab_milestoneTitle', selectedMilestoneTitle);
        } else {
            localStorage.removeItem('gitlab_milestoneTitle');
        }
    }, [selectedMilestoneTitle]);

    // Save summary to session storage
    useEffect(() => {
        if (summaryData) {
            sessionStorage.setItem('gitlab_summaryData', JSON.stringify(summaryData));
        } else {
            sessionStorage.removeItem('gitlab_summaryData');
        }
    }, [summaryData]);

    const fetchProjects = async () => {
        setLoading(true);

        // Safety timeout
        const timeoutId = setTimeout(() => {
            setLoading(false);
            console.error("Project fetch timed out");
        }, 30000);

        try {
            const response = await api.get('/gitlab/projects');
            setProjects(response.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    // Auto-fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const handleGenerateSummary = async () => {
        if (selectedProjectIds.length === 0 || !selectedMilestoneTitle) return;
        setLoading(true);
        setSummaryData(null);
        try {
            const response = await api.post('/gitlab/summary', {
                project_ids: selectedProjectIds,
                milestone_title: selectedMilestoneTitle
            });
            setSummaryData(response.data);
        } catch (error) {
            console.error("Failed to generate summary", error);
            alert("Failed to generate summary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background p-8 font-sans text-foreground">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Foundry
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                                GitLab Tracker <GitMerge className="w-6 h-6 text-orange-600" />
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Track milestones and generate AI summaries across multiple projects.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selection & Action */}
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProjectSelector
                            projects={projects}
                            selectedProjectIds={selectedProjectIds}
                            onSelect={setSelectedProjectIds}
                        />

                        {selectedProjectIds.length > 0 && (
                            <MilestoneSelector
                                projectIds={selectedProjectIds}
                                selectedMilestoneTitle={selectedMilestoneTitle}
                                onSelect={setSelectedMilestoneTitle}
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                <p className="text-muted-foreground">Loading projects...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-muted-foreground">No projects found. Check your backend configuration.</p>
                                <Button onClick={fetchProjects}>Retry</Button>
                            </div>
                        )}
                    </div>
                )}

                {selectedProjectIds.length > 0 && selectedMilestoneTitle && (
                    <div className="flex justify-center">
                        <Button size="lg" onClick={handleGenerateSummary} disabled={loading} className="w-full md:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Summary...
                                </>
                            ) : (
                                "Generate AI Summary"
                            )}
                        </Button>
                    </div>
                )}

                {/* Summary View */}
                {summaryData && <SummaryView data={summaryData} />}
            </div>
        </main>
    );
}
