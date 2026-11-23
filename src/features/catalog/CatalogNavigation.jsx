import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Pagination du catalogue ───────────────────────────────────────────────────
export const PAGE_SIZE = 12;

export function Pagination({ page, count, total, onChange }) {
  if (count <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const btn = (active, disabled) => ({
    minWidth: 40,
    height: 40,
    padding: "0 10px",
    borderRadius: 6,
    border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
    background: active ? "var(--gold)" : "var(--surf)",
    color: active ? "#fff" : "var(--text)",
    fontFamily: "var(--fb)",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background .15s, border-color .15s",
  });
  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        marginTop: 28,
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          aria-label="Page précédente"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          style={btn(false, page === 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
            style={btn(n === page, false)}
          >
            {n}
          </button>
        ))}
        <button
          aria-label="Page suivante"
          disabled={page === count}
          onClick={() => onChange(page + 1)}
          style={btn(false, page === count)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        {from}–{to} sur {total} parfums
      </div>
    </nav>
  );
}

// ── Carrousel horizontal (anciens stocks) ─────────────────────────────────────
export function Carousel({ items, perView, gap, resetKey, label, renderItem }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [first, setFirst] = useState(0);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth / perView;
    setFirst(Math.round(el.scrollLeft / step));
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, [perView]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, resetKey, items.length]);

  const slide = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth + gap), behavior: "smooth" });
  };

  const arrow = (disabled) => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "var(--surf)",
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "opacity .2s, border-color .2s",
    flexShrink: 0,
  });

  const last = Math.min(first + perView, items.length);

  return (
    <section aria-label={label} aria-roledescription="carrousel">
      <div
        ref={trackRef}
        className="carousel-track"
        tabIndex={0}
        style={{
          display: "flex",
          gap,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          padding: "6px 0",
        }}
      >
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              flex: `0 0 calc((100% - ${gap * (perView - 1)}px) / ${perView})`,
              scrollSnapAlign: "start",
              display: "flex",
              minWidth: 0,
            }}
          >
            <div style={{ width: "100%", minWidth: 0 }}>{renderItem(it)}</div>
          </div>
        ))}
      </div>
      {items.length > perView && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginTop: 18,
          }}
        >
          <button
            aria-label="Parfums précédents"
            disabled={atStart}
            onClick={() => slide(-1)}
            style={arrow(atStart)}
          >
            <ChevronLeft size={18} />
          </button>
          <span
            aria-live="polite"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              minWidth: 110,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {first + 1}–{last} sur {items.length} parfums
          </span>
          <button
            aria-label="Parfums suivants"
            disabled={atEnd}
            onClick={() => slide(1)}
            style={arrow(atEnd)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
