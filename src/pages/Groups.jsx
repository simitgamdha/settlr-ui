import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { Users, ArrowUpRight, Plus } from 'lucide-react';
import { apiClient } from '../services/api';
import { formatDate } from '../utils/format';

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadGroups = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.get('/api/groups');
            setGroups(data || []);
        } catch (err) {
            setError(err?.message || 'Unable to load groups.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        if (!groupName.trim()) {
            setError('Group name is required.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.post('/api/groups', { name: groupName.trim() });
            setGroupName('');
            await loadGroups();
        } catch (err) {
            setError(err?.message || 'Failed to create group.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Groups</p>
                        <h1 className="text-3xl font-semibold text-gray-900 font-display">
                            Organize people, track expenses, settle quickly.
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Create a group, add members, and start tracking shared costs.
                        </p>
                    </div>
                    {groups[0] && (
                        <Link to={`/groups/${groups[0].id}`}>
                            <Button>Go to Latest Group</Button>
                        </Link>
                    )}
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <Card className="border-gray-100/60 shadow-sm">
                    <CardHeader className="pb-0">
                        <h2 className="text-xl font-semibold text-gray-900">Create Group</h2>
                        <p className="text-sm text-gray-500">
                            Start a new group by giving it a memorable name.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <form className="flex flex-col gap-4 md:flex-row md:items-end" onSubmit={handleCreateGroup}>
                            <Input
                                label="Group Name"
                                name="groupName"
                                placeholder="Weekend Getaway"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                            <Button type="submit" className="md:h-10" isLoading={isSubmitting}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Group
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {loading && (
                        <Card className="border-gray-100/60 shadow-sm">
                            <CardContent className="p-5 text-sm text-gray-500">
                                Loading groups...
                            </CardContent>
                        </Card>
                    )}
                    {!loading && groups.length === 0 && (
                        <Card className="border-gray-100/60 shadow-sm">
                            <CardContent className="p-5 text-sm text-gray-500">
                                No groups yet. Create one to get started.
                            </CardContent>
                        </Card>
                    )}
                    {groups.map((group) => (
                        <Card key={group.id} className="border-gray-100/60 shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-lg font-semibold text-gray-900">{group.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="h-3 w-3" />
                                            {group.members?.length || 0} members
                                        </div>
                                    </div>
                                    <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Created</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(group.createdAt)}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Created by {group.members?.find((member) => member.userId === group.createdByUserId)?.name || 'Member'}
                                </p>
                                <Link to={`/groups/${group.id}`}>
                                    <Button variant="secondary" className="w-full">
                                        View Group
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
