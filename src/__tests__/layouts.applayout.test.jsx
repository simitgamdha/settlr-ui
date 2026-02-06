import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '../components/layouts/AppLayout';

const { navigateMock, logoutMock, apiGetMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  logoutMock: vi.fn(),
  apiGetMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Ada', email: 'ada@example.com' },
    logout: logoutMock,
  }),
}));

vi.mock('../services/api', () => ({
  apiClient: {
    get: apiGetMock,
  },
}));

describe('AppLayout', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    navigateMock.mockReset();
    logoutMock.mockReset();
  });

  it('renders children and summary', async () => {
    apiGetMock.mockResolvedValue({ totalOwedToUser: 200, totalOwedByUser: 50 });

    render(
      <MemoryRouter>
        <AppLayout>
          <div>Child content</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.getByText('Net Balance')).toBeInTheDocument();
  });

  it('signs out and navigates to login', async () => {
    apiGetMock.mockResolvedValue({ totalOwedToUser: 0, totalOwedByUser: 0 });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AppLayout>
          <div>Child content</div>
        </AppLayout>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
