
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export interface NewCompetitorState {
    name: string;
    website: string;
    description: string;
    tier: string;
    neilComparison: string;
}

interface AddCompetitorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newCompetitor: NewCompetitorState;
    setNewCompetitor: (competitor: NewCompetitorState) => void;
    onAdd: () => void;
    onResearch: () => void;
    isResearching: boolean;
}

export function AddCompetitorDialog({
    isOpen,
    onOpenChange,
    newCompetitor,
    setNewCompetitor,
    onAdd,
    onResearch,
    isResearching
}: AddCompetitorDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Competitor</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Search for a competitor to auto-fill details using AI.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Competitor Name</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newCompetitor.name}
                                onChange={e => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                                placeholder="e.g. Coupa"
                                className="bg-slate-950 border-slate-700 focus:border-orange-500"
                            />
                            <Button onClick={onResearch} disabled={isResearching} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">Click the sparkle to auto-research this company.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Website</Label>
                            <Input
                                value={newCompetitor.website}
                                onChange={e => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                                placeholder="https://..."
                                className="bg-slate-950 border-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Tier</Label>
                            <Select
                                value={newCompetitor.tier}
                                onValueChange={v => setNewCompetitor({ ...newCompetitor, tier: v })}
                            >
                                <SelectTrigger className="bg-slate-950 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                    <SelectItem value="Tier 1">Tier 1 (Direct)</SelectItem>
                                    <SelectItem value="Tier 2">Tier 2 (Indirect)</SelectItem>
                                    <SelectItem value="Niche">Niche Player</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Description</Label>
                        <Textarea
                            value={newCompetitor.description}
                            onChange={e => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                            placeholder="Brief overview..."
                            className="bg-slate-950 border-slate-700 min-h-[80px]"
                        />
                    </div>

                    {newCompetitor.neilComparison && (
                        <div className="space-y-2">
                            <Label className="text-orange-400">AI Comparison Analysis</Label>
                            <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800 max-h-24 overflow-y-auto">
                                {newCompetitor.neilComparison}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-800 text-slate-400">Cancel</Button>
                    <Button onClick={onAdd} className="bg-orange-600 hover:bg-orange-700 text-white">Add Competitor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
