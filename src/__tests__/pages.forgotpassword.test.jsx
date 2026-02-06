import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';

describe('ForgotPassword page', () => {
  it('validates email input', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await screen.findByText('Please enter a valid email address');
  });

  it('shows confirmation after valid submit', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(screen.getByText(/Password reset is not available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();
  });
});
