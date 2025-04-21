"use client";

import React from "react";
import { LoadingIndicator } from "../../loading";
import { cn } from "@/lib/utils"; // Import cn

interface ChatInputAreaProps {
  status?: string;
}

export const ChatInputForm = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> & ChatInputAreaProps
>(({ status, className, ...props }, ref) => (
  // Wrapper div remains simple, layout handled by parent
  <div className={cn("w-full", className)} data-slot="chat-input-form-wrapper">
    <div className="flex flex-col gap-2">
      {/* Status remains above the input */}
      <ChatInputStatus status={status} />
      {/* Input container styling adhering to DS: rounded-xs, border-2, shadow-xs */}
      <div className="bg-background/80 backdrop-blur-md rounded-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary border-2 border-border shadow-xs" data-slot="chat-input-inner-container">
        {/* Form padding remains minimal */}
        <form ref={ref} className="p-[2px]" {...props}>
          {props.children}
        </form>
      </div>
    </div>
  </div>
));
ChatInputForm.displayName = "ChatInputForm";


export const ChatInputStatus = (props: { status?: string }) => {
  if (props.status === undefined || props.status === "") return null;
  return (
    // Status bubble styling adhering to DS: border-2, rounded-xs, shadow-xs
    <div className="flex justify-center" data-slot="chat-input-status-wrapper">
      <div className="border-2 border-border bg-background p-2 px-5 rounded-xs flex gap-2 items-center text-sm shadow-xs" data-slot="chat-input-status">
        <LoadingIndicator isLoading={true} size={16}/> {props.status} {/* Adjusted size */}
      </div>
    </div>
  );
};

// Action area uses flex, justify-between, items-center, and padding
export const ChatInputActionArea = (props: { children?: React.ReactNode }) => {
  return <div className="flex justify-between items-center p-2" data-slot="chat-input-action-area">{props.children}</div>; // Added items-center
};

// Primary actions use flex, items-center, and gap
export const ChatInputPrimaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1" data-slot="chat-input-primary-actions">{props.children}</div>; // Added items-center and gap
};

// Secondary actions use flex, items-center, and gap
export const ChatInputSecondaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1" data-slot="chat-input-secondary-actions">{props.children}</div>; // Added items-center and gap
};