import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: true,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
            toast.success('Welcome back!');
        } catch (error) {
            setErrors({ root: error?.message || 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="p-8 shadow-xl glass-panel text-slate-100">
                <CardHeader className="pb-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
                        <p className="text-slate-400">
                            Log in to keep your shared expenses in sync
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-400">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-white/10 bg-ink-800 text-accent-pink focus:ring-accent-pink"
                                />
                                Remember me
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-accent-pink hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        {errors.root && (
                            <p className="text-sm text-rose-400 text-center">{errors.root}</p>
                        )}
                        <Button type="submit" className="w-full bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90" isLoading={isLoading}>
                            Sign In
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            New here?{' '}
                            <Link to="/register" className="text-accent-pink font-semibold hover:underline">
                                Create an account
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
