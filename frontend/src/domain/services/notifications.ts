import { commit, getDb } from "../database";

export function markRead(id: string): void {
  const notification = getDb().notifs.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    commit();
  }
}

export function markAllRead(userId: string): void {
  getDb()
    .notifs.filter((n) => n.userId === userId)
    .forEach((n) => (n.read = true));
  commit();
}
