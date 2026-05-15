import { useState, useEffect } from 'react';
import { Project, Sprint } from '../types';
import { sprintsApi } from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';

interface SprintCreateDialogProps {
  open: boolean;
  onClose: () => void;
  /** Projects the user can assign the sprint to */
  projects: Project[];
  /** All existing sprints — used to auto-number the new sprint name */
  sprints: Sprint[];
  /** Default project to pre-select */
  defaultProjectId?: string;
  /** Called with the newly created sprint after a successful save */
  onCreated: (sprint: Sprint) => void;
}

export function SprintCreateDialog({
  open,
  onClose,
  projects,
  sprints,
  defaultProjectId,
  onCreated,
}: SprintCreateDialogProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [name, setName]           = useState('');
  const [goal, setGoal]           = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [saving, setSaving]       = useState(false);

  // Auto-generate sprint name whenever projectId changes
  useEffect(() => {
    if (!projectId) return;
    const existing = sprints.filter((s) => (s as any).projectId === projectId);
    setName(`Sprint ${existing.length + 1}`);
  }, [projectId, sprints]);

  // Sync defaultProjectId when dialog opens
  useEffect(() => {
    if (open) {
      setProjectId(defaultProjectId ?? (projects[0]?.id ?? ''));
      setGoal('');
      setStartDate('');
      setEndDate('');
    }
  }, [open, defaultProjectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) { toast.error('Please select a project'); return; }
    if (!name.trim()) { toast.error('Sprint name is required'); return; }

    setSaving(true);
    try {
      const created = await sprintsApi.create({
        projectId,
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: 'planning',
      } as any);
      toast.success(`${created.name} created!`);
      onCreated(created as unknown as Sprint);
      onClose();
    } catch (err: any) {
      toast.error(`Failed to create sprint: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#30c2b7]" />
            Create New Sprint
          </DialogTitle>
          <DialogDescription>
            A sprint is a time-boxed iteration. Tasks assigned to this sprint will
            appear on the Kanban board when it is selected.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {/* Project */}
          <div>
            <Label htmlFor="sp-project">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="sp-project" className="mt-1">
                <SelectValue placeholder="Select project…" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="sp-name">
              Sprint Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint 1"
              className="mt-1"
              required
              autoFocus
            />
          </div>

          {/* Goal */}
          <div>
            <Label htmlFor="sp-goal">Sprint Goal</Label>
            <Textarea
              id="sp-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What should the team achieve by the end of this sprint?"
              rows={2}
              className="mt-1 resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sp-start">Start Date</Label>
              <Input
                id="sp-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sp-end">End Date</Label>
              <Input
                id="sp-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !projectId}
              className="bg-[#30c2b7] hover:bg-[#28a89e] text-white"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                : 'Create Sprint'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
