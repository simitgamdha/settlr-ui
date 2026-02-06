import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthLayout } from '../components/layouts/AuthLayout';

describe('AuthLayout', () => {
  it('renders children content', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Auth form</div>
        </AuthLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Auth form')).toBeInTheDocument();
    expect(screen.getByText(/Settle expenses without the friction/i)).toBeInTheDocument();
  });
});
