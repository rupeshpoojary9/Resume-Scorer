
import { Target } from 'lucide-react';
import { Competitor } from '../../types';

interface MarketQuadrantProps {
    competitors: Competitor[];
    onSelectCompetitor: (id: string) => void;
}

export function MarketQuadrant({ competitors, onSelectCompetitor }: MarketQuadrantProps) {
    return (
        <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800" />
                <h3 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
                    <Target className="w-6 h-6 text-orange-500" /> Competitive Quadrant
                </h3>
                <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="relative w-full aspect-[16/9] bg-slate-900/50 rounded-3xl border border-slate-800 p-8 overflow-hidden shadow-2xl backdrop-blur-sm">
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Axes */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700/50" />
                    <div className="absolute left-1/2 top-0 h-full w-px bg-slate-700/50" />

                    {/* Quadrant Labels */}
                    <div className="absolute top-4 left-4 text-slate-500 font-bold uppercase tracking-widest text-sm">Disruptors</div>
                    <div className="absolute top-4 right-4 text-slate-500 font-bold uppercase tracking-widest text-sm text-right">Leaders</div>
                    <div className="absolute bottom-4 left-4 text-slate-500 font-bold uppercase tracking-widest text-sm">Niche Players</div>
                    <div className="absolute bottom-4 right-4 text-slate-500 font-bold uppercase tracking-widest text-sm text-right">Contenders</div>

                    {/* Axis Labels */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-600 font-medium">Market Presence →</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-600 font-medium">Innovation / Threat →</div>
                </div>

                {/* Competitor Dots */}
                <div className="relative w-full h-full">
                    {competitors.map((comp, i) => {
                        // Default to center if scores missing
                        const x = comp.marketPresence || 50;
                        const y = comp.innovationScore || 50;

                        return (
                            <div
                                key={i}
                                className="absolute group cursor-pointer transition-all duration-500 ease-out hover:z-50"
                                style={{
                                    left: `${x}%`,
                                    bottom: `${y}%`,
                                    transform: 'translate(-50%, 50%)'
                                }}
                                onClick={() => onSelectCompetitor(comp.id)}
                            >
                                {/* Dot */}
                                <div className={`
                                w-4 h-4 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-150
                                ${comp.tier === 'Tier 1' ? 'bg-red-500 border-red-300 shadow-red-500/50' :
                                        comp.tier === 'Tier 2' ? 'bg-blue-500 border-blue-300 shadow-blue-500/50' :
                                            'bg-slate-500 border-slate-300'}
                            `} />

                                {/* Label */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-slate-300 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800">
                                        {comp.name}
                                    </span>
                                </div>

                                {/* Hover Card */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none scale-95 group-hover:scale-100 z-50">
                                    <h4 className="font-bold text-slate-100 mb-1">{comp.name}</h4>
                                    <p className="text-[10px] text-slate-400 leading-tight mb-2 line-clamp-2">{comp.description}</p>
                                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                                        <span>Presence: {x}</span>
                                        <span>Innov: {y}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
