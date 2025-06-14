import { describe, it, expect } from 'vitest';
import type { Checkpoint } from '../../types';
import {
  calculateInterval,
  hasDistanceError,
  calculateTravelTime,
  addMinutesToTime,
  calculateCheckpointTimes,
} from '../timeCalculations';

describe('timeCalculations', () => {
  const createCheckpoint = (id: number, distance: number, pace: number = 5, restTime: number = 0): Checkpoint => ({
    id,
    name: `Checkpoint ${id}`,
    type: id === 0 ? '集合' : '',
    distance,
    pace,
    interval: 0,
    restTime,
  });

  describe('calculateInterval', () => {
    it('スタート地点（ID=0）の間隔は0', () => {
      const checkpoint = createCheckpoint(0, 0);
      const result = calculateInterval(checkpoint, null);
      expect(result).toBe(0);
    });

    it('ID=1の間隔は0', () => {
      const checkpoint = createCheckpoint(1, 5);
      const prev = createCheckpoint(0, 0);
      const result = calculateInterval(checkpoint, prev);
      expect(result).toBe(0);
    });

    it('正常な間隔計算', () => {
      const checkpoint = createCheckpoint(2, 10);
      const prev = createCheckpoint(1, 5);
      const result = calculateInterval(checkpoint, prev);
      expect(result).toBe(5);
    });

    it('距離差が負の場合は0', () => {
      const checkpoint = createCheckpoint(2, 3);
      const prev = createCheckpoint(1, 5);
      const result = calculateInterval(checkpoint, prev);
      expect(result).toBe(0);
    });

    it('小数点以下の計算', () => {
      const checkpoint = createCheckpoint(2, 10.75);
      const prev = createCheckpoint(1, 5.25);
      const result = calculateInterval(checkpoint, prev);
      expect(result).toBe(5.5);
    });
  });

  describe('hasDistanceError', () => {
    it('スタート地点はエラーなし', () => {
      const checkpoint = createCheckpoint(0, 0);
      const result = hasDistanceError(checkpoint, null);
      expect(result).toBe(false);
    });

    it('ID=1はエラーなし', () => {
      const checkpoint = createCheckpoint(1, 5);
      const prev = createCheckpoint(0, 0);
      const result = hasDistanceError(checkpoint, prev);
      expect(result).toBe(false);
    });

    it('距離が増加している場合はエラーなし', () => {
      const checkpoint = createCheckpoint(2, 10);
      const prev = createCheckpoint(1, 5);
      const result = hasDistanceError(checkpoint, prev);
      expect(result).toBe(false);
    });

    it('距離が減少している場合はエラー', () => {
      const checkpoint = createCheckpoint(2, 3);
      const prev = createCheckpoint(1, 5);
      const result = hasDistanceError(checkpoint, prev);
      expect(result).toBe(true);
    });
  });

  describe('calculateTravelTime', () => {
    it('正常な移動時間計算', () => {
      const result = calculateTravelTime(5, 6); // 5km, 6分/km
      expect(result).toBe(30); // 30分
    });

    it('間隔が0の場合は0', () => {
      const result = calculateTravelTime(0, 6);
      expect(result).toBe(0);
    });

    it('ペースが0の場合は0', () => {
      const result = calculateTravelTime(5, 0);
      expect(result).toBe(0);
    });

    it('負の値の場合は0', () => {
      const result = calculateTravelTime(-1, 6);
      expect(result).toBe(0);
    });
  });

  describe('addMinutesToTime', () => {
    it('時間に分を加算', () => {
      const baseTime = new Date('2025-06-07T08:30:00');
      const result = addMinutesToTime(baseTime, 30);
      expect(result.getTime()).toBe(new Date('2025-06-07T09:00:00').getTime());
    });

    it('0分加算', () => {
      const baseTime = new Date('2025-06-07T08:30:00');
      const result = addMinutesToTime(baseTime, 0);
      expect(result.getTime()).toBe(baseTime.getTime());
    });
  });

  describe('calculateCheckpointTimes', () => {
    const baseTime = new Date('2025-06-07T08:30:00');

    it('スタート地点の時刻計算', () => {
      const checkpoint = createCheckpoint(0, 0, 0, 10); // 10分休憩
      const result = calculateCheckpointTimes(baseTime, checkpoint, 0, false);
      
      expect(result.arrivalTimeStr).toBe('08:30');
      expect(result.departureTimeStr).toBe('08:40');
      expect(result.date).toBe('06/07');
    });

    it('通常のチェックポイント時刻計算', () => {
      const checkpoint = createCheckpoint(2, 10, 6, 5); // 6分/km, 5分休憩
      const result = calculateCheckpointTimes(baseTime, checkpoint, 5, false); // 5km間隔
      
      expect(result.arrivalTimeStr).toBe('09:00'); // 8:30 + 30分移動
      expect(result.departureTimeStr).toBe('09:05'); // 9:00 + 5分休憩
    });

    it('エラーがある場合は時間を進めない', () => {
      const checkpoint = createCheckpoint(2, 10, 6, 5);
      const result = calculateCheckpointTimes(baseTime, checkpoint, 5, true);
      
      expect(result.arrivalTimeStr).toBe('08:30');
      expect(result.departureTimeStr).toBe('08:30');
    });

    it('休憩時間が0の場合', () => {
      const checkpoint = createCheckpoint(2, 10, 6, 0);
      const result = calculateCheckpointTimes(baseTime, checkpoint, 5, false);
      
      expect(result.arrivalTimeStr).toBe('09:00');
      expect(result.departureTimeStr).toBe('');
    });
  });
});