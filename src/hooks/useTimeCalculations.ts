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

    const checkpointsWithUpdatedIntervals = validatedCheckpoints.map((checkpoint, index, array) => {
      if (index <= 1) return checkpoint;

      const prevCheckpoint = array[index - 1];
      const calculatedInterval = Number((checkpoint.distance - prevCheckpoint.distance).toFixed(2));

      return {
        ...checkpoint,
        interval: calculatedInterval > 0 ? calculatedInterval : checkpoint.interval
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