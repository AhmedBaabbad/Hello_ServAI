// app/knowledge-faq/page.tsx
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

const INSURANCE_FAQ = [
  {
    question: "ما هي التغطيات الأساسية في وثيقة التأمين الطبي؟",
    answer:
      "تشمل التغطيات الأساسية: الكشف الطبي، الأدوية، الفحوصات المخبرية، الأشعة، العمليات الجراحية، التنويم، وحالات الطوارئ.",
  },
  {
    question: "هل يشمل التأمين الفحوصات المخبرية والأشعة؟",
    answer:
      "نعم، يغطي التأمين الفحوصات المخبرية والأشعة حسب حدود وشروط الوثيقة.",
  },
  {
    question: "هل يغطي التأمين الحالات الطارئة؟",
    answer:
      "نعم، جميع الحالات الطارئة مشمولة ضمن التغطية ويتم استقبالها على مدار الساعة.",
  },
  {
    question: "هل توجد مستشفيات معتمدة يمكنني زيارتها؟",
    answer:
      "نعم، يمكنك الاطلاع على قائمة المستشفيات المعتمدة عبر التطبيق أو موقع الشركة.",
  },
  {
    question: "كيف أعرف أن المنشأة الطبية مشمولة في شبكتي؟",
    answer:
      "يمكنك إدخال اسم المنشأة في محرك البحث داخل الشبكة الطبية للتحقق من توفر الخدمة.",
  },
  {
    question: "كيف أرفع مطالبة طبية؟",
    answer:
      "يمكنك رفع المطالبة عبر التطبيق بإرفاق الفواتير والتقارير الطبية، وسيتم مراجعتها خلال 7 أيام عمل.",
  },
  {
    question: "كم يستغرق وقت اعتماد المطالبة؟",
    answer: "عادةً خلال 5 إلى 7 أيام عمل حسب حالة الطلب.",
  },
  {
    question: "ما هي المستندات المطلوبة لتعويض المطالبة؟",
    answer:
      "تشمل: الفاتورة المختومة، التقرير الطبي، الوصفة الطبية، ونسخة من الهوية.",
  },
  {
    question: "كيف أتابع حالة المطالبة؟",
    answer: "يمكنك متابعة حالة المطالبة عبر التطبيق أو عبر خدمة العملاء.",
  },
  {
    question: "هل أحتاج موافقة مسبقة قبل زيارة المستشفى؟",
    answer:
      "بعض الخدمات تتطلب موافقة مسبقة مثل العمليات الجراحية أو الأشعة المتقدمة.",
  },
  {
    question: "كم يستغرق وقت إصدار الموافقة؟",
    answer: "عادةً بين 30 دقيقة إلى ساعتين حسب نوع الخدمة.",
  },
  {
    question: "لماذا تم رفض الموافقة؟",
    answer:
      "قد يكون بسبب عدم شمول الخدمة في الوثيقة أو عدم تقديم معلومات كافية.",
  },
  {
    question: "ما الفرق بين شبكة A و B و C؟",
    answer:
      "تختلف الشبكات في مستوى المستشفيات والأسعار والخدمات المتاحة.",
  },
  {
    question: "هل يمكنني الانتقال من شبكة لأخرى؟",
    answer:
      "نعم، يمكن ذلك عند التجديد أو حسب شروط الوثيقة.",
  },
  {
    question: "كيف أجدد وثيقة التأمين؟",
    answer:
      "يمكنك التجديد عبر التطبيق أو التواصل مع خدمة العملاء.",
  },
  {
    question: "هل يمكن إضافة أفراد جدد للعائلة؟",
    answer:
      "نعم، يمكن إضافة الزوج/الزوجة والأبناء حسب سياسة الشركة.",
  },
  {
    question: "متى تبدأ صلاحية التغطية؟",
    answer:
      "تبدأ التغطية عادةً من تاريخ إصدار الوثيقة.",
  },
  {
    question: "كيف أقدم شكوى؟",
    answer:
      "يمكنك رفع شكوى عبر المنصة الإلكترونية أو التواصل مع الرقم الموحد.",
  },
  {
    question: "ما هو رقم خدمة العملاء؟",
    answer:
      "الرقم الموحد لخدمة العملاء هو المتوفر على الموقع والتطبيق.",
  },
  {
    question: "ماذا أفعل إذا رفض المستشفى تقديم الخدمة؟",
    answer:
      "تواصل فورًا مع خدمة العملاء وسيتم التحقق والتوجيه للمستشفى لاستكمال الإجراء.",
  },
];

export default function KnowledgeFaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 relative overflow-hidden px-4 md:px-8 py-8">
      {/* عناصر خلفية زخرفية نفس الصفحة الرئيسية */}
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
              href="/project-description"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/40 border border-slate-700/60 px-3 py-1 text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>وصف مشروع HELLO ServAI</span>
            </Link>
          </div>
        </header>

        {/* الكارد الرئيسي */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/80 p-6 md:p-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
            <div className="text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center justify-end gap-2">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span>وصف أسئلة قاعدة المعرفة</span>
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                هذه الأسئلة تمثّل نموذجًا لقاعدة المعرفة المستخدمة في وكيل خدمة
                العملاء (دراسة حالة على التأمين الطبي).
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-medium text-slate-600">
                HELLO ServAI – Knowledge Base
              </p>
              <p>نموذج أولي لأسئلة متكررة في التأمين الطبي</p>
            </div>
          </header>

          <section className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {INSURANCE_FAQ.map((item, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right shadow-sm hover:border-sky-300 hover:bg-sky-50 transition-all"
              >
                <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                    سؤال #{idx + 1}
                  </span>
                  <span className="flex-1">
                    {item.question}
                  </span>
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {item.answer}
                </p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
