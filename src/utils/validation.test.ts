import { validateConnection } from './validation';
import type { Rect, ConnectionPoint } from '../types';

describe('validateConnection', () => {
  const testRect: Rect = {
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 }
  };

  test('should validate correct connection', () => {
    const validPoint: ConnectionPoint = {
      point: { x: 125, y: 100 },
      angle: 0
    };
    
    expect(() => validateConnection(testRect, validPoint)).not.toThrow();
  });

  test('should throw for point not on border', () => {
    const invalidPoint: ConnectionPoint = {
      point: { x: 110, y: 110 },
      angle: 0
    };
    
    expect(() => validateConnection(testRect, invalidPoint))
      .toThrow("Точка соединения не находится на границе прямоугольника");
  });

  test('should throw for invalid angle', () => {
    const invalidAngle: ConnectionPoint = {
      point: { x: 125, y: 100 },
      angle: 90
    };
    
    expect(() => validateConnection(testRect, invalidAngle))
      .toThrow("Угол соединения не перпендикулярен грани или не направлен наружу");
  });
});