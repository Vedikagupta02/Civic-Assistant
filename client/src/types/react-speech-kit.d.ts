declare module 'react-speech-kit' {
  export interface SpeechRecognitionOptions {
    onResult?: (result: string) => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
    onStart?: () => void;
  }

  export interface SpeechRecognitionState {
    listen: (options?: { lang?: string; continuous?: boolean; interimResults?: boolean }) => void;
    listening: boolean;
    stop: () => void;
    supported: boolean;
  }

  export interface SpeechSynthesisOptions {
    text: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  }

  export interface SpeechSynthesisState {
    speak: (options: SpeechSynthesisOptions) => void;
    cancel: () => void;
    speaking: boolean;
    supported: boolean;
  }

  export function useSpeechRecognition(options: SpeechRecognitionOptions): SpeechRecognitionState;
  export function useSpeechSynthesis(): SpeechSynthesisState;
}
