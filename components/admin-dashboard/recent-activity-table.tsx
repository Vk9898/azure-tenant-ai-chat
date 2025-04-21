"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  entityId: string;
  entityName: string;
  timestamp: Date;
}

interface RecentActivityTableProps {
  activities: RecentActivity[];
}

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                No recent activities found
              </td>
            </tr>
          ) : (
            activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link 
                    href={`/admin/chats/${activity.entityId}`}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    <MessageSquare size={16} />
                    <span className="truncate max-w-[200px]">
                      {activity.entityName || 'Unnamed chat'}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.userName || 'Unknown User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 