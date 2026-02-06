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
    const [error, setError] = useState('');

    const loadGroupData = async () => {
        setLoading(true);
        setError('');
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
            setError(err?.message || 'Unable to load group data.');
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
            setError('Amount, description, and payer are required.');
            return;
        }

        setSubmittingExpense(true);
        setError('');
        try {
            await apiClient.post('/api/expenses', {
                groupId: group.id,
                payerId: expenseForm.payerId,
                amount: Number(expenseForm.amount),
                description: expenseForm.description.trim(),
            });
            setExpenseForm({ amount: '', description: '', payerId: expenseForm.payerId });
            await loadGroupData();
        } catch (err) {
            setError(err?.message || 'Failed to add expense.');
        } finally {
            setSubmittingExpense(false);
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();
        if (!group) return;
        if (!memberEmail.trim()) {
            setError('Member email is required.');
            return;
        }

        setAddingMember(true);
        setError('');
        try {
            const lookup = await apiClient.get(`/api/users/lookup?email=${encodeURIComponent(memberEmail.trim())}`);
            await apiClient.post(`/api/groups/${group.id}/members`, {
                userIds: [lookup.id],
            });
            setMemberEmail('');
            await loadGroupData();
        } catch (err) {
            setError(err?.message || 'Failed to add member.');
        } finally {
            setAddingMember(false);
        }
    };

    const memberOptions = useMemo(() => group?.members || [], [group]);

    if (loading) {
        return (
            <AppLayout>
                <div className="text-sm text-gray-500">Loading group...</div>
            </AppLayout>
        );
    }

    if (!group) {
        return (
            <AppLayout>
                <div className="text-sm text-gray-500">Group not found.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Group</p>
                        <h1 className="text-3xl font-semibold text-gray-900 font-display">
                            {group.name}
                        </h1>
                        <p className="text-gray-500 mt-2">Created {formatDate(group.createdAt)}</p>
                    </div>
                    <Button variant="secondary">Settle Up</Button>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
                                    <p className="text-sm text-gray-500">
                                        Expenses are split equally among all group members.
                                    </p>
                                </div>
                                <ReceiptText className="h-5 w-5 text-gray-400" />
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
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Payer</label>
                                    <select
                                        name="payerId"
                                        value={expenseForm.payerId}
                                        onChange={handleExpenseChange}
                                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
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
                                    className="md:col-span-2"
                                />
                                <Button type="submit" className="md:col-span-2" isLoading={submittingExpense}>
                                    Add Expense
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Add Members</h2>
                                    <p className="text-sm text-gray-500">
                                        Invite existing users by email.
                                    </p>
                                </div>
                                <Users className="h-5 w-5 text-gray-400" />
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
                                />
                                <Button type="submit" variant="secondary" className="w-full" isLoading={addingMember}>
                                    Add Member
                                </Button>
                            </form>
                            <div className="rounded-2xl border border-gray-100 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Members</p>
                                <div className="mt-3 space-y-2">
                                    {memberOptions.map((member) => (
                                        <div key={member.userId} className="flex items-center justify-between text-sm text-gray-700">
                                            <span>{member.name}</span>
                                            <span className="text-xs text-gray-400">{member.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
                            <p className="text-sm text-gray-500">
                                All expenses created for this group.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                            {expenses.length === 0 && (
                                <p className="text-sm text-gray-500">No expenses yet.</p>
                            )}
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{expense.description}</p>
                                        <p className="text-xs text-gray-500">
                                            Paid by {memberOptions.find((member) => member.userId === expense.payerId)?.name || 'Member'}
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

                    <Card className="border-gray-100/60 shadow-sm">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Balances</h2>
                                    <p className="text-sm text-gray-500">
                                        Amount owed by and to each member.
                                    </p>
                                </div>
                                <BadgeDollarSign className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                            {balances.length === 0 && (
                                <p className="text-sm text-gray-500">No balances yet.</p>
                            )}
                            {balances.map((balance) => (
                                <div key={balance.userId} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{balance.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Owes {formatCurrency(balance.owedByUser)} · Owed {formatCurrency(balance.owedToUser)}
                                        </p>
                                    </div>
                                    <p className={`text-sm font-semibold ${balance.netBalance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
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
