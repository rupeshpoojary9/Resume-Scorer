
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, ExternalLink, Clock, AlertCircle, CheckCircle2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssueDetail {
    title: string;
    web_url: string;
    state: string;
    labels: string[];
    status: string;
    has_time_stats: boolean;
    is_daily_compliant: boolean;
    is_overdue: boolean;
    due_date?: string;
}

interface AssigneeTableProps {
    assignees: { [name: string]: IssueDetail[] };
    unassigned: number;
}

const STATUS_COLORS: { [key: string]: string } = {
    "Status::Open": "#94a3b8", // Slate 400
    "Status::Discussion required": "#facc15", // Yellow 400
    "Status::Progress": "#3b82f6", // Blue 500
    "Status::Merge Request": "#8b5cf6", // Violet 500
    "Status::QA Testing": "#f97316", // Orange 500
    "Signoff::Solutions": "#0ea5e9", // Sky 500
    "Signoff::Development": "#0284c7", // Sky 700
    "Status::Closed": "#22c55e", // Green 500
};

const STATUS_LABELS: { [key: string]: string } = {
    "Status::Open": "Open",
    "Status::Discussion required": "Discussion",
    "Status::Progress": "In Progress",
    "Status::Merge Request": "In MR",
    "Status::QA Testing": "In QA",
    "Signoff::Solutions": "Signoff Sol",
    "Signoff::Development": "Signoff Dev",
    "Status::Closed": "Closed",
};

const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || "#cbd5e1"; // Default to Slate 300
};

const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status.replace("Status::", "").replace("Signoff::", "");
};

