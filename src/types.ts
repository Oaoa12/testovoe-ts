export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  position: Point;
  size: Size;
}

export interface ConnectionPoint {
  point: Point;
  angle: number;
}