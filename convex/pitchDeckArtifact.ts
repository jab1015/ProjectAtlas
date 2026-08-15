import { buildInventSmithPptx, type PptxSlide } from "./pptxWriter";

function cleanInline(value: string) {
  return value
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function fallbackSlides(markdown: string, inventionTitle: string): PptxSlide[] {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((value) => cleanInline(value.replace(/\s*\n\s*/g, " ")))
    .filter(Boolean);

  const slides: PptxSlide[] = [
    {
      title: inventionTitle,
      subtitle: "Investor Pitch Deck",
      bullets: ["Prepared by InventSmith — The Inventor OS"],
      footer: "InventSmith • Modern Methods",
    },
  ];

  for (let index = 0; index < paragraphs.length && slides.length < 12; index += 1) {
    const paragraph = paragraphs[index];
    const sentenceParts = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
    slides.push({
      title: index === 0 ? "Opportunity" : `Pitch Brief ${index + 1}`,
      bullets: sentenceParts.slice(0, 7).map((item) => item.slice(0, 260)),
      footer: `${inventionTitle} • InventSmith`,
    });
  }

  return slides;
}

export function pitchDeckSlidesFromMarkdown(markdown: string, inventionTitle: string): PptxSlide[] {
  const lines = markdown.split(/\r?\n/);
  const sections: Array<{ title: string; bullets: string[] }> = [];
  let current: { title: string; bullets: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    if (current.title || current.bullets.length) sections.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flush();
      current = { title: cleanInline(heading[1]), bullets: [] };
      continue;
    }

    if (!current) current = { title: "Overview", bullets: [] };
    const bullet = line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
    const text = cleanInline(bullet ? bullet[1] : line);
    if (text) current.bullets.push(text.slice(0, 320));
  }
  flush();

  if (sections.length === 0) return fallbackSlides(markdown, inventionTitle);

  const contentSlides: PptxSlide[] = sections.slice(0, 15).map((section) => ({
    title: section.title || "Overview",
    bullets: section.bullets.slice(0, 8),
    footer: `${inventionTitle} • InventSmith`,
  }));

  const normalizedTitle = contentSlides[0]?.title.toLocaleLowerCase() ?? "";
  const hasTitleSlide = normalizedTitle.includes(inventionTitle.toLocaleLowerCase()) || normalizedTitle.includes("pitch");
  if (!hasTitleSlide) {
    contentSlides.unshift({
      title: inventionTitle,
      subtitle: "Investor Pitch Deck",
      bullets: ["Evidence-backed invention development package"],
      footer: "InventSmith • Modern Methods",
    });
  }

  return contentSlides.slice(0, 16);
}

export function buildPitchDeckArtifact(markdown: string, inventionTitle: string) {
  const slides = pitchDeckSlidesFromMarkdown(markdown, inventionTitle);
  const generated = buildInventSmithPptx(slides, {
    title: `${inventionTitle} — Investor Pitch Deck`,
    subject: "Evidence-backed inventor funding presentation",
    creator: "InventSmith — The Inventor OS • Modern Methods",
  });
  const concreteBytes = new Uint8Array(generated.length);
  concreteBytes.set(generated);
  return { bytes: concreteBytes.buffer, slideCount: slides.length };
}
