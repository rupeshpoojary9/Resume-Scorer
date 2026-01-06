import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssigneeChartProps {
    assignees: { [name: string]: { [status: string]: number } };
    unassigned: number;
}

export default function AssigneeChart({ assignees }: AssigneeChartProps) {
    // Transform data for Recharts
    const data = Object.entries(assignees).map(([name, counts]) => ({
        name,
        ...counts
    }));

    // Add unassigned if needed, though it might not have status breakdown in current backend logic (it does not, just a count).
    // If unassigned is just a number, we can't easily stack it unless we assume a status or change backend.
    // For now, let's just show assignees as requested.

    // Sort by total count
    data.sort((a, b) => {
        const totalA = Object.values(a).filter(v => typeof v === 'number').reduce((sum: number, v) => sum + (v as number), 0);
        const totalB = Object.values(b).filter(v => typeof v === 'number').reduce((sum: number, v) => sum + (v as number), 0);
        return totalB - totalA;
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Assignee Workload & Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 40,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Status::Open" stackId="a" fill="#94a3b8" name="Open" />
                            <Bar dataKey="Status::In Discussion" stackId="a" fill="#facc15" name="In Discussion" />
                            <Bar dataKey="Status::Progress" stackId="a" fill="#3b82f6" name="In Progress" />
                            <Bar dataKey="Status::In MR" stackId="a" fill="#8b5cf6" name="In MR" />
                            <Bar dataKey="Status::In QA" stackId="a" fill="#f97316" name="In QA" />
                            <Bar dataKey="Signoff::Solutions" stackId="a" fill="#0ea5e9" name="Signoff Solutions" />
                            <Bar dataKey="Signoff::Development" stackId="a" fill="#0284c7" name="Signoff Dev" />
                            <Bar dataKey="Status::Closed" stackId="a" fill="#22c55e" name="Closed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
