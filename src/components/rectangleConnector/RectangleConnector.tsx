import React, { useState, useMemo } from 'react';
import CanvasRenderer from '../canvasRenderer/CanvasRenderer';
import { dataConverter } from '../../utils/connectionCalculator';
import { validateConnection } from '../../utils/validation';
import type { Rect, ConnectionPoint, Point, Size } from '../../types';

const RectangleConnector: React.FC = () => {
  const [rect1, setRect1] = useState<Rect>({
    position: { x: 200, y: 200 },
    size: { width: 100, height: 80 }
  });

  const [rect2, setRect2] = useState<Rect>({
    position: { x: 500, y: 300 },
    size: { width: 120, height: 60 }
  });

  const [cPoint1, setCPoint1] = useState<ConnectionPoint>({
    point: { x: 250, y: 200 },
    angle: 0
  });

  const [cPoint2, setCPoint2] = useState<ConnectionPoint>({
    point: { x: 500, y: 270 },
    angle: 270
  });

  const [error, setError] = useState<string | null>(null);

  const connectionPath = useMemo(() => {
    try {
      validateConnection(rect1, cPoint1);
      validateConnection(rect2, cPoint2);
      setError(null);
      return dataConverter(rect1, rect2, cPoint1, cPoint2);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return [];
    }
  }, [rect1, rect2, cPoint1, cPoint2]);

  const handleRect1Move = (position: Point) => {
    setRect1(prev => ({ ...prev, position }));
    setCPoint1(prev => ({
      ...prev,
      point: calculateConnectionPointOnRect(position, rect1.size, prev.point, rect1.position)
    }));
  };

  const handleRect2Move = (position: Point) => {
    setRect2(prev => ({ ...prev, position }));
    setCPoint2(prev => ({
      ...prev,
      point: calculateConnectionPointOnRect(position, rect2.size, prev.point, rect2.position)
    }));
  };

  const calculateConnectionPointOnRect = (
    newPosition: Point,
    size: Size,
    oldPoint: Point,
    oldPosition: Point
  ): Point => {
    const dx = newPosition.x - oldPosition.x;
    const dy = newPosition.y - oldPosition.y;
    return { x: oldPoint.x + dx, y: oldPoint.y + dy };
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>Ошибка: {error}</div>}
      <CanvasRenderer
        rect1={rect1}
        rect2={rect2}
        cPoint1={cPoint1}
        cPoint2={cPoint2}
        connectionPath={connectionPath}
        onRect1Move={handleRect1Move}
        onRect2Move={handleRect2Move}
        onConnectionPoint1Change={setCPoint1}
        onConnectionPoint2Change={setCPoint2}
      />
      <div style={{ marginTop: '20px' }}>
        <h3>Прямоугольник 1</h3>
        <div>Позиция: X: {rect1.position.x.toFixed(0)}, Y: {rect1.position.y.toFixed(0)}</div>
        <div>Размер: Ширина: {rect1.size.width}, Высота: {rect1.size.height}</div>
        
        <h3>Прямоугольник 2</h3>
        <div>Позиция: X: {rect2.position.x.toFixed(0)}, Y: {rect2.position.y.toFixed(0)}</div>
        <div>Размер: Ширина: {rect2.size.width}, Высота: {rect2.size.height}</div>
      </div>
    </div>
  );
};

export default RectangleConnector;