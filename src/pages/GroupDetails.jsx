import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, ReceiptText, BadgeDollarSign } from 'lucide-react';
import { apiClient } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function GroupDetails() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [balances, setBalances] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        description: '',
        payerId: '',
    });
    const [loading, setLoading] = useState(true);
    const [submittingExpense, setSubmittingExpense] = useState(false);
    const [addingMember, setAddingMember] = useState(false);

    const loadGroupData = async () => {
        setLoading(true);
        try {
            const groupList = await apiClient.get('/api/groups');
            const foundGroup = groupList?.find((item) => item.id === groupId) || groupList?.[0];
            if (!foundGroup) {
                setGroup(null);
                setBalances([]);
                setExpenses([]);
                return;
            }

            setGroup(foundGroup);
            setExpenseForm((prev) => ({
                ...prev,
                payerId: prev.payerId || foundGroup.members?.[0]?.userId || user?.id || '',
            }));

            const [balanceData, expenseData] = await Promise.all([
                apiClient.get(`/api/groups/${foundGroup.id}/balances`),
                apiClient.get(`/api/groups/${foundGroup.id}/expenses`),
            ]);

            setBalances(balanceData || []);
            setExpenses(expenseData || []);
        } catch (err) {
            toast.error(err?.message || 'Unable to load group data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroupData();
    }, [groupId]);

    const handleExpenseChange = (event) => {
        const { name, value } = event.target;
        setExpenseForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddExpense = async (event) => {
        event.preventDefault();
        if (!group) return;

        if (!expenseForm.amount || !expenseForm.description.trim() || !expenseForm.payerId) {
            toast.error('Amount, description, and payer are required.');
            return;
        }

        setSubmittingExpense(true);
        try {
            await apiClient.post('/api/expenses', {
                groupId: group.id,
                payerId: expenseForm.payerId,
                amount: Number(expenseForm.amount),
                description: expenseForm.description.trim(),
            });
            setExpenseForm({ amount: '', description: '', payerId: expenseForm.payerId });
            await loadGroupData();
            toast.success('Expense added.');
        } catch (err) {
            toast.error(err?.message || 'Failed to add expense.');
        } finally {
            setSubmittingExpense(false);
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();
        if (!group) return;
        if (!memberEmail.trim()) {
            toast.error('Member email is required.');
            return;
        }

        setAddingMember(true);
        try {
            const lookup = await apiClient.get(`/api/users/lookup?email=${encodeURIComponent(memberEmail.trim())}`);
            await apiClient.post(`/api/groups/${group.id}/members`, {
                userIds: [lookup.id],
            });
            setMemberEmail('');
            await loadGroupData();
            toast.success('Member added.');
        } catch (err) {
            toast.error(err?.message || 'Failed to add member.');
        } finally {
            setAddingMember(false);
        }
    };

    const memberOptions = useMemo(() => group?.members || [], [group]);

    if (loading) {
        return (
            <AppLayout>
                <div className="text-sm text-slate-400">Loading group...</div>
            </AppLayout>
        );
    }

    if (!group) {
        return (
            <AppLayout>
                <div className="text-sm text-slate-400">Group not found.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Group</p>
                        <h1 className="text-3xl font-semibold text-white font-display">
                            {group.name}
                        </h1>
                        <p className="text-slate-400 mt-2">Created {formatDate(group.createdAt)}</p>
                    </div>
                    <Button variant="secondary" className="border-white/10 bg-ink-800/70 text-slate-200 hover:bg-ink-800">
                        Settle Up
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Add Expense</h2>
                                    <p className="text-sm text-slate-400">
                                        Expenses are split equally among all group members.
                                    </p>
                                </div>
                                <ReceiptText className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddExpense}>
                                <Input
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseChange}
                                    className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Payer</label>
                                    <select
                                        name="payerId"
                                        value={expenseForm.payerId}
                                        onChange={handleExpenseChange}
                                        className="h-10 w-full rounded-md border border-white/10 bg-ink-800/80 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-purple/60"
                                    >
                                        {memberOptions.length === 0 && (
                                            <option value="">No members</option>
                                        )}
                                        {memberOptions.map((member) => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Description"
                                    name="description"
                                    placeholder="Electricity bill"
                                    value={expenseForm.description}
                                    onChange={handleExpenseChange}
                                    className="md:col-span-2 bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                                />
                                <Button
                                    type="submit"
                                    className="md:col-span-2 bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90"
                                    isLoading={submittingExpense}
                                >
                                    Add Expense
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Add Members</h2>
                                    <p className="text-sm text-slate-400">
                                        Invite existing users by email.
                                    </p>
                                </div>
                                <Users className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <form className="space-y-4" onSubmit={handleAddMember}>
                                <Input
                                    label="User Email"
                                    name="memberEmail"
                                    type="email"
                                    placeholder="member@example.com"
                                    value={memberEmail}
                                    onChange={(event) => setMemberEmail(event.target.value)}
                                    className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                                />
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-full border-white/10 bg-ink-800/70 text-slate-200 hover:bg-ink-800"
                                    isLoading={addingMember}
                                >
                                    Add Member
                                </Button>
                            </form>
                            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Members</p>
                                <div className="mt-3 space-y-2">
                                    {memberOptions.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between text-sm text-slate-200">
                                            <span>{member.name}</span>
                                            <span className="text-xs text-slate-400">{member.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <h2 className="text-xl font-semibold text-white">Expenses</h2>
                            <p className="text-sm text-slate-400">
                                All expenses created for this group.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                            {expenses.length === 0 && (
                                <p className="text-sm text-slate-400">No expenses yet.</p>
                            )}
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{expense.description}</p>
                                        <p className="text-xs text-slate-400">
                                            Paid by {memberOptions.find((member) => member.userId === expense.payerId)?.name || 'Member'}
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

                    <Card className="glass-panel text-slate-100">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Balances</h2>
                                    <p className="text-sm text-slate-400">
                                        Amount owed by and to each member.
                                    </p>
                                </div>
                                <BadgeDollarSign className="h-5 w-5 text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                            {balances.length === 0 && (
                                <p className="text-sm text-slate-400">No balances yet.</p>
                            )}
                            {balances.map((balance) => (
                                <div key={balance.userId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-800/60 p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{balance.name}</p>
                                        <p className="text-xs text-slate-400">
                                            Owes {formatCurrency(balance.owedByUser)} · Owed {formatCurrency(balance.owedToUser)}
                                        </p>
                                    </div>
                                    <p className={`text-sm font-semibold ${balance.netBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {formatCurrency(balance.netBalance)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
