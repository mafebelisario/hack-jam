export interface VideoGenerationConfig {
    prompt: string;
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p';
    image?: {
        mimeType: string;
        data: string;
    };
}

export enum AppState {
    LOGIN_FORM = 'LOGIN_FORM',
    LOGIN_CAPTCHA = 'LOGIN_CAPTCHA',
    LOGIN_ROLE_MATCH = 'LOGIN_ROLE_MATCH',
    DASHBOARD = 'DASHBOARD'
}

export interface GeneratedVideo {
    uri: string;
    mimeType: string;
}