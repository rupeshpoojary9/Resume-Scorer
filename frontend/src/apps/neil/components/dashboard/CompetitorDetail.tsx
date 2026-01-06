
import {
    ArrowLeft, Globe, TrendingUp, Trash2, Target, CheckCircle2, XCircle,
    BarChart3, DollarSign, Zap, ShieldAlert, Check, X, Swords, Gavel, ThumbsUp, ThumbsDown,
    Loader2, Newspaper, Calendar, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Competitor, NewsItem } from '../../types';

interface CompetitorDetailProps {
    competitor: Competitor;
    onBack: () => void;
    onRefreshResearch: () => void;
    onDelete: (id: string) => void;
    isResearching: boolean;
    news: NewsItem[];
    isLoadingNews: boolean;
    onLogUpdate: () => void;
}

export function CompetitorDetail({
    competitor,
    onBack,
    onRefreshResearch,
    onDelete,
    isResearching,
    news,
    isLoadingNews,
    onLogUpdate
}: CompetitorDetailProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Back Button for Detail View */}
            <Button variant="secondary" className="pl-2 text-slate-300 hover:text-white hover:bg-slate-800 mb-4 border border-slate-700" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Market Landscape
            </Button>
            {/* Competitor Header */}
            <div className="flex justify-between items-start bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                        {competitor.name}
                        <Button
                            size="sm"
                            onClick={onRefreshResearch}
                            disabled={isResearching}
                            className="ml-4 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-0 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                            title="Run Deep Dive Analysis"
                        >
                            <Sparkles className={`w-4 h-4 ${isResearching ? 'animate-spin' : ''}`} />
                            {isResearching ? 'Analysing Market...' : 'Analyse Competitor'}
                        </Button>
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <a href={competitor.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                            <Globe className="w-4 h-4" /> {competitor.website}
                        </a>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                            <TrendingUp className="w-3 h-3" /> {competitor.tier}
                        </span>
                    </div>
                    <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-2xl">{competitor.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-950/30" onClick={() => onDelete(competitor.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="deep-dive" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-900 border border-slate-800">
                    <TabsTrigger value="deep-dive" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Deep Dive Analysis</TabsTrigger>
                    <TabsTrigger value="risk-strategy" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Risk & Strategy</TabsTrigger>
                    <TabsTrigger value="battle-card" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Battle Card</TabsTrigger>
                    <TabsTrigger value="news" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Latest News</TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Timeline Logs</TabsTrigger>
                </TabsList>

                {/* Deep Dive Content */}
                <TabsContent value="deep-dive" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths & Weaknesses */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Target className="w-5 h-5 text-blue-500" /> Strengths & Weaknesses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Key Strengths</h4>
                                    <ul className="space-y-2">
                                        {competitor.strengths?.map((s, i) => (
                                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /> {s}
                                            </li>
                                        )) || <p className="text-slate-500 text-sm">No data available.</p>}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Key Weaknesses</h4>
                                    <ul className="space-y-2">
                                        {competitor.weaknesses?.map((w, i) => (
                                            <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {w}
                                            </li>
                                        )) || <p className="text-slate-500 text-sm">No data available.</p>}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Market & Pricing */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <BarChart3 className="w-5 h-5 text-purple-500" /> Market Position
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-1">Market Focus</h4>
                                    <p className="text-lg text-slate-200">{competitor.marketFocus || "General Market"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Pricing Model
                                    </h4>
                                    <p className="text-lg text-slate-200">{competitor.pricingModel || "Contact Sales"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Neil Comparison */}
                    <Card className="bg-gradient-to-br from-orange-950/30 to-slate-900 border-orange-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-400">
                                <Zap className="w-5 h-5" /> Neil vs {competitor.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg text-slate-200 leading-relaxed">
                                {competitor.logs[0]?.neilComparison || "No comparison data available."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Risk & Strategy Content */}
                <TabsContent value="risk-strategy" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Radar Chart */}
                        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <ShieldAlert className="w-5 h-5 text-red-500" /> Threat Radar
                                </CardTitle>
                                <CardDescription className="text-slate-400 flex items-center gap-2">
                                    Threat Level:
                                    <span
                                        className={`font-bold cursor-help border-b border-dotted border-slate-600 ${competitor.threatLevel === 'Critical' ? 'text-red-500' : competitor.threatLevel === 'High' ? 'text-orange-500' : 'text-yellow-500'}`}
                                        title="Critical: Immediate risk to deals. High: Strong competitor. Medium: Monitor. Low: Niche player."
                                    >
                                        {competitor.threatLevel || 'Unknown'}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center relative z-10">
                                {competitor.marketRadar ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                            { subject: 'Pricing', A: competitor.marketRadar.pricing_pressure, fullMark: 10 },
                                            { subject: 'Features', A: competitor.marketRadar.feature_completeness, fullMark: 10 },
                                            { subject: 'Presence', A: competitor.marketRadar.market_presence, fullMark: 10 },
                                            { subject: 'Innovation', A: competitor.marketRadar.innovation_speed, fullMark: 10 },
                                            { subject: 'Brand', A: competitor.marketRadar.brand_strength, fullMark: 10 },
                                        ]}>
                                            <PolarGrid stroke="#334155" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                            <Radar name={competitor.name} dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-slate-500 text-sm">No radar data available. Refresh research.</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Risk Factors */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Target className="w-5 h-5 text-orange-500" /> Risk Factors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {competitor.riskFactors?.map((risk, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm bg-slate-950/50 p-3 rounded border border-slate-800/50">
                                            <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                            {risk}
                                        </li>
                                    )) || <p className="text-slate-500 text-sm">No specific risks identified.</p>}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feature Matrix */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-200">
                                <BarChart3 className="w-5 h-5 text-blue-500" /> Feature Comparison
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3">Feature</th>
                                            <th className="px-4 py-3 text-center">Neil</th>
                                            <th className="px-4 py-3 text-center">{competitor.name}</th>
                                            <th className="px-4 py-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {competitor.featureMatrix?.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                                <td className="px-4 py-3 font-medium text-slate-200">{item.feature}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.neil_has ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.competitor_has ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{item.note}</td>
                                            </tr>
                                        )) || (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No feature comparison available. Refresh research.</td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Battle Card Content */}
                <TabsContent value="battle-card" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Kill Points */}
                        <Card className="md:col-span-2 bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Swords className="w-5 h-5 text-red-500" /> Kill Points (How to Win)
                                </CardTitle>
                                <CardDescription className="text-slate-400">High-impact statements to de-position {competitor.name}.</CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <ul className="space-y-4">
                                    {competitor.killPoints?.map((point, i) => (
                                        <motion.li
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                            className="flex items-start gap-4 bg-gradient-to-r from-red-950/40 to-slate-900/40 p-4 rounded-xl border border-red-900/20 hover:border-red-500/30 transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500 font-bold border border-red-500/20 group-hover:scale-110 transition-transform">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-200 text-lg leading-snug font-medium">{point}</p>
                                        </motion.li>
                                    )) || <p className="text-slate-500">No kill points available. Refresh research.</p>}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Win Themes */}
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Gavel className="w-5 h-5 text-emerald-500" /> Why We Win
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {competitor.winThemes?.map((theme, i) => (
                                        <div key={i} className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-200 text-center font-medium">
                                            {theme}
                                        </div>
                                    )) || <p className="text-slate-500 text-sm">No win themes available.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Objection Handling */}
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-200">
                                <ShieldAlert className="w-5 h-5 text-orange-500" /> Objection Handling
                            </CardTitle>
                            <CardDescription className="text-slate-400">Scripts to counter common competitor claims.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                {competitor.objections?.map((obj, i) => (
                                    <div key={i} className="grid gap-3">
                                        {/* They Say */}
                                        <div className="flex justify-start">
                                            <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] border border-slate-700">
                                                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                                                    <ThumbsDown className="w-3 h-3" /> They Say
                                                </div>
                                                <p className="text-slate-300 italic text-sm">"{obj.claim}"</p>
                                            </div>
                                        </div>
                                        {/* You Say */}
                                        <div className="flex justify-end">
                                            <div className="bg-emerald-950/40 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] border border-emerald-900/30">
                                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 justify-end">
                                                    You Say <ThumbsUp className="w-3 h-3" />
                                                </div>
                                                <p className="text-emerald-100 font-medium text-sm">"{obj.rebuttal}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )) || <p className="text-slate-500 text-center py-8">No objection handling scripts available.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* News Content */}
                <TabsContent value="news" className="space-y-4 mt-6">
                    {isLoadingNews ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : news.length > 0 ? (
                        <div className="grid gap-4">
                            {news.map((item) => (
                                <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base text-blue-400 hover:underline cursor-pointer">
                                                {item.title}
                                            </CardTitle>
                                            <span className="text-xs text-slate-500">{item.date}</span>
                                        </div>
                                        <CardDescription className="text-slate-400 text-xs uppercase tracking-wider">
                                            {item.source}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-300">{item.summary}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No recent news found for this competitor.</p>
                        </div>
                    )}
                </TabsContent>

                {/* Timeline Content */}
                <TabsContent value="timeline" className="space-y-8 relative mt-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                        <h3 className="text-xl font-semibold text-slate-200">Monthly Updates</h3>
                        <Button onClick={onLogUpdate} variant="outline" className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-300">
                            <Calendar className="w-4 h-4" /> Log Update
                        </Button>
                    </div>

                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-20 bottom-0 w-0.5 bg-slate-800 hidden md:block" />

                    {competitor.logs.length === 0 && (
                        <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                            <Sparkles className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                            <h3 className="text-lg font-medium text-slate-300">No updates logged yet</h3>
                            <p className="text-slate-500 mb-6">Start tracking monthly changes for this competitor.</p>
                            <Button onClick={onLogUpdate} variant="secondary">Log First Update</Button>
                        </div>
                    )}

                    {competitor.logs.map((log) => (
                        <Card key={log.id} className="relative overflow-visible bg-slate-900 border-slate-800 shadow-xl ml-0 md:ml-8 transition-all hover:border-slate-700">
                            <div className="absolute -left-[29px] top-6 w-6 h-6 bg-slate-950 rounded-full border-4 border-slate-800 hidden md:flex items-center justify-center z-10">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            </div>

                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <Badge variant="secondary" className="text-sm px-3 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700">
                                        {new Date(log.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </Badge>
                                    <span className="text-xs text-slate-500 font-mono">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-slate-500">Executive Summary</h4>
                                    <p className="leading-relaxed text-slate-300">{log.summary}</p>
                                </div>

                                {log.keyChanges.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-slate-500">Key Changes</h4>
                                        <ul className="space-y-2">
                                            {log.keyChanges.map((change, i) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="bg-orange-950/20 p-4 rounded-lg border border-orange-900/30">
                                    <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-orange-400 flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> Impact on Neil
                                    </h4>
                                    <p className="text-sm text-orange-200/80">{log.neilComparison}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
