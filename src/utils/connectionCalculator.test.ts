import { dataConverter } from './connectionCalculator';
import type { Rect, ConnectionPoint, Point } from '../types';

describe('dataConverter', () => {
  const rect1: Rect = {
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 }
  };

  const rect2: Rect = {
    position: { x: 300, y: 100 },
    size: { width: 50, height: 50 }
  };

  const cPoint1: ConnectionPoint = {
    point: { x: 125, y: 100 },
    angle: 0
  };

  const cPoint2: ConnectionPoint = {
    point: { x: 275, y: 100 },
    angle: 180
  };

  test('should create path between two rectangles', () => {
    const path = dataConverter(rect1, rect2, cPoint1, cPoint2);
    expect(path.length).toBeGreaterThanOrEqual(3);
    expect(path[0]).toEqual(cPoint1.point);
    expect(path[path.length - 1]).toEqual(cPoint2.point);
  });

  test('should throw when rectangles overlap', () => {
    const overlappingRect: Rect = {
      position: { x: 110, y: 100 },
      size: { width: 50, height: 50 }
    };
    
    expect(() => dataConverter(rect1, overlappingRect, cPoint1, cPoint2))
      .toThrow("Прямоугольники пересекаются или находятся слишком близко");
  });

  test('should create path with minimal turns', () => {
    const path = dataConverter(rect1, rect2, cPoint1, cPoint2);
    let directionChanges = 0;
    
    for (let i = 1; i < path.length - 1; i++) {
      const prevSegment = getSegmentDirection(path[i-1], path[i]);
      const nextSegment = getSegmentDirection(path[i], path[i+1]);
      if (prevSegment !== nextSegment) directionChanges++;
    }
    
    expect(directionChanges).toBeLessThanOrEqual(2);
  });
});

function getSegmentDirection(a: {x: number, y: number}, b: {x: number, y: number}): 'h' | 'v' {
  return Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 'h' : 'v';
}