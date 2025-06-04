export interface RunningScheduleConfig {
    id: string;
    name: string;
    description: string;
    startDateTime: string;
    checkpoints: {
        id: number;
        name: string;
        type: string;
        distance: number;
        pace: number;
        interval: number;
        restTime: number;
    }[];
}

export interface ConfigPreset {
    id: string;
    name: string;
    description: string;
    category: 'street-run' | 'marathon' | 'training' | 'custom';
    config: RunningScheduleConfig;
}
