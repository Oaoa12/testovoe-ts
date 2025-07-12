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

// Добавляем недостающую функцию
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

export function isPointOnRectBorder(
  point: Point,
  rect: Rect,
  epsilon = 0.1
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
  epsilon = 5
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

  const angleDiff = Math.abs(normalizeAngle(angle) - normalizeAngle(expectedAngle));
  return angleDiff < epsilon || angleDiff > 360 - epsilon;
}