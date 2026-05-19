// Light client-side sanity checks for citizen-uploaded photographs.
// These are NOT a substitute for server-side identity verification — they
// only catch the obvious bad cases (blank canvas, all-black, single-colour
// fill, tiny screenshot) so the receiving PHI office doesn't get bombed
// with empty submissions.

export interface ImageSanityResult {
  ok: boolean;
  /** Citizen-facing reason if `ok` is false. */
  reason?: string;
  /** Diagnostics — useful in dev tools. */
  details: {
    width: number;
    height: number;
    avgBrightness: number; // 0–255
    variance: number;      // pixel variance
    edgeScore: number;     // crude edge-density score
  };
}

/** Decode a File into a downscaled canvas (~512px wide) and analyse it. */
export async function checkPhotoLooksReal(file: File): Promise<ImageSanityResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w = Math.min(512, img.naturalWidth);
        const scale = w / img.naturalWidth;
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(failure('Could not analyse the photo on this device.', { width: w, height: h, avgBrightness: 0, variance: 0, edgeScore: 0 })); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        let sum = 0;
        let sumSq = 0;
        const total = w * h;
        for (let i = 0; i < data.length; i += 4) {
          // Luminance approximation (Rec.601)
          const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          sum += lum;
          sumSq += lum * lum;
        }
        const avg = sum / total;
        const variance = sumSq / total - avg * avg;

        // Edge score: horizontal neighbour diff (crude but fast)
        let edge = 0;
        let edgeCount = 0;
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w - 1; x += 2) {
            const i = (y * w + x) * 4;
            const j = i + 4;
            const dr = Math.abs(data[i] - data[j]);
            const dg = Math.abs(data[i + 1] - data[j + 1]);
            const db = Math.abs(data[i + 2] - data[j + 2]);
            edge += dr + dg + db;
            edgeCount += 1;
          }
        }
        const edgeScore = edge / Math.max(1, edgeCount);

        URL.revokeObjectURL(url);

        const details = { width: w, height: h, avgBrightness: avg, variance, edgeScore };

        // Heuristics — tuned to catch the worst cases without rejecting
        // legitimate phone snaps. All thresholds picked from empirical NIC
        // captures.
        if (w < 200 || h < 100) {
          resolve(failure('That image is too small to read. Please retake at higher resolution.', details));
          return;
        }
        if (avg < 8) {
          resolve(failure('The photo is almost entirely black — please retake in better light.', details));
          return;
        }
        if (avg > 248) {
          resolve(failure('The photo looks overexposed (almost completely white). Please retake.', details));
          return;
        }
        if (variance < 40) {
          resolve(failure('The image looks blank or solid-colour — please retake an actual photo of the NIC card.', details));
          return;
        }
        if (edgeScore < 4) {
          resolve(failure('We could not detect text or edges in this photo. Make sure the NIC card fills most of the frame.', details));
          return;
        }
        resolve({ ok: true, details });
      } catch (err) {
        URL.revokeObjectURL(url);
        resolve({ ok: false, reason: `Could not analyse the photo: ${err instanceof Error ? err.message : String(err)}`, details: { width: 0, height: 0, avgBrightness: 0, variance: 0, edgeScore: 0 } });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, reason: 'That file does not look like a valid image.', details: { width: 0, height: 0, avgBrightness: 0, variance: 0, edgeScore: 0 } });
    };
    img.src = url;
  });
}

function failure(reason: string, details: ImageSanityResult['details']): ImageSanityResult {
  return { ok: false, reason, details };
}
