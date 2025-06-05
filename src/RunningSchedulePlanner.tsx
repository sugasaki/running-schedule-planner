import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import type { Checkpoint } from './types';
import type { RunningScheduleConfig } from './types/config';
import { useTimeCalculations } from './hooks/useTimeCalculations';
import { calculateTotalTime } from './utils/timeUtils';
import HandsontableSchedule from './components/HandsontableSchedule';
import { ConfigSelector } from './components/ConfigSelector';
import { ConfigManager } from './services/ConfigManager';

const RunningSchedulePlanner = () => {
  const [currentConfig, setCurrentConfig] = useState<RunningScheduleConfig>({
    id: 'default',
    name: 'デフォルト設定',
    description: '',
    startDateTime: '2025-06-07T08:30',
    checkpoints: [
      { id: 0, name: '新しいチェックポイント', type: '集合', distance: 0, pace: 0, interval: 0, restTime: 0 },
    ]
  });

  const [startDateTime, setStartDateTime] = useState(currentConfig.startDateTime);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(currentConfig.checkpoints);
  const [isInitialized, setIsInitialized] = useState(false);

  // ConfigManagerの初期化とデフォルト設定の読み込み
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        await ConfigManager.initialize();
        const defaultPreset = await ConfigManager.getPresetById('tokyo-street-run-2025') ||
          await ConfigManager.getPresetById('default-fallback');
        if (defaultPreset?.config) {
          setCurrentConfig(defaultPreset.config);
        }
        setIsInitialized(true);
      } catch (error) {
        console.warn('設定の初期化に失敗しました:', error);
        setIsInitialized(true);
      }
    };
    initializeConfig();
  }, []);

  // 設定が変更されたときにstateを更新
  useEffect(() => {
    setStartDateTime(currentConfig.startDateTime);
    setCheckpoints(currentConfig.checkpoints);
  }, [currentConfig.id]); // idが変わった時のみ更新（プリセット切り替え時）

  // checkpointsまたはstartDateTimeが変更されたときにcurrentConfigを更新
  // ただし、プリセット読み込み中は更新しない
  useEffect(() => {
    if (isInitialized && currentConfig.id) {
      // プリセットのデータと現在のstateが異なる場合のみ更新
      const currentCheckpointsStr = JSON.stringify(checkpoints.map(cp => ({
        id: cp.id, name: cp.name, type: cp.type, distance: cp.distance,
        pace: cp.pace, interval: cp.interval, restTime: cp.restTime
      })));
      const configCheckpointsStr = JSON.stringify(currentConfig.checkpoints);

      if (currentCheckpointsStr !== configCheckpointsStr || startDateTime !== currentConfig.startDateTime) {
        setCurrentConfig(prevConfig => ({
          ...prevConfig,
          startDateTime,
          checkpoints: checkpoints.map(cp => ({
            id: cp.id,
            name: cp.name,
            type: cp.type,
            distance: cp.distance,
            pace: cp.pace,
            interval: cp.interval,
            restTime: cp.restTime
          }))
        }));
      }
    }
  }, [checkpoints, startDateTime, isInitialized]);

  const handleConfigChange = (newConfig: RunningScheduleConfig) => {
    setCurrentConfig(newConfig);
  };

  const calculateTimes = useTimeCalculations(startDateTime, checkpoints);

  // 初期化中の場合はローディング表示
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>設定を読み込み中...</span>
        </div>
      </div>
    );
  }


  const addCheckpoint = () => {
    const newId = Math.max(...checkpoints.map(cp => cp.id)) + 1;
    setCheckpoints(prev => [...prev, {
      id: newId,
      name: '新しいチェックポイント',
      type: '' as const,
      distance: 0,
      pace: 10,
      interval: 0,
      restTime: 5,
    }]);
  };

  const handleCheckpointChange = (id: number, field: string, value: string | number) => {
    setCheckpoints(prev => {
      const updatedCheckpoints = prev.map(cp =>
        cp.id === id
          ? {
            ...cp,
            [field]: ['distance', 'pace', 'interval', 'restTime'].includes(field)
              ? Number(value)
              : value,
          }
          : cp
      );

      const changedIndex = updatedCheckpoints.findIndex(cp => cp.id === id);

      if (field === 'distance') {
        if (changedIndex > 1 && changedIndex < updatedCheckpoints.length - 1) {
          const nextCheckpoint = updatedCheckpoints[changedIndex + 1];
          if (nextCheckpoint) {
            const newInterval = Number((nextCheckpoint.distance - Number(value)).toFixed(2));
            if (newInterval > 0) {
              updatedCheckpoints[changedIndex + 1] = {
                ...nextCheckpoint,
                interval: newInterval
              };
            }
          }
        }
      }

      // ペース変更時または休憩時間変更時は、該当行から最終行までの時間計算を強制的に再実行
      // useTimeCalculationsフックが自動的に再計算するため、ここでは変更を記録するだけ
      if (field === 'pace' || field === 'restTime') {
        // 時間計算は useTimeCalculations フックで自動的に再実行される
        // changedIndexから最終行までが影響を受ける
        console.log(`${field}が変更されました。行${changedIndex}から最終行まで再計算されます。`);
      }

      return updatedCheckpoints;
    });
  };


  return (
    <div className="max-w-7xl mx-auto p-4 relative">
      <div className="mb-6 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Play className="w-6 h-6" />
            {currentConfig.name}
          </h1>
          <ConfigSelector
            currentConfig={currentConfig}
            onConfigChange={handleConfigChange}
          />
        </div>

        {currentConfig.description && (
          <p className="text-gray-600 mb-4">{currentConfig.description}</p>
        )}

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スタート日時
          </label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => {
              setStartDateTime(e.target.value);
            }}
            className="w-48"
          />
        </div>
      </div>

      <div className="relative z-10">
        <HandsontableSchedule
          checkpoints={calculateTimes}
          onCheckpointChange={handleCheckpointChange}
          onAddCheckpoint={addCheckpoint}
        />
      </div>


      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">使い方：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• スタート日時を設定してください（日付をまたぐ長時間イベントにも対応）</li>
            <li>• 各チェックポイントの距離、ペース、間隔、休憩時間を個別に設定できます</li>
            <li>• 到着・出発時刻は自動計算されます（月/日 時:分 形式で表示）</li>
            <li>• 集合時間、スタート時間、ゴール時間を区別して管理できます</li>
            <li>• 休憩時間0分の場合は出発時刻が表示されません</li>
            <li>• 行を右クリックして行の追加・削除ができます</li>
            <li>• 行番号をドラッグして行の順序を変更できます（集合・スタート行は移動不可）</li>
            <li>• 列ヘッダーをドラッグして列の順序を変更できます（No列は移動不可）</li>
            <li>• 列の境界をドラッグして列幅を調整できます</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">計算例：</h3>
          <p className="text-sm text-amber-700">
            総距離: {checkpoints[checkpoints.length - 3]?.distance || 0}km |
            推定総時間: {(() => {
              const lastCheckpoint = calculateTimes[calculateTimes.length - 3];
              if (lastCheckpoint && lastCheckpoint.date && lastCheckpoint.arrivalTime) {
                return calculateTotalTime(startDateTime, {
                  date: lastCheckpoint.date,
                  arrivalTime: lastCheckpoint.arrivalTime
                });
              }
              return '計算中...';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RunningSchedulePlanner;