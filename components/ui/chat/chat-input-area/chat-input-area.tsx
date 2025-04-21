"use client";

import React from "react";
import { LoadingIndicator } from "../../loading";

interface ChatInputAreaProps {
  status?: string;
}

export const ChatInputForm = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> & ChatInputAreaProps
>(({ status, ...props }, ref) => (
  <div className="absolute bottom-0 w-full py-2 pb-safe" data-slot="chat-input-wrapper">
    <div className="container max-w-3xl flex flex-col gap-2">
      <ChatInputStatus status={status} />
      <div className="backdrop-blur-xl bg-background/70 rounded-xs overflow-hidden focus-within:border-primary border-2 border-border shadow-xs" data-slot="chat-input-container">
        <form ref={ref} className="p-[2px]" {...props}>
          {props.children}
        </form>
      </div>
    </div>
  </div>
));
ChatInputForm.displayName = "ChatInputArea";

export const ChatInputStatus = (props: { status?: string }) => {
  if (props.status === undefined || props.status === "") return null;
  return (
    <div className="flex justify-center" data-slot="chat-input-status-wrapper">
      <div className="border-2 border-border bg-background p-2 px-5 rounded-xs flex gap-2 items-center text-sm shadow-xs" data-slot="chat-input-status">
        <LoadingIndicator isLoading={true} /> {props.status}
      </div>
    </div>
  );
};

export const ChatInputActionArea = (props: { children?: React.ReactNode }) => {
  return <div className="flex justify-between p-2" data-slot="chat-input-action-area">{props.children}</div>;
};

export const ChatInputPrimaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex" data-slot="chat-input-primary-actions">{props.children}</div>;
};

export const ChatInputSecondaryActionArea = (props: {
  children?: React.ReactNode;
}) => {
  return <div className="flex" data-slot="chat-input-secondary-actions">{props.children}</div>;
};
