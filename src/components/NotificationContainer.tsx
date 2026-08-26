"use client";
import React, { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';
import { Toast } from './Toast';

export const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none pt-4"
      aria-live="polite"
      aria-atomic="true"
      data-testid="notification-container"
    >
      <div className="flex flex-col gap-3 px-4 pointer-events-auto max-w-full sm:max-w-md">
        {context.notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={() => context.removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};
