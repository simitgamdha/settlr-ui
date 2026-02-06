import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../pages/Profile';

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
  }),
}));

describe('Profile page', () => {
  it('renders user details', async () => {
    apiGetMock.mockResolvedValue({ totalOwedByUser: 0, totalOwedToUser: 0 });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenCalled();
    });

    expect(screen.getAllByText('Ada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ada@example.com').length).toBeGreaterThan(0);
  });
});
