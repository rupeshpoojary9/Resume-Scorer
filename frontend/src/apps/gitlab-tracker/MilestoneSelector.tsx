import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

interface Milestone {
    id: number;
    title: string;
    due_date: string;
}

interface MilestoneSelectorProps {
    projectIds: number[];
    selectedMilestoneTitle: string | null;
    onSelect: (title: string) => void;
}

export default function MilestoneSelector({ projectIds, selectedMilestoneTitle, onSelect }: MilestoneSelectorProps) {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (projectIds.length > 0) {
            fetchMilestones();
        } else {
            setMilestones([]);
        }
    }, [projectIds]);

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            // Try fetching milestones from selected projects until we find one that has them
            for (const projectId of projectIds) {
                try {
                    const response = await api.get(`/gitlab/projects/${projectId}/milestones`);
                    const data = response.data;

                    if (data && data.length > 0) {
                        setMilestones(data);

                        // Auto-select "Development-0.0.9.3" or similar if not selected
                        if (!selectedMilestoneTitle) {
                            const defaultMilestone = data.find((m: Milestone) => m.title === "Development-0.0.9.3")
                                || data.find((m: Milestone) => m.title.includes("Development"))
                                || data[0];
                            if (defaultMilestone) {
                                onSelect(defaultMilestone.title);
                            }
                        }
                        return; // Found milestones, stop searching
                    }
                } catch (e) {
                    console.warn(`Failed to fetch milestones for project ${projectId}, trying next...`);
                }
            }
            // If loop finishes without returning, no milestones were found
            setMilestones([]);
        } catch (error) {
            console.error("Failed to fetch milestones", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedMilestone = milestones.find((m) => m.title === selectedMilestoneTitle);

    const filteredMilestones = milestones.filter(milestone =>
        milestone.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Select Milestone</CardTitle>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            disabled={loading || projectIds.length === 0}
                        >
                            {loading ? "Loading milestones..." : (
                                selectedMilestone
                                    ? selectedMilestone.title
                                    : "Select milestone..."
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <div className="flex flex-col border rounded-md bg-popover">
                            <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <input
                                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Search milestone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-1">
                                {filteredMilestones.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">No milestone found.</div>
                                ) : (
                                    filteredMilestones.map((milestone) => (
                                        <div
                                            key={milestone.id}
                                            onClick={() => {
                                                onSelect(milestone.title);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                selectedMilestoneTitle === milestone.title && "bg-accent"
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedMilestoneTitle === milestone.title ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span>{milestone.title} {milestone.due_date ? `(${milestone.due_date})` : ''}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
}
