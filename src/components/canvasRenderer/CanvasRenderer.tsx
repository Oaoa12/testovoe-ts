import React, { useEffect, useRef } from 'react';
import type { Rect, ConnectionPoint, Point } from '../../types';

interface CanvasRendererProps {
  rect1: Rect;
  rect2: Rect;
  cPoint1: ConnectionPoint;
  cPoint2: ConnectionPoint;
  connectionPath: Point[];
  onRect1Move: (position: Point) => void;
  onRect2Move: (position: Point) => void;
  onConnectionPoint1Change: (point: ConnectionPoint) => void;
  onConnectionPoint2Change: (point: ConnectionPoint) => void;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  rect1,
  rect2,
  cPoint1,
  cPoint2,
  connectionPath,
  onRect1Move,
  onRect2Move,
  onConnectionPoint1Change,
  onConnectionPoint2Change,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef<'rect1' | 'rect2' | 'cPoint1' | 'cPoint2' | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(ctx, rect1);
    drawRect(ctx, rect2);
    drawConnectionPoint(ctx, cPoint1, '#FF5722');
    drawConnectionPoint(ctx, cPoint2, '#FF5722');
    drawConnectionPath(ctx, connectionPath);
  }, [rect1, rect2, cPoint1, cPoint2, connectionPath]);

  const drawRect = (ctx: CanvasRenderingContext2D, rect: Rect) => {
    ctx.fillStyle = '#2196F3';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    const x = rect.position.x - rect.size.width / 2;
    const y = rect.position.y - rect.size.height / 2;
    
    ctx.beginPath();
    ctx.rect(x, y, rect.size.width, rect.size.height);
    ctx.fill();
    ctx.stroke();
  };

  const drawConnectionPoint = (ctx: CanvasRenderingContext2D, cPoint: ConnectionPoint, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cPoint.point.x, cPoint.point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    const endX = cPoint.point.x + Math.cos(cPoint.angle * Math.PI / 180) * 15;
    const endY = cPoint.point.y + Math.sin(cPoint.angle * Math.PI / 180) * 15;
    
    ctx.beginPath();
    ctx.moveTo(cPoint.point.x, cPoint.point.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawConnectionPath = (ctx: CanvasRenderingContext2D, path: Point[]) => {
    if (path.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPointInRect(mouseX, mouseY, rect1)) {
      isDragging.current = 'rect1';
      dragOffset.current = {
        x: mouseX - rect1.position.x,
        y: mouseY - rect1.position.y
      };
      return;
    }

    if (isPointInRect(mouseX, mouseY, rect2)) {
      isDragging.current = 'rect2';
      dragOffset.current = {
        x: mouseX - rect2.position.x,
        y: mouseY - rect2.position.y
      };
      return;
    }

    if (distance(mouseX, mouseY, cPoint1.point.x, cPoint1.point.y) < 10) {
      isDragging.current = 'cPoint1';
      return;
    }

    if (distance(mouseX, mouseY, cPoint2.point.x, cPoint2.point.y) < 10) {
      isDragging.current = 'cPoint2';
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    switch (isDragging.current) {
      case 'rect1':
        onRect1Move({
          x: mouseX - dragOffset.current.x,
          y: mouseY - dragOffset.current.y
        });
        break;
      case 'rect2':
        onRect2Move({
          x: mouseX - dragOffset.current.x,
          y: mouseY - dragOffset.current.y
        });
        break;
      case 'cPoint1':
        onConnectionPoint1Change({
          point: { x: mouseX, y: mouseY },
          angle: cPoint1.angle
        });
        break;
      case 'cPoint2':
        onConnectionPoint2Change({
          point: { x: mouseX, y: mouseY },
          angle: cPoint2.angle
        });
        break;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = null;
  };

  const isPointInRect = (x: number, y: number, rect: Rect): boolean => {
    return (
      x >= rect.position.x - rect.size.width / 2 &&
      x <= rect.position.x + rect.size.width / 2 &&
      y >= rect.position.y - rect.size.height / 2 &&
      y <= rect.position.y + rect.size.height / 2
    );
  };

  const distance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default CanvasRenderer;