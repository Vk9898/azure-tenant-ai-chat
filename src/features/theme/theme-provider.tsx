"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";


export function ThemeProvider({ 
  children, 
  ...props 
}: React.PropsWithChildren<{
  attribute?: "class" | "data-theme";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
