import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupBalances, setGroupBalances] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                const [summaryData, groupList] = await Promise.all([
                    apiClient.get('/api/dashboard/summary'),
                    apiClient.get('/api/groups'),
                ]);

                setSummary(summaryData);
                setGroups(groupList || []);

                if (groupList?.length) {
                    const balancesResponses = await Promise.all(
                        groupList.map((group) =>
                            apiClient.get(`/api/groups/${group.id}/balances`).then((balances) => ({
                                group,
                                balances: balances || [],
                            }))
                        )
                    );

                    const computedBalances = balancesResponses.map(({ group, balances }) => {
                        const userBalance = balances.find((balance) => balance.userId === user?.id);
                        return {
                            group,
                            userBalance,
                            members: group.members?.length || 0,
                        };
                    });
                    setGroupBalances(computedBalances);

                    const expenseGroups = groupList.slice(0, 3);
                    const expensesResponses = await Promise.all(
                        expenseGroups.map((group) =>
                            apiClient.get(`/api/groups/${group.id}/expenses`).then((expenses) =>
                                (expenses || []).map((expense) => ({ ...expense, groupName: group.name }))
                            )
                        )
                    );
                    const mergedExpenses = expensesResponses.flat();
                    mergedExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setRecentExpenses(mergedExpenses.slice(0, 3));
                } else {
                    setGroupBalances([]);
                    setRecentExpenses([]);
                }
            } catch (err) {
                setError(err?.message || 'Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user?.id]);

    const stats = useMemo(() => {
        const totalOwed = summary?.totalOwedByUser ?? 0;
        const totalOwedTo = summary?.totalOwedToUser ?? 0;
        const netBalance = totalOwedTo - totalOwed;
        return [
            { label: 'You Owe', value: formatCurrency(totalOwed), change: '', trend: 'down' },
            { label: 'You Are Owed', value: formatCurrency(totalOwedTo), change: '', trend: 'up' },
            { label: 'Net Balance', value: formatCurrency(netBalance), change: '', trend: netBalance >= 0 ? 'up' : 'down' },
            { label: 'Active Groups', value: String(groups.length), change: '', trend: 'up' },
        ];
    }, [summary, groups.length]);

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
                        <h1 className="text-3xl font-semibold text-gray-900 font-display">
                            Keep every shared expense aligned.
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Track what you owe, what you are owed, and settle quickly across groups.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/groups">
                            <Button variant="secondary">Manage Groups</Button>
                        </Link>
                        <Link to="/groups/1">
                            <Button>Add Expense</Button>
                        </Link>
                    </div>
                </div>
                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-gray-100/60 shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                    {stat.change && (
                                        <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {stat.trend === 'up' ? (
                                                <ArrowUpRight className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4" />
                                            )}
                                            {stat.change}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Group Balances</h2>
                                    <p className="text-sm text-gray-500">
                                        Summary of what you owe and are owed by group.
                                    </p>
                                </div>
                                <Link to="/groups">
                                    <Button variant="link">View all</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            {loading && <p className="text-sm text-gray-500">Loading balances...</p>}
                            {!loading && groupBalances.length === 0 && (
                                <p className="text-sm text-gray-500">No groups yet. Create one to get started.</p>
                            )}
                            {groupBalances.map(({ group, userBalance, members }) => (
                                <div key={group.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="h-3 w-3" />
                                            {members} members
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(userBalance?.netBalance ?? 0)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {userBalance?.netBalance >= 0 ? 'You are owed' : 'You owe'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
                            <p className="text-sm text-gray-500">
                                Latest activity across your groups.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            {loading && <p className="text-sm text-gray-500">Loading expenses...</p>}
                            {!loading && recentExpenses.length === 0 && (
                                <p className="text-sm text-gray-500">No expenses recorded yet.</p>
                            )}
                            {recentExpenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{expense.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {expense.groupName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                                        <p className="text-xs text-gray-500">{formatDate(expense.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
