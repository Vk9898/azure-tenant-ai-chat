"use client";

import React, { PropsWithChildren, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"; // Use DS Input

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
      <div className="text-sm text-muted-foreground font-bold p-3" data-slot="chat-group-header">{props.title}</div>
      <div className="flex flex-col gap-1">{props.children}</div>
      {showGroupActions && (
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2">
            {/* Removed selection indicator for simplicity, selection handled by item styling */}
            {isRenaming ? (
              <Input
                ref={inputRef}
                value={newTitle}
                // Applied DS input styles: h-8 for smaller height, rounded-xs, border-2
                className="h-8 px-2 py-1 text-sm rounded-xs border-2 ds-focus-ring"
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
                className={cn("line-clamp-1 text-sm px-2", { // Added padding for alignment
                  "font-semibold": isSelected,
                })}
              >
                {props.title}
              </span>
            )}
          </div>

          <div data-slot="chat-group-actions" className="flex items-center pr-2"> {/* Added padding */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 {/* Ensure Button uses DS styles (size, variant, rounded-xs, touch target) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 rounded-xs ds-touch-target"
                  aria-label="Chat group menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* DropdownMenuContent should inherit DS styles (border-2, rounded-xs, shadow-xs) */}
              <DropdownMenuContent align="end" className="rounded-xs border-2 shadow-xs">
                 {/* DropdownMenuItem should inherit DS styles (rounded-xs) */}
                <DropdownMenuItem onClick={() => setIsRenaming(true)} className="gap-2 rounded-xs">
                  <PencilIcon className="h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteAll} className="gap-2 rounded-xs">
                  <Trash2Icon className="h-4 w-4" />
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