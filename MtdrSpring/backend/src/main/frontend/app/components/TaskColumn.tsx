import { useDrop } from 'react-dnd';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Card } from './ui/card';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  /** Lookup function: given a projectId, return the project name */
  getProjectName?: (projectId: string) => string | undefined;
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600',
  'in-progress': 'bg-[#30c2b7]/10 border-[#30c2b7]/30',
  done: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
};

const statusHeaderColors: Record<TaskStatus, string> = {
  todo: 'text-gray-600 dark:text-gray-300',
  'in-progress': 'text-[#30c2b7]',
  done: 'text-green-600 dark:text-green-400',
};

const statusCountBg: Record<TaskStatus, string> = {
  todo: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  'in-progress': 'bg-[#30c2b7]/20 text-[#30c2b7]',
  done: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
};

export function TaskColumn({ title, status, tasks, onTaskMove, onTaskClick, getProjectName }: TaskColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        onTaskMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1 min-w-75">
      <div className="mb-3 flex items-center gap-2">
        <h3 className={`font-semibold text-sm uppercase tracking-wide ${statusHeaderColors[status]}`}>
          {title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCountBg[status]}`}>
          {tasks.length}
        </span>
      </div>

      <Card
        ref={drop}
        className={`p-3 min-h-125 transition-colors ${statusColors[status]} ${
          isOver ? 'ring-2 ring-[#30c2b7] ring-dashed' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            projectName={getProjectName ? getProjectName(task.projectId) : undefined}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-600 py-12 text-sm">
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        )}
      </Card>
    </div>
  );
}
