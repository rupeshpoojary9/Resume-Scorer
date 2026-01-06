import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { neilFeatures } from './data/features';

export default function NeilHome() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const filteredFeatures = neilFeatures.filter(category => {
        if (activeCategory !== 'all' && category.id !== activeCategory) return false;
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            category.title.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query) ||
            category.features.some(f => f.title.toLowerCase().includes(query) || f.description.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 text-white pb-24 pt-10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />

                <div className="container relative mx-auto px-6 z-10">
                    <Button
                        variant="ghost"
                        className="text-slate-300 hover:text-white mb-8 pl-0 hover:bg-transparent"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Foundry
                    </Button>

                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/30">
                                Product Showcase
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Neil Platform
                        </h1>
                        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                            The intelligent AI assistant for your enterprise. Automate document processing,
                            streamline workflows, and gain actionable insights with Hactar-Prime.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white border-0">
                                Explore Features
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={() => navigate('/neil/competitive-analysis')}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Competitive Analysis
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-6 -mt-16 relative z-20 pb-20">
                {/* Search and Filter */}
                <Card className="mb-10 shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search features..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                                <Button
                                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                                    onClick={() => setActiveCategory('all')}
                                    size="sm"
                                >
                                    All
                                </Button>
                                {neilFeatures.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={activeCategory === cat.id ? 'default' : 'outline'}
                                        onClick={() => setActiveCategory(cat.id)}
                                        size="sm"
                                        className="whitespace-nowrap"
                                    >
                                        {cat.title}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 gap-12">
                    {filteredFeatures.map((category) => (
                        <div key={category.id} className="scroll-mt-24" id={category.id}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                    <category.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{category.title}</h2>
                                    <p className="text-muted-foreground">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.features.map((feature, idx) => (
                                    <Card key={idx} className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                                                {feature.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredFeatures.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No features found</h3>
                            <p className="text-muted-foreground">Try adjusting your search query or filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 py-20 border-t">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to analyze the competition?</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Use our AI-powered competitive analysis tool to benchmark Neil against other market players.
                    </p>
                    <Button size="lg" onClick={() => navigate('/neil/competitive-analysis')} className="gap-2">
                        Start Analysis <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
