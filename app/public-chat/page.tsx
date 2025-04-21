import { PublicChatPage } from "@/components/public-chat/public-chat-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Chat Demo",
  description: "Try out our AI chat assistant without signing in"
};

export default function PublicChatRoute() {
  return <PublicChatPage />;
} 