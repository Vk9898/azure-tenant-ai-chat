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
// Changed outer div position to relative, removed py-2
>(({ status, className, ...props }, ref) => (
  <div className={cn("w-full", className)} data-slot="chat-input-form-wrapper"> {/* Removed absolute, bottom-0, py-2 */}
    {/* Container and status remain the same, but layout handled by parent flex */}
    <div className="flex flex-col gap-2">
       <ChatInputStatus status={status} />
       {/* Input container styling remains */}
       <div className="backdrop-blur-xl bg-background/70 rounded-xs overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary border-2 border-border shadow-xs" data-slot="chat-input-inner-container">
         {/* Form padding remains */}
         <form ref={ref} className="p-[2px]" {...props}>
           {props.children}
         </form>
       </div>
     </div>
  </div>
));
ChatInputForm.displayName = "ChatInputForm"; // Updated display name


export const ChatInputStatus = (props: { status?: string }) => {
  if (props.status === undefined || props.status === "") return null;
  return (
    <div className="flex justify-center" data-slot="chat-input-status-wrapper">
      <div className="border-2 border-border bg-background p-2 px-5 rounded-xs flex gap-2 items-center text-sm shadow-xs" data-slot="chat-input-status">
        <LoadingIndicator isLoading={true} size={16}/> {props.status} {/* Added size */}
      </div>
    </div>
  );
};

// Action area styling remains the same
export const ChatInputActionArea = (props: { children?: React.ReactNode }) => {
  return <div className="flex justify-between items-center p-2" data-slot="chat-input-action-area">{props.children}</div>; // Added items-center
};

export const ChatInputPrimaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1" data-slot="chat-input-primary-actions">{props.children}</div>; // Added items-center and gap
};

export const ChatInputSecondaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex items-center gap-1" data-slot="chat-input-secondary-actions">{props.children}</div>; // Added items-center and gap
};