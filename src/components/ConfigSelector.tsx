import React, { useState, useEffect } from 'react';
import { Settings, Download, Upload, Save, Trash2 } from 'lucide-react';
import { ConfigManager } from '../services/ConfigManager';
import type { ConfigPreset, RunningScheduleConfig } from '../types/config';

interface ConfigSelectorProps {
    currentConfig: RunningScheduleConfig;
    onConfigChange: (config: RunningScheduleConfig) => void;
}

export const ConfigSelector: React.FC<ConfigSelectorProps> = ({
    currentConfig,
    onConfigChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [presets, setPresets] = useState<ConfigPreset[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetDescription, setNewPresetDescription] = useState('');
    const [importData, setImportData] = useState('');

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const availablePresets = await ConfigManager.getAvailablePresets();
            setPresets(availablePresets);
        } catch (error) {
            console.warn('プリセットの読み込みに失敗しました:', error);
            setPresets([]);
        }
    };

    const categories = [
        { value: 'all', label: 'すべて' },
        { value: 'street-run', label: '街ラン' },
        { value: 'marathon', label: 'マラソン' },
        { value: 'training', label: 'トレーニング' },
        { value: 'custom', label: 'カスタム' }
    ];

    const filteredPresets = selectedCategory === 'all'
        ? presets
        : presets.filter(preset => preset.category === selectedCategory);

    const handlePresetSelect = (preset: ConfigPreset) => {
        onConfigChange(preset.config);
        setIsOpen(false);
    };

    const handleSavePreset = async () => {
        if (!newPresetName.trim()) return;

        const newPreset: ConfigPreset = {
            id: `custom-${Date.now()}`,
            name: newPresetName,
            description: newPresetDescription,
            category: 'custom',
            config: {
                ...currentConfig,
                id: `custom-${Date.now()}`,
                name: newPresetName,
                description: newPresetDescription
            }
        };

        ConfigManager.saveCustomPreset(newPreset);
        await loadPresets();
        setShowSaveDialog(false);
        setNewPresetName('');
        setNewPresetDescription('');
    };

    const handleDeletePreset = async (presetId: string) => {
        if (confirm('この設定を削除しますか？')) {
            ConfigManager.deleteCustomPreset(presetId);
            await loadPresets();
        }
    };

    const handleExport = () => {
        const exportData = ConfigManager.exportConfig(currentConfig);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentConfig.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        try {
            const config = ConfigManager.importConfig(importData);
            onConfigChange(config);
            setShowImportDialog(false);
            setImportData('');
        } catch (error) {
            alert('設定ファイルの読み込みに失敗しました: ' + error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Settings className="w-4 h-4" />
                設定を選択
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-80 md:w-96 max-w-[calc(100vw-1rem)] bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] 
                       origin-top-right mr-0">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">スケジュール設定</h3>

                        {/* カテゴリ選択 */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                カテゴリ
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setShowSaveDialog(true)}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                                <Save className="w-3 h-3" />
                                保存
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                                <Download className="w-3 h-3" />
                                エクスポート
                            </button>
                            <button
                                onClick={() => setShowImportDialog(true)}
                                className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            >
                                <Upload className="w-3 h-3" />
                                インポート
                            </button>
                        </div>
                    </div>

                    {/* プリセット一覧 */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredPresets.map(preset => (
                            <div
                                key={preset.id}
                                className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-start"
                            >
                                <div onClick={() => handlePresetSelect(preset)} className="flex-1">
                                    <div className="font-medium text-sm">{preset.name}</div>
                                    <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {preset.config.checkpoints.length}箇所 |
                                        {preset.config.checkpoints[preset.config.checkpoints.length - 1]?.distance || 0}km
                                    </div>
                                </div>
                                {preset.category === 'custom' && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleDeletePreset(preset.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t border-gray-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            {/* 保存ダイアログ */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">設定を保存</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    設定名
                                </label>
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="例: 山手線一周ラン"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    説明
                                </label>
                                <textarea
                                    value={newPresetDescription}
                                    onChange={(e) => setNewPresetDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                                    placeholder="この設定の説明を入力してください"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSavePreset}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                                保存
                            </button>
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* インポートダイアログ */}
            {showImportDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">設定をインポート</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    JSON設定データ
                                </label>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                                    placeholder="JSONデータを貼り付けてください"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleImport}
                                className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                            >
                                インポート
                            </button>
                            <button
                                onClick={() => setShowImportDialog(false)}
                                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
