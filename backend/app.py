from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import List, Dict, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
# ===================== إعداد التطبيق =====================

app = FastAPI(title="HELLO ServAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== تحميل قاعدة المعرفة =====================

with open("knowledge_base.json", "r", encoding="utf-8") as f:
    kb_data = json.load(f)

FAQ: List[Dict[str, str]] = kb_data.get("insurance_faq", [])

# ===================== إعداد OpenAI =====================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in environment variables")

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
client = Groq(api_key=GROQ_API_KEY)

# ===================== نماذج الطلب/الاستجابة =====================


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    user_question: str
    matched_question: Optional[str]
    answer: str
    source: str  # "knowledge_base_only" أو "knowledge_base+llm" أو "fallback"


# ===================== منطق قاعدة المعرفة (Exact/Keyword Match) =====================

def find_best_answer(user_question: str) -> Dict[str, str]:
    """
    من أجل البروتوتايب: نستخدم مطابقة بسيطة بالكلمات.
    لاحقًا يمكن استبدالها بـ Embeddings.
    """
    user_q = user_question.strip()
    if not user_q:
        return {
            "question": "",
            "answer": "فضلاً اطرح سؤالك بشكل واضح لأتمكن من مساعدتك."
        }

    best_match = None
    best_score = 0

    # تقسيم بدائي للكلمات
    user_tokens = set(user_q.split())

    for item in FAQ:
        q_text = item["question"]
        q_tokens = set(q_text.split())

        common = user_tokens.intersection(q_tokens)
        score = len(common)

        if score > best_score:
            best_score = score
            best_match = item

    if best_match and best_score > 0:
        return best_match

    # لو لم نجد تطابق معقول
    return {
        "question": "",
        "answer": ""
    }


def build_faq_context() -> str:
    """
    يبني نصًا منظمًا يحتوي على الأسئلة والأجوبة في قاعدة المعرفة
    ليتم تمريره للـ LLM كمرجع وحيد.
    """
    lines: List[str] = []
    for idx, item in enumerate(FAQ, start=1):
        q = item.get("question", "").strip()
        a = item.get("answer", "").strip()
        if q and a:
            lines.append(f"{idx}. سؤال: {q}\n   جواب: {a}")
    return "\n".join(lines)


# ===================== هندسة الأمر مع LLM =====================

SYSTEM_PROMPT = """
أنت مساعد افتراضي ذكي لخدمة العملاء في مجال التأمين الطبي ضمن نظام HELLO ServAI.

القواعد الأساسية لعملك:

1. مصدر المعرفة الوحيد لديك هو "قاعدة المعرفة" التي سيتم تزويدك بها (أسئلة وأجوبة محددة).
2. يجب أن تعتمد إجابتك فقط على المعلومات الموجودة في هذه القاعدة.
3. إذا لم تجد في القاعدة معلومات كافية للإجابة بدقة:
   - لا تخترع إجابات أو سياسات من عندك (لا للهلوسة).
   - استخدم أسلوب مهذب ولبق واطلب من العميل التواصل مع موظف خدمة العملاء البشري.
4. إذا كان السؤال يتضمن معلومات شخصية أو طلبًا للوصول إلى بيانات حساسة (مثل: مطالبة محددة، رقم هوية، تفاصيل حالة طبية شخصية، حالة ملف معيّن):
   - لا تحاول تخمين أو تأكيد أي معلومات.
   - اشرح للعميل بلطف أن هذه الحالات تحتاج لموظف خدمة العملاء حفاظًا على الخصوصية.
5. أجب دائمًا باللغة العربية الفصحى المبسّطة، وبأسلوب خدمة عملاء راقٍ وودود.
6. إذا كان السؤال خارج نطاق التأمين الطبي أو الخدمات المذكورة في قاعدة المعرفة:
   - أوضِح أن السؤال خارج نطاق هذه النسخة التجريبية من النظام،
   - واقترح عليه التواصل مع مركز خدمة العملاء في شركته للحصول على تفاصيل أدق.

صيغة الإجابة:
- اجعل الجواب قصيرًا وواضحًا، ويمكنك تقسيمه إلى نقاط عند الحاجة.
- إن احتجت تحويله لموظف خدمة العملاء، وضّح ذلك في نهاية الرد بنبرة ودية.
"""


def generate_llm_answer(
    user_question: str,
    best_match: Dict[str, str],
) -> str:
    """
    يستدعي LLM مع تمرير قاعدة المعرفة كاملة وأفضل سؤال مطابق (إن وجد)
    مع تطبيق سياسات منع الهلوسة واحترام السرية.
    """
    faq_context = build_faq_context()
    best_q = best_match.get("question", "") or "لا يوجد تطابق واضح."
    best_a = best_match.get(
        "answer", "") or "لا يوجد جواب مطابق في قاعدة المعرفة."

    user_content = f"""
سؤال العميل:
{user_question}

أقرب سؤال مطابق في قاعدة المعرفة (إن وجد):
سؤال: {best_q}
جواب: {best_a}

نص قاعدة المعرفة (أسئلة وأجوبة متاحة لديك فقط):

{faq_context}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,  # يمكنك تغييره لنموذج آخر من OpenAI إذا رغبت
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,  # تقليل الإبداع للحد من الهلوسة
    )

    answer_text = completion.choices[0].message.content or ""
    return answer_text.strip()


# ===================== نقاط النهاية =====================

@app.post("/ask", response_model=AskResponse)
def ask_hello_servai(payload: AskRequest):
    user_question = payload.question.strip()

    # 1) نحصل على أفضل تطابق من قاعدة المعرفة
    best = find_best_answer(user_question)

    # 2) نحاول الاعتماد على LLM مع ضبط صارم للمعرفة
    try:
        if not user_question:
            final_answer = "فضلاً اكتب سؤالك لأتمكن من مساعدتك."
            return AskResponse(
                user_question=user_question,
                matched_question="",
                answer=final_answer,
                source="validation"
            )

        llm_answer = generate_llm_answer(user_question, best)

        # لو جاء رد فارغ أو قصير جدًا، نرجع على fallback من قاعدة المعرفة
        if not llm_answer or len(llm_answer) < 5:
            fallback_answer = best.get("answer") or \
                "لم أجد إجابة مباشرة في قاعدة المعرفة، يُفضّل تحويلك لموظف خدمة العملاء."
            return AskResponse(
                user_question=user_question,
                matched_question=best.get("question", ""),
                answer=fallback_answer,
                source="knowledge_base_only"
            )

        return AskResponse(
            user_question=user_question,
            matched_question=best.get("question", ""),
            answer=llm_answer,
            source="knowledge_base+llm"
        )

    except Exception as e:
        # في حالة فشل LLM نضمن أن النظام لا يتعطل
        print("LLM error:", str(e))
        fallback_answer = best.get("answer") or \
            "عذراً، حدث خلل مؤقت في خدمة المساعد الذكي. يُفضّل تحويلك لموظف خدمة العملاء."
        return AskResponse(
            user_question=user_question,
            matched_question=best.get("question", ""),
            answer=fallback_answer,
            source="fallback"
        )


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HELLO ServAI backend v2", "llm": True}
