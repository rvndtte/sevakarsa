import type { ReactNode } from "react";
import type { User } from "@/domain";
import { Avatar, Card, Icon, Photo, StatusTag } from "@/components/ui";

/** Sampul + avatar + nama untuk halaman profil desa dan universitas. */
export function ProfileCover({ user, subtitle }: { user: User; subtitle: ReactNode }) {
  return (
    <Card padding="none">
      <Photo seed={user.id} className="h-[180px] w-full rounded-none" />
      <div className="-mt-[34px] flex items-end gap-3.5 px-6 pb-[22px]">
        <Avatar name={user.name} size="lg" variant={user.role === "univ" ? "univ" : "desa"} />
        <div className="mt-[34px]">
          <div className="font-display text-2xl font-semibold">{user.name}</div>
          <div className="text-xs text-muted">
            <Icon name="map-pin" /> {subtitle} · <StatusTag status="approved" />
          </div>
        </div>
      </div>
    </Card>
  );
}
