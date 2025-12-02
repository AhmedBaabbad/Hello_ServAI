"use client";

import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import { Mic, Send, Volume2, VolumeX, Sparkles } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AskResponse {
  user_question: string;
  matched_question: string;
  answer: string;
  source: string;
}

/* ======= تعريفات Web Speech API ======= */

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;

  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;

  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* =============================================== */

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "مرحبًا بك في HELLO ServAI 👋\nأنا وكيل ذكي لخدمة العملاء، وحاليًا أقوم بدراسة حالة خاصة بالتأمين الطبي. اسألني عن التغطيات، المطالبات، أو الشبكة الطبية.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ========== أوتو سكرول لأسفل ========== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ========== مؤقت التسجيل ========== */
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTimer(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  /* ========== إعداد أصوات TTS ========== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);

      const arSaVoice =
        v.find((voice) => voice.lang.toLowerCase().startsWith("ar-sa")) ??
        v.find((voice) => voice.lang.toLowerCase().startsWith("ar"));

      if (arSaVoice) {
        setSelectedVoice(arSaVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ========== دالة قراءة الرد صوتيًا ========== */
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;
      if (!voiceEnabled) return;
      if (!("speechSynthesis" in window)) return;

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = selectedVoice?.lang ?? "ar-SA";
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err: unknown) {
        console.error("TTS error:", err);
        setIsSpeaking(false);
      }
    },
    [voiceEnabled, selectedVoice]
  );

  /* ========== إيقاف القراءة الصوتية ========== */
  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  /* ========== إرسال السؤال ========== */
  const handleSend = async (e?: MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    stopSpeaking();

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
     const res = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });


      if (!res.ok) {
        throw new Error("حدث خطأ في الاتصال بالخادم");
      }

      const data: AskResponse = await res.json();

      const answerText =
        data.answer ||
        "لم أجد إجابة واضحة في قاعدة المعرفة، يُفضّل تحويلك لموظف خدمة العملاء.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answerText },
      ]);

      setTimeout(() => speak(answerText), 300);
    } catch (err: unknown) {
      console.error(err);
      setError("تعذر الاتصال بالخدمة حاليًا. حاول مرة أخرى لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  /* ========== التسجيل الصوتي (STT) ========== */
  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    if (loading) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognitionClass: SpeechRecognitionConstructor | undefined =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError(
        "المتصفح الحالي لا يدعم التعرف على الصوت. يُفضّل استخدام متصفح Chrome."
      );
      return;
    }

    stopSpeaking();
    setError(null);

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingTimer(0);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("STT error:", event.error, event.message);
      setIsRecording(false);

      if (event.error === "no-speech") {
        setError("لم يتم اكتشاف أي صوت. حاول مرة أخرى والتحدث بوضوح.");
      } else if (event.error === "not-allowed") {
        setError("الرجاء السماح بالوصول إلى الميكروفون من إعدادات المتصفح.");
      } else {
        setError("حدث خطأ أثناء التعرف على الصوت. حاول مرة أخرى.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      console.log(`Recognized: "${transcript}" (confidence: ${confidence})`);

      setInput(transcript);
      setIsRecording(false);

      setTimeout(() => {
        void handleSend();
      }, 100);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setError("فشل بدء التسجيل الصوتي. حاول مرة أخرى.");
      setIsRecording(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ========== الواجهة ========== */
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 relative overflow-hidden px-4 md:px-8 py-8">
      {/* عناصر خلفية زخرفية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,2.2fr] gap-6">
        {/* العمود الجانبي: روابط وصف المشروع وقاعدة المعرفة */}
        <aside className="space-y-4 flex flex-col">
          <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/80 p-5 flex flex-col text-right">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                صفحات المشروع
              </h3>
              <p className="text-[13px] text-slate-600">
                يمكنك استعراض وصف المشروع وقاعدة المعرفة المستخدمة في هذه
                الدراسة من خلال الروابط التالية:
              </p>
            </div>

            {/* فاصل بسيط وجذاب بدل الفراغ الكبير */}
            <div className="mt-3 h-px w-full bg-gradient-to-l from-slate-200 via-sky-300 to-slate-200 rounded-full" />

            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/knowledge-faq"
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-[13px] text-slate-800 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800 transition-all"
              >
                <span>وصف أسئلة قاعدة المعرفة</span>
                <span className="text-xs text-sky-600">عرض الأسئلة ➜</span>
              </Link>

              <Link
                href="/project-description"
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-[13px] text-slate-800 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
              >
                <span>وصف مشروع HELLO ServAI</span>
                <span className="text-xs text-emerald-600">عرض الوصف ➜</span>
              </Link>
            </div>

            <p className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-dashed border-slate-200">
              هذه النسخة للاستخدام التجريبي فقط كدراسة حالة على وكيل خدمة
              العملاء في شركة تأمين طبية.
            </p>
          </section>
        </aside>

        {/* عمود الدردشة (يمين في الشاشات الكبيرة) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col h-[75vh] max-h-[780px] overflow-hidden">
          {/* الهيدر مع الشعار قبل العنوان */}
          <header className="flex flex-row-reverse items-center justify-between px-5 md:px-7 py-4 border-b border-slate-200 bg-slate-50/90">
            <div className="flex items-center gap-3 text-right">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </span>
                  <span>
                    HELLO{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                      ServAI
                    </span>
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  وكيل ذكي لخدمة العملاء – دراسة حالة على التأمين الطبي
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل الآن
              </span>
              <button
                onClick={() => setVoiceEnabled((prev) => !prev)}
                className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-sky-600 transition-colors"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span>قراءة الرد صوتيًا</span>
              </button>
            </div>
          </header>

          {/* منطقة الرسائل */}
          <section className="flex-1 px-4 md:px-6 py-4 overflow-y-auto bg-slate-50/80">
            <div className="flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.role === "assistant"
                      ? "self-end max-w-[85%] rounded-2xl rounded-br-md bg-white text-slate-900 px-4 py-2.5 text-sm text-right whitespace-pre-line border border-slate-200 shadow-sm"
                      : "self-start max-w-[85%] rounded-2xl rounded-bl-md bg-sky-600 text-white px-4 py-2.5 text-sm text-right whitespace-pre-line shadow-sm"
                  }
                >
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="self-end flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-200" />
                  </div>
                  جاري معالجة سؤالك...
                </div>
              )}

              {isSpeaking && (
                <div className="self-end flex items-center gap-2 text-xs text-sky-600">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  جاري قراءة الرد...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </section>

          {/* رسالة الخطأ إن وجدت */}
          {error && (
            <div className="px-5 md:px-6 pb-2 bg-white/90">
              <div className="flex items-start gap-2 text-xs text-red-600 border border-red-200 rounded-2xl p-3 bg-red-50">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* الإدخال – الأزرار بجانب مربع النص */}
          <section className="px-4 md:px-6 pb-4 pt-2 border-t border-slate-200 bg-white/95">
            <div className="flex flex-row gap-3 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="relative">
                  <textarea
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-sm p-3.5 pr-4 outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-sky-400 resize-none transition-all"
                    rows={2}
                    placeholder="اكتب سؤالك عن التأمين الطبي أو الخدمات هنا..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isRecording}
                  />
                  {isRecording && (
                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-50 border border-red-300 rounded-full px-2.5 py-1 text-[11px] text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      جاري التسجيل {formatTimer(recordingTimer)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pr-1">
                  <span className="opacity-70">💡</span>
                  <span>
                    اضغط Enter للإرسال، أو استخدم زر الميكروفون للتحدث.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={loading}
                  className={`relative inline-flex items-center justify-center w-11 h-11 rounded-2xl text-sm font-medium transition-all shadow-sm ${
                    isRecording
                      ? "bg-red-500 text-white scale-105 shadow-red-300"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                  title={isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !input.trim() || isRecording}
                  className="inline-flex items-center justify-center gap-1.5 min-w-[110px] px-4 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جارٍ...</span>
                    </>
                  ) : (
                    <>
                      <span>إرسال</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
