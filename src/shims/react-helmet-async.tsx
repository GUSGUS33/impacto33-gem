// TODO: reemplazar shim por generateMetadata nativo de Next.js
"use client";

import React from "react";

interface HelmetProps {
  children?: React.ReactNode;
}

export function Helmet({ children }: HelmetProps) {
  // We can't use next/head in the App Router without potentially crashing the next build in weird ways.
  // The correct fix is to migrate to generateMetadata.
  // For now we will return null or just the children (which won't go into <head> but fixes build).
  return null;
}

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default { Helmet, HelmetProvider };

