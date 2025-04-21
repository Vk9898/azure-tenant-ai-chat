"use client";

import { useEffect, useState } from "react";
import { UsersTable, User as UsersTableUser } from "@/components/admin-dashboard/users-table";
import { GetAllUsers, User as AdminServiceUser } from "@/components/admin-dashboard/admin-services/admin-service";
import { redirect } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState<UsersTableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const fetchedUsers = await GetAllUsers();
        // Map the users from admin-service format to users-table format
        const mappedUsers: UsersTableUser[] = fetchedUsers.map(user => ({
          userId: user.id,
          userName: user.name || 'Unknown',
          chatCount: user.chatCount,
          messageCount: user.messageCount,
          lastActive: user.lastActive ? new Date(user.lastActive) : new Date()
        }));
        setUsers(mappedUsers);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </div>
  );
} 