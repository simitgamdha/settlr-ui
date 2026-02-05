import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { apiClient } from '../services/api';

export default function Register() {
    const navigate = useNavigate();
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

        // Name: Only letters, no digits, no spaces, no special chars
        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (!/^[A-Za-z]+$/.test(formData.name)) {
            newErrors.name = 'Name must contain only letters (no spaces, numbers, or special characters)';
        }

        // Email: Standard email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password: Complex validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters long';
            } else if (!/[A-Z]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one uppercase letter';
            } else if (!/[a-z]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one lowercase letter';
            } else if (!/[0-9]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one number';
            } else if (!/[!@#$%^&*]/.test(formData.password)) {
                newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // await apiClient.post('/auth/register', formData);
            console.log('Registered:', formData);
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            setErrors({ root: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="p-8 shadow-xl border-gray-100/50 backdrop-blur-sm bg-white/95">
                <CardHeader className="pb-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Get Started</h1>
                        <p className="text-gray-500">
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
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />
                        {errors.root && (
                            <p className="text-sm text-red-500 text-center">{errors.root}</p>
                        )}
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign Up
                        </Button>
                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-brand-dark font-semibold hover:underline">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
