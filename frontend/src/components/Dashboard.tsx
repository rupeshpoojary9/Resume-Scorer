import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UploadSection from '@/components/UploadSection';
import ResultsTable from '@/components/ResultsTable';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function Dashboard() {
    const { jdId } = useParams<{ jdId: string }>();
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [roleTitle, setRoleTitle] = useState<string>('');

    const selectedJdId = jdId ? parseInt(jdId) : null;

    useEffect(() => {
        if (selectedJdId) {
            fetchRoleDetails();
        }
    }, [selectedJdId]);

    const fetchRoleDetails = async () => {
        try {
            // We might need an endpoint to get single JD details, or filter from list
            // For now, let's just fetch all and find it, or add a specific endpoint later.
            // Using the existing /jds endpoint for simplicity
            const response = await api.get('/jds');
            const jd = response.data.find((j: any) => j.id === selectedJdId);
            if (jd) {
                setRoleTitle(jd.role_title || jd.filename);
            }
        } catch (error) {
            console.error("Failed to fetch role details", error);
        }
    };

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <main className="min-h-screen bg-background p-8 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" className="w-fit -ml-4 text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                                {roleTitle || 'Loading...'} <Sparkles className="w-6 h-6 text-primary" />
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Candidate Scoring Dashboard
                            </p>
                        </div>
                    </div>

                    <ApiKeyInput />
                </div>

                {/* Upload Section */}
                <UploadSection
                    onUploadComplete={handleUploadComplete}
                    selectedJdId={selectedJdId}
                />

                {/* Results Table */}
                <ResultsTable
                    key={refreshTrigger}
                    selectedJdId={selectedJdId}
                />
            </div>
        </main>
    );
}
