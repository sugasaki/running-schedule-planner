import { useState } from 'react';
import { Play, MapPin } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Checkpoint, Column } from './types';
import { useTimeCalculations } from './hooks/useTimeCalculations';
import { calculateTotalTime } from './utils/timeUtils';
import ScheduleTable from './components/ScheduleTable';

const RunningSchedulePlanner = () => {
  const [startDateTime, setStartDateTime] = useState('2025-06-07T08:30');
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: '場所', width: '150px' },
    { id: 'type', label: '区分', width: '100px' },
    { id: 'distance', label: '距離\\n(km)', width: '100px' },
    { id: 'pace', label: 'ペース\\n(分/km)', width: '100px' },
    { id: 'interval', label: '間隔\\n(km)', width: '100px' },
    { id: 'restTime', label: '休憩\\n(分)', width: '100px' },
    { id: 'date', label: '日付', width: '100px' },
    { id: 'arrivalTime', label: '到着', width: '100px' },
    { id: 'departureTime', label: '出発', width: '100px' },
    { id: 'actions', label: '操作', width: '80px' },
  ]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    { id: 0, name: '御徒町', type: '集合', distance: 0, pace: 0, interval: 0, restTime: 0 },
    { id: 1, name: '御器所', type: 'スタート', distance: 0, pace: 0, interval: 0, restTime: 30 },
    { id: 2, name: 'そばよし', type: '', distance: 2.74, pace: 10, interval: 5, restTime: 20 },
    { id: 3, name: 'コンビニ', type: '', distance: 10, pace: 10, interval: 4.2, restTime: 10 },
    { id: 4, name: '北池袋の肉まん研究所', type: '', distance: 19.82, pace: 10, interval: 4.2, restTime: 10 },
    { id: 5, name: '巣鴨', type: '', distance: 22.13, pace: 10, interval: 0.6, restTime: 10 },
    { id: 6, name: '谷中銀座', type: '', distance: 25.59, pace: 10, interval: 0.2, restTime: 10 },
    { id: 7, name: '新吉原花園池跡 弁天観音', type: '', distance: 28.8, pace: 10, interval: 1.1, restTime: 10 },
    { id: 8, name: '浅草寺', type: '', distance: 30.26, pace: 10, interval: 1.1, restTime: 10 },
    { id: 9, name: '両国メンチ', type: '', distance: 32.83, pace: 10, interval: 1.55, restTime: 15 },
    { id: 10, name: '高輪ゲートウェイ', type: '', distance: 44.44, pace: 10, interval: 1.78, restTime: 10 },
    { id: 11, name: '目黒川', type: '', distance: 47.96, pace: 10, interval: 1.05, restTime: 10 },
    { id: 12, name: '祐天寺の稲毛屋天野屋', type: '', distance: 51.35, pace: 10, interval: 3.5, restTime: 15 },
    { id: 12, name: '武蔵小山の鳥勇', type: '', distance: 54.68, pace: 10, interval: 1.66, restTime: 15 },
    { id: 13, name: '自由が丘の腰塚のメンチ', type: '', distance: 59.24, pace: 10, interval: 3.63, restTime: 15 },
    { id: 14, name: '三茶のキャロットタワー', type: '', distance: 64.62, pace: 10, interval: 0, restTime: 20 },
    { id: 15, name: '下北沢', type: '', distance: 66.91, pace: 10, interval: 11, restTime: 10 },
    { id: 16, name: '椎名町の南天そば', type: '', distance: 80.09, pace: 10, interval: 0, restTime: 30 },
    { id: 17, name: 'コンビニ', type: '', distance: 87.3, pace: 10, interval: 0, restTime: 10 },
    { id: 18, name: '日暮里の一由そば', type: '', distance: 96.71, pace: 10, interval: 0, restTime: 30 },
    { id: 19, name: '平井駅(コンビニ)', type: '', distance: 105.23, pace: 10, interval: 0, restTime: 15 },
    { id: 20, name: '砂町銀座', type: '', distance: 109.87, pace: 10, interval: 0, restTime: 10 },
    { id: 21, name: '横十間川', type: '', distance: 111.34, pace: 10, interval: 0, restTime: 10 },
    { id: 22, name: '亀戸神社', type: '', distance: 114.01, pace: 10, interval: 0, restTime: 10 },
    { id: 23, name: 'スカイツリー', type: '', distance: 115.63, pace: 10, interval: 0, restTime: 10 },
    { id: 24, name: '御徒町', type: 'ゴール', distance: 120.37, pace: 10, interval: 0, restTime: 20 },
    { id: 25, name: '燕湯', type: '銭湯', distance:120.5, pace: 10, interval: 0, restTime: 60 },
    { id: 26, name: '打上', type: '打上', distance:121.5, pace: 10, interval: 0, restTime: 120 },
  ]);

  const calculateTimes = useTimeCalculations(startDateTime, checkpoints);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      const activeColumnId = active.id.replace('column-', '');
      const overColumnId = over.id.toString().replace('column-', '');

      if (activeColumnId === 'no' || overColumnId === 'no') return;

      setColumns((columns) => {
        const oldIndex = columns.findIndex((col) => col.id === activeColumnId);
        const newIndex = columns.findIndex((col) => col.id === overColumnId);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(columns, oldIndex, newIndex);
        }
        return columns;
      });
    } else {
      setCheckpoints((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addCheckpoint = () => {
    const newId = Math.max(...checkpoints.map(cp => cp.id)) + 1;
    setCheckpoints(prev => [...prev, {
      id: newId,
      name: '新しいチェックポイント',
      type: '',
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

      if (field === 'distance') {
        const changedIndex = updatedCheckpoints.findIndex(cp => cp.id === id);
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

      return updatedCheckpoints;
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Play className="w-6 h-6" />
          2025年5月18日 街ラン
        </h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スタート日時
          </label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      <ScheduleTable
        checkpoints={calculateTimes}
        columns={columns}
        onCheckpointChange={handleCheckpointChange}
        onColumnResize={(columnId, newWidth) => {
          setColumns(cols =>
            cols.map(col =>
              col.id === columnId ? { ...col, width: newWidth } : col
            )
          );
        }}
        onDragEnd={handleDragEnd}
      />

      <div className="mt-4">
        <button
          onClick={addCheckpoint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          チェックポイント追加
        </button>
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
            <li>• 行の左端のグリップアイコンをドラッグして順序を変更できます</li>
            <li>• 列の見出しのグリップアイコンをドラッグして列の順序を変更できます</li>
            <li>• 列の右端をドラッグして列の幅を調整できます</li>
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