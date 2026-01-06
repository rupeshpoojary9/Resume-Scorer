
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryData {
    milestone: string;
    due_date: string | null;
    counts: {
        "Req::Feature": number;
        "Req::Enhancement": number;
        "Req::Bug": number;
    };
}

interface HistoryChartProps {
    data: HistoryData[];
}

export default function HistoryChart({ data }: HistoryChartProps) {
    // Transform data for Recharts
    const chartData = data.map(item => ({
        name: item.milestone,
        Features: item.counts["Req::Feature"],
        Enhancements: item.counts["Req::Enhancement"],
        Bugs: item.counts["Req::Bug"],
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Milestone History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Features" stackId="a" fill="#4ade80" />
                            <Bar dataKey="Enhancements" stackId="a" fill="#60a5fa" />
                            <Bar dataKey="Bugs" stackId="a" fill="#f87171" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
