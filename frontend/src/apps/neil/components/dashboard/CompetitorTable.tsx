
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';
import { Competitor } from '../../types';

interface CompetitorTableProps {
    competitors: Competitor[];
    onSelectCompetitor: (id: string) => void;
}

export function CompetitorTable({ competitors, onSelectCompetitor }: CompetitorTableProps) {
    return (
        <div className="space-y-6 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-200">Competitor Data</h3>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-900/80 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-bold">Company</th>
                            <th className="px-6 py-4 font-bold">Tier</th>
                            <th className="px-6 py-4 font-bold text-center">Presence</th>
                            <th className="px-6 py-4 font-bold text-center">Innovation</th>
                            <th className="px-6 py-4 font-bold">Threat Level</th>
                            <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                        {competitors.map((comp) => (
                            <tr key={comp.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">
                                    {comp.name}
                                    <div className="text-xs text-slate-500 font-normal mt-0.5">{comp.website}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="bg-slate-950 border-slate-800 text-slate-400">
                                        {comp.tier}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
                                        {comp.marketPresence ?? '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
                                        {comp.innovationScore ?? '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 ${comp.threatLevel === 'Critical' ? 'text-red-500' :
                                        comp.threatLevel === 'High' ? 'text-orange-500' :
                                            'text-slate-500'
                                        }`}>
                                        <ShieldAlert className="w-3 h-3" />
                                        {comp.threatLevel || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                                        onClick={() => onSelectCompetitor(comp.id)}
                                    >
                                        Analyze
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
