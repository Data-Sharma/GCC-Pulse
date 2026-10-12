import "server-only";

type GrokResponse = {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function responseText(response: GrokResponse) {
  if (response.output_text) return response.output_text;
  return (response.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" || item.type === "text")
    .map((item) => item.text ?? "")
    .join("");
}

export async function generateGroundedChatAnswer(systemPrompt: string, userPrompt: string, requestId: string) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY is not configured.");
  const configuredBaseUrl = process.env.GROK_API_BASE_URL || "https://api.x.ai/v1";
  const baseUrl = new URL(configuredBaseUrl);
  if (baseUrl.protocol !== "https:") throw new Error("The Grok API base URL must use HTTPS.");
  const model = process.env.GROK_MODEL || "grok-4.7";
  const endpoint = new URL(`${baseUrl.pathname.replace(/\/+$/, "")}/responses`, baseUrl.origin);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "x-client-request-id": requestId,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 1800,
      temperature: 0.2,
      store: false,
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) {
    throw new Error(response.status === 429
      ? "Grok provider rate limit."
      : `Grok provider request failed with status ${response.status}.`);
  }
  const payload = await response.json() as GrokResponse;
  const content = responseText(payload);
  if (!content) throw new Error("Grok returned an empty response.");
  return {
    content,
    model,
    provider: "grok",
    providerRequestId: payload.id ?? response.headers.get("x-request-id"),
  };
}
