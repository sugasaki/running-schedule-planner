import type { Checkpoint } from '../types';
import { formatDate, formatTime } from './timeUtils';

/**
 * 前のチェックポイントとの距離差から間隔を計算
 */
export const calculateInterval = (currentCheckpoint: Checkpoint, previousCheckpoint: Checkpoint | null): number => {
  if (!previousCheckpoint || currentCheckpoint.id <= 1) {
    return 0;
  }
  return Math.max(0, Number((currentCheckpoint.distance - previousCheckpoint.distance).toFixed(2)));
};

/**
 * 距離エラーをチェック（前のチェックポイントより距離が小さい場合）
 */
export const hasDistanceError = (currentCheckpoint: Checkpoint, previousCheckpoint: Checkpoint | null): boolean => {
  if (!previousCheckpoint || currentCheckpoint.id <= 1) {
    return false;
  }
  return currentCheckpoint.distance < previousCheckpoint.distance;
};

/**
 * 移動時間を計算（分単位）
 */
export const calculateTravelTime = (interval: number, pace: number): number => {
  if (interval <= 0 || pace <= 0) {
    return 0;
  }
  return interval * pace;
};

/**
 * 時刻に時間を加算
 */
export const addMinutesToTime = (baseTime: Date, minutes: number): Date => {
  return new Date(baseTime.getTime() + minutes * 60000);
};

/**
 * チェックポイントの到着時刻と出発時刻を計算
 */
export const calculateCheckpointTimes = (
  currentTime: Date,
  checkpoint: Checkpoint,
  interval: number,
  hasError: boolean
): { arrivalTime: Date; departureTime: Date; date: string; arrivalTimeStr: string; departureTimeStr: string } => {
  // スタート地点の場合
  if (checkpoint.id === 0) {
    const departureTime = addMinutesToTime(currentTime, checkpoint.restTime);
    return {
      arrivalTime: currentTime,
      departureTime,
      date: formatDate(currentTime),
      arrivalTimeStr: formatTime(currentTime),
      departureTimeStr: checkpoint.restTime > 0 ? formatTime(departureTime) : '',
    };
  }

  // エラーがある場合は時間を進めない
  if (hasError) {
    return {
      arrivalTime: currentTime,
      departureTime: currentTime,
      date: formatDate(currentTime),
      arrivalTimeStr: formatTime(currentTime),
      departureTimeStr: checkpoint.restTime > 0 ? formatTime(currentTime) : '',
    };
  }

  // 移動時間を計算して到着時刻を求める
  const travelTime = calculateTravelTime(interval, checkpoint.pace);
  const arrivalTime = addMinutesToTime(currentTime, travelTime);
  const departureTime = addMinutesToTime(arrivalTime, checkpoint.restTime);

  return {
    arrivalTime,
    departureTime,
    date: formatDate(arrivalTime),
    arrivalTimeStr: formatTime(arrivalTime),
    departureTimeStr: checkpoint.restTime > 0 ? formatTime(departureTime) : '',
  };
};