import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
    id: number;
    name: string;
    path_with_namespace: string;
}

interface ProjectSelectorProps {
    projects: Project[];
    selectedProjectIds: number[];
    onSelect: (ids: number[]) => void;
}

export default function ProjectSelector({ projects, selectedProjectIds, onSelect }: ProjectSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const toggleProject = (projectId: number) => {
        if (selectedProjectIds.includes(projectId)) {
            onSelect(selectedProjectIds.filter(id => id !== projectId));
        } else {
            onSelect([...selectedProjectIds, projectId]);
        }
    };

    const getSelectedText = () => {
        if (selectedProjectIds.length === 0) return "Select projects...";

        const selectedNames = projects
            .filter(p => selectedProjectIds.includes(p.id))
            .map(p => p.name);

        if (selectedNames.length <= 2) {
            return selectedNames.join(", ");
        }
        return `${selectedNames.length} projects selected`;
    };

    const filteredProjects = projects.filter(project =>
        project.path_with_namespace.toLowerCase().includes(search.toLowerCase()) ||
        project.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Select Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            <span className="truncate">{getSelectedText()}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <div className="flex flex-col border rounded-md">
                            <div className="flex items-center border-b px-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <input
                                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Search project..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-1">
                                {filteredProjects.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-muted-foreground">No project found.</div>
                                ) : (
                                    filteredProjects.map((project) => {
                                        const isSelected = selectedProjectIds.includes(project.id);
                                        return (
                                            <div
                                                key={project.id}
                                                onClick={() => toggleProject(project.id)}
                                                className={cn(
                                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                    isSelected && "bg-accent/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                <span>{project.path_with_namespace}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
}
