import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button', () => {
  it('renders children and applies variants', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-white');
  });

  it('shows a loader and disables when loading', () => {
    const { container } = render(
      <Button isLoading>Saving</Button>
    );
    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });
});
