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
  isSelected?: boolean; // Keep isSelected for potential future use
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export const ChatGroup = (props: Props) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(props.group?.title || props.title);
  const isSelected = props.isSelected || false; // Keep isSelected flag

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (props.onRename && props.group && newTitle.trim() !== '' && newTitle !== props.group.title) {
      props.onRename(props.group.id, newTitle);
    }
    setIsRenaming(false);
  };

  const handleCancel = () => {
    setNewTitle(props.group?.title || props.title);
    setIsRenaming(false);
  };

  const handleDeleteAll = () => {
    // Add confirmation for deleting a group
    if (props.onDelete && props.group && window.confirm(`Are you sure you want to delete the group "${props.title}"?`)) {
      props.onDelete(props.group.id);
    }
  };

  const showGroupActions = !!props.group && !!props.onRename && !!props.onDelete; // Only show if group and handlers are provided

  return (
    <div className="flex flex-col" data-slot="chat-group">
      {/* Header styling: DS text size, color, weight, padding */}
      <div className="text-sm text-muted-foreground font-bold p-2 px-3 flex justify-between items-center" data-slot="chat-group-header">
         <span>{props.title}</span>
         {/* Group Actions Dropdown */}
         {showGroupActions && (
            <div data-slot="chat-group-actions" className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 rounded-xs ds-touch-target"
                    aria-label="Chat group menu"
                    onClick={(e) => e.stopPropagation()} // Prevent group click
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => setIsRenaming(true)} className="gap-2 text-sm">
                    <PencilIcon className="h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteAll} className="gap-2 text-sm text-destructive focus:bg-destructive focus:text-destructive-foreground">
                    <Trash2Icon className="h-4 w-4" />
                    <span>Delete Group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
         )}
      </div>
       {/* Rename Input - uses DS Input styles */}
       {isRenaming && props.group && (
          <div className="px-2 pb-2">
            <Input
              ref={inputRef}
              value={newTitle}
              className="h-9 px-2 py-1 text-sm rounded-xs border-2 ds-focus-ring" // Use DS Input styles
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                else if (e.key === "Escape") handleCancel();
              }}
              onBlur={handleSave} // Save on blur
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevent group click
            />
          </div>
        )}
      {/* Chat Items Container */}
      <div className="flex flex-col gap-1">{props.children}</div>
    </div>
  );
};