
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketSegment, Competitor } from '../../types';

interface MarketSegmentListProps {
    segments: MarketSegment[];
    competitors: Competitor[];
    onSelectCompetitor: (id: string) => void;
}

export function MarketSegmentList({ segments, competitors, onSelectCompetitor }: MarketSegmentListProps) {
    return (
        <div className="xl:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-200">Market Segments</h3>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {segments.map((segment, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className={`text-base ${i === 0 ? 'text-red-400' : i === 1 ? 'text-blue-400' : 'text-emerald-400'
                                }`}>
                                {segment.name}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 line-clamp-2">
                                {segment.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {segment.companies.map((company, j) => (
                                    <Badge
                                        key={j}
                                        variant="secondary"
                                        className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer"
                                        onClick={() => {
                                            const comp = competitors.find(c => c.name === company);
                                            if (comp) onSelectCompetitor(comp.id);
                                        }}
                                    >
                                        {company}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
