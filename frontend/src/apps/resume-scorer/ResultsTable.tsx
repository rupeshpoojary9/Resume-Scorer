import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star } from 'lucide-react';



interface ResultsTableProps {
    selectedJdId: number | null;
}

export default function ResultsTable({ selectedJdId }: ResultsTableProps) {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

    useEffect(() => {
        if (selectedJdId) {
            fetchAnalysis();
        } else {
            setCandidates([]);
        }
    }, [selectedJdId]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/analysis?jd_id=${selectedJdId}`);
            setCandidates(response.data);
        } catch (error) {
            console.error("Failed to fetch results", error);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictVariant = (verdict: string) => {
        switch (verdict?.toLowerCase()) {
            case 'highly relevant': return 'success';
            case 'relevant': return 'default';
            case 'borderline': return 'warning';
            case 'not relevant': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Candidate Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading results...</div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No candidates analyzed yet. Upload resumes to begin.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3">Rank</th>
                                        <th className="px-4 py-3">Candidate</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">Verdict</th>
                                        <th className="px-4 py-3">Experience</th>
                                        <th className="px-4 py-3">Top Skills</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate, index) => (
                                        <motion.tr
                                            key={candidate.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium">#{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{candidate.parsed_json?.name || "Unknown"}</div>
                                                <div className="text-xs text-muted-foreground">{candidate.filename}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 font-bold text-lg">
                                                    {candidate.score_json?.score || 0}
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getVerdictVariant(candidate.score_json?.verdict)}>
                                                    {candidate.score_json?.verdict || "Pending"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {candidate.parsed_json?.total_experience_years} years
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate">
                                                {candidate.parsed_json?.skills?.technical?.slice(0, 3).join(", ")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                                                    View <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Simple Detail View Modal (Inline for now) */}
            {selectedCandidate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCandidate(null)}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedCandidate.parsed_json?.name}</h2>
                                <p className="text-muted-foreground">{selectedCandidate.parsed_json?.email}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">{selectedCandidate.score_json?.score}</div>
                                <Badge variant={getVerdictVariant(selectedCandidate.score_json?.verdict)}>
                                    {selectedCandidate.score_json?.verdict}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-1">AI Reasoning</h3>
                                <p className="text-sm bg-muted p-3 rounded-md italic">"{selectedCandidate.score_json?.reasoning}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-1 text-green-600">Matching Skills</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {selectedCandidate.score_json?.matching_skills?.map((s: string) => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1 text-red-600">Missing Skills</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {selectedCandidate.score_json?.missing_skills?.map((s: string) => <li key={s}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-1">Summary</h3>
                                <p className="text-sm text-muted-foreground">{selectedCandidate.parsed_json?.summary || "No summary available."}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
