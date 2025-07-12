import type { Point, Rect, ConnectionPoint } from "../types";
import { angleToVector, calculateRectBorder } from "./geometry";

export function dataConverter(
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
): Point[] {
  // 1. Проверяем, не пересекаются ли прямоугольники
  if (checkRectanglesOverlap(rect1, rect2)) {
    throw new Error("Прямоугольники пересекаются или находятся слишком близко");
  }

  // 2. Получаем направления из углов соединения
  const dir1 = angleToVector(cPoint1.angle);
  const dir2 = angleToVector(cPoint2.angle);

  // 3. Определяем базовые точки
  const start = cPoint1.point;
  const end = cPoint2.point;

  // 4. Строим путь с минимальным количеством поворотов
  const path = buildOptimalPath(start, end, dir1, dir2, rect1, rect2);

  // 5. Оптимизируем путь (удаляем лишние точки)
  return optimizePath(path);
}

// Проверка пересечения прямоугольников
function checkRectanglesOverlap(rect1: Rect, rect2: Rect): boolean {
  const r1 = calculateRectBorder(rect1);
  const r2 = calculateRectBorder(rect2);
  
  return !(
    r1.right < r2.left || 
    r1.left > r2.right || 
    r1.bottom < r2.top || 
    r1.top > r2.bottom
  );
}

// Построение оптимального пути
function buildOptimalPath(
  start: Point,
  end: Point,
  dir1: Point,
  dir2: Point,
  rect1: Rect,
  rect2: Rect
): Point[] {
  const path: Point[] = [start];
  const buffer = 20; // Отступ от прямоугольников

  // Первый сегмент от начальной точки
  const firstSegment = {
    x: start.x + dir1.x * buffer,
    y: start.y + dir1.y * buffer
  };
  path.push(firstSegment);

  // Определяем основной направление соединения
  const isHorizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

  // Промежуточные точки
  if (isHorizontal) {
    const midY = (firstSegment.y + end.y) / 2;
    path.push({ x: firstSegment.x, y: midY });
    path.push({ x: end.x, y: midY });
  } else {
    const midX = (firstSegment.x + end.x) / 2;
    path.push({ x: midX, y: firstSegment.y });
    path.push({ x: midX, y: end.y });
  }

  // Последний сегмент к конечной точке
  const lastSegment = {
    x: end.x + dir2.x * buffer,
    y: end.y + dir2.y * buffer
  };
  path.push(lastSegment);
  path.push(end);

  return path;
}

// Оптимизация пути (удаление коллинеарных точек)
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

// Определение направления между точками
function getDirection(a: Point, b: Point): 'h' | 'v' {
  return Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 'h' : 'v';
}