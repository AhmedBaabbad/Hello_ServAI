// app/project-description/page.tsx
import Link from "next/link";
import { Sparkles, ArrowRight, Layers } from "lucide-react";

export default function ProjectDescriptionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 relative overflow-hidden px-4 md:px-8 py-8">
      {/* خلفية زخرفية مطابقة */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* هيدر علوي بسيط مع روابط */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 text-xs md:text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/60 border border-slate-700/70 px-3 py-1 hover:bg-slate-800/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>العودة إلى الوكيل الذكي</span>
            </Link>
          </div>

          <div className="flex gap-2 text-xs md:text-sm">
            <Link
              href="/knowledge-faq"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/40 border border-slate-700/60 px-3 py-1 text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>وصف أسئلة قاعدة المعرفة</span>
            </Link>
          </div>
        </header>

        {/* الكارد الرئيسي */}
        <div className="w-full bg-white/95 rounded-3xl shadow-2xl border border-slate-200/80 p-6 md:p-8 backdrop-blur-sm">
          <header className="flex flex-col gap-2 text-right border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center justify-end gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                <Layers className="w-4 h-4" />
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                وصف مشروع HELLO ServAI
              </h1>
            </div>
            <p className="text-sm text-slate-500 pr-11">
              مشروع تجريبي (Prototype) وكيل ذكي لخدمة العملاء، يُستخدم كدراسة
              حالة على وكيل خدمة العملاء في شركة تأمين طبية.
            </p>
          </header>

          <section className="space-y-5 text-right text-sm text-slate-700 leading-relaxed">
            {/* فكرة المشروع */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">
                فكرة المشروع
              </h2>
              <p>
                المشروع عبارة عن تنفيذ نموذج أولي تفاعلي{" "}
                <span className="font-medium">(Interactive Prototype)</span>{" "}
                وكيل خدمة عملاء ذكي، يتعامل مع استفسارات العملاء المتعلقة
                بالتأمين الطبي، مثل: التغطيات، المطالبات، الشبكة الطبية، وحالات
                الطوارئ. الهدف الأساسي هو عرض الفكرة وتجربة رحلة المستخدم وليس
                تقديم منتج نهائي جاهز للإطلاق.
              </p>
            </div>

            {/* دور الوكيل الذكي */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                دور الوكيل الذكي
              </h2>
              <div className="space-y-1.5">
                {[
                  "استقبال أسئلة العميل كنص أو صوت.",
                  "البحث في قاعدة معرفة بسيطة للأسئلة المتكررة (FAQ).",
                  "إرجاع إجابة واضحة أو اقتراح تحويل الحالة لموظف خدمة العملاء.",
                  "قراءة الرد صوتيًا بشكل مبسّط، كمثال على تجربة وكيل صوتي مستقبلي.",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row-reverse items-start gap-2"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                    <p className="flex-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* طبقة التكامل */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                طبقة التكامل (Integration Layer)
              </h2>
              <p>
                في التصور الكامل للمشروع، يعمل HELLO ServAI كطبقة تكامل{" "}
                <span className="font-medium">Integration Layer</span> بين:
              </p>
              <div className="mt-2 space-y-1.5">
                {[
                  "العميل أو المستخدم النهائي الذي يتصل أو يرسل استفساره.",
                  "صاحب المصلحة (شركة التأمين أو جهة الخدمة) التي ترغب في أتمتة الرد على الأسئلة المتكررة.",
                  "أنظمة وخدمات خارجية مستقبلية (مثل: أنظمة التأمين، قواعد بيانات الشبكة الطبية، أنظمة الـ CRM، أو أنظمة IVR الصوتية).",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row-reverse items-start gap-2"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <p className="flex-1">{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                النموذج الحالي يركّز على طبقة الواجهة وتجربة التفاعل، بينما
                تُترك التكاملات العميقة مع الأنظمة الفعلية للمرحلة التالية من
                المشروع.
              </p>
            </div>

            {/* نطاق التنفيذ */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                نطاق التنفيذ في هذه النسخة
              </h2>
              <div className="space-y-1.5">
                {[
                  "تنفيذ واجهة دردشة نصية باللغة العربية.",
                  "دعم إدخال السؤال صوتيًا عبر المتصفح (Web Speech API).",
                  "قراءة الرد صوتيًا للمستخدم (Text-to-Speech) بطريقة مبسطة.",
                  "الاعتماد على REST API بسيطة (/ask) لاسترجاع الإجابات من خدمة خلفية (Backend).",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row-reverse items-start gap-2"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <p className="flex-1">{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                تم تنفيذ هذه النسخة كـ{" "}
                <span className="font-medium">دراسة حالة</span> على التأمين
                الطبي، ويمكن مستقبلاً تعميم نفس الفكرة على قطاعات أخرى (بنوك،
                لوجستيات، شركات اتصالات، إلخ).
              </p>
            </div>

            {/* ملاحظات مهمة */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                ملاحظات مهمة
              </h2>
              <div className="space-y-1.5">
                {[
                  "هذه النسخة ليست منتجًا نهائيًا، وإنما نموذج توضيحي لفكرة وكيل خدمة العملاء الذكي.",
                  "الهدف منها هو عرض الفكرة للمستثمر أو صاحب القرار، مع إمكانية تطويرها لاحقًا إلى حل متكامل يرتبط بأنظمة حقيقية.",
                  "تصميم الواجهة وتجربة المستخدم يمكن تخصيصهما لاحقًا وفق هوية شركة التأمين أو الجهة المالكة للمشروع.",
                ].map((text, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row-reverse items-start gap-2"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                    <p className="flex-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
