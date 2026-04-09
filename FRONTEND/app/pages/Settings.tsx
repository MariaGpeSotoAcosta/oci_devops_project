import { useState } from 'react';
import { NotificationSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { User, Bell, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { defaultNotificationSettings } from '../data/mockData';
import { toast } from 'sonner';

export function Settings() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    defaultNotificationSettings
  );

  const [telegramConnected, setTelegramConnected] = useState(user?.telegramConnected || false);
  const [telegramUsername, setTelegramUsername] = useState(user?.telegramUsername || '');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handleNotificationSave = () => {
    toast.success('Notification preferences saved!');
  };

  const handleConnectTelegram = () => {
    // Mock Telegram connection
    setTelegramConnected(true);
    setTelegramUsername('@taskflow_bot');
    toast.success('Telegram account connected!');
  };

  const handleDisconnectTelegram = () => {
    setTelegramConnected(false);
    setTelegramUsername('');
    setNotificationSettings({ ...notificationSettings, telegramNotifications: false });
    toast.success('Telegram account disconnected!');
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="telegram">
            <MessageSquare className="w-4 h-4 mr-2" />
            Telegram
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl">
                    {user?.avatar}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user?.role}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                <div>
                  <p className="font-medium dark:text-white">Delete Account</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-4 dark:text-white">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4 dark:text-white">Activity Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="taskAssignment">Task Assignments</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When you're assigned to a task
                      </p>
                    </div>
                    <Switch
                      id="taskAssignment"
                      checked={notificationSettings.taskAssignment}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, taskAssignment: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sprintUpdates">Sprint Updates</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When sprints start, end, or are updated
                      </p>
                    </div>
                    <Switch
                      id="sprintUpdates"
                      checked={notificationSettings.sprintUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, sprintUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentions">Mentions</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When someone mentions you in a comment
                      </p>
                    </div>
                    <Switch
                      id="mentions"
                      checked={notificationSettings.mentions}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, mentions: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When someone comments on your tasks
                      </p>
                    </div>
                    <Switch
                      id="comments"
                      checked={notificationSettings.comments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, comments: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Integration */}
        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Integration</CardTitle>
              <CardDescription>
                Connect your Telegram account to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!telegramConnected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl mb-2 dark:text-white">Connect Telegram</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Get instant notifications on Telegram when tasks are assigned, 
                    sprints are updated, or you're mentioned in comments
                  </p>
                  <Button onClick={handleConnectTelegram}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Connect Telegram Account
                  </Button>
                  
                  <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                    <h4 className="font-medium mb-2 dark:text-white">How to connect:</h4>
                    <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Click the "Connect Telegram Account" button</li>
                      <li>Open Telegram and search for @TaskFlowBot</li>
                      <li>Send the command /start to the bot</li>
                      <li>Follow the bot's instructions to complete linking</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg mb-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Telegram Connected
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Connected to {telegramUsername}
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleDisconnectTelegram}>
                      Disconnect
                    </Button>
                  </div>

                  <Separator />

                  <div className="mt-6">
                    <h4 className="mb-4 dark:text-white">Telegram Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="telegramNotifications">Enable Telegram Notifications</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive notifications via Telegram
                          </p>
                        </div>
                        <Switch
                          id="telegramNotifications"
                          checked={notificationSettings.telegramNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, telegramNotifications: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                        What you'll receive on Telegram:
                      </h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Task assignments</li>
                        <li>• Sprint start and completion notifications</li>
                        <li>• Mentions in comments</li>
                        <li>• Important project updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
