import type { Point, Rect, ConnectionPoint } from "../types";
import { angleToVector, calculateRectBorder, getRectBordersWithMargin } from "./geometry";

const CONNECTION_MARGIN = 15;
const MIN_DISTANCE_BETWEEN_RECTS = 10;

export function dataConverter(
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] {
  if (checkRectanglesOverlap(rect1, rect2)) {
    throw new Error("Прямоугольники пересекаются или находятся слишком близко");
  }

  const dir1 = angleToVector(cPoint1.angle);
  const dir2 = angleToVector(cPoint2.angle);

  const rect1Borders = getRectBordersWithMargin(rect1, CONNECTION_MARGIN);
  const rect2Borders = getRectBordersWithMargin(rect2, CONNECTION_MARGIN);

  const start = {
    x: cPoint1.point.x + dir1.x * CONNECTION_MARGIN,
    y: cPoint1.point.y + dir1.y * CONNECTION_MARGIN
  };
  
  const end = {
    x: cPoint2.point.x + dir2.x * CONNECTION_MARGIN,
    y: cPoint2.point.y + dir2.y * CONNECTION_MARGIN
  };

  const isHorizontalPreferred = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

  const path = buildOptimalPath(start, end, rect1Borders, rect2Borders, isHorizontalPreferred);

  return optimizePath([cPoint1.point, ...path, cPoint2.point]);
}

function buildOptimalPath(
  start: Point,
  end: Point,
  rect1Borders: ReturnType<typeof calculateRectBorder>,
  rect2Borders: ReturnType<typeof calculateRectBorder>,
  isHorizontalPreferred: boolean
): Point[] {
  const midPoints: Point[] = [];

  if (isHorizontalPreferred) {
    const midY = (start.y + end.y) / 2;
    midPoints.push({ x: start.x, y: midY });
    midPoints.push({ x: end.x, y: midY });
  } else {
    const midX = (start.x + end.x) / 2;
    midPoints.push({ x: midX, y: start.y });
    midPoints.push({ x: midX, y: end.y });
  }

  if (!doesPathIntersectRects([start, ...midPoints, end], rect1Borders, rect2Borders)) {
    return midPoints;
  }

  const alternative1 = [
    { x: start.x, y: end.y },
    { x: end.x, y: start.y }
  ];

  for (const point of alternative1) {
    if (!doesPathIntersectRects([start, point, end], rect1Borders, rect2Borders)) {
      return [point];
    }
  }

  return buildBypassPath(start, end, rect1Borders, rect2Borders);
}

function buildBypassPath(
  start: Point,
  end: Point,
  rect1Borders: ReturnType<typeof calculateRectBorder>,
  rect2Borders: ReturnType<typeof calculateRectBorder>
): Point[] {
  const shouldGoAbove = start.y < rect1Borders.top && end.y < rect2Borders.top;
  const shouldGoLeft = start.x < rect1Borders.left && end.x < rect2Borders.left;

  if (shouldGoAbove) {
    const y = Math.min(rect1Borders.top, rect2Borders.top) - CONNECTION_MARGIN;
    return [
      { x: start.x, y },
      { x: end.x, y }
    ];
  } else if (shouldGoLeft) {
    const x = Math.min(rect1Borders.left, rect2Borders.left) - CONNECTION_MARGIN;
    return [
      { x, y: start.y },
      { x, y: end.y }
    ];
  } else {
    const x = Math.max(rect1Borders.right, rect2Borders.right) + CONNECTION_MARGIN;
    return [
      { x, y: start.y },
      { x, y: end.y }
    ];
  }
}

function doesPathIntersectRects(
  path: Point[],
  rect1Borders: ReturnType<typeof calculateRectBorder>,
  rect2Borders: ReturnType<typeof calculateRectBorder>
): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    
    if (doesSegmentIntersectRect(a, b, rect1Borders)) return true;
    if (doesSegmentIntersectRect(a, b, rect2Borders)) return true;
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
  const ccw = (A: Point, B: Point, C: Point) => 
    (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  
  return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && 
         ccw(a1, a2, b1) !== ccw(a1, a2, b2);
}

function optimizePath(points: Point[]): Point[] {
  if (points.length < 3) return points;

  const optimized = [points[0]];
  let prevDir = getDirection(points[0], points[1]);

  for (let i = 1; i < points.length - 1; i++) {
    const currDir = getDirection(points[i], points[i + 1]);
    if (currDir !== prevDir) {
      optimized.push(points[i]);
      prevDir = currDir;
    }
  }

  optimized.push(points[points.length - 1]);
  return optimized;
}

function getDirection(a: Point, b: Point): 'h' | 'v' {
  return Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 'h' : 'v';
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