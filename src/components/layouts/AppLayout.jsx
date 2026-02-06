import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import {
    LayoutGrid,
    Users,
    ReceiptText,
    CircleDollarSign,
    LogOut,
    Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { formatCurrency } from '../../utils/format';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/groups', label: 'Groups', icon: Users },
    { to: '/expenses', label: 'Expenses', icon: ReceiptText },
];

export function AppLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const loadSummary = async () => {
            try {
                const data = await apiClient.get('/api/dashboard/summary');
                setSummary(data);
            } catch {
                setSummary(null);
            }
        };

        loadSummary();
    }, []);

    const netBalance = summary
        ? (summary.totalOwedToUser ?? 0) - (summary.totalOwedByUser ?? 0)
        : 0;

    return (
        <div className="min-h-screen bg-background text-gray-900">
            <div className="flex">
                <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-gray-200 bg-white/90 backdrop-blur-md">
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-brand-dark text-white grid place-items-center shadow-lg">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Settlr</p>
                                <p className="text-lg font-semibold text-gray-900">Expense Hub</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                                            isActive
                                                ? 'bg-brand-dark text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        )
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="px-6 pb-6 pt-4">
                        <div className="rounded-2xl bg-gradient-to-br from-brand-dark to-indigo-900 text-white p-4 space-y-3 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">
                                Net Balance
                            </p>
                            <p className="text-3xl font-semibold">{formatCurrency(netBalance)}</p>
                            <p className="text-xs text-indigo-200">
                                {netBalance >= 0 ? 'You are owed more than you owe.' : 'You owe more than you are owed.'}
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="flex-1">
                    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-md md:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 md:hidden">
                                <div className="h-10 w-10 rounded-2xl bg-brand-dark text-white grid place-items-center">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Settlr</p>
                                    <p className="text-sm font-semibold text-gray-900">Expense Hub</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
                                <Bell className="h-4 w-4" />
                                <span>2 pending settles</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to="/groups/1">
                                    <Button size="sm">New Expense</Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                        {user && (
                            <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                                    {user.name}
                                </span>
                                <span>{user.email}</span>
                            </div>
                        )}
                        <div className="flex md:hidden gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                                                isActive
                                                    ? 'bg-brand-dark text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            )
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </header>

                    <main className="px-4 py-6 md:px-8 lg:px-12">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
