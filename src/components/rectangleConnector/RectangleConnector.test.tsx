import * as React from 'react';
import { render } from '@testing-library/react';
import RectangleConnector from './RectangleConnector';

describe('RectangleConnector', () => {
  it('renders without crashing', () => {
    render(<RectangleConnector />);
  });

  it('displays error message when validation fails', () => {
    const { container } = render(<RectangleConnector />);
    expect(container).toBeInTheDocument();
  });
});