import type { ConfigPreset, RunningScheduleConfig } from '../types/config';

export class ConfigManager {
    private static customConfigs: Map<string, ConfigPreset> = new Map();
    private static defaultPresets: ConfigPreset[] = [];
    private static isInitialized = false;

    static async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // デフォルトプリセットを読み込み
            await this.loadDefaultPresets();
            // カスタムプリセットを読み込み
            this.loadCustomPresets();
            this.isInitialized = true;
        } catch (error) {
            console.warn('プリセットの初期化に失敗しました:', error);
            this.isInitialized = true; // エラーでも初期化済みとする
        }
    }

    private static async loadDefaultPresets(): Promise<void> {
        try {
            // プリセットインデックスファイルを読み込み
            const baseUrl = import.meta.env.BASE_URL || '/';
            const indexResponse = await fetch(`${baseUrl}presets/presets-index.json`);
            if (!indexResponse.ok) {
                throw new Error(`HTTP error! status: ${indexResponse.status}`);
            }
            const index = await indexResponse.json();

            // 各プリセットファイルを並列で読み込み
            const presetPromises = index.presets.map(async (presetPath: string) => {
                // presetPathが相対パスの場合、baseUrlを追加
                const fullPath = presetPath.startsWith('/') ? `${baseUrl}${presetPath.slice(1)}` : `${baseUrl}${presetPath}`;
                const response = await fetch(fullPath);
                if (!response.ok) {
                    throw new Error(`Failed to load preset: ${fullPath}`);
                }
                return await response.json();
            });

            const presets = await Promise.all(presetPromises);
            this.defaultPresets = presets;
        } catch (error) {
            console.warn('デフォルトプリセットの読み込みに失敗しました:', error);
            // フォールバック用のデフォルト設定
            this.defaultPresets = [{
                id: 'default-fallback',
                name: 'デフォルト設定',
                description: 'システムデフォルト設定',
                category: 'training',
                config: {
                    id: 'default-fallback',
                    name: 'デフォルト設定',
                    description: 'システムデフォルト設定',
                    startDateTime: '2025-06-07T08:30',
                    checkpoints: [
                        { id: 0, name: '集合地点', type: '集合', distance: 0, pace: 0, interval: 0, restTime: 0 },
                        { id: 1, name: 'スタート地点', type: 'スタート', distance: 0, pace: 0, interval: 0, restTime: 30 },
                        { id: 2, name: 'チェックポイント1', type: '', distance: 5, pace: 10, interval: 0, restTime: 10 },
                        { id: 3, name: 'ゴール地点', type: 'ゴール', distance: 10, pace: 10, interval: 0, restTime: 0 }
                    ]
                }
            }];
        }
    }

    static async getAvailablePresets(): Promise<ConfigPreset[]> {
        await this.initialize();
        const customPresets = Array.from(this.customConfigs.values());
        return [...this.defaultPresets, ...customPresets];
    }

    static async getPresetsByCategory(category?: string): Promise<ConfigPreset[]> {
        const presets = await this.getAvailablePresets();
        if (!category) return presets;
        return presets.filter(preset => preset.category === category);
    }

    static async getPresetById(id: string): Promise<ConfigPreset | undefined> {
        const presets = await this.getAvailablePresets();
        return presets.find(preset => preset.id === id);
    }

    static saveCustomPreset(preset: ConfigPreset): void {
        this.customConfigs.set(preset.id, preset);
        // localStorageに保存
        if (typeof localStorage !== 'undefined') {
            const customConfigs = Array.from(this.customConfigs.values());
            localStorage.setItem('customRunningConfigs', JSON.stringify(customConfigs));
        }
    }

    static loadCustomPresets(): void {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('customRunningConfigs');
            if (saved) {
                try {
                    const configs: ConfigPreset[] = JSON.parse(saved);
                    configs.forEach(config => {
                        this.customConfigs.set(config.id, config);
                    });
                } catch (error) {
                    console.warn('カスタム設定の読み込みに失敗しました:', error);
                }
            }
        }
    }

    static deleteCustomPreset(id: string): boolean {
        const deleted = this.customConfigs.delete(id);
        if (deleted && typeof localStorage !== 'undefined') {
            const customConfigs = Array.from(this.customConfigs.values());
            localStorage.setItem('customRunningConfigs', JSON.stringify(customConfigs));
        }
        return deleted;
    }

    static exportConfig(config: RunningScheduleConfig): string {
        return JSON.stringify(config, null, 2);
    }

    static importConfig(jsonString: string): RunningScheduleConfig {
        try {
            const config = JSON.parse(jsonString);
            this.validateConfig(config);
            return config;
        } catch (error) {
            throw new Error('設定ファイルの形式が正しくありません');
        }
    }

    private static validateConfig(config: any): void {
        if (!config.id || !config.name || !Array.isArray(config.checkpoints)) {
            throw new Error('必要な設定項目が不足しています');
        }
    }
}
