import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/ui/Input';

describe('Input', () => {
  it('renders label and error message', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
  });
});
