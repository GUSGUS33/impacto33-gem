import React from 'react';
import { X } from 'lucide-react';
import { Notification, NotificationType } from '@/context/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const getBackgroundColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

const getTextColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'text-green-800';
    case 'info':
      return 'text-blue-800';
    case 'warning':
      return 'text-yellow-800';
    case 'error':
      return 'text-red-800';
    default:
      return 'text-slate-800';
  }
};

const getCloseButtonColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'text-green-600 hover:text-green-700 hover:bg-green-100';
    case 'info':
      return 'text-blue-600 hover:text-blue-700 hover:bg-blue-100';
    case 'warning':
      return 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100';
    case 'error':
      return 'text-red-600 hover:text-red-700 hover:bg-red-100';
    default:
      return 'text-slate-600 hover:text-slate-700 hover:bg-slate-100';
  }
};

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const IconComponent = notification.icon;

  return (
    <div
      className={`
        animate-in slide-in-from-top-8 fade-in duration-500 ease-out
        flex items-center gap-3 px-4 py-3 rounded-lg border
        ${getBackgroundColor(notification.type)}
        ${getTextColor(notification.type)}
        shadow-lg max-w-sm pointer-events-auto
      `}
      role="alert"
    >
      {IconComponent && (
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${notification.iconClassName}`} />
        </div>
      )}

      <p className="flex-1 text-sm font-medium">{notification.message}</p>

      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded transition-colors ${getCloseButtonColor(
          notification.type
        )}`}
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
