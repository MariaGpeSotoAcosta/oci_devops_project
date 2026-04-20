import { useDrag } from 'react-dnd';
import { Task } from '../types';
import { useTeam } from '../context/TeamContext';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { AlertCircle, Bug, CheckSquare, FileText, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  /** Optional project name to display on the card */
  projectName?: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-[#96efc1]/20 text-[#30c2b7] border-[#70e1bf]/30',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const priorityDot: Record<string, string> = {
  low: 'bg-[#30c2b7]',
  medium: 'bg-yellow-400',
  high: 'bg-orange-400',
  critical: 'bg-red-500',
};

const typeIcons = {
  story: FileText,
  task: CheckSquare,
  bug: Bug,
  epic: AlertCircle,
};

const typeColors: Record<string, string> = {
  story: 'bg-green-100 text-green-700',
  task: 'bg-[#30c2b7]/20 text-[#30c2b7]',
  bug: 'bg-red-100 text-red-700',
  epic: 'bg-purple-100 text-purple-700',
};

/** Turn a full name into 1–2 uppercase initials */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function TaskCard({ task, onClick, projectName }: TaskCardProps) {
  const { teams } = useTeam();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Resolve assignee from real team data
  const allMembers = teams.flatMap((t) => t.members);
  const assignee = task.assigneeId
    ? allMembers.find((m) => m.id === task.assigneeId)
    : null;

  const TypeIcon = typeIcons[task.type] ?? CheckSquare;

  return (
    <Card
      ref={drag}
      onClick={onClick}
      className={`p-3 mb-2 cursor-pointer hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
        isDragging ? 'opacity-40 rotate-1 scale-95' : 'opacity-100'
      }`}
    >
      {/* Top row: type badge + hours */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={`text-xs ${typeColors[task.type] ?? ''}`}>
          <TypeIcon className="w-3 h-3 mr-1" />
          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
        </Badge>
        {task.storyPoints != null && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" /> 
            Estimated time: {task.storyPoints}h
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 leading-snug">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Project name */}
      {projectName && (
        <p className="text-xs text-[#30c2b7] font-medium mb-2 truncate">{projectName}</p>
      )}

      {/* Bottom row: priority dot + label, assignee avatar */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority] ?? 'bg-gray-300'}`}
          />
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority] ?? ''}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">             <Clock className="w-3 h-3" /> 
 Worked hours: {task.workedHours ?? 0}h</div>
        </div>

        {assignee ? (
          <div
            className="w-6 h-6 rounded-full bg-linear-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-xs font-semibold shrink-0"
            title={assignee.name}
          >
            {initials(assignee.name)}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600"
            title="Unassigned"
          />
        )}
      </div>
    </Card>
  );
}
