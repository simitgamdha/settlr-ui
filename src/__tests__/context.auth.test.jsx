import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

const { apiPostMock } = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return {
    ...actual,
    apiClient: {
      post: apiPostMock,
    },
  };
});

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(auth.isLoading)}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="user">{auth.user?.name || ''}</div>
      <button type="button" onClick={() => auth.login('a@example.com', 'secret')}>Login</button>
      <button type="button" onClick={() => auth.register('Ada', 'a@example.com', 'secret')}>Register</button>
      <button type="button" onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    apiPostMock.mockReset();
  });

  it('throws if useAuth is used outside provider', () => {
    const ConsoleError = console.error;
    console.error = () => {};

    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');

    console.error = ConsoleError;
  });

  it('hydrates from storage when token is valid', async () => {
    localStorage.setItem('settlr_token', 'token-123');
    localStorage.setItem('settlr_token_expires', new Date(Date.now() + 60000).toISOString());
    localStorage.setItem('settlr_user', JSON.stringify({ name: 'Ada' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('Ada');
  });

  it('logs in and updates auth state', async () => {
    apiPostMock.mockResolvedValue({
      token: 'token-abc',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      user: { name: 'Ada' },
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('Ada');
    expect(apiPostMock).toHaveBeenCalledWith('/api/auth/login', {
      email: 'a@example.com',
      password: 'secret',
    });
  });

  it('logs out and clears auth state', async () => {
    apiPostMock.mockResolvedValue({
      token: 'token-abc',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      user: { name: 'Ada' },
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });
});
