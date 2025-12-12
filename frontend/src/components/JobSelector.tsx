import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Briefcase } from 'lucide-react';
import api from '@/lib/api';

interface JobDescription {
    id: number;
    role_title: string;
    filename: string;
    timestamp: string;
}

interface JobSelectorProps {
    selectedJdId: number | null;
    onSelectJd: (id: number | null) => void;
    refreshTrigger: number;
}

export default function JobSelector({ selectedJdId, onSelectJd, refreshTrigger }: JobSelectorProps) {
    const [jds, setJds] = useState<JobDescription[]>([]);

    useEffect(() => {
        fetchJds();
    }, [refreshTrigger]);

    const fetchJds = async () => {
        try {
            const response = await api.get('/jds');
            setJds(response.data);

            // Auto-select the most recent one if nothing selected and list is not empty
            if (selectedJdId === null && response.data.length > 0) {
                onSelectJd(response.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch JDs", error);
        }
    };

    const handleValueChange = (value: string) => {
        if (value === "new") {
            onSelectJd(null); // Null means "Create New" mode
        } else {
            onSelectJd(Number(value));
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Active Role:</span>
            </div>
            <Select
                value={selectedJdId ? selectedJdId.toString() : "new"}
                onValueChange={handleValueChange}
            >
                <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="new" className="text-primary font-medium">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Create New Role
                        </div>
                    </SelectItem>
                    {jds.map((jd) => (
                        <SelectItem key={jd.id} value={jd.id.toString()}>
                            {jd.role_title || jd.filename}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
