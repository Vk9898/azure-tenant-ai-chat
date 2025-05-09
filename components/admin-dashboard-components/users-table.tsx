"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

// Updated to match the data shape returned by GetTopActiveUsers
export interface User {
  userId: string;
  userName: string;
  chatCount: number;
  messageCount: number;
  lastActive: Date;
}

type SortField = "userName" | "chatCount" | "messageCount" | "lastActive";
type SortDirection = "asc" | "desc";

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>("lastActive");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "userName":
        comparison = a.userName.localeCompare(b.userName);
        break;
      case "chatCount":
        comparison = a.chatCount - b.chatCount;
        break;
      case "messageCount":
        comparison = a.messageCount - b.messageCount;
        break;
      case "lastActive":
        if (a.lastActive && b.lastActive) {
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
        } else if (a.lastActive) {
          comparison = 1;
        } else if (b.lastActive) {
          comparison = -1;
        }
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {sortField === field && (
          <span className="ml-2">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-xs">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="userName" label="Name" />
            <SortableHeader field="chatCount" label="Chats" />
            <SortableHeader field="messageCount" label="Messages" />
            <SortableHeader field="lastActive" label="Last Active" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            sortedUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.chatCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.messageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastActive 
                    ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) 
                    : "Never"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 