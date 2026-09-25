/** URL for an R2 object key, served same-origin by the Pages Function at /media/*. */
export function media(key: string) {
  if (/^https?:\/\//.test(key)) return key;
  return `/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}
