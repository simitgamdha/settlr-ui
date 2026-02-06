import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';

const { loginMock, navigateMock, toastSuccess } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  navigateMock: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: vi.fn(),
  },
}));

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset();
    navigateMock.mockReset();
    toastSuccess.mockReset();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('submits login and navigates on success', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('ada@example.com', 'secret123');
    });
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    expect(toastSuccess).toHaveBeenCalled();
  });
});
