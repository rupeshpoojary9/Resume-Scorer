
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryChart from './HistoryChart';
import AssigneeTable from './AssigneeTable';

interface SummaryViewProps {
    data: {
        milestone: string;
        summary: string;
        issues: {
            "Req::Feature": string[];
            "Req::Enhancement": string[];
            "Req::Bug": string[];
            "Other": string[];
        };
        history?: any[];
        assignees?: {
            [name: string]: {
                title: string;
                status: string;
                labels: string[];
                web_url: string;
                state: string;
                has_time_stats: boolean;
                is_daily_compliant: boolean;
                is_overdue: boolean;
            }[]
        };
        unassigned?: number;
    };
}

export default function SummaryView({ data }: SummaryViewProps) {
    const { milestone, summary, issues, history, assignees, unassigned } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{milestone}</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* AI Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                {typeof summary === 'string' ? (
                                    <ReactMarkdown>{summary}</ReactMarkdown>
                                ) : (
                                    <p className="text-muted-foreground italic">No summary available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts Section */}
                    <div className="space-y-6">
                        {history && history.length > 0 && (
                            <HistoryChart data={history} />
                        )}
                        {assignees && (
                            <AssigneeTable assignees={assignees} unassigned={unassigned || 0} />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                    {/* Detailed Issues */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <IssueList title="Features" issues={issues["Req::Feature"]} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" />
                        <IssueList title="Enhancements" issues={issues["Req::Enhancement"]} color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" />
                        <IssueList title="Bugs" issues={issues["Req::Bug"]} color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" />
                        <IssueList title="Other Tasks" issues={issues["Other"]} color="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function IssueList({ title, issues, color }: { title: string, issues: string[], color: string }) {
    if (!issues || issues.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                    {title}
                    <Badge variant="secondary" className={color}>{issues.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <ul className="space-y-2">
                        {issues.map((issue, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                                {issue.replace(/^- /, '')}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
