"use client";

import React, { PropsWithChildren, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/features/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/features/ui/dropdown-menu";
import { Input } from "@/features/ui/input";

interface ChatGroupObject {
  id: string;
  title: string;
}

interface Props extends PropsWithChildren {
  title: string;
  group?: ChatGroupObject;
  isSelected?: boolean;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatGroup = (props: Props) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(props.group?.title || props.title);
  const isSelected = props.isSelected || false;
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (props.onRename && props.group && newTitle.trim() !== '') {
      props.onRename(props.group.id, newTitle);
    }
    setIsRenaming(false);
  };

  const handleCancel = () => {
    setNewTitle(props.group?.title || props.title);
    setIsRenaming(false);
  };

  const handleDeleteAll = () => {
    if (props.onDelete && props.group) {
      props.onDelete(props.group.id);
    }
  };

  // Don't show the group actions if no group is provided
  const showGroupActions = !!props.group;

  return (
    <div className="flex flex-col" data-slot="chat-group">
      <div className="text-sm text-muted-foreground p-3" data-slot="chat-group-header">{props.title}</div>
      <div>{props.children}</div>
      {showGroupActions && (
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            <div
              className={cn("w-2 h-2 rounded-xs", {
                "bg-blue-500": !isRenaming && isSelected,
                "bg-blue-400": !isRenaming && !isSelected,
              })}
              data-slot="selection-indicator"
            ></div>

            {isRenaming ? (
              <Input
                ref={inputRef}
                value={newTitle}
                className="h-8 px-2 py-1 text-sm"
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  } else if (e.key === "Escape") {
                    handleCancel();
                  }
                }}
                onBlur={handleSave}
                autoFocus
              />
            ) : (
              <span
                data-slot="chat-group-title"
                className={cn("line-clamp-1 text-sm", {
                  "font-semibold": isSelected,
                })}
              >
                {props.title}
              </span>
            )}
          </div>

          <div data-slot="chat-group-actions" className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-xs"
                  aria-label="Chat group menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xs">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteAll}>
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  <span>Delete All</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};
