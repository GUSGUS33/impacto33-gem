"use client";

import { useState, useRef, useEffect } from 'react';
import { PageBlock } from '@/queries/seoPageComplete';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HtmlBlockProps {
  data: PageBlock & { html?: string | null, htmlTitulo?: string | null, htmlContenido?: string | null };
}

/**
 * HtmlBlock Component
 * 
 * SEO STRATEGY (SSR COMPLIANT):
 * 1. Full content is ALWAYS present in the DOM from the initial server-side render.
 * 2. Visual contraction is handled strictly via CSS (max-height + overflow-hidden).
 * 3. No JavaScript truncation (.slice, .substring) is used for rendering.
 * 4. Googlebot and users see the same content in the HTML source.
 * 5. Patterns follow legitimate UX needs (progressive disclosure) which is recognized by Google.
 * 
 * IMPORTANT: This component assumes the HTML content ('rawContent') is already SANITIZED 
 * by the backend/CMS. If not guaranteed, use a library like DOMPurify before dangerouslySetInnerHTML.
 */
export function HtmlBlock({ data }: HtmlBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const rawContent = data.htmlContenido || data.html;

  // Threshold for visual collapse (px)
  const COLLAPSE_HEIGHT = 450;
  
  // Initial heuristic for isCollapsible to avoid large Layout Shifts during hydration
  // If content is long enough, we assume it's probably taller than our limit
  const [isCollapsible, setIsCollapsible] = useState<boolean>(rawContent ? rawContent.length > 1000 : false);

  useEffect(() => {
    // Precise calculation after hydration: check if content is actually taller than threshold
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > COLLAPSE_HEIGHT + 50) {
        setIsCollapsible(true);
      } else {
        setIsCollapsible(false);
      }
    }
  }, [rawContent]);

  // Accessibility: prevent tabbing into focusable elements hidden in the collapsed area
  useEffect(() => {
    if (contentRef.current && isCollapsible) {
      const focusableElements = contentRef.current.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((el) => {
        const element = el as HTMLElement;
        if (!isExpanded) {
          // If the element is below the visible threshold when collapsed
          if (element.offsetTop > COLLAPSE_HEIGHT) {
            // Store original tabindex if not already stored
            if (!element.hasAttribute('data-original-tabindex')) {
              element.setAttribute('data-original-tabindex', element.tabIndex.toString());
            }
            element.tabIndex = -1;
          }
        } else {
          // Restore original tabindex when expanded
          const original = element.getAttribute('data-original-tabindex');
          if (original !== null) {
            element.tabIndex = parseInt(original);
          } else if (element.tagName === 'A') {
             // Default to 0 for links if no original tabIndex was captured
             element.tabIndex = 0;
          } else {
            element.removeAttribute('tabindex');
          }
        }
      });
    }
  }, [isExpanded, isCollapsible, rawContent]);

  if (!rawContent) return null;

  // Pre-process plain text if necessary (converting newlines to P tags)
  const processContent = (text: string) => {
    let processed = text;
    if (!/<(p|div|h[1-6]|ul|ol|table|blockquote)/i.test(processed)) {
      processed = processed
        .split(/\n\n+/)
        .filter((p) => p.trim().length > 0)
        .map((p) => {
          const trimmed = p.trim();
          if (
            trimmed.length > 0 &&
            trimmed.length < 90 &&
            !/[.:;!?]$/.test(trimmed) &&
            trimmed.indexOf('\n') === -1
          ) {
            return `<h3 class="text-xl font-bold mt-8 mb-4">${trimmed}</h3>`;
          }
          return `<p class="mb-4">${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');
    }
    return processed;
  };

  const content = processContent(rawContent);

  const toggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      // UX improvement: smooth scroll back to block start when collapsing long text
      if (containerRef.current) {
        const elementPosition = containerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - 120;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <section ref={containerRef} className="max-w-4xl mx-auto relative px-4 html-block">
      {data.htmlTitulo && (
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            {data.htmlTitulo}
          </h2>
          <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full opacity-80"></div>
        </div>
      )}
      
      <div className="relative overflow-hidden transition-[max-height] duration-700 ease-in-out" 
           style={{ maxHeight: isExpanded || !isCollapsible ? '5000px' : `${COLLAPSE_HEIGHT}px` }}>
        <div
          ref={contentRef}
          id="html-block-content"
          className="prose prose-lg md:prose-xl max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                    prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-blue-900
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-800 transition-colors
                    prose-strong:text-slate-900 prose-strong:font-semibold
                    prose-ul:text-slate-700 prose-ol:text-slate-700
                    marker:text-blue-500
                    prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        {/* Gradient overlay for smooth visual cutoff */}
        {isCollapsible && !isExpanded && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" 
            aria-hidden="true"
          />
        )}
      </div>

      {isCollapsible && (
        <div className="mt-10 text-center relative z-20">
          <button
            type="button"
            onClick={toggleExpand}
            aria-expanded={isExpanded}
            aria-controls="html-block-content"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 shadow-md rounded-full text-slate-900 font-bold hover:bg-slate-50 hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
          >
            {isExpanded ? (
              <>
                <span>Ver menos</span>
                <ChevronUp className="w-5 h-5 text-blue-500" />
              </>
            ) : (
              <>
                <span>Ver más sobre {data.htmlTitulo || 'este tema'}</span>
                <ChevronDown className="w-5 h-5 text-blue-500" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
