import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import {
    LayoutGrid,
    Users,
    ReceiptText,
    CircleDollarSign,
    LogOut,
    UserCircle2,
    BellDot,
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
        <div className="h-screen app-bg text-slate-100 overflow-hidden">
            <div className="flex h-full">
                <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-white/10 bg-ink-900/90 backdrop-blur-md sticky top-0 h-full">
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink text-white grid place-items-center shadow-lg">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Settlr</p>
                                <p className="text-lg font-semibold text-white">Expense Hub</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                                                ? 'bg-gradient-to-r from-accent-purple/70 to-accent-pink/70 text-white shadow-sm'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
                        <div className="rounded-2xl bg-gradient-to-br from-accent-purple/80 to-accent-blue/80 text-white p-4 space-y-3 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                Net Balance
                            </p>
                            <p className="text-3xl font-semibold">{formatCurrency(netBalance)}</p>
                            <p className="text-xs text-white/70">
                                {netBalance >= 0 ? 'You are owed more than you owe.' : 'You owe more than you are owed.'}
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col h-full">
                    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-white/10 bg-ink-900/80 px-4 py-4 backdrop-blur-md md:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 md:hidden">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink text-white grid place-items-center">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Settlr</p>
                                    <p className="text-sm font-semibold text-white">Expense Hub</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 md:ml-auto">
                                <button className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-ink-800/70 border border-white/10 text-slate-300 hover:text-white">
                                    <BellDot className="h-5 w-5" />
                                </button>
                                <Link to="/expenses">
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90"
                                    >
                                        New Expense
                                    </Button>
                                </Link>
                                <div className="hidden sm:flex items-center gap-3">
                                    <Link to="/profile" className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/70 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20 transition-colors">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-pink text-xs font-semibold grid place-items-center text-white">
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    </Link>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="border-white/10 bg-ink-800/70 text-slate-200 hover:bg-ink-800"
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
                        </div>
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
                                                    ? 'bg-gradient-to-r from-accent-purple/80 to-accent-pink/80 text-white'
                                                    : 'bg-ink-800/70 text-slate-300'
                                            )
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                            <Link
                                to="/profile"
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-ink-800/70 text-slate-300"
                            >
                                <UserCircle2 className="h-4 w-4" />
                                Profile
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
