export type AlbumPalette = {
  primary: string;
  secondary: string;
  accent: string;
};

const DEFAULT_PALETTE: AlbumPalette = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
};

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function darken(hex: string, amount: number) {
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return rgbToHex(
    Math.floor(r * (1 - amount)),
    Math.floor(g * (1 - amount)),
    Math.floor(b * (1 - amount)),
  );
}

function saturate(hex: string, factor: number) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  r = Math.min(255, Math.floor(gray + (r - gray) * factor));
  g = Math.min(255, Math.floor(gray + (g - gray) * factor));
  b = Math.min(255, Math.floor(gray + (b - gray) * factor));

  return rgbToHex(r, g, b);
}

export async function extractPalette(imageUrl: string): Promise<AlbumPalette> {
  if (typeof window === "undefined") {
    return DEFAULT_PALETTE;
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(DEFAULT_PALETTE);
        return;
      }

      ctx.drawImage(image, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 128) continue;

        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        const brightness = (pr + pg + pb) / 3;

        if (brightness < 20 || brightness > 240) continue;

        r += pr;
        g += pg;
        b += pb;
        count++;
      }

      if (count === 0) {
        resolve(DEFAULT_PALETTE);
        return;
      }

      const primary = rgbToHex(
        Math.floor(r / count),
        Math.floor(g / count),
        Math.floor(b / count),
      );

      resolve({
        primary: darken(primary, 0.55),
        secondary: darken(saturate(primary, 1.3), 0.35),
        accent: saturate(primary, 1.6),
      });
    };

    image.onerror = () => resolve(DEFAULT_PALETTE);
    image.src = imageUrl;
  });
}

export { DEFAULT_PALETTE };
