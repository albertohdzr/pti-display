// services/notifications.ts
import { admindb } from "@/lib/firebaseAdmin";
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/types/notifications";

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  async createNotification(
    teamId: string,
    type: NotificationType,
    data: {
      title: string;
      message: string;
      priority: NotificationPriority;
      recipients: string[];
      metadata?: Record<string, any>;
      expiresIn?: number; // en minutos
    },
  ): Promise<string> {
    const notificationRef = admindb
      .collection("teams")
      .doc(teamId)
      .collection("notifications")
      .doc();

    const notification: Omit<Notification, "id"> = {
      teamId,
      type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      recipients: data.recipients,
      read: data.recipients.reduce(
        (acc, userId) => ({
          ...acc,
          [userId]: false,
        }),
        {},
      ),
      metadata: data.metadata,
      createdAt: new Date(),
      expiresAt: data.expiresIn
        ? new Date(Date.now() + data.expiresIn * 60000)
        : null,
    };

    await notificationRef.set(notification);

    // Enviar notificaciones por email si es alta prioridad
    if (data.priority === NotificationPriority.HIGH) {
      await this.sendEmailNotifications(notification);
    }

    return notificationRef.id;
  }

  private async sendEmailNotifications(notification: Omit<Notification, "id">) {
    // Implementar lógica de envío de emails
    // Puedes usar servicios como SendGrid, Mailgun, etc.
  }

  async markAsRead(
    teamId: string,
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notificationRef = admindb
      .collection("teams")
      .doc(teamId)
      .collection("notifications")
      .doc(notificationId);

    await notificationRef.update({
      [`read.${userId}`]: true,
    });
  }
}
