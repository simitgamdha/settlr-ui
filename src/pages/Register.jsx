import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Name: Required and within limits
        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 150) {
            newErrors.name = 'Name must be 150 characters or fewer';
        }

        // Email: Standard email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password: Minimum length
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
            await register(formData.name, formData.email, formData.password);
            navigate('/dashboard');
            toast.success('Account created successfully.');
        } catch (error) {
            setErrors({ root: error?.message || 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="p-8 shadow-xl glass-panel text-slate-100">
                <CardHeader className="pb-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Get Started</h1>
                        <p className="text-slate-400">
                            Create your account to start sharing expenses
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            className="bg-ink-800/80 border-white/10 text-slate-100 placeholder:text-slate-500 focus:ring-accent-purple/60"
                        />
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
                        {errors.root && (
                            <p className="text-sm text-rose-400 text-center">{errors.root}</p>
                        )}
                        <Button type="submit" className="w-full bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:opacity-90" isLoading={isLoading}>
                            Sign Up
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-accent-pink font-semibold hover:underline">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
