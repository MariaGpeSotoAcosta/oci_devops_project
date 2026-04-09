import { useState } from "react";
import { Link } from "react-router";
import { Task, Activity, Sprint, Project } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTeam } from "../context/TeamContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Layers,
  Target,
  Users,
  Plus,
  UserPlus,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardProps {
  tasks: Task[];
  activities: Activity[];
  sprints: Sprint[];
  projects: Project[];
  isLoading?: boolean;
}

export function Dashboard({
  tasks,
  activities,
  sprints,
  projects,
  isLoading = false,
}: DashboardProps) {
  const { user } = useAuth();
const { teams, createTeam, joinTeam, isLoading: isTeamLoading } = useTeam();  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const myTasks = tasks.filter((t) => t.sprintId);
  const todoTasks = myTasks.filter((t) => t.status === "todo");
  const inProgressTasks = myTasks.filter(
    (t) => t.status === "in-progress",
  );
  const doneTasks = myTasks.filter((t) => t.status === "done");

  const activeSprints = sprints.filter(
    (s) => s.status === "active",
  );
  const activeProjects = projects.filter(
    (p) => p.status === "active",
  );

  const totalPoints = myTasks.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0,
  );
  const completedPoints = doneTasks.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0,
  );
  const progressPercentage =
    totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

  const getTeamMemberName = (userId: string) => {
    const allMembers = teams.flatMap((t) => t.members);
    const member = allMembers.find((m) => m.id === userId);
    return member?.name || "Unknown";
  };

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

  return (
    <div className="p-6 space-y-6">
      {(isLoading || isTeamLoading) && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-[#30c2b7] border-t-transparent rounded-full animate-spin" />
          Loading your data...
        </div>
      )}
      {/* Welcome Section */}
      <div className="p-6 bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] rounded-xl text-white">
        <h1 className="text-3xl mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-[#96efc1] mb-4">
          Here's what's happening with your projects today
        </p>

        {/* Quick Actions */}
        {teams.length === 0 && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-white mb-3">Get started by creating or joining a team</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-white text-[#30c2b7] hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
              <Button
                onClick={() => setIsJoinDialogOpen(true)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Team
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Tasks
                </p>
                <p className="text-3xl dark:text-white">
                  {myTasks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {doneTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  In Progress
                </p>
                <p className="text-3xl dark:text-white">
                  {inProgressTasks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Story Points
                </p>
                <p className="text-3xl dark:text-white">
                  {completedPoints}/{totalPoints}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(progressPercentage)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Sprints
                </p>
                <p className="text-3xl dark:text-white">
                  {activeSprints.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Across {activeProjects.length} projects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Sprints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Active Sprints
              </span>
              <Link to="/board">
                <Button variant="ghost" size="sm">
                  View All{" "}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSprints.map((sprint) => {
              const sprintTasks = tasks.filter(
                (t) => t.sprintId === sprint.id,
              );
              const sprintDone = sprintTasks.filter(
                (t) => t.status === "done",
              );
              const sprintTotal = sprintTasks.reduce(
                (sum, t) => sum + (t.storyPoints || 0),
                0,
              );
              const sprintCompleted = sprintDone.reduce(
                (sum, t) => sum + (t.storyPoints || 0),
                0,
              );
              const sprintProgress =
                sprintTotal > 0
                  ? (sprintCompleted / sprintTotal) * 100
                  : 0;

              return (
                <div key={sprint.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="dark:text-white">
                        {sprint.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sprint.goal}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="dark:text-white">
                        {sprintCompleted}/{sprintTotal} points
                      </span>
                    </div>
                    <Progress
                      value={sprintProgress}
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}

            {activeSprints.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No active sprints
              </p>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                My Tasks
              </span>
              <Link to="/board">
                <Button variant="ghost" size="sm">
                  View All{" "}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.slice(0, 5).map((task) => {
                const priorityColors = {
                  low: "bg-blue-100 text-blue-700",
                  medium: "bg-yellow-100 text-yellow-700",
                  high: "bg-orange-100 text-orange-700",
                  critical: "bg-red-100 text-red-700",
                };

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="mb-1 dark:text-white">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            priorityColors[task.priority]
                          }
                          variant="outline"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {task.storyPoints} pts
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {task.status === "todo"
                        ? "To Do"
                        : task.status === "in-progress"
                          ? "In Progress"
                          : "Done"}
                    </Badge>
                  </div>
                );
              })}

              {myTasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No tasks assigned
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Active Projects
              </span>
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  View All{" "}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeProjects.map((project) => {
              const projectTasks = tasks.filter(
                (t) => t.projectId === project.id,
              );
              const projectSprints = sprints.filter(
                (s) => s.projectId === project.id,
              );

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                >
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="dark:text-white">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {project.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {project.key}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{projectTasks.length} tasks</span>
                      <span>•</span>
                      <span>
                        {projectSprints.length} sprints
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {activeProjects.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No active projects
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                      {activity.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm dark:text-white">
                      <span className="font-medium">
                        {activity.userName}
                      </span>{" "}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        activity.timestamp,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
              <Button type="submit" disabled={isTeamLoading}>
                {isTeamLoading ? 'Creating...' : 'Create Team'}
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
              <Label htmlFor="joinCode">Team Join Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="uppercase"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Ask your team admin for the join code
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTeamLoading || joinCode.length !== 6}>
                {isTeamLoading ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}