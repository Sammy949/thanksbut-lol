// Dynamic SVG favicon. A sharp-edged square in one solid colour drawn from a
// curated "archive ink" palette, with subtly jittered corners so each session /
// hard refresh feels a little different. No gradients, no text. Generated per
// request (force-dynamic + no-store).

export const dynamic = "force-dynamic";

const PALETTE = [
  "#b91c1c", // stamp red
  "#93000b", // deep oxblood
  "#d72638", // bright reject
  "#b20024", // archive red
  "#991b1b", // late-night red
  "#1a1c19", // ink
  "#5b403d", // umber
  "#ffb4ab", // salmon
  "#0e0e0e", // near-black
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Small ±1.5px corner jitter so the "square" reads as hand-cut paper.
function jitter(): number {
  return Math.round((Math.random() * 3 - 1.5) * 10) / 10;
}

export function GET() {
  const fill = pick(PALETTE);
  const lo = 5;
  const hi = 27;
  const corners = [
    [lo + jitter(), lo + jitter()],
    [hi + jitter(), lo + jitter()],
    [hi + jitter(), hi + jitter()],
    [lo + jitter(), hi + jitter()],
  ];
  const d =
    `M${corners[0][0]},${corners[0][1]} ` +
    `L${corners[1][0]},${corners[1][1]} ` +
    `L${corners[2][0]},${corners[2][1]} ` +
    `L${corners[3][0]},${corners[3][1]} Z`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="${d}" fill="${fill}"/></svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
