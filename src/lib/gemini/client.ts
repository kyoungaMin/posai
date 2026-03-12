import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  /** 내일 매출 예측 (Flash Lite) */
  async predictSales(historicalData: unknown) {
    const prompt = `
      당신은 소상공인 사장님을 돕는 친절하고 열정적인 AI 경영 비서입니다.
      다음의 최근 7일간 매출 데이터와 날씨 정보를 바탕으로 내일의 매출과 메뉴 수요를 예측해주세요.
      데이터: ${JSON.stringify(historicalData)}

      답변은 다음을 포함해야 하며, 사장님께 힘이 되는 따뜻한 응원의 한마디로 시작해주세요:
      1. 내일 예상 총 매출액 (원 단위)
      2. 내일 인기가 많을 것으로 예상되는 메뉴 TOP 3
      3. 날씨와 계절 요인을 고려한 구체적인 조언
      4. 재고 관리에 대한 조언

      한국어로 답변하고, 친근한 말투(~해요, ~입니다)를 사용하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text;
  },

  /** AI 경영 비서 채팅 (Pro) */
  async chat(message: string, context: unknown) {
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `당신은 'POS 인사이트 AI'의 전문 경영 컨설턴트입니다.
        소상공인 사장님들을 위해 POS 데이터를 분석하고, 재고 최적화 및 매출 증대 방안을 제시합니다.
        현재 매장 상황: ${JSON.stringify(context)}
        항상 전문적이면서도 사장님의 입장을 공감하고 응원하는 따뜻한 태도로 답변하세요.
        한국어로 답변하세요.`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  },

  /** 7일간 매출 & 날씨 예보 (Flash Lite, JSON) */
  async predictWeeklyForecast(historicalData: unknown) {
    const today = new Date().toISOString().split("T")[0];
    const prompt = `
      당신은 소상공인 사장님을 돕는 AI 경영 컨설턴트입니다.
      최근 매출 데이터: ${JSON.stringify(historicalData)}

      앞으로 7일간의 가상의 날씨 예보와 그에 따른 예상 매출액을 예측해주세요.
      결과는 반드시 다음 JSON 형식의 배열로만 응답해주세요:
      [
        { "date": "YYYY-MM-DD", "weather": "맑음|흐림|비|눈", "temp": 숫자, "predictedSales": 숫자, "reason": "간략한 이유" }
      ]
      오늘 날짜는 ${today} 입니다. 내일부터 7일치를 생성하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              weather: { type: Type.STRING },
              temp: { type: Type.NUMBER },
              predictedSales: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ["date", "weather", "temp", "predictedSales", "reason"],
          },
        },
      },
    });

    try {
      return JSON.parse(response.text ?? "[]");
    } catch {
      return [];
    }
  },

  /** 페이스북 홍보 문구 생성 (Flash Lite) */
  async generateFacebookPost(
    storeData: unknown,
    fileData?: { data: string; mimeType: string },
    customTopic?: string
  ) {
    const prompt = `
      당신은 소상공인 사장님의 SNS 마케팅을 돕는 전문가입니다.
      매장 데이터: ${JSON.stringify(storeData)}

      ${customTopic ? `홍보 주제: ${customTopic}` : ""}
      ${fileData ? "첨부된 사진/동영상의 내용을 분석하여 그에 어울리는 페이스북 홍보 문구를 작성해주세요." : "매장의 최근 인기 메뉴나 긍정적인 지표를 활용해 홍보글을 작성해주세요."}

      페이스북에 올릴 친근하고 매력적인 홍보 문구를 작성해주세요.
      이모지를 적절히 섞어주시고, 해시태그도 3-5개 포함해주세요.
      문구만 응답해주세요.
    `;

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [{ text: prompt }];
    if (fileData) {
      parts.push({ inlineData: { data: fileData.data, mimeType: fileData.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts }],
    });

    return response.text;
  },

  /** 범용 텍스트 생성 (Flash Lite) */
  async generateText(prompt: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text;
  },
};
