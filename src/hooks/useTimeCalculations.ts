import { useMemo } from 'react';
import type { Checkpoint, CheckpointWithTimes } from '../types';
import { 
  hasDistanceError, 
  calculateCheckpointTimes 
} from '../utils/timeCalculations';

export const useTimeCalculations = (startDateTime: string, checkpoints: Checkpoint[]): CheckpointWithTimes[] => {
  return useMemo(() => {
    const startTime = new Date(startDateTime);
    let currentTime = new Date(startTime);
    
    // 見た目の順序で上から順番に時刻計算
    return checkpoints.map((checkpoint, index) => {
      const previousCheckpoint = index > 0 ? checkpoints[index - 1] : null;
      
      // checkpointsには既に計算済みのintervalが含まれているのでそれを使用
      const interval = checkpoint.interval;
      
      // 距離エラーをチェック
      const hasError = hasDistanceError(checkpoint, previousCheckpoint);
      
      // 時刻を計算
      const timeResult = calculateCheckpointTimes(currentTime, checkpoint, interval, hasError);
      
      // 次の計算のために現在時刻を更新
      currentTime = timeResult.departureTime;
      
      return {
        ...checkpoint,
        interval,
        hasError,
        date: timeResult.date,
        arrivalTime: timeResult.arrivalTimeStr,
        departureTime: timeResult.departureTimeStr,
      };
    });
  }, [startDateTime, checkpoints]);
};