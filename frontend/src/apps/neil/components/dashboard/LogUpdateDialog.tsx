
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export interface NewLogState {
    month: string;
    summary: string;
    keyChanges: string;
    neilComparison: string;
}

interface LogUpdateDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newLog: NewLogState;
    setNewLog: (log: NewLogState) => void;
    onAdd: () => void;
    competitorName?: string;
}

export function LogUpdateDialog({
    isOpen,
    onOpenChange,
    newLog,
    setNewLog,
    onAdd,
    competitorName
}: LogUpdateDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Log Monthly Update</DialogTitle>
                    <DialogDescription className="text-slate-400">Record findings for {competitorName}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Month</Label>
                        <Input
                            type="month"
                            value={newLog.month}
                            onChange={e => setNewLog({ ...newLog, month: e.target.value })}
                            className="bg-slate-950 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Executive Summary</Label>
                        <Textarea
                            value={newLog.summary}
                            onChange={e => setNewLog({ ...newLog, summary: e.target.value })}
                            placeholder="What happened this month? Major releases, news, etc."
                            className="h-24 bg-slate-950 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Key Changes / New Features (One per line)</Label>
                        <Textarea
                            value={newLog.keyChanges}
                            onChange={e => setNewLog({ ...newLog, keyChanges: e.target.value })}
                            placeholder="- Launched new mobile app&#10;- Updated pricing model"
                            className="h-32 font-mono text-sm bg-slate-950 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-orange-400">Comparison vs Neil</Label>
                        <Textarea
                            value={newLog.neilComparison}
                            onChange={e => setNewLog({ ...newLog, neilComparison: e.target.value })}
                            placeholder="How does this affect our position? Where are we stronger/weaker?"
                            className="h-24 bg-slate-950 border-orange-900/50 focus-visible:ring-orange-500"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-800 text-slate-400">Cancel</Button>
                    <Button onClick={onAdd} className="bg-orange-600 hover:bg-orange-700 text-white">Save Log</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
