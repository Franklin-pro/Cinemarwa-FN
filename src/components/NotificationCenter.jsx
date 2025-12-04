import React from "react";
import { Bell, Film, Heart, MessageSquare, Calendar } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "new_release",
    title: "New Movie Release!",
    message: "‘The Lost Kingdom’ is now available to stream.",
    icon: <Film className="text-blue-500 w-6 h-6" />,
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "recommendation",
    title: "Recommended for You",
    message: "We think you’ll love ‘Dream City’ — based on your watch history.",
    icon: <Heart className="text-pink-500 w-6 h-6" />,
    time: "Yesterday",
  },
  {
    id: 3,
    type: "comment",
    title: "New Comment on Your Review",
    message: "User @MovieFan replied to your review of ‘Echoes of Time’.",
    icon: <MessageSquare className="text-blue-500 w-6 h-6" />,
    time: "1 day ago",
  },
  {
    id: 4,
    type: "reminder",
    title: "Reminder",
    message: "‘Starlight’ premieres this Friday. Add it to your watchlist!",
    icon: <Calendar className="text-blue-500 w-6 h-6" />,
    time: "3 days ago",
  },
];

export default function NotificationCenter() {
  return (
    <div className="min-h-screen from-gray-950 via-gray-900 to-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Notification Center</h1>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-4 bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200"
            >
              <div>{n.icon}</div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{n.title}</h2>
                <p className="text-gray-300 text-sm">{n.message}</p>
                <p className="text-gray-500 text-xs mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <Bell className="w-10 h-10 mx-auto mb-3" />
            <p>No notifications yet. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
