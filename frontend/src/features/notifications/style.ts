import type { NotificationType } from "@/domain";
import type { Tone } from "@/components/ui/tone";

/** Ikon dan warna per jenis notifikasi. */
export const NOTIFICATION_STYLE: Record<NotificationType, { icon: string; tone: Tone }> = {
  partnership: { icon: "heart-handshake", tone: "green" },
  agreement: { icon: "file-check", tone: "blue" },
  deadline: { icon: "clock", tone: "amber" },
  status: { icon: "circle-check", tone: "purple" },
  reject: { icon: "circle-x", tone: "red" },
  expire: { icon: "hourglass-empty", tone: "gray" },
  system: { icon: "bell", tone: "gray" },
};
