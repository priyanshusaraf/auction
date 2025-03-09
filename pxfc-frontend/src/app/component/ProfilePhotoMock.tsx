// components/ProfilePhotoMock.tsx
import React, { useMemo } from "react";

interface ProfilePhotoMockProps {
  name: string;
  size?: number;
  className?: string;
}

export default function ProfilePhotoMock({
  name,
  size = 48,
  className = "",
}: ProfilePhotoMockProps) {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  const bgColor = useMemo(() => {
    // Generate a deterministic color based on name
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];

    // Simple hash function for strings
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
