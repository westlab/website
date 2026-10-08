// YouTube の各種URL形式から動画ID（11文字）を取り出す。取れなければ null。
const ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeId(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | undefined;
  if (host === "youtu.be") {
    id = u.pathname.split("/")[1];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") {
      id = u.searchParams.get("v") ?? undefined;
    } else {
      const [, kind, value] = u.pathname.split("/");
      if (["embed", "shorts", "live"].includes(kind)) id = value;
    }
  }
  return id && ID.test(id) ? id : null;
}
