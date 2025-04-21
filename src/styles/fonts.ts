import { Inter, Lora, Work_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Use both paths for maximum compatibility
export const cal = localFont({
  src: [
    {
      path: "./CalSans-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/CalSans-SemiBold.otf", 
      weight: "600",
      style: "normal",
    }
  ],
  variable: "--font-cal",
  display: "swap",
});

export const calTitle = localFont({
  src: "./CalSans-SemiBold.otf",
  variable: "--font-title",
  weight: "600",
  display: "swap",
});

export const lora = Lora({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const work = Work_Sans({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontMapper = {
  "font-cal": calTitle.variable,
  "font-lora": lora.variable,
  "font-work": work.variable,
} as Record<string, string>;
