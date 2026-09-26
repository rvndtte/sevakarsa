import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

/** Pengalih Masuk / Daftar berbentuk segmen. */
export function AuthTabs({ active }: { active: "login" | "register" }) {
  const item = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={cn("rounded-full px-6 py-2 font-semibold", on ? "bg-white text-ink" : "text-muted")}
    >
      {label}
    </Link>
  );
  return (
    <div className="inline-flex self-start rounded-full bg-[#e9e8df] p-1">
      {item(routes.login, "Masuk", active === "login")}
      {item(routes.register, "Daftar", active === "register")}
    </div>
  );
}
