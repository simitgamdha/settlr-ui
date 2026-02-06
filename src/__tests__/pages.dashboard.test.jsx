import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

const { apiGetMock, toastError } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../services/api', () => ({
  apiClient: {
    get: apiGetMock,
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Ada' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: toastError,
    success: vi.fn(),
  },
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    toastError.mockReset();
  });

  it('renders dashboard data', async () => {
    const summary = { totalOwedByUser: 10, totalOwedToUser: 50 };
    const groups = [{ id: 'g1', name: 'Trip', members: [{ userId: 'u1', name: 'Ada' }] }];
    const balances = [{ userId: 'u1', netBalance: 40 }];
    const expenses = [
      { id: 'e1', amount: 25, description: 'Hotel', createdAt: new Date().toISOString() },
    ];

    apiGetMock.mockImplementation((endpoint) => {
      if (endpoint === '/api/dashboard/summary') return Promise.resolve(summary);
      if (endpoint === '/api/groups') return Promise.resolve(groups);
      if (endpoint === '/api/groups/g1/balances') return Promise.resolve(balances);
      if (endpoint === '/api/groups/g1/expenses') return Promise.resolve(expenses);
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalledWith('/api/groups/g1/expenses');
    });

    const tripItems = await screen.findAllByText('Trip');
    expect(tripItems.length).toBeGreaterThan(0);
    expect(await screen.findByText('Hotel')).toBeInTheDocument();
  });
});
