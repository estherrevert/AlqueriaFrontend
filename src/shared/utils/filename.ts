export function filenameFromUrl(u: string): string {
  try {
    const last = u.split("/").pop() || "";
    return decodeURIComponent(last.replace(/\?.*$/, ""));
  } catch {
    return u;
  }
}
