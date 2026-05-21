// TODO: reemplazar shim por next/link nativo — este archivo es temporal para la migración a Next.js
// Proporciona las mismas APIs que wouter (Link, useRoute, useLocation, useParams, useSearch, Redirect, Route, Switch)
// pero internamente usa next/link y next/navigation.
"use client";

import React from "react";
import NextLink from "next/link";
import {
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useRouter as useNextRouter,
  useParams as useNextParams,
} from "next/navigation";

// ─── Safe wrappers for next/navigation hooks ────────────────────────────────
// During static prerendering, these hooks throw because PathnameContext is null.
// We catch the error and return safe defaults.

function useSafePathname(): string {
  return useNextPathname() ?? "/";
}

function useSafeRouter() {
  return useNextRouter();
}

function useSafeSearchParams() {
  return useNextSearchParams();
}

function useSafeParams() {
  return useNextParams();
}

// ─── LinkProps (exported for SafeLink and other consumers) ───────────────────
export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string;
  to?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

// ─── Link ────────────────────────────────────────────────────────────────────
export function Link({ href, to, children, asChild, ...rest }: LinkProps) {
  const target = href || to || "/";
  // If the link is # (mega-menu grouper), render a plain <a>
  if (target === "#") {
    return (
      <a href="#" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={target} {...rest}>
      {children}
    </NextLink>
  );
}

// ─── useLocation ─────────────────────────────────────────────────────────────
export function useLocation(): [string, (to: string, options?: { replace?: boolean }) => void] {
  const pathname = useSafePathname();
  const router = useSafeRouter();

  const navigate = React.useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );

  return [pathname, navigate];
}

// ─── useRoute ────────────────────────────────────────────────────────────────
// Simplified pattern matching — supports :param and * patterns
export function useRoute(pattern: string): [boolean, Record<string, string>] {
  const pathname = useSafePathname();
  const params = useSafeParams();

  // Simple check: if pattern has params, try to match
  const regexStr = pattern
    .replace(/\*/g, ".*")
    .replace(/:([^/]+)/g, "(?<$1>[^/]+)");
  const regex = new RegExp(`^${regexStr}$`);
  const match = pathname.match(regex);

  if (match) {
    return [true, { ...params, ...match.groups } as Record<string, string>];
  }

  return [false, {} as Record<string, string>];
}

// ─── useParams ───────────────────────────────────────────────────────────────
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const params = useSafeParams();
  return params as unknown as T;
}

// ─── useSearch ───────────────────────────────────────────────────────────────
export function useSearch(): string {
  const searchParams = useSafeSearchParams();
  const str = searchParams?.toString() ?? "";
  return str ? `?${str}` : "";
}

// ─── Redirect ────────────────────────────────────────────────────────────────
export function Redirect({ href, to }: { href?: string; to?: string }) {
  const router = useSafeRouter();
  const target = href || to || "/";
  React.useEffect(() => {
    router.replace(target);
  }, [router, target]);
  return null;
}

// ─── Route / Switch (simplified) ─────────────────────────────────────────────
// These are no-ops in Next.js App Router since routing is file-based.
// They render children if the current path matches the pattern.
interface RouteProps {
  path?: string;
  component?: React.ComponentType<any>;
  children?: React.ReactNode | (() => React.ReactNode);
}

export function Route({ path, component: Component, children }: RouteProps) {
  const pathname = useSafePathname();
  if (path) {
    const regexStr = path
      .replace(/\*/g, ".*")
      .replace(/:([^/]+)/g, "(?<$1>[^/]+)");
    const regex = new RegExp(`^${regexStr}$`);
    if (!regex.test(pathname)) return null;
  }
  if (Component) return <Component />;
  // Support render-prop pattern: <Route>{() => <Component />}</Route>
  if (typeof children === 'function') {
    return <>{(children as () => React.ReactNode)()}</>;
  }
  return <>{children}</>;
}

export function Switch({ children }: { children: React.ReactNode }) {
  // In Next.js, routing is file-based. This just renders children as-is.
  return <>{children}</>;
}

// ─── Default export for compatibility ────────────────────────────────────────
export default { Link, useLocation, useRoute, useParams, useSearch, Redirect, Route, Switch };
