/** Map known failures to useful UI instructions; never display raw service errors. */
export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { credentials: "same-origin", ...init });
  } catch {
    throw new Error("Check your connection and try again.");
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: "Your session expired. Reload and try again.",
      404: "This post is no longer available.",
      429: "Too many attempts. Wait a minute, then try again.",
      503: "This action is temporarily unavailable. Try again later.",
    };
    throw new Error(
      messages[response.status] ?? "Couldn’t complete this action. Try again.",
    );
  }
  return (await response.json()) as T;
}
