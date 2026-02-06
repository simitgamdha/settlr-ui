import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GroupDetails from '../pages/GroupDetails';

const { apiGetMock, apiPostMock, toastError } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPostMock: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../services/api', () => ({
  apiClient: {
    get: apiGetMock,
    post: apiPostMock,
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

describe('GroupDetails page', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    toastError.mockReset();
  });

  it('renders group details', async () => {
    const group = {
      id: 'g1',
      name: 'Trip',
      createdAt: new Date().toISOString(),
      members: [{ userId: 'u1', name: 'Ada', email: 'ada@example.com' }],
    };

    apiGetMock.mockImplementation((endpoint) => {
      if (endpoint === '/api/groups') return Promise.resolve([group]);
      if (endpoint === '/api/groups/g1/balances') return Promise.resolve([]);
      if (endpoint === '/api/groups/g1/expenses') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter initialEntries={['/groups/g1']}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Trip')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add Members' })).toBeInTheDocument();
  });

  it('validates expense form before submit', async () => {
    const user = userEvent.setup();
    const group = {
      id: 'g1',
      name: 'Trip',
      createdAt: new Date().toISOString(),
      members: [{ userId: 'u1', name: 'Ada', email: 'ada@example.com' }],
    };

    apiGetMock.mockImplementation((endpoint) => {
      if (endpoint === '/api/groups') return Promise.resolve([group]);
      if (endpoint === '/api/groups/g1/balances') return Promise.resolve([]);
      if (endpoint === '/api/groups/g1/expenses') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter initialEntries={['/groups/g1']}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Add Expense' });

    await user.click(screen.getByRole('button', { name: /add expense/i }));
    expect(toastError).toHaveBeenCalledWith('Amount, description, and payer are required.');
  });
});
