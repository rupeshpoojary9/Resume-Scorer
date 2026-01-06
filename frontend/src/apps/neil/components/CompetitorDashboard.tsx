import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart3, Loader2, Radar as RadarIcon,
    TrendingUp, Globe, Plus, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Competitor, AnalysisLog, MarketOverview, NewsItem } from '../types';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Import new components
import { MarketQuadrant } from './dashboard/MarketQuadrant';
import { MarketSegmentList } from './dashboard/MarketSegmentList';
import { CompetitorTable } from './dashboard/CompetitorTable';
import { CompetitorDetail } from './dashboard/CompetitorDetail';
import { AddCompetitorDialog, NewCompetitorState } from './dashboard/AddCompetitorDialog';
import { LogUpdateDialog, NewLogState } from './dashboard/LogUpdateDialog';

export default function CompetitorDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [competitors, setCompetitors] = useState<Competitor[]>(() => {
        const saved = localStorage.getItem('neil_competitors');
        return saved ? JSON.parse(saved) : [];
    });
    const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isResearching, setIsResearching] = useState(false);
    const [isDiscovering, setIsDiscovering] = useState(false);

    // News State
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(false);

    // Form States
    const [newCompetitor, setNewCompetitor] = useState<NewCompetitorState>({ name: '', website: '', description: '', tier: 'Tier 1', neilComparison: '' });
    const [newLog, setNewLog] = useState<NewLogState>({ month: new Date().toISOString().slice(0, 7), summary: '', keyChanges: '', neilComparison: '' });

    useEffect(() => {
        localStorage.setItem('neil_competitors', JSON.stringify(competitors));
    }, [competitors]);

    // Fetch news when competitor is selected
    useEffect(() => {
        if (selectedCompetitorId) {
            const comp = competitors.find(c => c.id === selectedCompetitorId);
            if (comp) {
                fetchNews(comp.name);
            }
        }
    }, [selectedCompetitorId]);

    const fetchNews = async (name: string) => {
        setIsLoadingNews(true);
        try {
            const response = await api.get(`/neil/news/${encodeURIComponent(name)}`);
            setNews(response.data.news);
        } catch (error) {
            console.error("Failed to fetch news", error);
            setNews([]);
        } finally {
            setIsLoadingNews(false);
        }
    };


    const handleDiscover = async () => {
        setIsDiscovering(true);
        try {
            const response = await api.get('/neil/discover');
            const data = response.data;
            const discovered = data.competitors;

            const newCompetitors = discovered.map((d: any) => ({
                id: d.name.toLowerCase().replace(/\s+/g, '-'),
                name: d.name,
                website: d.website,
                description: d.description,
                tier: d.tier,
                strengths: d.strengths,
                weaknesses: d.weaknesses,
                marketFocus: d.market_focus,
                pricingModel: d.pricing_model,
                marketPresence: d.market_presence,
                innovationScore: d.innovation_score,
                logs: [{
                    id: Date.now().toString(),
                    month: new Date().toISOString().slice(0, 7),
                    summary: "Initial Market Scan",
                    keyChanges: [],
                    neilComparison: d.neil_comparison,
                    timestamp: Date.now()
                }]
            }));

            setCompetitors(prev => {
                const newMap = new Map(newCompetitors.map((c: any) => [c.name, c]));

                // Update existing competitors with new data
                const updatedPrev = prev.map(c => {
                    if (newMap.has(c.name)) {
                        const newData = newMap.get(c.name) as any;
                        return {
                            ...c,
                            marketPresence: newData.marketPresence,
                            innovationScore: newData.innovationScore,
                            marketFocus: newData.marketFocus,
                            pricingModel: newData.pricingModel,
                            // Keep existing logs and id
                        };
                    }
                    return c;
                });

                // Add completely new competitors
                const existingNames = new Set(prev.map(c => c.name));
                const uniqueNew = newCompetitors.filter((c: any) => !existingNames.has(c.name));

                return [...updatedPrev, ...uniqueNew];
            });

            setMarketOverview({
                market_summary: data.market_summary,
                trends: data.trends,
                segments: data.segments,
                competitors: newCompetitors
            });

            // Show landscape view
            setSelectedCompetitorId(null);

            toast({ title: "Market Scan Complete", description: `Analyzed market trends and found ${newCompetitors.length} competitors.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Scan Failed", description: "Could not discover competitors.", variant: "destructive" });
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleResearch = async () => {
        if (!newCompetitor.name) {
            toast({ title: "Please enter a name", variant: "destructive" });
            return;
        }
        setIsResearching(true);
        try {
            const response = await api.post('/neil/research', { competitor_name: newCompetitor.name });
            const data = response.data;
            setNewCompetitor(prev => ({
                ...prev,
                name: data.name,
                website: data.website,
                description: data.description,
                tier: data.tier,
                neilComparison: data.neil_comparison
            }));
            toast({ title: "Research Complete", description: "Competitor details auto-filled by AI." });
        } catch (error) {
            console.error(error);
            toast({ title: "Research Failed", description: "Could not fetch competitor details.", variant: "destructive" });
        } finally {
            setIsResearching(false);
        }
    };

    const handleRefreshResearch = async () => {
        if (!selectedCompetitor) return;

        setIsResearching(true);
        toast({ title: "Refreshing Research", description: "Agents are gathering latest data..." });

        try {
            const response = await api.post('/neil/research', { competitor_name: selectedCompetitor.name });
            const data = response.data;

            setCompetitors(prev => prev.map(c => {
                if (c.id === selectedCompetitor.id) {
                    return {
                        ...c,
                        description: data.description,
                        tier: data.tier,
                        strengths: data.strengths,
                        weaknesses: data.weaknesses,
                        marketFocus: data.market_focus,
                        pricingModel: data.pricing_model,
                        marketPresence: data.market_presence,
                        innovationScore: data.innovation_score,

                        // New Deep Dive Data
                        threatLevel: data.threat_level,
                        riskFactors: data.risk_factors,
                        featureMatrix: data.feature_matrix,
                        marketRadar: data.market_radar,

                        // Battle Card Data
                        killPoints: data.kill_points,
                        objections: data.objections,
                        winThemes: data.win_themes,

                        // Update the latest log's comparison if needed, or just keep it
                        logs: c.logs.map((log, index) =>
                            index === 0 ? { ...log, neilComparison: data.neil_comparison } : log
                        )
                    };
                }
                return c;
            }));

            toast({ title: "Research Updated", description: "Latest market data applied." });
        } catch (error) {
            console.error(error);
            toast({ title: "Refresh Failed", description: "Could not update research.", variant: "destructive" });
        } finally {
            setIsResearching(false);
        }
    };

    const handleAddCompetitor = () => {
        if (!newCompetitor.name) return;
        const competitor: Competitor = {
            id: Date.now().toString(),
            name: newCompetitor.name,
            website: newCompetitor.website,
            description: newCompetitor.description,
            tier: newCompetitor.tier as any,
            logs: []
        };
        // Add initial log if comparison exists
        if (newCompetitor.neilComparison) {
            competitor.logs.push({
                id: Date.now().toString(),
                month: new Date().toISOString().slice(0, 7),
                summary: "Initial AI Analysis",
                keyChanges: [],
                neilComparison: newCompetitor.neilComparison,
                timestamp: Date.now()
            });
        }

        setCompetitors([...competitors, competitor]);
        setNewCompetitor({ name: '', website: '', description: '', tier: 'Tier 1', neilComparison: '' });
        setIsAddModalOpen(false);
        setSelectedCompetitorId(competitor.id);
    };

    const handleAddLog = () => {
        if (!selectedCompetitorId || !newLog.summary) return;
        const log: AnalysisLog = {
            id: Date.now().toString(),
            month: newLog.month,
            summary: newLog.summary,
            keyChanges: newLog.keyChanges.split('\n').filter(s => s.trim()),
            neilComparison: newLog.neilComparison,
            timestamp: Date.now()
        };

        const updatedCompetitors = competitors.map(c => {
            if (c.id === selectedCompetitorId) {
                return { ...c, logs: [log, ...c.logs] };
            }
            return c;
        });

        setCompetitors(updatedCompetitors);
        setNewLog({ month: new Date().toISOString().slice(0, 7), summary: '', keyChanges: '', neilComparison: '' });
        setIsLogModalOpen(false);
    };

    const handleDeleteCompetitor = (id: string) => {
        if (confirm('Are you sure you want to delete this competitor?')) {
            setCompetitors(competitors.filter(c => c.id !== id));
            if (selectedCompetitorId === id) setSelectedCompetitorId(null);
        }
    };

    const selectedCompetitor = competitors.find(c => c.id === selectedCompetitorId);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-orange-500/30">
            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/neil')} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            <BarChart3 className="w-6 h-6 text-orange-500" />
                            Competitive Intelligence
                        </h1>
                        <p className="text-sm text-slate-500">Track market movements vs Neil</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDiscover} disabled={isDiscovering} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-900/20">
                        {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RadarIcon className="w-4 h-4" />}
                        Scan Market
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                        <Plus className="w-4 h-4" /> Manual Add
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar List */}
                <aside className="w-80 bg-slate-900/30 border-r border-slate-800 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Filter competitors..."
                                className="pl-9 bg-slate-900 border-slate-700 focus:border-orange-500/50 text-slate-200 placeholder:text-slate-600"
                            />
                        </div>

                        <div className="space-y-2">
                            {competitors.length === 0 && (
                                <div className="text-center py-12 text-slate-600 text-sm px-4">
                                    <p className="mb-4">No competitors tracked.</p>
                                    <Button onClick={handleDiscover} disabled={isDiscovering} variant="secondary" className="w-full gap-2">
                                        {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RadarIcon className="w-4 h-4" />}
                                        Auto-Discover
                                    </Button>
                                </div>
                            )}
                            {competitors.map(comp => (
                                <div
                                    key={comp.id}
                                    onClick={() => setSelectedCompetitorId(comp.id)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedCompetitorId === comp.id
                                        ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                        : 'hover:bg-slate-800/50 border-transparent hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-medium ${selectedCompetitorId === comp.id ? 'text-orange-400' : 'text-slate-300'}`}>
                                            {comp.name}
                                        </h3>
                                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500 bg-slate-900/50 cursor-help" title="Tier 1: Market Leader. Tier 2: Strong Contender. Niche: Specialized Player.">{comp.tier}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{comp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-slate-950 to-slate-900">
                    {!selectedCompetitor ? (
                        // Market Landscape View
                        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">

                            {/* Header & Actions */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                                <div>
                                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                        Market Command Center
                                    </h2>
                                    <p className="text-slate-400 mt-2 text-lg">Strategic intelligence and competitive landscape analysis.</p>
                                </div>
                                <Button onClick={handleDiscover} disabled={isDiscovering} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20 transition-all hover:scale-105">
                                    {isDiscovering ? <Loader2 className="w-5 h-5 animate-spin" /> : <RadarIcon className="w-5 h-5" />}
                                    {isDiscovering ? 'Scanning...' : 'Refresh Market Scan'}
                                </Button>
                            </div>

                            {marketOverview ? (
                                <div className="space-y-6">
                                    {/* Hero Summary */}
                                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
                                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                            <Globe className="w-96 h-96 text-blue-500" />
                                        </div>
                                        <div className="relative z-10 max-w-4xl">
                                            <Badge variant="outline" className="mb-6 border-blue-500/30 text-blue-400 bg-blue-950/30 px-4 py-1 text-sm uppercase tracking-widest">
                                                Market Executive Summary
                                            </Badge>
                                            <h3 className="text-3xl md:text-4xl font-light text-slate-100 leading-relaxed mb-8">
                                                "{marketOverview.market_summary}"
                                            </h3>

                                            {/* Key Trends Ticker */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                                {marketOverview.trends.map((trend, i) => (
                                                    <div key={i} className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/50 transition-colors">
                                                        <div className="flex items-center gap-3 mb-3 text-indigo-400">
                                                            <TrendingUp className="w-5 h-5" />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Trend {i + 1}</span>
                                                        </div>
                                                        <p className="text-slate-200 font-medium leading-snug group-hover:text-white transition-colors">
                                                            {trend}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Split View: Quadrant & Segments */}
                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                        <MarketQuadrant
                                            competitors={competitors}
                                            onSelectCompetitor={setSelectedCompetitorId}
                                        />
                                        <MarketSegmentList
                                            segments={marketOverview.segments}
                                            competitors={competitors}
                                            onSelectCompetitor={setSelectedCompetitorId}
                                        />
                                    </div>

                                    <CompetitorTable
                                        competitors={competitors}
                                        onSelectCompetitor={setSelectedCompetitorId}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                                    <RadarIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg">No market data available.</p>
                                    <p className="text-sm">Click "Refresh Scan" to analyze the market.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <CompetitorDetail
                            competitor={selectedCompetitor}
                            onBack={() => setSelectedCompetitorId(null)}
                            onRefreshResearch={handleRefreshResearch}
                            onDelete={handleDeleteCompetitor}
                            isResearching={isResearching}
                            news={news}
                            isLoadingNews={isLoadingNews}
                            onLogUpdate={() => setIsLogModalOpen(true)}
                        />
                    )}
                </main>
            </div>

            <AddCompetitorDialog
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                newCompetitor={newCompetitor}
                setNewCompetitor={setNewCompetitor}
                onAdd={handleAddCompetitor}
                onResearch={handleResearch}
                isResearching={isResearching}
            />

            <LogUpdateDialog
                isOpen={isLogModalOpen}
                onOpenChange={setIsLogModalOpen}
                newLog={newLog}
                setNewLog={setNewLog}
                onAdd={handleAddLog}
                competitorName={selectedCompetitor?.name}
            />
        </div>
    );
}