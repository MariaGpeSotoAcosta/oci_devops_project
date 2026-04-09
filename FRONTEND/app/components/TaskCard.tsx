import { useDrag } from 'react-dnd';
import { Task } from '../types';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { AlertCircle, Bug, CheckSquare, FileText } from 'lucide-react';
import { teams } from '../data/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityColors = {
  low: 'bg-[#96efc1]/20 text-[#30c2b7] border-[#70e1bf]/30',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const typeIcons = {
  story: FileText,
  task: CheckSquare,
  bug: Bug,
  epic: AlertCircle,
};

const typeColors = {
  story: 'bg-green-100 text-green-700',
  task: 'bg-[#30c2b7]/20 text-[#30c2b7]',
  bug: 'bg-red-100 text-red-700',
  epic: 'bg-purple-100 text-purple-700',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const TypeIcon = typeIcons[task.type];

  // Get assignee name from team members
  const getAssigneeName = () => {
    if (!task.assigneeId) return null;
    const allMembers = teams.flatMap(t => t.members);
    const member = allMembers.find(m => m.id === task.assigneeId);
    return member?.avatar || null;
  };

  const assigneeAvatar = getAssigneeName();

  return (
    <Card
      ref={drag}
      onClick={onClick}
      className={`p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={typeColors[task.type]}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
          </Badge>
        </div>
        {task.storyPoints && (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            {task.storyPoints} pts
          </Badge>
        )}
      </div>
      
      <h4 className="mb-1">{task.title}</h4>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge className={priorityColors[task.priority]}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
        
        {assigneeAvatar && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-xs">
              {assigneeAvatar}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}