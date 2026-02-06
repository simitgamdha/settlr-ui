import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setSubmitted(true);
    };

    return (
        <AuthLayout>
            <Card className="p-8 shadow-xl glass-panel text-slate-100">
                <CardHeader className="pb-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
                        <p className="text-slate-400">
                            We will email you a secure link to reset your password
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-slate-300">
                                Password reset is not available yet. Contact the administrator to regain access for
                                <span className="font-semibold text-white"> {email}</span>.
                            </p>
                            <Link to="/login" className="text-sm font-medium text-accent-pink hover:underline">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={error}
                                className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                            />
                            <Button type="submit" className="w-full bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90">
                                Send Reset Link
                            </Button>
                            <div className="text-center text-sm text-slate-400">
                                Remembered your password?{' '}
                                <Link to="/login" className="text-accent-pink font-semibold hover:underline">
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
