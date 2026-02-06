import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Groups from '../pages/Groups';

const { apiGetMock, apiPostMock, toastError, toastSuccess } = vi.hoisted(() => ({
  apiGetMock: vi.fn(),
  apiPostMock: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../services/api', () => ({
  apiClient: {
    get: apiGetMock,
    post: apiPostMock,
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
    error: toastError,
    success: toastSuccess,
  },
}));

describe('Groups page', () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it('renders empty state', async () => {
    apiGetMock.mockImplementation((endpoint) => {
      if (endpoint === '/api/dashboard/summary') {
        return Promise.resolve({ totalOwedByUser: 0, totalOwedToUser: 0 });
      }
      if (endpoint === '/api/groups') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter>
        <Groups />
      </MemoryRouter>
    );

    expect(await screen.findByText('No groups yet. Create one to get started.')).toBeInTheDocument();
  });

  it('creates a group and reloads list', async () => {
    const user = userEvent.setup();
    let hasCreated = false;
    const createdGroup = {
      id: 'g1',
      name: 'Weekend',
      members: [],
      createdAt: new Date().toISOString(),
      createdByUserId: 'u1',
    };

    apiGetMock.mockImplementation((endpoint) => {
      if (endpoint === '/api/dashboard/summary') {
        return Promise.resolve({ totalOwedByUser: 0, totalOwedToUser: 0 });
      }
      if (endpoint === '/api/groups') {
        return Promise.resolve(hasCreated ? [createdGroup] : []);
      }
      return Promise.resolve([]);
    });

    apiPostMock.mockImplementation(() => {
      hasCreated = true;
      return Promise.resolve({});
    });

    render(
      <MemoryRouter>
        <Groups />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Group Name'), 'Weekend');
    await user.click(screen.getByRole('button', { name: /create group/i }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/api/groups', { name: 'Weekend' });
    });

    await waitFor(() => {
      expect(screen.getAllByText('Weekend').length).toBeGreaterThan(0);
    });
  });
});
