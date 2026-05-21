"use client";
import { useContext } from 'react';
import { NotificationContext, NotificationType } from '@/context/NotificationContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'info':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      default:
        return null;
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const notify = (
    type: NotificationType,
    message: string,
    duration: number = 5000
  ) => {
    const IconComponent = getIcon(type);
    const iconColor = getIconColor(type);

    return context.addNotification({
      type,
      message,
      icon: IconComponent || undefined,
      iconClassName: `w-5 h-5 ${iconColor}`,
      duration,
    });
  };

  return {
    success: (message: string, duration?: number) => notify('success', message, duration),
    info: (message: string, duration?: number) => notify('info', message, duration),
    warning: (message: string, duration?: number) => notify('warning', message, duration),
    error: (message: string, duration?: number) => notify('error', message, duration),
    notify,
    addNotification: context.addNotification,
    removeNotification: context.removeNotification,
    clearAll: context.clearAll,
  };
};
