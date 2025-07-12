import {
    angleToVector,
    calculateRectBorder,
    isPointOnRectBorder,
    isAngleValidForPoint,
    normalizeAngle
  } from './geometry';
  import type { Rect, Point } from '../types';
  
  describe('geometry utilities', () => {
    const testRect: Rect = {
      position: { x: 100, y: 100 },
      size: { width: 50, height: 50 }
    };
  
    describe('calculateRectBorder', () => {
      it('should calculate correct rectangle borders', () => {
        const border = calculateRectBorder(testRect);
        expect(border).toEqual({
          left: 75,
          right: 125,
          top: 75,
          bottom: 125
        });
      });
    });
  
    describe('angleToVector', () => {
      it('should convert 0 degrees to right vector', () => {
        expect(angleToVector(0)).toEqual({ x: 1, y: 0 });
      });
  
      it('should convert 90 degrees to up vector', () => {
        const result = angleToVector(90);
        expect(result.y).toBe(1);
        expect(result.x).toBeCloseTo(0, 15); // Исправлено для работы с float
      });
    });
  
    describe('isPointOnRectBorder', () => {
      it('should detect point on left border', () => {
        expect(isPointOnRectBorder({ x: 75, y: 100 }, testRect)).toBe(true);
      });
  
      it('should detect point on top border', () => {
        expect(isPointOnRectBorder({ x: 100, y: 75 }, testRect)).toBe(true);
      });
  
      it('should reject point inside rectangle', () => {
        expect(isPointOnRectBorder({ x: 90, y: 90 }, testRect)).toBe(false);
      });
    });
  
    describe('isAngleValidForPoint', () => {
      it('should validate angle for left border', () => {
        expect(isAngleValidForPoint({ x: 75, y: 100 }, testRect, 180)).toBe(true);
      });
  
      it('should validate angle for right border', () => {
        expect(isAngleValidForPoint({ x: 125, y: 100 }, testRect, 0)).toBe(true);
      });
  
      it('should reject invalid angle', () => {
        expect(isAngleValidForPoint({ x: 75, y: 100 }, testRect, 90)).toBe(false);
      });
    });
  
    describe('normalizeAngle', () => {
      it('should normalize negative angles', () => {
        expect(normalizeAngle(-90)).toBe(270);
      });
  
      it('should normalize angles over 360', () => {
        expect(normalizeAngle(450)).toBe(90);
      });
    });
  });