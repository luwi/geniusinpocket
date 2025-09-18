import { generateText, type GenerateTextResult } from "@vercel/ai";

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";

export async function queryModel(prompt: string, model: string = DEFAULT_MODEL): Promise<GenerateTextResult> {
  const endpoint = process.env.AI_WORKER_URL;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!endpoint || !apiToken) {
    throw new Error("Missing Cloudflare AI credentials (AI_WORKER_URL / CLOUDFLARE_API_TOKEN).");
  }

  return generateText({
    model,
    prompt,
    provider: {
      type: "fetch",
      url: endpoint,
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    }
  });
}
