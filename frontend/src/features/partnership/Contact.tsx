import { ButtonLink, Icon } from "@/components/ui";
import { waLink } from "@/lib/whatsapp";

interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
}

/** Tombol WhatsApp dengan pesan pembuka opsional. */
export function WhatsAppButton({
  phone,
  text,
  variant = "green",
}: {
  phone: string;
  text?: string;
  variant?: "green" | "outline";
}) {
  return (
    <ButtonLink href={waLink(phone, text)} external size="sm" variant={variant}>
      <Icon name="brand-whatsapp" /> Hubungi via WhatsApp
    </ButtonLink>
  );
}

/** Kontak lengkap (nama, telepon, email) dengan tombol hubungi. */
export function ContactRows({ contact, waText }: { contact: ContactInfo; waText?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Icon name="user" className="text-muted" /> {contact.name || "-"}
      </div>
      <div className="flex items-center gap-2.5">
        <Icon name="phone" className="text-muted" /> {contact.phone || "-"}
      </div>
      {contact.email && (
        <div className="flex items-center gap-2.5">
          <Icon name="mail" className="text-muted" /> {contact.email}
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2.5">
        {contact.phone && (
          <>
            <WhatsAppButton phone={contact.phone} text={waText} />
            <ButtonLink href={`tel:${contact.phone}`} external size="sm" variant="outline">
              <Icon name="phone" /> Telepon
            </ButtonLink>
          </>
        )}
        {contact.email && (
          <ButtonLink href={`mailto:${contact.email}`} external size="sm" variant="outline">
            <Icon name="mail" /> Email
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

/** Pengganti kontak saat masih terkunci sebelum desa menyetujui. */
export function LockedContactNote() {
  return (
    <div className="text-xs text-muted">
      <Icon name="lock" /> Kontak terbuka setelah desa menyetujui kerja sama.
    </div>
  );
}
