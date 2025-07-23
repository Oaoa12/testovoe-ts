import type { Point, Rect, ConnectionPoint } from '../types';
import { angleToVector, calculateRectBorder, getRectBordersWithMargin } from './geometry';

const CONNECTION_MARGIN = 10;
const MIN_DISTANCE_BETWEEN_RECTS = 5;

export function dataConverter(rect1: Rect, rect2: Rect, cPoint1: ConnectionPoint, cPoint2: ConnectionPoint): Point[] {
  if (checkRectanglesOverlap(rect1, rect2)) {
    throw new Error('Прямоугольники пересекаются или находятся слишком близко');
  }

  const dir1 = angleToVector(cPoint1.angle);
  const dir2 = angleToVector(cPoint2.angle);

  const start = {
    x: cPoint1.point.x + dir1.x * CONNECTION_MARGIN,
    y: cPoint1.point.y + dir1.y * CONNECTION_MARGIN,
  };

  const end = {
    x: cPoint2.point.x + dir2.x * CONNECTION_MARGIN,
    y: cPoint2.point.y + dir2.y * CONNECTION_MARGIN,
  };

  const rect1Borders = getRectBordersWithMargin(rect1, CONNECTION_MARGIN);
  const rect2Borders = getRectBordersWithMargin(rect2, CONNECTION_MARGIN);

  const path = findOptimalPath(start, end, rect1Borders, rect2Borders);
  return path.length > 0 ? [cPoint1.point, ...path, cPoint2.point] : [];
}

function checkRectanglesOverlap(rect1: Rect, rect2: Rect): boolean {
  const r1 = calculateRectBorder(rect1);
  const r2 = calculateRectBorder(rect2);
  return !(
    r1.right + MIN_DISTANCE_BETWEEN_RECTS < r2.left ||
    r1.left - MIN_DISTANCE_BETWEEN_RECTS > r2.right ||
    r1.bottom + MIN_DISTANCE_BETWEEN_RECTS < r2.top ||
    r1.top - MIN_DISTANCE_BETWEEN_RECTS > r2.bottom
  );
}

function findOptimalPath(start: Point, end: Point, rect1Borders: ReturnType<typeof calculateRectBorder>, rect2Borders: ReturnType<typeof calculateRectBorder>): Point[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const paths: { points: Point[]; length: number; turns: number }[] = [];

  paths.push({
    points: [{ x: start.x, y: end.y }],
    length: Math.abs(dx) + Math.abs(dy),
    turns: dx !== 0 && dy !== 0 ? 1 : 0,
  });

  paths.push({
    points: [{ x: end.x, y: start.y }],
    length: Math.abs(dx) + Math.abs(dy),
    turns: dx !== 0 && dy !== 0 ? 1 : 0,
  });

  const midX = dx > 0 ? Math.max(start.x, end.x) + CONNECTION_MARGIN : Math.min(start.x, end.x) - CONNECTION_MARGIN;
  const midY = dy > 0 ? Math.max(start.y, end.y) + CONNECTION_MARGIN : Math.min(start.y, end.y) - CONNECTION_MARGIN;

  paths.push({
    points: [
      { x: midX, y: start.y },
      { x: midX, y: end.y },
    ],
    length: Math.abs(midX - start.x) + Math.abs(midX - end.x) + Math.abs(dy),
    turns: 2,
  });

  paths.push({
    points: [
      { x: start.x, y: midY },
      { x: end.x, y: midY },
    ],
    length: Math.abs(dx) + Math.abs(midY - start.y) + Math.abs(midY - end.y),
    turns: 2,
  });

  const validPaths = paths.filter((path) => !doesPathIntersectRects([start, ...path.points, end], rect1Borders, rect2Borders));

  if (validPaths.length === 0) {
    return buildComplexPath(start, end, rect1Borders, rect2Borders);
  }

  validPaths.sort((a, b) => (a.length !== b.length ? a.length - b.length : a.turns - b.turns));
  return validPaths[0].points;
}

function buildComplexPath(start: Point, end: Point, rect1Borders: ReturnType<typeof calculateRectBorder>, rect2Borders: ReturnType<typeof calculateRectBorder>): Point[] {
  const paths: { points: Point[]; length: number; turns: number }[] = [];

  const safeX = Math.max(rect1Borders.right, rect2Borders.right) + CONNECTION_MARGIN;
  const safeY = Math.max(rect1Borders.bottom, rect2Borders.bottom) + CONNECTION_MARGIN;
  const safeXMin = Math.min(rect1Borders.left, rect2Borders.left) - CONNECTION_MARGIN;
  const safeYMin = Math.min(rect1Borders.top, rect2Borders.top) - CONNECTION_MARGIN;

  paths.push({
    points: [
      { x: start.x, y: safeY },
      { x: end.x, y: safeY },
    ],
    length: Math.abs(end.x - start.x) + Math.abs(safeY - start.y) + Math.abs(safeY - end.y),
    turns: 2,
  });

  paths.push({
    points: [
      { x: safeX, y: start.y },
      { x: safeX, y: end.y },
    ],
    length: Math.abs(safeX - start.x) + Math.abs(safeX - end.x) + Math.abs(end.y - start.y),
    turns: 2,
  });

  paths.push({
    points: [
      { x: start.x, y: safeYMin },
      { x: end.x, y: safeYMin },
    ],
    length: Math.abs(end.x - start.x) + Math.abs(safeYMin - start.y) + Math.abs(safeYMin - end.y),
    turns: 2,
  });

  paths.push({
    points: [
      { x: safeXMin, y: start.y },
      { x: safeXMin, y: end.y },
    ],
    length: Math.abs(safeXMin - start.x) + Math.abs(safeXMin - end.x) + Math.abs(end.y - start.y),
    turns: 2,
  });

  const validPaths = paths.filter((path) => !doesPathIntersectRects([start, ...path.points, end], rect1Borders, rect2Borders));

  if (validPaths.length === 0) {
    return [];
  }

  validPaths.sort((a, b) => (a.length !== b.length ? a.length - b.length : a.turns - b.turns));
  return validPaths[0].points;
}

function doesPathIntersectRects(path: Point[], rect1Borders: ReturnType<typeof calculateRectBorder>, rect2Borders: ReturnType<typeof calculateRectBorder>): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if (doesSegmentIntersectRect(path[i], path[i + 1], rect1Borders) || doesSegmentIntersectRect(path[i], path[i + 1], rect2Borders)) {
      return true;
    }
  }
  return false;
}

function doesSegmentIntersectRect(a: Point, b: Point, rect: ReturnType<typeof calculateRectBorder>): boolean {
  return (
    lineIntersectsLine(a, b, { x: rect.left, y: rect.top }, { x: rect.right, y: rect.top }) ||
    lineIntersectsLine(a, b, { x: rect.right, y: rect.top }, { x: rect.right, y: rect.bottom }) ||
    lineIntersectsLine(a, b, { x: rect.right, y: rect.bottom }, { x: rect.left, y: rect.bottom }) ||
    lineIntersectsLine(a, b, { x: rect.left, y: rect.bottom }, { x: rect.left, y: rect.top })
  );
}

function lineIntersectsLine(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, a2, b2);
}