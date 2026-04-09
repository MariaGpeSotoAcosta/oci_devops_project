import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home, Layers, Users, LayoutGrid, Settings,
  Calendar, ListTodo, LogOut, MessageCircle,
  Plus, UserPlus, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../context/TeamContext';
import { cn } from '../ui/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';

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
  const { createTeam, joinTeam, isLoading } = useTeam();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam(createForm.name, createForm.description);
      setIsCreateDialogOpen(false);
      setCreateForm({ name: '', description: '' });
    } catch {
      // toast already shown in context
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinTeam(joinCode);
      setIsJoinDialogOpen(false);
      setJoinCode('');
    } catch {
      // toast already shown in context
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-[#30c2b7] to-[#70e1bf] rounded-lg flex items-center justify-center shadow-md">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg dark:text-white">Just To Do It</span>
          </div>
        </div>

        {/* New Group button */}
        <div className="px-3 mb-2 relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#30c2b7] hover:bg-[#28aaa0] text-white transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Group
            </span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); setIsCreateDialogOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#30c2b7]" />
                <div className="text-left">
                  <p className="font-medium">Create Group</p>
                  <p className="text-xs text-gray-500">Start a new team</p>
                </div>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700" />
              <button
                onClick={() => { setMenuOpen(false); setIsJoinDialogOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#30c2b7]" />
                <div className="text-left">
                  <p className="font-medium">Join Group</p>
                  <p className="text-xs text-gray-500">Enter a join code</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMenuOpen(false)}
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

        {/* Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
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

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <Label htmlFor="sb-teamName">Group Name</Label>
              <Input
                id="sb-teamName"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Engineering Team"
                required
              />
            </div>
            <div>
              <Label htmlFor="sb-teamDesc">Description</Label>
              <Textarea
                id="sb-teamDesc"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe your group..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <Label htmlFor="sb-joinCode">Join Code</Label>
              <Input
                id="sb-joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="uppercase font-mono tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Ask your group admin for the 6-character code</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || joinCode.length !== 6}>
                {isLoading ? 'Joining...' : 'Join Group'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
