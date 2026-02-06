import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, ReceiptText } from 'lucide-react';
import { apiClient } from '../services/api';
import { formatDate } from '../utils/format';

export default function Expenses() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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

        loadGroups();
    }, []);

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Expenses</p>
                        <h1 className="text-3xl font-semibold text-gray-900 font-display">
                            Choose a group to view expenses.
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Each group shows the latest activity and links to its expense feed.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

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
                                No groups yet. Create one to add expenses.
                            </CardContent>
                        </Card>
                    )}
                    {groups.map((group) => (
                        <Card key={group.id} className="border-gray-100/60 shadow-sm">
                            <CardHeader className="pb-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">{group.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="h-3 w-3" />
                                            {group.members?.length || 0} members
                                        </div>
                                    </div>
                                    <ReceiptText className="h-5 w-5 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Created</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(group.createdAt)}</p>
                                <Link to={`/groups/${group.id}`}>
                                    <Button variant="secondary" className="w-full">
                                        View Expenses
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
