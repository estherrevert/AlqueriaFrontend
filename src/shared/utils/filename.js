export function filenameFromUrl(u) {
    try {
        const last = u.split("/").pop() || "";
        return decodeURIComponent(last.replace(/\?.*$/, ""));
    }
    catch {
        return u;
    }
}
