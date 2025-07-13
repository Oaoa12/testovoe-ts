import type { Rect, ConnectionPoint } from "../types";
import { isPointOnRectBorder, isAngleValidForPoint, snapPointToBorder } from "./geometry";

export function validateConnection(rect: Rect, cPoint: ConnectionPoint): void {
  const snappedPoint = snapPointToBorder(cPoint.point, rect);
  
  if (!isPointOnRectBorder(snappedPoint, rect)) {
    throw new Error("Точка соединения не находится на границе прямоугольника");
  }

  if (!isAngleValidForPoint(snappedPoint, rect, cPoint.angle)) {
    throw new Error("Угол соединения не перпендикулярен грани или не направлен наружу");
  }
}