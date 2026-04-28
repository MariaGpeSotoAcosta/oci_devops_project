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
import { User, Bell, MessageSquare, CheckCircle2, Copy, RefreshCw, Clock } from 'lucide-react';
import { defaultNotificationSettings } from '../data/mockData';
import { toast } from 'sonner';

// ── API helper ────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('auth_token') ?? '';
}

async function generateJoinCode(): Promise<{ code: string; expiresInMinutes: number }> {
  const res = await fetch('/api/telegram/join-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Settings() {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    defaultNotificationSettings
  );

  // ── Telegram state ──────────────────────────────────────────────────────────
  const [telegramConnected]   = useState(user?.telegramConnected || false);
  const [telegramUsername]    = useState(user?.telegramUsername || '');

  /** The join code currently shown to the user */
  const [joinCode, setJoinCode]           = useState<string | null>(null);
  /** When the current code expires (Date object) */
  const [codeExpiry, setCodeExpiry]       = useState<Date | null>(null);
  /** True while the POST /api/telegram/join-code request is in flight */
  const [generatingCode, setGeneratingCode] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handleNotificationSave = () => {
    toast.success('Notification preferences saved!');
  };

  /** Calls the backend to create a new join code and shows it to the user. */
  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const { code, expiresInMinutes } = await generateJoinCode();
      setJoinCode(code);
      const expiry = new Date(Date.now() + expiresInMinutes * 60 * 1000);
      setCodeExpiry(expiry);
      toast.success('Join code generated! It expires in 15 minutes.');
    } catch (err) {
      toast.error('Could not generate join code. Please try again.');
    } finally {
      setGeneratingCode(false);
    }
  };

  /** Copies the join code to clipboard. */
  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).then(() => {
      toast.success('Join code copied to clipboard!');
    });
  };

  /** Formats the expiry time as HH:MM */
  const formatExpiry = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Render ───────────────────────────────────────────────────────────────────

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

        {/* ── Profile ── */}
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
              <CardDescription>Irreversible and destructive actions</CardDescription>
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

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
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
                  {[
                    { id: 'taskAssignment', label: 'Task Assignments', desc: "When you're assigned to a task", key: 'taskAssignment' as const },
                    { id: 'sprintUpdates',  label: 'Sprint Updates',   desc: 'When sprints start, end, or are updated', key: 'sprintUpdates' as const },
                    { id: 'mentions',       label: 'Mentions',         desc: 'When someone mentions you in a comment', key: 'mentions' as const },
                    { id: 'comments',       label: 'Comments',         desc: 'When someone comments on your tasks', key: 'comments' as const },
                  ].map(({ id, label, desc, key }) => (
                    <div key={id} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={id}>{label}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                      </div>
                      <Switch
                        id={id}
                        checked={notificationSettings[key]}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, [key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Telegram ── */}
        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Integration</CardTitle>
              <CardDescription>
                Link your Telegram account to manage tasks directly from the bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* ── Already connected ── */}
              {telegramConnected ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Telegram Connected
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {telegramUsername ? `Connected as ${telegramUsername}` : 'Account linked'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your Telegram account is not linked yet. Follow the steps below.
                  </p>
                </div>
              )}

              <Separator />

              {/* ── How-to steps ── */}
              <div>
                <h4 className="font-medium mb-4 dark:text-white">
                  How to link your account
                </h4>
                <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">1</span>
                    <span>
                      Click <strong>"Generate Join Code"</strong> below to get a one-time code valid for 15 minutes.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">2</span>
                    <span>
                      Open Telegram and find the bot{' '}
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">@YourBotName</code>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">3</span>
                    <span>
                      Send the command <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/ConfigUser</code> to the bot.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">4</span>
                    <span>
                      Paste the join code when the bot asks for it.
                    </span>
                  </li>
                </ol>
              </div>

              <Separator />

              {/* ── Join code generator ── */}
              <div>
                <h4 className="font-medium mb-3 dark:text-white">Join Code</h4>

                {joinCode ? (
                  <div className="space-y-3">
                    {/* Code display */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-2xl tracking-widest text-center py-4 px-6 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 select-all dark:text-white">
                        {joinCode}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyCode}
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Expiry notice */}
                    {codeExpiry && (
                      <p className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                        <Clock className="w-4 h-4" />
                        Expires at {formatExpiry(codeExpiry)} — code is single-use
                      </p>
                    )}

                    {/* Regenerate */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${generatingCode ? 'animate-spin' : ''}`} />
                      Generate New Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate a one-time code to paste in the Telegram bot. The code expires after 15 minutes.
                    </p>
                    <Button onClick={handleGenerateCode} disabled={generatingCode}>
                      {generatingCode ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Generate Join Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* ── What you can do ── */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                  What you can do from Telegram:
                </h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>📋 <code>/NewTask</code> — create a task and pick a project</li>
                  <li>📝 <code>/MyTasks</code> — see your assigned tasks</li>
                  <li>✏️ <code>/ModName</code> — rename a task</li>
                  <li>🔋 <code>/ModStatus</code> — change task status</li>
                  <li>⏱️ <code>/ModWorked</code> — log worked hours</li>
                  <li>⏱️ <code>/ModExpected</code> — update expected hours</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}