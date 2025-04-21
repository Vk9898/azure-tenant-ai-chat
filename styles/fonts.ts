import { Inter } from "next/font/google";
import localFont from "next/font/local";

// Define Inter font from Google Fonts
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Define Cal Sans font locally
// This will be used for both 'cal' and 'title' variants in Tailwind config
export const cal = localFont({
  src: "./CalSans-SemiBold.otf",
  variable: "--font-cal", // Used for font-cal
  weight: "600",
  display: "swap",
});

// Define a separate variable specifically for the title font, using the same source
// This ensures clarity in the Tailwind config if needed, though it uses the same font file.
export const calTitle = localFont({
  src: "./CalSans-SemiBold.otf",
  variable: "--font-title", // Used for font-title
  weight: "600",
  display: "swap",
});

// Note: Lora and Work_Sans were removed as they conflicted with --font-title.
// If they are needed elsewhere, assign them unique CSS variable names.

// The fontMapper is likely unused but kept for reference if needed later.
export const fontMapper = {
  "font-cal": cal.variable,
  "font-title": calTitle.variable, // Using the dedicated title variable
} as Record<string, string>;