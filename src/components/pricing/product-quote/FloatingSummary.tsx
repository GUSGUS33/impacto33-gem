import { useEffect, useRef, useState } from "react";
import { formatEuroPrice } from "@/services/pricingService";
import styles from "./calculator.module.css";

// View-only observer. Prices are supplied by Summary, never recalculated here.
export default function FloatingSummary({
  quantity,
  minimum,
  total,
  unit,
}: {
  quantity: number;
  minimum: number;
  total: number;
  unit: number;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const step = anchor.current?.closest<HTMLElement>('[data-quote-step="5"]');
    const panel = anchor.current?.closest<HTMLElement>(
      "[data-quote-calculator]"
    );
    if (!step || !panel) return;
    const intersecting = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? intersecting.add(entry.target) : intersecting.delete(entry.target));
      setVisible(intersecting.size === 0);
    });
    observer.observe(step);
    const delivery = panel.querySelector('[data-quote-step="4"]');
    if (delivery) observer.observe(delivery);
    const measure = () => {
      const rect = panel.getBoundingClientRect();
      setBounds({ left: rect.left, width: rect.width });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(panel);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  useEffect(() => {
    const panel = anchor.current?.closest<HTMLElement>(
      "[data-quote-calculator]"
    );
    if (!panel || !bar.current || !visible || quantity <= 0) return;
    const measure = () =>
      panel.style.setProperty(
        "--quote-bar-height",
        `${bar.current?.getBoundingClientRect().height || 0}px`
      );
    const resize = new ResizeObserver(measure);
    resize.observe(bar.current);
    measure();
    return () => {
      resize.disconnect();
      panel.style.removeProperty("--quote-bar-height");
    };
  }, [visible, quantity]);
  return (
    <>
      <span ref={anchor} />
      {visible && quantity > 0 && (
        <div
          ref={bar}
          className={`${styles.mobileBar} ${styles.floatingBar}`}
          data-product-quote-bar
          aria-label="Resumen flotante del presupuesto"
          style={
            {
              "--quote-left": `${bounds.left}px`,
              "--quote-width": `${bounds.width}px`,
            } as React.CSSProperties
          }
        >
          <div aria-live="polite" aria-atomic="true">
            {quantity < minimum ? (
              <strong>
                {quantity} uds · Faltan {minimum - quantity} para el mínimo
              </strong>
            ) : (
              <>
                <strong>
                  {quantity} uds · {formatEuroPrice(total)} IVA incluido
                </strong>
                <span> · {formatEuroPrice(unit)}/ud sin IVA</span>
              </>
            )}
          </div>
          <button
            type="button"
            className={styles.cta}
            onClick={() =>
              anchor.current
                ?.closest('[data-quote-step="5"]')
                ?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches
                    ? "auto"
                    : "smooth",
                  block: "start",
                })
            }
          >
            Ver presupuesto
          </button>
        </div>
      )}
    </>
  );
}