export default function AssigneeTable({ assignees, unassigned }: AssigneeTableProps) {
    // DEBUG: Check incoming data
    console.log('AssigneeTable received assignees:', assignees);

    // Transform data
    const data = Object.entries(assignees).map(([name, issues]) => {
        const total = issues.length;
        // Calculate counts for the progress bar
        const counts: { [status: string]: number } = {};
        let signoffCount = 0;
        let missingTimeCount = 0;
        let overdueCount = 0;

        issues.forEach(issue => {
            counts[issue.status] = (counts[issue.status] || 0) + 1;
            if (issue.labels.some(l => l.startsWith("Signoff::"))) {
                signoffCount++;
            }
            // Check daily compliance instead of just having stats
            if (!issue.is_daily_compliant) {
                missingTimeCount++;
            }
            if (issue.is_overdue) {
                overdueCount++;
            }
        });
        return { name, issues, total, counts, signoffCount, missingTimeCount, overdueCount };
    });

    // Sort by total count descending
    data.sort((a, b) => b.total - a.total);

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader>
                <CardTitle>Assignee Workload & Status</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    {Object.entries(STATUS_LABELS)
                        .filter(([key]) => !key.startsWith("Signoff::"))
                        // Deduplicate labels for display
                        .filter((item, index, self) => index === self.findIndex((t) => t[1] === item[1]))
                        .map(([key, label]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: STATUS_COLORS[key] }}
                                />
                                <span className="text-muted-foreground">{label}</span>
                            </div>
                        ))}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableCaption>Click on a row to view detailed issue list.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="w-[180px]">Assignee</TableHead>
                                <TableHead className="w-[60px] text-right">Total</TableHead>
                                <TableHead className="w-[80px] text-center">Sign-offs</TableHead>
                                <TableHead className="w-[100px] text-center">Missing Time</TableHead>
                                <TableHead className="w-[80px] text-center">Overdue</TableHead>
                                <TableHead className="min-w-[200px]">Status Breakdown</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <ExpandableRow key={row.name} row={row} />
                            ))}
                            {unassigned > 0 && (
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell className="font-medium text-muted-foreground">Unassigned</TableCell>
                                    <TableCell className="text-right">{unassigned}</TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell className="text-center">-</TableCell>
                                    <TableCell>
                                        <div className="h-6 w-full rounded-full bg-muted-foreground/20" />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function ExpandableRow({ row }: { row: { name: string, issues: IssueDetail[], total: number, counts: { [status: string]: number }, signoffCount: number, missingTimeCount: number, overdueCount: number } }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <TableRow
                className={`cursor-pointer hover:bg-muted/50 ${row.missingTimeCount > 0 ? 'border-l-4 border-l-destructive' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        {row.name}
                        {row.missingTimeCount > 0 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Missing time tracking (Daily)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </TableCell>
                <TableCell className="text-right">{row.total}</TableCell>
                <TableCell className="text-center">
                    {row.signoffCount > 0 ? (
                        <Badge className="bg-sky-600 hover:bg-sky-700">{row.signoffCount}</Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                    )}
                </TableCell>
                <TableCell className="text-center">
                    {row.missingTimeCount > 0 ? (
                        <Badge variant="destructive" className="flex items-center justify-center gap-1 w-fit mx-auto">
                            <AlertCircle className="h-3 w-3" /> {row.missingTimeCount}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center justify-center gap-1 w-fit mx-auto">
                            <CheckCircle2 className="h-3 w-3" /> 0
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="text-center">
                    {row.overdueCount > 0 ? (
                        <Badge variant="destructive" className="flex items-center justify-center gap-1 w-fit mx-auto">
                            <CalendarClock className="h-3 w-3" /> {row.overdueCount}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                    )}
                </TableCell>
                <TableCell>
                    <div className="flex h-6 w-full rounded-full overflow-hidden bg-muted">
                        {Object.entries(row.counts)
                            .sort(([a], [b]) => {
                                const order = [
                                    "Status::Open",
                                    "Status::Discussion required",
                                    "Signoff::Development",
                                    "Signoff::Solutions",
                                    "Status::Progress",
                                    "Status::Merge Request",
                                    "Status::QA Testing",
                                    "Status::Closed"
                                ];
                                return order.indexOf(a) - order.indexOf(b);
                            })
                            .map(([status, count]) => {
                                if (count === 0) return null;
                                const width = (count / row.total) * 100;
                                return (
                                    <TooltipProvider key={status}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    style={{ width: `${width}%`, backgroundColor: getStatusColor(status) }}
                                                    className="h-full border-r border-background last:border-r-0"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: getStatusColor(status) }}
                                                    />
                                                    <p>{getStatusLabel(status)}: {count}</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={7}>
                        <div className="p-4 space-y-2">
                            {row.issues.map((issue, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between bg-background p-3 rounded-md border shadow-sm ${((issue.status === "Status::Progress") && !issue.is_daily_compliant) ? 'border-l-4 border-l-destructive bg-red-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: getStatusColor(issue.status) }}
                                            title={issue.status}
                                        />
                                        <a
                                            href={issue.web_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium hover:underline truncate flex items-center gap-1"
                                        >
                                            {issue.title}
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Overdue Badge */}
                                        {issue.is_overdue && (
                                            <Badge variant="destructive" className="gap-1">
                                                <CalendarClock className="h-3 w-3" /> Overdue
                                            </Badge>
                                        )}

                                        {/* Time Status - Only for Progress Lane */}
                                        {(issue.status === "Status::Progress") && (
                                            issue.is_daily_compliant ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                    <Clock className="h-3 w-3" /> Time Logged
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Missing Time
                                                </Badge>
                                            )
                                        )}

                                        {/* Status Badge */}
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {getStatusLabel(issue.status)}
                                        </Badge>

                                        {/* Signoff Badges */}
                                        {issue.labels.includes("Signoff::Solutions") && (
                                            <Badge className="bg-sky-500 hover:bg-sky-600 text-xs whitespace-nowrap">Signoff Sol</Badge>
                                        )}
                                        {issue.labels.includes("Signoff::Development") && (
                                            <Badge className="bg-sky-700 hover:bg-sky-800 text-xs whitespace-nowrap">Signoff Dev</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
