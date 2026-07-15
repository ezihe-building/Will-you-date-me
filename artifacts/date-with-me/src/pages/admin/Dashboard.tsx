import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  useGetAuthStatus,
  useLogin,
  useLogout,
  useGetStats,
  useGetSettings,
  useUpdateSettings,
  useListProposals,
  useCreateProposal,
  useDeleteProposal,
  useResetProposal,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, Users, Heart, Calendar, Link2, Plus, Trash2, RotateCcw,
  BarChart3, Settings, Lock, Copy, Check, Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStatsQueryKey, getGetSettingsQueryKey, getListProposalsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "proposals" | "settings";

function LoginForm() {
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-10 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-8">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>
          <h1 className="text-xl font-medium text-white text-center mb-1 tracking-wide">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-xs text-center mb-8 tracking-widest uppercase">
            Owner Access
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-zinc-500"
              autoFocus
            />
            {login.isError && (
              <p className="text-red-400 text-xs text-center">Incorrect password</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 bg-white text-black hover:bg-zinc-100 rounded-xl font-medium tracking-wide"
              disabled={!password || login.isPending}
            >
              {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enter"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent?: string }) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">{label}</p>
          <p className="text-4xl font-light text-foreground">{value.toLocaleString()}</p>
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", accent || "bg-primary/10")}>
          <Icon className={cn("w-5 h-5", accent ? "text-white" : "text-primary")} />
        </div>
      </CardContent>
    </Card>
  );
}

function CopyLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${import.meta.env.BASE_URL}to/${slug}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      <span className="font-mono truncate max-w-[180px]">/to/{slug}</span>
    </button>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: auth, isLoading: authLoading } = useGetAuthStatus();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");

  // Stats
  const { data: stats, isLoading: statsLoading } = useGetStats({}, { query: { enabled: !!auth?.authenticated, queryKey: ['stats'] } });

  // Settings
  const { data: settings } = useGetSettings({ query: { enabled: !!auth?.authenticated, queryKey: ['settings-dash'] } });
  const updateSettings = useUpdateSettings();
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Proposals
  const { data: proposals, isLoading: proposalsLoading } = useListProposals({ query: { enabled: !!auth?.authenticated, queryKey: ['proposals'] } });
  const createProposal = useCreateProposal();
  const deleteProposal = useDeleteProposal();
  const resetProposal = useResetProposal();
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Sync settings fields when data loads
  if (settings && welcomeMsg === "" && musicUrl === "" && galleryPhotos === "") {
    setWelcomeMsg(settings.welcomeMessage || "");
    setMusicUrl(settings.musicUrl || "");
    setGalleryPhotos((settings.galleryPhotos || []).join("\n"));
  }

  const handleLogout = () => {
    logout.mutate();
    navigate("/");
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(
      {
        data: {
          welcomeMessage: welcomeMsg,
          musicUrl: musicUrl || null,
          galleryPhotos: galleryPhotos.split("\n").map(s => s.trim()).filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          setSettingsSaved(true);
          setTimeout(() => setSettingsSaved(false), 2000);
        },
      }
    );
  };

  const handleCreateProposal = () => {
    if (!newName.trim()) return;
    createProposal.mutate(
      { data: { recipientName: newName.trim(), welcomeMessage: newMessage.trim() || null } },
      {
        onSuccess: () => {
          setNewName("");
          setNewMessage("");
          queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
        },
      }
    );
  };

  const handleDelete = (slug: string) => {
    if (confirmDelete !== slug) { setConfirmDelete(slug); return; }
    deleteProposal.mutate({ slug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
        setConfirmDelete(null);
      }
    });
  };

  const handleReset = (slug: string) => {
    resetProposal.mutate({ slug }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!auth?.authenticated) return <LoginForm />;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "proposals", label: "Proposals", icon: Link2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <span className="text-sm font-medium tracking-wider uppercase text-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide uppercase transition-all duration-200",
                    tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </nav>
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Overview Tab */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-serif italic text-foreground mb-8">Overview</h2>
            {statsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard label="Visitors" value={stats?.totalVisitors || 0} icon={Users} />
                  <StatCard label="Said Yes" value={stats?.acceptedCount || 0} icon={Heart} />
                  <StatCard label="Bookings" value={stats?.totalBookings || 0} icon={Calendar} />
                  <StatCard label="Proposals" value={(proposals || []).length} icon={Link2} />
                </div>

                {/* Response breakdown */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium tracking-wider uppercase text-muted-foreground">Response Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-light text-primary">{stats?.acceptedCount || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Yes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-light text-amber-500">{stats?.maybeCount || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Maybe</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-light text-muted-foreground">{stats?.declinedCount || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Not now</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent bookings */}
                {(stats?.recentBookings?.length || 0) > 0 && (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium tracking-wider uppercase text-muted-foreground">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border/50">
                        {stats!.recentBookings.map((b) => (
                          <div key={b.id} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground capitalize">{b.location.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">{b.date} at {b.time}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Proposals Tab */}
        {tab === "proposals" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-serif italic text-foreground mb-8">Personalized Proposals</h2>

            {/* Create form */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium tracking-wider uppercase text-muted-foreground">Create New</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Recipient Name *</label>
                    <Input placeholder="e.g. Emma" value={newName} onChange={e => setNewName(e.target.value)}
                      className="bg-background/50 border-border/60" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Personal Message</label>
                    <Input placeholder="A message just for them..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      className="bg-background/50 border-border/60" />
                  </div>
                </div>
                <Button onClick={handleCreateProposal} disabled={!newName.trim() || createProposal.isPending}
                  className="gap-2">
                  {createProposal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Proposal Link
                </Button>
              </CardContent>
            </Card>

            {/* List */}
            {proposalsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : !proposals?.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <Link2 className="w-8 h-8 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No proposals yet. Create your first one above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(p => (
                  <Card key={p.id} className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-5 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium text-foreground">{p.recipientName}</p>
                          <span className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                            p.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {p.welcomeMessage && <p className="text-sm text-muted-foreground italic truncate mb-2">"{p.welcomeMessage}"</p>}
                        <CopyLink slug={p.slug} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                          onClick={() => handleReset(p.slug)} title="Reset responses">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className={cn("h-8 w-8", confirmDelete === p.slug ? "text-destructive" : "text-muted-foreground hover:text-destructive")}
                          onClick={() => handleDelete(p.slug)} title={confirmDelete === p.slug ? "Confirm delete" : "Delete"}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-serif italic text-foreground mb-8">Site Settings</h2>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardContent className="p-8 space-y-8">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block font-medium">Welcome Message</label>
                  <Textarea
                    value={welcomeMsg}
                    onChange={e => setWelcomeMsg(e.target.value)}
                    rows={3}
                    className="bg-background/50 border-border/60 resize-none"
                    placeholder="I've been wanting to ask you something for a long time..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">Displayed in quotes on the home page.</p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block font-medium">Background Music URL</label>
                  <Input
                    value={musicUrl}
                    onChange={e => setMusicUrl(e.target.value)}
                    className="bg-background/50 border-border/60"
                    placeholder="https://example.com/song.mp3"
                  />
                  <p className="text-xs text-muted-foreground mt-2">A direct link to an audio file (MP3, WAV, OGG). Leave empty for no music.</p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block font-medium">Gallery Photos</label>
                  <Textarea
                    value={galleryPhotos}
                    onChange={e => setGalleryPhotos(e.target.value)}
                    rows={6}
                    className="bg-background/50 border-border/60 resize-none font-mono text-xs"
                    placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-2">One photo URL per line. These appear in the Gallery page.</p>
                </div>

                <Button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="gap-2">
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : settingsSaved ? <Check className="w-4 h-4" /> : null}
                  {settingsSaved ? "Saved!" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
