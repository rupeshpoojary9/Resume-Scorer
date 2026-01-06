
import { useNavigate } from 'react-router-dom';
import { FileText, GitMerge, ArrowRight, Zap, Video } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FoundryHome() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-background p-8 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl flex items-center gap-3">
                            e42 Foundry
                        </h1>
                        <p className="text-muted-foreground mt-2 text-xl">
                            Your AI-powered productivity suite.
                        </p>
                    </div>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resume Scorer App Card */}
                    <Card
                        className="hover:border-primary transition-all cursor-pointer hover:shadow-lg group"
                        onClick={() => navigate('/resume-scorer')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="w-8 h-8" />
                                </div>
                                Resume Scorer
                            </CardTitle>
                            <CardDescription className="text-base">
                                AI-powered ATS to rank and analyze candidate resumes against job descriptions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Multi-role management</li>
                                <li>Instant AI scoring</li>
                                <li>Detailed candidate analysis</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Open App <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* GitLab Tracker App Card */}
                    <Card
                        className="hover:border-primary transition-all cursor-pointer hover:shadow-lg group"
                        onClick={() => navigate('/gitlab-tracker')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <GitMerge className="w-8 h-8" />
                                </div>
                                GitLab Tracker
                            </CardTitle>
                            <CardDescription className="text-base">
                                Track milestones and generate AI summaries for your GitLab projects.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Milestone progress tracking</li>
                                <li>AI-generated summaries</li>
                                <li>Feature/Bug breakdown</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Open App <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Neil Platform App Card */}
                    <Card
                        className="hover:border-primary transition-all cursor-pointer hover:shadow-lg group"
                        onClick={() => navigate('/neil')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Zap className="w-8 h-8" />
                                </div>
                                Neil Platform
                            </CardTitle>
                            <CardDescription className="text-base">
                                Explore the intelligent AI assistant for enterprise document processing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Feature Showcase</li>
                                <li>Competitive Analysis</li>
                                <li>AI Capabilities</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Open App <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Avatar Studio App Card */}
                    <Card
                        className="hover:border-primary transition-all cursor-pointer hover:shadow-lg group"
                        onClick={() => navigate('/avatar-studio')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="p-2 bg-pink-100 rounded-lg text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                    <Video className="w-8 h-8" />
                                </div>
                                Avatar Studio
                            </CardTitle>
                            <CardDescription className="text-base">
                                Generate realistic talking head videos from a single image and audio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Image-to-Video generation</li>
                                <li>Audio lip-sync</li>
                                <li>AI-powered animation</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Open App <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </main>
    );
}
