/** Cookie set by middleware when the server has no `OPENAI_API_KEY` (non-httpOnly for client checks). */
export const OPENAI_API_KEY_MISSING_COOKIE = "api_key_not_found";

export function isOpenAiApiKeyConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
