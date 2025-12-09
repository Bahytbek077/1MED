import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const RED_FLAG_KEYWORDS = [
  'сильная боль', 'острая боль', 'невыносимая боль', 'резкая боль',
  'одышка', 'не могу дышать', 'задыхаюсь', 'нехватка воздуха',
  'температура', '38.5', '39', '40', 'высокая температура', 'жар',
  'кровотечение', 'кровь', 'кровавый', 'кровит',
  'онемение', 'паралич', 'не чувствую', 'потеря чувствительности',
  'потеря сознания', 'обморок', 'упал в обморок',
  'судороги', 'конвульсии', 'трясет',
  'боль в груди', 'давит в груди', 'сердце болит',
  'опухоль', 'шишка', 'новообразование', 'растет быстро',
  'резкая потеря веса', 'похудел резко',
  'желтуха', 'пожелтел', 'желтые глаза',
  'кровь в моче', 'кровь в кале', 'черный кал',
  'сильная головная боль', 'мигрень', 'голова раскалывается'
];

export type Severity = 'low_risk' | 'high_risk';

export interface AgentResponse {
  reply: string;
  severity: Severity;
}

function checkForRedFlags(text: string): boolean {
  const lowerText = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

export async function analyzeSymptoms(text: string): Promise<AgentResponse> {
  const hasRedFlags = checkForRedFlags(text);
  
  const systemPrompt = `Ты — медицинский ИИ-ассистент 1MED. Твоя задача:
1. Внимательно выслушать жалобу пациента
2. Задать уточняющие вопросы для понимания симптомов
3. Оценить серьёзность ситуации
4. Дать общие рекомендации по облегчению состояния
5. Направить к нужному специалисту

ВАЖНЫЕ ПРАВИЛА:
- НЕ ставь диагнозы
- НЕ назначай лекарства и дозировки
- НЕ рекомендуй конкретные препараты
- Говори простым, понятным языком
- Будь эмпатичным и внимательным
- Если симптомы серьёзные (сильная боль, высокая температура, кровотечение, одышка, неврологические симптомы) — настоятельно рекомендуй обратиться к врачу немедленно

Отвечай на русском языке. Ответ должен быть кратким (2-4 предложения), но информативным.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Извините, не могу обработать ваш запрос. Пожалуйста, попробуйте еще раз.";
    
    const responseHasRedFlags = checkForRedFlags(reply);
    const severity: Severity = (hasRedFlags || responseHasRedFlags) ? 'high_risk' : 'low_risk';

    return { reply, severity };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      reply: "Извините, произошла ошибка при обработке вашего сообщения. Пожалуйста, попробуйте позже или обратитесь к врачу напрямую.",
      severity: hasRedFlags ? 'high_risk' : 'low_risk'
    };
  }
}
