export const aiProviders = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini"
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash"
  },
  mimo: {
    label: "MiMo",
    baseUrl: "https://api.mimo-v2.com/v1",
    model: "mimo-v2.5"
  }
};

export function defaultAiSettings() {
  return {
    provider: "openai",
    baseUrl: aiProviders.openai.baseUrl,
    model: aiProviders.openai.model,
    apiKey: ""
  };
}

export async function requestAiCompletion({ settings, system, prompt }) {
  if (!settings?.apiKey) {
    throw new Error("请先在设置里填写 AI API Key。");
  }

  const baseUrl = String(settings.baseUrl || "").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: system || "你是 MarkNote 的写作助手，请用简洁清楚的中文回答。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败：${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}
