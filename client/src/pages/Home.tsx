import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, AlertCircle, Phone, ArrowRight, Bot, User, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalyzeText } from "@/hooks/use-analyze";
import { useCreateMessage, useMessages } from "@/hooks/use-messages";
import { ReportModal } from "@/components/issues/ReportModal";
import { type AnalyzeResponse } from "@shared/schema";
import { Navbar } from "@/components/layout/Navbar";
import { VoiceRecorder, useVoiceSynthesis } from "@/components/voice/VoiceRecorder";

// Local type for chat history display
type ChatItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysis?: AnalyzeResponse;
};

const chatSchema = z.object({
  message: z.string().min(1),
});

export default function Home() {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    {
      id: "intro",
      role: "assistant",
      content: "Namaste! I am Nagrik Seva AI. Tell me about any civic issue you're facing (water, roads, garbage), and I'll help you report it to the right department.",
    },
  ]);
  const [reportModalData, setReportModalData] = useState<{ category: string; description: string } | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const analyze = useAnalyzeText();
  const { speak, cancel, speaking } = useVoiceSynthesis();
  
  // Use React Hook Form for input
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, analyze.isPending]);

  const onSubmit = (values: z.infer<typeof chatSchema>) => {
    const userMsg = values.message;
    form.reset();
    setIsVoiceListening(false);
    submitMessage(userMsg);
  };

  const submitMessage = (userMsg: string) => {
    // Add user message to UI immediately
    const newHistory: ChatItem[] = [
      ...chatHistory,
      { id: Date.now().toString(), role: "user", content: userMsg },
    ];
    setChatHistory(newHistory);

    // Call analyze API
    analyze.mutate({ text: userMsg }, {
      onSuccess: (data) => {
        const assistantMessage = "I've analyzed your issue. Here is the guidance:";
        setChatHistory(prev => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: assistantMessage,
            analysis: data 
          }
        ]);
      },
      onError: () => {
        const errorMessage = "I'm having trouble connecting to the server. Please try again.";
        setChatHistory(prev => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: errorMessage 
          }
        ]);
      }
    });
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Set the transcript in the form field but don't auto-submit
    form.setValue("message", transcript);
    // Don't set isVoiceListening to false here - let user control when to stop
  };

  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      // Stop listening
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.stop();
      }
      setIsVoiceListening(false);
    } else {
      // Start listening
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = selectedLanguage;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            form.setValue("message", transcript);
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsVoiceListening(false);
        };
        
        recognition.onend = () => {
          setIsVoiceListening(false);
        };
        
        recognition.start();
        setIsVoiceListening(true);
      } else {
        alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      }
    }
  };

  const speakMessage = (text: string, language: string = 'en-IN') => {
    if (speaking) {
      cancel();
    } else {
      speak(text, language);
    }
  };

  const handleOpenReport = (analysis: AnalyzeResponse, userOriginalText: string) => {
    setReportModalData({
      category: analysis.category,
      description: userOriginalText, // In a real app we'd grab the actual text from history context
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-8 pt-16 md:pt-24">
      <Navbar />
      
      {/* Header for Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur border-b z-40 flex items-center px-4 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mr-3">
          <AlertCircle size={20} />
        </div>
        <h1 className="font-display font-bold text-lg text-primary">Nagrik Seva</h1>
      </div>

      <main className="max-w-3xl mx-auto px-4 w-full h-[calc(100vh-8rem)] flex flex-col">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 scroll-smooth pr-2">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-primary" />
                  </div>
                )}
                
                <div className={`space-y-2 max-w-[85%] ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
                  {/* Text Bubble */}
                  <div className="relative">
                    <div
                      className={`px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
                        ${msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-white border border-border/50 text-foreground rounded-tl-none"
                        }`}
                    >
                      {msg.content}
                    </div>
                    
                    {/* Speak Button for AI Messages */}
                    {msg.role === "assistant" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => speakMessage(msg.content)}
                        className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full shadow-md transition-colors ${
                          speaking && msg.content === chatHistory[chatHistory.length - 1]?.content
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        {speaking && msg.content === chatHistory[chatHistory.length - 1]?.content ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Structured Analysis Card */}
                  {msg.analysis && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-sm bg-white rounded-xl border border-border shadow-lg overflow-hidden mt-2"
                    >
                      <div className="bg-primary/5 p-4 border-b border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Guidance Card</span>
                          <div className="flex gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              msg.analysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                              msg.analysis.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {msg.analysis.riskLevel} Risk
                            </span>
                          </div>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground">{msg.analysis.category}</h3>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-800 font-bold mb-1 uppercase">Why this matters</p>
                          <p className="text-sm text-blue-900 leading-snug">{msg.analysis.importance}</p>
                          <p className="text-sm text-blue-900 mt-2 font-medium italic">{msg.analysis.advice}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase">What you can do</p>
                          <ul className="space-y-1">
                            {msg.analysis.actions.map((action, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-1">✔</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Responsible Authority</p>
                            <p className="font-medium text-foreground">{msg.analysis.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase font-bold">Official Helpline</p>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 font-mono text-primary font-bold">
                                <Phone size={12} />
                                {msg.analysis.helpline}
                              </div>
                              <p className="text-xs text-muted-foreground italic">Delhi Government</p>
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                          onClick={() => handleOpenReport(msg.analysis!, "Issue reported from chat")}
                        >
                          Submit Official Report
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {analyze.isPending && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="bg-white border border-border/50 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Analyzing request...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="py-4 bg-transparent">
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative flex items-center gap-2"
          >
            <Input 
              {...form.register("message")}
              placeholder="Describe your issue (e.g., 'Broken street light at Main St')..."
              className="h-14 pl-6 pr-36 rounded-full border-border/60 shadow-lg bg-white focus-visible:ring-primary/20 text-base"
              autoComplete="off"
              disabled={analyze.isPending}
            />
            
            {/* Voice and Send Buttons */}
            <div className="absolute right-2 flex items-center gap-1">
              {/* Language Selector (compact) */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={analyze.isPending}
                className="h-8 px-2 text-xs border rounded bg-white"
              >
                <option value="en-IN">EN</option>
                <option value="hi-IN">HI</option>
                <option value="bn-IN">BN</option>
                <option value="ta-IN">TA</option>
                <option value="te-IN">TE</option>
              </select>
              
              {/* Microphone Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleVoiceListening}
                disabled={analyze.isPending}
                className={`h-10 w-10 transition-all duration-200 ${
                  isVoiceListening 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                    : "hover:bg-primary hover:text-primary-foreground text-muted-foreground"
                }`}
              >
                {isVoiceListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              
              {/* Send Button */}
              <Button 
                type="submit" 
                size="icon"
                disabled={!form.watch("message") || analyze.isPending}
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md transition-all hover:scale-105"
              >
                <Send size={18} className="ml-0.5" />
              </Button>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2">
            AI can make mistakes. Please verify important information. You can also use voice input in multiple Indian languages.
          </p>
        </div>

      </main>

      <ReportModal 
        open={!!reportModalData} 
        onOpenChange={(open) => !open && setReportModalData(null)}
        prefilledCategory={reportModalData?.category}
        prefilledDescription={reportModalData?.description}
      />
    </div>
  );
}
