import { Link, useLocation } from 'react-router';
import { Home, Layers, Users, LayoutGrid, Settings, Calendar, ListTodo, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: Layers },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Board', href: '/board', icon: LayoutGrid },
  { name: 'Backlog', href: '/backlog', icon: ListTodo },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'AI Chatbot', href: '/chatbot', icon: MessageCircle },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] rounded-lg flex items-center justify-center shadow-md">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg dark:text-white">TaskFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 text-[#30c2b7] dark:text-[#70e1bf]'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-2',
            location.pathname === '/settings'
              ? 'bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 text-[#30c2b7] dark:text-[#70e1bf]'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}