export const aiProviders = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5-mini"
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
  },
  kimi: {
    label: "Kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "kimi-k2.6"
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
  const body = {
    model: settings.model,
    messages: [
      { role: "system", content: system || "你是 MarkNote 的写作助手，请用简洁清楚的中文回答。" },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  };
  const send = (payload) => fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  let response = await send(body);
  if (!response.ok) {
    const data = await response.clone().json().catch(() => ({}));
    if (/temperature/i.test(String(data?.error?.message || ""))) {
      // Some models (Kimi K3, OpenAI reasoning models) only accept temperature=1.
      response = await send({ ...body, temperature: 1 });
    }
  }

  if (!response.ok) {
    throw new Error(`AI 请求失败：${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}
