import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";

// Indian languages supported
const INDIAN_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', voice: 'English (India)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)', voice: 'Hindi' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)', voice: 'Bengali' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', voice: 'Gujarati' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', voice: 'Kannada' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)', voice: 'Malayalam' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', voice: 'Marathi' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', voice: 'Punjabi' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)', voice: 'Tamil' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)', voice: 'Telugu' },
  { code: 'ur-IN', name: 'اردو (Urdu)', voice: 'Urdu' },
];

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
  disabled?: boolean;
  compact?: boolean; // New prop for compact mode
}

export function VoiceRecorder({ onTranscript, isListening: externalListening, disabled = false, compact = false }: VoiceRecorderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [internalListening, setInternalListening] = useState(false);
  const lastTranscriptRef = useRef<string>('');

  const {
    listen,
    listening: speechListening,
    stop,
    supported,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      // Handle both interim and final results
      const transcript = result.toString();
      if (transcript && transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = transcript;
        onTranscript(transcript);
      }
    },
    onEnd: () => {
      setInternalListening(false);
      lastTranscriptRef.current = '';
    },
  });

  // Use external listening state if provided, otherwise use internal state
  const currentlyListening = externalListening !== undefined ? externalListening : internalListening;

  const toggleListening = () => {
    if (currentlyListening) {
      stop();
      setInternalListening(false);
      if (externalListening !== undefined) {
        // Let parent handle the state change
        return;
      }
    } else {
      listen({
        lang: selectedLanguage,
        continuous: true, // Keep listening until stopped
        interimResults: true,
      });
      setInternalListening(true);
      if (externalListening !== undefined) {
        // Let parent handle the state change
        return;
      }
    }
  };

  const { speak, cancel, speaking, supported: synthesisSupported } = useSpeechSynthesis();

  const speakText = (text: string) => {
    if (!isMuted && synthesisSupported) {
      speak({
        text,
        voice: window.speechSynthesis.getVoices().find(voice => 
          voice.lang.includes(selectedLanguage.split('-')[0])
        ),
        rate: 0.9,
        pitch: 1,
        volume: volume,
      });
    }
  };

  const stopSpeaking = () => {
    cancel();
  };

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MicOff className="w-4 h-4" />
        <span>Speech recognition not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {compact ? (
        /* Compact Mode - Only Microphone Button */
        <Button
          type="button"
          variant={currentlyListening ? "destructive" : "ghost"}
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          className={`h-10 w-10 transition-all duration-200 ${
            currentlyListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse text-white" 
              : "hover:bg-primary hover:text-primary-foreground text-muted-foreground"
          }`}
        >
          {currentlyListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      ) : (
        /* Full Mode - Language Selector, Mic Button, Volume Controls */
        <>
          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={disabled}>
            <SelectTrigger className="w-40 h-10 text-xs">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Voice Input Button */}
          <Button
            type="button"
            variant={currentlyListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            disabled={disabled}
            className={`h-10 w-10 transition-all duration-200 ${
              currentlyListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {currentlyListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Volume Controls */}
          {synthesisSupported && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1"
                disabled={isMuted}
              />
            </div>
          )}

          {/* Status Indicator */}
          {currentlyListening && (
            <div className="flex items-center gap-2 text-xs text-green-600 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Listening...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Export the speak function for use in other components
export const useVoiceSynthesis = () => {
  const { speak, cancel, speaking, supported } = useSpeechSynthesis();
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const speakInLanguage = (text: string, language: string = 'en-IN') => {
    if (supported) {
      // Cancel any ongoing speech
      cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(voice => 
        voice.lang.includes(language.split('-')[0])
      );
      if (voice) {
        utterance.voice = voice;
      }
      
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    cancel();
    currentUtteranceRef.current = null;
  };

  return {
    speak: speakInLanguage,
    cancel: stopSpeaking,
    speaking,
    supported,
  };
};
