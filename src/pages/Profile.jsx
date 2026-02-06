import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { UserCircle2 } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Profile</p>
                        <h1 className="text-3xl font-semibold text-white font-display">
                            My Profile
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Manage your account details and preferences.
                        </p>
                    </div>
                </div>

                <Card className="glass-panel text-slate-100">
                    <CardHeader className="pb-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink text-white grid place-items-center">
                                <UserCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
                                <p className="text-sm text-slate-400">{user?.email || 'email@example.com'}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
                                <p className="text-sm font-semibold text-white mt-2">{user?.name || '-'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                                <p className="text-sm font-semibold text-white mt-2">{user?.email || '-'}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button variant="secondary" disabled className="border-white/10 bg-ink-800/70 text-slate-200">
                                Edit Profile (Coming soon)
                            </Button>
                            <Button variant="secondary" disabled className="border-white/10 bg-ink-800/70 text-slate-200">
                                Change Password (Coming soon)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
