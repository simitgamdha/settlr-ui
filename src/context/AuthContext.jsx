import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, authStorage } from '../services/api';

const AuthContext = createContext(null);

const isTokenValid = (expiresAt) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    return Number.isFinite(expiry.getTime()) && expiry > new Date();
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = authStorage.getToken();
        const storedExpires = authStorage.getExpiresAt();
        const storedUser = authStorage.getUser();

        if (storedToken && isTokenValid(storedExpires)) {
            setToken(storedToken);
            setExpiresAt(storedExpires);
            setUser(storedUser);
        } else {
            authStorage.clear();
        }
        setIsLoading(false);
    }, []);

    const setSession = (authResponse) => {
        authStorage.setAuth({
            token: authResponse.token,
            expiresAt: authResponse.expiresAt,
            user: authResponse.user,
        });
        setToken(authResponse.token);
        setExpiresAt(authResponse.expiresAt);
        setUser(authResponse.user);
    };

    const login = async (email, password) => {
        const data = await apiClient.post('/api/auth/login', { email, password });
        setSession(data);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await apiClient.post('/api/auth/register', { name, email, password });
        setSession(data);
        return data;
    };

    const logout = () => {
        authStorage.clear();
        setToken(null);
        setExpiresAt(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            expiresAt,
            isLoading,
            isAuthenticated: Boolean(token) && isTokenValid(expiresAt),
            login,
            register,
            logout,
        }),
        [user, token, expiresAt, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
