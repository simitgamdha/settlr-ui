import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';

const { registerMock, navigateMock, toastSuccess } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  navigateMock: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: registerMock,
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

describe('Register page', () => {
  beforeEach(() => {
    registerMock.mockReset();
    navigateMock.mockReset();
    toastSuccess.mockReset();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('submits registration and navigates on success', async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('Ada', 'ada@example.com', 'secret123');
    });
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    expect(toastSuccess).toHaveBeenCalled();
  });
});
