import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { PackageInput } from './PackageInput';

describe('PackageInput', () => {
  it('renders two input fields by default', () => {
    render(<PackageInput onCompare={() => {}} />);

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    expect(inputs).toHaveLength(2);
  });

  it('shows compare button', () => {
    render(<PackageInput onCompare={() => {}} />);

    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
  });

  it('can add a third package', () => {
    render(<PackageInput onCompare={() => {}} />);

    const addButton = screen.getByRole('button', { name: /\+ add package/i });
    fireEvent.click(addButton);

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    expect(inputs).toHaveLength(3);
  });

  it('can add packages up to maximum of 6', () => {
    render(<PackageInput onCompare={() => {}} />);

    const addButton = screen.getByRole('button', { name: /\+ add package/i });

    // Add 4 more packages (starting with 2)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(addButton);
    }

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    expect(inputs).toHaveLength(6);

    // Should not be able to add a 7th
    expect(addButton).not.toBeInTheDocument();
  });

  it('can remove packages down to minimum of 2', () => {
    render(<PackageInput onCompare={() => {}} />);

    // First add a third package
    const addButton = screen.getByRole('button', { name: /\+ add package/i });
    fireEvent.click(addButton);

    // Now remove it
    const removeButtons = screen.getAllByRole('button', { name: '' }); // IconX buttons
    fireEvent.click(removeButtons[0]);

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    expect(inputs).toHaveLength(2);
  });

  it('disables compare button with less than 2 valid packages', () => {
    render(<PackageInput onCompare={() => {}} />);

    const compareButton = screen.getByRole('button', { name: /compare/i });
    expect(compareButton).toBeDisabled();
  });

  it('enables compare button with 2 valid packages', () => {
    render(<PackageInput onCompare={() => {}} />);

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    const compareButton = screen.getByRole('button', { name: /compare/i });

    fireEvent.change(inputs[0], { target: { value: 'react' } });
    fireEvent.change(inputs[1], { target: { value: 'preact' } });

    expect(compareButton).toBeEnabled();
  });

  it('shows error for duplicate package names', () => {
    render(<PackageInput onCompare={() => {}} />);

    const inputs = screen.getAllByPlaceholderText('e.g., react');

    fireEvent.change(inputs[0], { target: { value: 'react' } });
    fireEvent.change(inputs[1], { target: { value: 'react' } });

    expect(screen.getByText(/please enter unique package names/i)).toBeInTheDocument();
  });

  it('calls onCompare with array of package names', () => {
    const handleCompare = () => {};
    const mockCompare = vi.fn(handleCompare);

    render(<PackageInput onCompare={mockCompare} />);

    const inputs = screen.getAllByPlaceholderText('e.g., react');
    const compareButton = screen.getByRole('button', { name: /compare/i });

    fireEvent.change(inputs[0], { target: { value: 'react' } });
    fireEvent.change(inputs[1], { target: { value: 'preact' } });
    fireEvent.click(compareButton);

    expect(mockCompare).toHaveBeenCalledWith(['react', 'preact']);
  });
});
