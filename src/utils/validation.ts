import type { Rect, ConnectionPoint } from '../types';
import { isPointOnRectBorder, isAngleValidForPoint } from './geometry';

export function validateConnection(rect: Rect, cPoint: ConnectionPoint): void {
  if (!isPointOnRectBorder(cPoint.point, rect)) {
    throw new Error('Точка соединения не находится на границе прямоугольника');
  }
  if (!isAngleValidForPoint(cPoint.point, rect, cPoint.angle)) {
    throw new Error('Угол соединения не перпендикулярен грани или не направлен наружу');
  }
}