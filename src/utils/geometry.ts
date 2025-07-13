import type { Point, Rect } from "../types";

export function angleToVector(angle: number): Point {
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad),
    y: Math.sin(rad)
  };
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function calculateRectBorder(rect: Rect): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  return {
    left: rect.position.x - rect.size.width / 2,
    right: rect.position.x + rect.size.width / 2,
    top: rect.position.y - rect.size.height / 2,
    bottom: rect.position.y + rect.size.height / 2
  };
}

export function getRectBordersWithMargin(rect: Rect, margin: number) {
  const borders = calculateRectBorder(rect);
  return {
    left: borders.left - margin,
    right: borders.right + margin,
    top: borders.top - margin,
    bottom: borders.bottom + margin
  };
}

export function isPointOnRectBorder(
  point: Point,
  rect: Rect,
  epsilon = 0.5
): boolean {
  const { left, right, top, bottom } = calculateRectBorder(rect);

  const onVertical =
    (Math.abs(point.x - left) < epsilon || Math.abs(point.x - right) < epsilon) &&
    point.y >= top - epsilon &&
    point.y <= bottom + epsilon;

  const onHorizontal =
    (Math.abs(point.y - top) < epsilon || Math.abs(point.y - bottom) < epsilon) &&
    point.x >= left - epsilon &&
    point.x <= right + epsilon;

  return onVertical || onHorizontal;
}

export function isAngleValidForPoint(
  point: Point,
  rect: Rect,
  angle: number,
  epsilon = 1 
): boolean {
  const { left, right, top, bottom } = calculateRectBorder(rect);
  let expectedAngle = 0;
  
  if (Math.abs(point.x - left) < epsilon) {
    expectedAngle = 180;
  } else if (Math.abs(point.x - right) < epsilon) {
    expectedAngle = 0;
  } else if (Math.abs(point.y - top) < epsilon) {
    expectedAngle = 270;
  } else if (Math.abs(point.y - bottom) < epsilon) {
    expectedAngle = 90;
  }

  const normalizedAngle = normalizeAngle(angle);
  const angleDiff = Math.abs(normalizedAngle - expectedAngle);
  
  return angleDiff < epsilon || angleDiff > 360 - epsilon;
}

export function snapPointToBorder(point: Point, rect: Rect): Point {
  const { left, right, top, bottom } = calculateRectBorder(rect);
  const epsilon = 5;
  
  if (Math.abs(point.x - left) < epsilon) return { ...point, x: left };
  if (Math.abs(point.x - right) < epsilon) return { ...point, x: right };
  if (Math.abs(point.y - top) < epsilon) return { ...point, y: top };
  if (Math.abs(point.y - bottom) < epsilon) return { ...point, y: bottom };
  
  return point;
}