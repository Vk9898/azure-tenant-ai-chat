"use client";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ClipboardIcon,
  PocketKnife,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../../avatar";
import { Button } from "../../button";

export const ChatMessageArea = (props: {
  children?: React.ReactNode;
  profilePicture?: string | null;
  profileName?: string;
  role: "function" | "user" | "assistant" | "system" | "tool";
  onCopy: () => void;
  className?: string;
  "data-slot"?: string;
}) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

  const handleButtonClick = () => {
    props.onCopy();
    setIsIconChecked(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIconChecked(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isIconChecked]);

  let profile = null;
  const userInitial = props.profileName?.charAt(0).toUpperCase() || "?";

  switch (props.role) {
    case "assistant":
      profile = (
          <Avatar className="size-7 border-2 border-border rounded-xs" data-slot="chat-avatar-assistant">
            <AvatarImage src={"/ai-icon.png"} alt="AI Avatar" className="rounded-xs"/>
            <AvatarFallback className="rounded-xs bg-muted text-muted-foreground font-bold text-xs">AI</AvatarFallback>
          </Avatar>
      );
      break;
    case "user":
      if (props.profilePicture) {
        profile = (
          <Avatar className="size-7 border-2 border-border rounded-xs" data-slot="chat-avatar-user">
            <AvatarImage src={props.profilePicture} alt={props.profileName || "User Avatar"} className="rounded-xs"/>
            <AvatarFallback className="rounded-xs bg-muted text-muted-foreground font-bold text-xs">{userInitial}</AvatarFallback>
          </Avatar>
        );
      } else {
         profile = (
          <Avatar className="size-7 border-2 border-border rounded-xs bg-muted flex items-center justify-center" data-slot="chat-avatar-user-fallback">
            <UserCircle
              size={16} // Slightly smaller icon inside avatar
              strokeWidth={1.8}
              className="text-muted-foreground"
            />
          </Avatar>
        );
      }
      break;
    case "tool":
    case "function":
       profile = (
        <Avatar className="size-7 border-2 border-border rounded-xs bg-muted flex items-center justify-center" data-slot="chat-avatar-tool">
          <PocketKnife
            size={16} // Slightly smaller icon inside avatar
            strokeWidth={1.8}
            className="text-muted-foreground"
          />
        </Avatar>
      );
      break;
    default:
      break;
  }

  return (
    // Added core DS styles: bg-card, border-2, shadow-xs, rounded-xs. Kept padding.
    <div className={cn(
        "flex flex-col p-4 sm:p-6 rounded-xs bg-card text-card-foreground border-2 border-border shadow-xs",
         props.className)}
         data-slot={props["data-slot"] || "chat-message"}
         >
      <div className="h-7 flex items-center justify-between mb-2">
        <div className="flex gap-3 items-center">
          <div data-slot="chat-message-avatar">
            {profile}
          </div>
          <div
            className={cn(
              "text-primary capitalize font-bold text-sm", // Consistent text-sm
              props.role === "function" || props.role === "tool"
                ? "text-muted-foreground font-medium" // Use medium weight for tools
                : ""
            )}
            data-slot="chat-message-profile-name"
          >
            {props.profileName}
          </div>
        </div>
        <div className="h-7 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="icon"
              title="Copy text"
              className="min-h-10 min-w-10" // Ensure touch target size
              onClick={handleButtonClick}
              data-slot="chat-message-copy-button"
            >
              {isIconChecked ? (
                <CheckIcon size={20} />
              ) : (
                <ClipboardIcon size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1 ps-10" data-slot="chat-message-content">
        <div className="prose prose-slate dark:prose-invert whitespace-break-spaces prose-p:leading-relaxed prose-pre:p-0 max-w-none">
          {props.children}
        </div>
      </div>
    </div>
  );
};