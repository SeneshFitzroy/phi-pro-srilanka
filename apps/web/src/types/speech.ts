// Shared minimal typings for the Web Speech API (SpeechRecognition), which is
// not in lib.dom for all targets. Single source of truth so multiple components
// can use it without conflicting global augmentations.

export interface SpeechRecognitionAlternative { transcript: string; confidence: number }
export interface SpeechRecognitionResultItem { 0: SpeechRecognitionAlternative; isFinal: boolean; length: number }
export interface SpeechRecognitionEvent { resultIndex: number; results: ArrayLike<SpeechRecognitionResultItem> }
export interface SpeechRecognitionErrorEvent { error: string }

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}
