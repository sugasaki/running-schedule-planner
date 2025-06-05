import { useMemo } from 'react';
import type { Checkpoint, CheckpointWithTimes } from '../types';
import { formatDate, formatTime } from '../utils/timeUtils';

export const useTimeCalculations = (startDateTime: string, checkpoints: Checkpoint[]): CheckpointWithTimes[] => {
  return useMemo(() => {
    const validatedCheckpoints = [...checkpoints];

    for (let i = 1; i < validatedCheckpoints.length; i++) {
      const current = validatedCheckpoints[i];
      const prev = validatedCheckpoints[i-1];

      if (i <= 1) {
        current.hasError = false;
        continue;
      }

      if (current.distance < prev.distance) {
        current.hasError = true;
      } else {
        current.hasError = false;
      }
    }

    // 距離順でソートしてから間隔を計算
    const sortedCheckpoints = [...validatedCheckpoints].sort((a, b) => a.distance - b.distance);
    
    const checkpointsWithUpdatedIntervals = validatedCheckpoints.map(checkpoint => {
      // IDが0または1の場合は間隔計算をスキップ（集合・スタート地点）
      if (checkpoint.id <= 1) return checkpoint;

      // ソート済み配列から現在のチェックポイントの位置を見つける
      const sortedIndex = sortedCheckpoints.findIndex(cp => cp.id === checkpoint.id);
      
      if (sortedIndex <= 0) return checkpoint;
      
      const prevCheckpoint = sortedCheckpoints[sortedIndex - 1];
      const calculatedInterval = Number((checkpoint.distance - prevCheckpoint.distance).toFixed(2));

      return {
        ...checkpoint,
        interval: calculatedInterval
      };
    });

    const startTime = new Date(startDateTime);
    let currentTime = new Date(startTime);

    return checkpointsWithUpdatedIntervals.map((checkpoint) => {
      if (checkpoint.id === 0) {
        return {
          ...checkpoint,
          date: formatDate(currentTime),
          arrivalTime: formatTime(currentTime),
          departureTime: checkpoint.restTime > 0
            ? formatTime(new Date(currentTime.getTime() + checkpoint.restTime * 60000))
            : '',
        };
      }

      if (!checkpoint.hasError && checkpoint.interval > 0 && checkpoint.pace > 0) {
        currentTime = new Date(currentTime.getTime() + checkpoint.interval * checkpoint.pace * 60000);
      }

      const date = formatDate(currentTime);
      const arrivalTime = formatTime(currentTime);

      if (checkpoint.restTime > 0) {
        currentTime = new Date(currentTime.getTime() + checkpoint.restTime * 60000);
      }

      return {
        ...checkpoint,
        date,
        arrivalTime,
        departureTime: checkpoint.restTime > 0 ? formatTime(currentTime) : '',
      };
    });
  }, [startDateTime, checkpoints]);
};