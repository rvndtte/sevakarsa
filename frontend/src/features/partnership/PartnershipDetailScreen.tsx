"use client";

import { useParams } from "next/navigation";
import { getPartnership } from "@/domain";
import { useUser } from "@/components/layout/RoleOnly";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { routes } from "@/lib/routes";
import { PartnershipDetail } from "./PartnershipDetail";

export function PartnershipDetailScreen() {
  useDatabaseVersion();
  const me = useUser();
  const { id } = useParams<{ id: string }>();
  const ps = getPartnership(id);

  if (!ps || (ps.desaId !== me.id && ps.univId !== me.id)) {
    return (
      <>
        <PageHeader title="Kerja sama tidak ditemukan" />
        <Card>
          <EmptyState
            icon="mood-empty"
            action={<ButtonLink href={routes.partnerships} size="sm">Kembali</ButtonLink>}
          >
            Kerja sama tidak ditemukan atau bukan milik Anda.
          </EmptyState>
        </Card>
      </>
    );
  }
  return <PartnershipDetail key={ps.id} ps={ps} me={me} />;
}
