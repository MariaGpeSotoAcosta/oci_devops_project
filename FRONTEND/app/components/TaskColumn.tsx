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
}

const statusColors = {
  todo: 'bg-gray-100 border-gray-300',
  'in-progress': 'bg-[#30c2b7]/10 border-[#30c2b7]/30',
  done: 'bg-green-50 border-green-300',
};

export function TaskColumn({ title, status, tasks, onTaskMove, onTaskClick }: TaskColumnProps) {
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
    <div className="flex-1 min-w-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2">
          {title}
          <span className="text-sm text-gray-500">({tasks.length})</span>
        </h3>
      </div>
      
      <Card
        ref={drop}
        className={`p-4 min-h-[500px] transition-colors ${statusColors[status]} ${
          isOver ? 'border-2 border-dashed border-[#30c2b7]' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No tasks
          </div>
        )}
      </Card>
    </div>
  );
}