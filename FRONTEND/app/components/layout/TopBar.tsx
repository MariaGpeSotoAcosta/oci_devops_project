import { Bell, Moon, Sun, Search, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

interface TopBarProps {
  onCreateTask?: () => void;
}

export function TopBar({ onCreateTask }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks, projects, people..."
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onCreateTask && (
          <Button onClick={onCreateTask} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <p className="font-medium">New task assigned</p>
                <p className="text-sm text-gray-500">Sarah assigned you to "Fix password reset bug"</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <p className="font-medium">Sprint started</p>
                <p className="text-sm text-gray-500">Sprint 15 has started</p>
                <p className="text-xs text-gray-400 mt-1">1 day ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <p className="font-medium">Comment added</p>
                <p className="text-sm text-gray-500">Marcus commented on your task</p>
                <p className="text-xs text-gray-400 mt-1">2 days ago</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-sm shadow-md">
                {user?.avatar}
              </div>
              <span className="text-sm font-medium dark:text-white hidden md:block">{user?.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}