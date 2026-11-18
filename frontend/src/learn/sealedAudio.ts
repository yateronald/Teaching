// Recordings that are not offered for download: the texts read aloud
// (public/learn/texts/*.dat) and the practice recordings (listening passages,
// mission documents: public/learn/audio/<key>.dat). They are stored scrambled,
// so the file on the server is not a playable mp3; the page downloads it, puts
// it back in order in memory and plays it from a blob: address. It is not copy
// protection, but there is no player menu offering "Download", no audio file to
// save and nothing for a download manager to catch.
//
// The same key as scripts/practice-audio.mjs and scripts/learn-media.mjs.
const KEY = new TextEncoder().encode('lfwn-lecture-2026');

export function unscramble(u: Uint8Array) {
  for (let i = 0; i < u.length; i++) u[i] ^= KEY[i % KEY.length] ^ (i & 0xff);
}

/** Recordings ready to play in this visit (blob: addresses), and the ones on their way. */
const ready = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

/** The blob: address of a recording already loaded, to start it straight from a tap. */
export const sealedReady = (src: string) => ready.get(src);

export function loadSealed(src: string): Promise<string> {
  const hit = ready.get(src);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(src);
  if (!p) {
    p = fetch(src)
      .then(r => { if (!r.ok) throw new Error(`audio ${r.status}`); return r.arrayBuffer(); })
      .then(buf => {
        const bytes = new Uint8Array(buf);
        unscramble(bytes);
        const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
        ready.set(src, url);
        return url;
      })
      .finally(() => pending.delete(src));
    pending.set(src, p);
  }
  return p;
}
