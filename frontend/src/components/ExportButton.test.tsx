import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

describe('ExportButton Component - US5', () => {
  it('renders export button', () => {
    render(<ExportButton />);
    
    expect(screen.getByText(/Exporter/)).toBeInTheDocument();
  });

  it('opens export menu on click', () => {
    render(<ExportButton />);
    
    const button = screen.getByText(/Exporter/);
    fireEvent.click(button);
    
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('calls onExport with csv format', () => {
    const mockExport = vi.fn();
    render(<ExportButton onExport={mockExport} />);
    
    fireEvent.click(screen.getByText(/Exporter/));
    fireEvent.click(screen.getByText('CSV'));
    
    expect(mockExport).toHaveBeenCalledWith('csv');
  });

  it('calls onExport with pdf format', () => {
    const mockExport = vi.fn();
    render(<ExportButton onExport={mockExport} />);
    
    fireEvent.click(screen.getByText(/Exporter/));
    fireEvent.click(screen.getByText('PDF'));
    
    expect(mockExport).toHaveBeenCalledWith('pdf');
  });

  it('calls onExport with json format', () => {
    const mockExport = vi.fn();
    render(<ExportButton onExport={mockExport} />);
    
    fireEvent.click(screen.getByText(/Exporter/));
    fireEvent.click(screen.getByText('JSON'));
    
    expect(mockExport).toHaveBeenCalledWith('json');
  });

  it('closes menu after selection', () => {
    const mockExport = vi.fn();
    render(<ExportButton onExport={mockExport} />);
    
    fireEvent.click(screen.getByText(/Exporter/));
    fireEvent.click(screen.getByText('CSV'));
    
    // Menu should be closed
    expect(screen.queryByText('PDF')).not.toBeInTheDocument();
  });
});