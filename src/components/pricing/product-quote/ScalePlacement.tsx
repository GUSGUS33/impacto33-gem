import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
export default function ScalePlacement({ children }: { children: React.ReactNode }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => { setTarget(anchor.current?.closest('[data-quote-calculator]')?.querySelector('[data-quote-scale]') || null); }, []);
  return <><span ref={anchor}/>{target && createPortal(children, target)}</>;
}
