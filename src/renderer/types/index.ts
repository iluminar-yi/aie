import {Locale} from './i18n';

export type PageState = '/create-project' | '/recording-studio' | '/';

export interface VoiceItem {
    readonly displayText: string;
    readonly fileSystemName: string;
}

export interface RecordedVoiceItem extends VoiceItem {
    audioData?: object;
}

export type Consumer<T> = (t: T) => void;

export interface Environment {
    locale: Locale;
}

export type UsingState<S> = [S, Consumer<S>];

export interface VoiceListParser {
    parse(content: string): Promise<VoiceItem[]>;
}

/**
 * Extending default {@link HTMLAudioElement} because it works in Chrome
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId}
 */
export interface ChromeHTMLAudioElement extends HTMLAudioElement{
    setSinkId(sinkId: string): Promise<void>;
}
