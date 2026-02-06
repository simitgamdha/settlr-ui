import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Expenses from '../pages/Expenses';

const { apiGetMock } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
}));

vi.mock('../services/api', () => ({
  apiClient: {
    get: apiGetMock,
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Ada', email: 'ada@example.com' },
    logout: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Expenses page', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
  });

  it('renders empty state', async () => {
    apiGetMock.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Expenses />
      </MemoryRouter>
    );

    expect(await screen.findByText('No groups yet. Create one to add expenses.')).toBeInTheDocument();
  });

  it('renders groups list', async () => {
    apiGetMock.mockResolvedValue([
      { id: 'g1', name: 'Trip', members: [], createdAt: new Date().toISOString() },
    ]);

    render(
      <MemoryRouter>
        <Expenses />
      </MemoryRouter>
    );

    expect(await screen.findByText('Trip')).toBeInTheDocument();
  });
});
