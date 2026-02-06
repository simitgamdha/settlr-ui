import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const buildWeeklySeries = (expenses) => {
    const today = new Date();
    const dayKey = (date) => date.toISOString().slice(0, 10);
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const series = [];

    for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        series.push({
            key: dayKey(date),
            label: labels[date.getDay()],
            total: 0,
        });
    }

    const totals = series.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
    }, {});

    expenses.forEach((expense) => {
        const date = new Date(expense.createdAt);
        if (Number.isNaN(date.getTime())) return;
        const key = dayKey(date);
        if (totals[key]) {
            totals[key].total += Number(expense.amount) || 0;
        }
    });

    return series;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupBalances, setGroupBalances] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [weeklySeries, setWeeklySeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
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

                    const expensesResponses = await Promise.all(
                        groupList.map((group) =>
                            apiClient.get(`/api/groups/${group.id}/expenses`).then((expenses) =>
                                (expenses || []).map((expense) => ({ ...expense, groupName: group.name }))
                            )
                        )
                    );
                    const mergedExpenses = expensesResponses.flat();
                    mergedExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setRecentExpenses(mergedExpenses.slice(0, 3));
                    setWeeklySeries(buildWeeklySeries(mergedExpenses));
                } else {
                    setGroupBalances([]);
                    setRecentExpenses([]);
                    setWeeklySeries([]);
                }
            } catch (err) {
                toast.error(err?.message || 'Failed to load dashboard data.');
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

    const chartPath = useMemo(() => {
        if (!weeklySeries.length) return '';
        const width = 600;
        const height = 200;
        const paddingX = 20;
        const paddingY = 20;
        const maxValue = Math.max(...weeklySeries.map((d) => d.total), 1);
        const stepX = (width - paddingX * 2) / (weeklySeries.length - 1);
        const scaleY = (height - paddingY * 2) / maxValue;

        return weeklySeries
            .map((point, index) => {
                const x = paddingX + index * stepX;
                const y = height - paddingY - point.total * scaleY;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    }, [weeklySeries]);

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dashboard</p>
                        <h1 className="text-3xl font-semibold text-white font-display">
                            Keep every shared expense aligned.
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Track what you owe, what you are owed, and settle quickly across groups.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/groups">
                            <Button variant="secondary" className="border-white/10 bg-ink-800/80 text-slate-200 hover:bg-ink-800">
                                Manage Groups
                            </Button>
                        </Link>
                        <Link to="/expenses">
                            <Button className="bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90">
                                Add Expense
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="glass-panel text-slate-100">
                            <CardContent className="p-5 space-y-3">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                                    {stat.change && (
                                        <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Group Balances</h2>
                                    <p className="text-sm text-slate-400">
                                        Summary of what you owe and are owed by group.
                                    </p>
                                </div>
                                <Link to="/groups">
                                    <Button variant="link" className="text-accent-pink">
                                        View all
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            {loading && <p className="text-sm text-slate-400">Loading balances...</p>}
                            {!loading && groupBalances.length === 0 && (
                                <p className="text-sm text-slate-400">No groups yet. Create one to get started.</p>
                            )}
                            {groupBalances.map(({ group, userBalance, members }) => (
                                <div key={group.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-white">{group.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Users className="h-3 w-3" />
                                            {members} members
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-semibold text-white">
                                            {formatCurrency(userBalance?.netBalance ?? 0)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {userBalance?.netBalance >= 0 ? 'You are owed' : 'You owe'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <h2 className="text-xl font-semibold text-white">Recent Expenses</h2>
                            <p className="text-sm text-slate-400">
                                Latest activity across your groups.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            {loading && <p className="text-sm text-slate-400">Loading expenses...</p>}
                            {!loading && recentExpenses.length === 0 && (
                                <p className="text-sm text-slate-400">No expenses recorded yet.</p>
                            )}
                            {recentExpenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{expense.description}</p>
                                        <p className="text-xs text-slate-400">
                                            {expense.groupName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-white">{formatCurrency(expense.amount)}</p>
                                        <p className="text-xs text-slate-400">{formatDate(expense.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card className="glass-panel text-slate-100">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Spending Trend</h2>
                                <p className="text-sm text-slate-400">Last 7 days of expenses.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-ink-800/70 px-3 py-1 text-xs text-slate-300">
                                Last 7 days
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-56 rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                            {weeklySeries.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                                    No expense data yet.
                                </div>
                            ) : (
                                <svg viewBox="0 0 600 200" className="h-full w-full">
                                    <defs>
                                        <linearGradient id="lineExpense" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#7c9bff" />
                                            <stop offset="100%" stopColor="#ff6aa7" />
                                        </linearGradient>
                                        <linearGradient id="areaExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#7c9bff" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="#7c9bff" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`${chartPath} L 580 180 L 20 180 Z`}
                                        fill="url(#areaExpense)"
                                    />
                                    <path
                                        d={chartPath}
                                        fill="none"
                                        stroke="url(#lineExpense)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                    {weeklySeries.map((point, index) => {
                                        const width = 600;
                                        const height = 200;
                                        const paddingX = 20;
                                        const paddingY = 20;
                                        const maxValue = Math.max(...weeklySeries.map((d) => d.total), 1);
                                        const stepX = (width - paddingX * 2) / (weeklySeries.length - 1);
                                        const scaleY = (height - paddingY * 2) / maxValue;
                                        const x = paddingX + index * stepX;
                                        const y = height - paddingY - point.total * scaleY;
                                        return <circle key={point.label} cx={x} cy={y} r="4" fill="#ff6aa7" />;
                                    })}
                                </svg>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            {weeklySeries.map((point) => (
                                <span key={point.label} className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-accent-blue"></span>
                                    {point.label}: {formatCurrency(point.total)}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
