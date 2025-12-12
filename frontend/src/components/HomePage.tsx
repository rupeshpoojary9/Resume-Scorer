import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Briefcase, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UploadSection from '@/components/UploadSection';
import ApiKeyInput from '@/components/ApiKeyInput';
import api from '@/lib/api';

interface JobDescription {
    id: number;
    role_title: string;
    filename: string;
    timestamp: string;
}

export default function HomePage() {
    const navigate = useNavigate();
    const [jds, setJds] = useState<JobDescription[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchJds();
    }, []);

    const fetchJds = async () => {
        try {
            const response = await api.get('/jds');
            setJds(response.data);
        } catch (error) {
            console.error("Failed to fetch JDs", error);
        }
    };

    const handleCreateComplete = (newJdId?: number) => {
        if (newJdId) {
            setIsDialogOpen(false);
            navigate(`/dashboard/${newJdId}`);
        }
    };

    const filteredJds = jds.filter(jd =>
        (jd.role_title || jd.filename).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background p-8 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3">
                            Resume Scorer
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Manage your hiring roles and candidates.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ApiKeyInput />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="gap-2">
                                    <Plus className="w-5 h-5" /> Create New Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Job Role</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Upload a Job Description to create a new role. You can then upload resumes to score against it.
                                    </p>
                                    <UploadSection
                                        onUploadComplete={handleCreateComplete}
                                        selectedJdId={null} // Null means create new
                                        isCreateMode={true} // Special mode to only show JD upload
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJds.map((jd) => (
                        <Card
                            key={jd.id}
                            className="hover:border-primary transition-all cursor-pointer hover:shadow-md"
                            onClick={() => navigate(`/dashboard/${jd.id}`)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    {jd.role_title || jd.filename}
                                </CardTitle>
                                <CardDescription className="line-clamp-1">
                                    {jd.filename}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(jd.timestamp).toLocaleDateString()}
                                    </div>
                                    {/* We could add candidate count here if the API returned it */}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full">View Candidates</Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {filteredJds.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No roles found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
