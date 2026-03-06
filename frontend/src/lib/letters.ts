import { apiRequest } from "@/lib/api";

export interface Letter {
  id: string;
  title: string;
  body: string;
  sentDate: string;
  deliveryDate: string;
  isLocked: boolean;
  recipientPhone?: string;
  recipientName?: string;
  status: "sent" | "delivered";
}

interface ApiUserRef {
  _id: string;
  name?: string;
  phone?: string;
}

interface ApiLetter {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  deliveryDate: string;
  isDelivered: boolean;
  isRead: boolean;
  recipient?: ApiUserRef;
  sender?: ApiUserRef;
}

function mapApiLetter(letter: ApiLetter): Letter {
  return {
    id: letter._id,
    title: letter.title,
    body: letter.message,
    sentDate: letter.createdAt,
    deliveryDate: letter.deliveryDate,
    isLocked: !letter.isDelivered,
    recipientPhone: letter.recipient?.phone,
    recipientName: letter.recipient?.name,
    status: letter.isDelivered ? "delivered" : "sent",
  };
}

export function calculateProgress(sentDate: string, deliveryDate: string): number {
  const now = new Date();
  const sent = new Date(sentDate);
  const delivery = new Date(deliveryDate);
  const total = delivery.getTime() - sent.getTime();
  const elapsed = now.getTime() - sent.getTime();
  if (total <= 0) return 1;
  return Math.min(Math.max(elapsed / total, 0), 1);
}

export function isDelivered(deliveryDate: string): boolean {
  return new Date() >= new Date(deliveryDate);
}

export function getCountdownText(deliveryDate: string): string {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  const diffMs = delivery.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Delivering today";
  if (days === 1) return "Delivers tomorrow";
  return `Delivers in ${days} days`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getSentLetters(): Promise<Letter[]> {
  const data = await apiRequest<ApiLetter[]>("/api/letters/sent");
  return data
    .map(mapApiLetter)
    .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
}

export async function getReceivedLetters(): Promise<Letter[]> {
  const data = await apiRequest<ApiLetter[]>("/api/letters/received");
  return data.map((letter) => {
    const mapped = mapApiLetter(letter);
    return {
      ...mapped,
      recipientName: letter.sender?.name,
      recipientPhone: letter.sender?.phone,
      status: isDelivered(mapped.deliveryDate) ? "delivered" : "sent",
    };
  });
}

export async function createLetter(payload: {
  title: string;
  body: string;
  deliveryDate: string;
  recipientPhone?: string;
}): Promise<Letter> {
  const response = await apiRequest<ApiLetter>("/api/letters", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      message: payload.body,
      deliveryDate: payload.deliveryDate,
      recipientPhone: payload.recipientPhone,
    }),
  });

  return mapApiLetter(response);
}

export async function getLetterById(id: string): Promise<Letter> {
  const response = await apiRequest<ApiLetter>(`/api/letters/${id}`);
  const mapped = mapApiLetter(response);

  if (response.recipient?.name || response.sender?.name) {
    return {
      ...mapped,
      recipientName: response.recipient?.name || response.sender?.name,
      recipientPhone: response.recipient?.phone || response.sender?.phone,
    };
  }

  return mapped;
}

export async function deleteLetter(id: string): Promise<void> {
  await apiRequest(`/api/letters/${id}`, { method: "DELETE" });
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiRequest<ApiLetter[]>("/api/letters/received");
  return data.filter((letter) => !letter.isRead).length;
}
