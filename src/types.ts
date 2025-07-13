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
  
  export interface RectangleData {
    rect: Rect;
    connection: ConnectionPoint;
    color: string;
  }
  
  export interface CanvasState {
    rect1: RectangleData;
    rect2: RectangleData;
  }