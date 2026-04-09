import { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Users, Mail, Shield, Clock, Copy, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function Teams() {
  const { user } = useAuth();
  const { teams, createTeam, inviteMember, joinTeam, isLoading } = useTeam();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
  });

  const [joinCode, setJoinCode] = useState('');

  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'developer' as UserRole,
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam(createFormData.name, createFormData.description);
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinTeam(joinCode);
      setIsJoinDialogOpen(false);
      setJoinCode('');
    } catch (error) {
      console.error('Failed to join team:', error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember(selectedTeamId, inviteFormData.email, inviteFormData.role);
      setIsInviteDialogOpen(false);
      setInviteFormData({ email: '', role: 'developer' });
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied to clipboard!');
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    developer: 'bg-[#30c2b7]/20 text-[#30c2b7] border-[#70e1bf]/30',
    viewer: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Mock online status - in real app this would come from backend
  const getOnlineStatus = (memberId: string) => {
    const onlineMembers = ['1', '2', '3']; // Mock data
    return onlineMembers.includes(memberId);
  };

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] rounded-xl text-white shadow-lg">
        <h1 className="text-3xl mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-[#96efc1]">
          Manage your teams and collaborate with {teams.reduce((sum, t) => sum + t.members.length, 0)} team members
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl dark:text-white">Your Teams</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Collaborate and track team performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Join Team
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" />
                    {team.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {team.description}
                  </p>
                  {team.joinCode && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="px-3 py-1.5 bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 border border-[#30c2b7]/30 rounded-md">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Join Code: </span>
                        <span className="font-mono font-semibold text-[#30c2b7]">{team.joinCode}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyJoinCode(team.joinCode!)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setIsInviteDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{team.members.length} members</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {team.members.filter(m => getOnlineStatus(m.id)).length} online
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Show current user first if they're in this team */}
                  {team.members
                    .sort((a, b) => {
                      if (a.email === user?.email) return -1;
                      if (b.email === user?.email) return 1;
                      return 0;
                    })
                    .map((member) => {
                      const isCurrentUser = member.email === user?.email;
                      const isOnline = getOnlineStatus(member.id);
                      
                      return (
                        <div 
                          key={member.id} 
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isCurrentUser 
                              ? 'bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 border-2 border-[#30c2b7]/30 dark:border-[#30c2b7]/50' 
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white font-semibold shadow-md">
                                {member.avatar}
                              </div>
                              {isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium dark:text-white">
                                  {member.name}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs font-semibold text-[#30c2b7] dark:text-[#70e1bf]">
                                      (You)
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                                {isOnline && (
                                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <Clock className="w-3 h-3" />
                                    Active now
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={roleColors[member.role]}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {teams.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 dark:text-white">No teams yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first team to start collaborating
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </Card>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="Engineering Team"
                required
              />
            </div>

            <div>
              <Label htmlFor="teamDescription">Description</Label>
              <Textarea
                id="teamDescription"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Describe your team..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Team Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <Label htmlFor="joinCodeInput">Team Join Code</Label>
              <Input
                id="joinCodeInput"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="uppercase font-mono"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Ask your team admin for the 6-character join code
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || joinCode.length !== 6}>
                {isLoading ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                  placeholder="colleague@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteFormData.role}
                onValueChange={(value: UserRole) => setInviteFormData({ ...inviteFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-gray-500">Full access and control</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="developer">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Developer</p>
                        <p className="text-xs text-gray-500">Can create and manage tasks</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Viewer</p>
                        <p className="text-xs text-gray-500">Read-only access</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}