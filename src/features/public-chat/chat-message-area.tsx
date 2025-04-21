"use client";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/features/ui/avatar";
import { Button } from "@/features/ui/button";

export interface PublicChatMessageAreaProps {
  children?: React.ReactNode;
  profilePicture?: string | null;
  profileName?: string;
  role: "user" | "assistant";
  onCopy: () => void;
  className?: string;
  "data-slot"?: string;
}

export const PublicChatMessageArea = ({
  children,
  profilePicture,
  profileName,
  role,
  onCopy,
  className,
  "data-slot": dataSlot = "chat-message",
  ...props
}: PublicChatMessageAreaProps) => {
  const [isIconChecked, setIsIconChecked] = useState(false);

  const handleButtonClick = () => {
    onCopy();
    setIsIconChecked(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIconChecked(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isIconChecked]);

  let profile = null;

  if (profilePicture) {
    profile = (
      <Avatar>
        <AvatarImage src={profilePicture} />
      </Avatar>
    );
  } else {
    profile = (
      <UserCircle
        size={28}
        strokeWidth={1.4}
        className="text-muted-foreground"
      />
    );
  }

  return (
    <div className={cn("flex flex-col p-4 sm:p-6", className)} data-slot={dataSlot} {...props}>
      <div className="h-7 flex items-center justify-between mb-2">
        <div className="flex gap-3 items-center">
          <div data-slot="chat-message-avatar">
            {profile}
          </div>
          <div
            className="text-primary capitalize font-bold"
            data-slot="chat-message-profile-name"
          >
            {profileName}
          </div>
        </div>
        <div className="h-7 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="icon"
              title="Copy text"
              className="rounded-xs min-h-10 min-w-10"
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
          {children}
        </div>
      </div>
    </div>
  );
}; 