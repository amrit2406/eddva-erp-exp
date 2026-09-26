// Eyebrow + title that introduces a group of bento cards; spans the full grid row.
export default function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="lg:col-span-12 pt-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}
