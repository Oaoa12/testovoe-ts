import { render } from '@testing-library/react';
import CanvasRenderer from './CanvasRenderer';
import type { Rect, ConnectionPoint, Point } from '../../types';

describe('CanvasRenderer', () => {
  const mockRect: Rect = {
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 }
  };

  const mockCPoint: ConnectionPoint = {
    point: { x: 125, y: 100 },
    angle: 0
  };

  const mockPath: Point[] = [
    { x: 125, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 150 },
    { x: 275, y: 150 }
  ];

  it('renders without crashing', () => {
    render(
      <CanvasRenderer
        rect1={mockRect}
        rect2={mockRect}
        cPoint1={mockCPoint}
        cPoint2={mockCPoint}
        connectionPath={mockPath}
        onRect1Move={jest.fn()}
        onRect2Move={jest.fn()}
        onConnectionPoint1Change={jest.fn()}
        onConnectionPoint2Change={jest.fn()}
      />
    );
  });
});