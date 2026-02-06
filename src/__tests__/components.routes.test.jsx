import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';

const useAuthMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

describe('Route guards', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('renders loading state', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected routes', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/login');
  });

  it('renders children for authenticated users', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('redirects authenticated users from public routes', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(
      <PublicRoute>
        <div>Login</div>
      </PublicRoute>
    );
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/dashboard');
  });
});
