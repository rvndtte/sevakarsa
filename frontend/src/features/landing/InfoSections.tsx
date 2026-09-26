"use client";

import Link from "next/link";
import { Icon, IconBox } from "@/components/ui";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { FAQS, IMPACTS, PERKS, SDGS } from "./content";
import { Reveal, SpotlightCard, SplitHeading } from "./motion";
import { Section } from "./Section";

export function ImpactSection() {
  return (
    <Section id="impact" kicker="Dampak" glow="lime">
      <SplitHeading>Selaras dengan Tujuan Pembangunan Berkelanjutan</SplitHeading>
      <Reveal delay={160}>
        <p className="max-w-[620px] text-[15px] text-[#a9bbaf]">
          SevaKarsa berkontribusi pada agenda SDGs melalui kolaborasi desa dan perguruan tinggi.
        </p>
      </Reveal>
      <div className="mt-6 grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {SDGS.map((sdg, i) => (
          <Reveal key={sdg.no} variant="zoom" delay={i * 110}>
            <SpotlightCard
              className="flex items-start gap-3.5 border-l-4 p-4 transition hover:-translate-y-1 hover:shadow-[0_14px_34px_color-mix(in_srgb,var(--c)_35%,transparent)]"
              style={{ borderLeftColor: sdg.color, ["--c" as string]: sdg.color }}
            >
              <div className="flex size-[46px] flex-none items-center justify-center rounded-[10px] font-display text-2xl font-bold text-white" style={{ background: sdg.color }}>
                {sdg.no}
              </div>
              <div>
                <div className="font-semibold">SDG {sdg.no} · {sdg.title}</div>
                <p className="mt-0.5 text-xs text-[#a9bbaf]">{sdg.text}</p>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <h3 className="mt-8 font-display text-2xl font-semibold">Dampak yang diharapkan</h3>
      </Reveal>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {IMPACTS.map((item, i) => (
          <Reveal key={item.title} variant="zoom" delay={i * 110}>
            <SpotlightCard className="group p-[22px] transition hover:-translate-y-[5px] hover:border-lime/40 hover:shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
              <IconBox icon={item.icon} tone="green" className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-[8deg]" />
              <h3 className="mt-3.5 mb-1.5 font-display text-[17px] leading-tight font-semibold">{item.title}</h3>
              <p className="text-xs text-[#a9bbaf]">{item.text}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function PerkCard({ icon, tone, title, items, index }: { icon: string; tone: "green" | "blue"; title: string; items: string[]; index: number }) {
  return (
    <Reveal variant={index % 2 ? "right" : "left"}>
      <SpotlightCard className="p-7 transition hover:-translate-y-[5px] hover:border-lime/40 hover:shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
        <div className="mb-[18px] flex items-center gap-3.5">
          <IconBox icon={icon} tone={tone} />
          <h3 className="font-display text-[22px] font-semibold">{title}</h3>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Icon name="circle-check-filled" className="mt-px text-lg text-lime" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

export function BenefitSection() {
  return (
    <Section id="benefit" kicker="Manfaat" glow="blue">
      <SplitHeading>Manfaat untuk semua pihak</SplitHeading>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PerkCard icon="home-heart" tone="green" title="Untuk desa" items={PERKS.desa} index={0} />
        <PerkCard icon="building-community" tone="blue" title="Untuk universitas" items={PERKS.univ} index={1} />
      </div>
    </Section>
  );
}

export function FaqSection() {
  return (
    <Section id="faq" kicker="FAQ" glow="green">
      <SplitHeading>Pertanyaan umum</SplitHeading>
      <div className="mt-6 flex flex-col gap-2">
        {FAQS.map((faq, i) => (
          <Reveal key={faq.q} delay={i * 110}>
            <SpotlightCard className="group p-3.5 open:border-lime/50" >
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 font-semibold text-ondark [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <Icon name="chevron-down" className="text-lime transition-transform group-has-open:rotate-180" />
                </summary>
                <p className={cn("mt-2 animate-fade text-[#a9bbaf]")}>{faq.a}</p>
              </details>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function CtaAndFooter() {
  return (
    <>
      <Reveal className="mx-5 mt-14 mb-5 flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-lime px-6 py-8 lg:mt-[88px] lg:px-14 lg:py-[52px]">
        <div>
          <h2 className="font-display text-[28px] font-semibold text-forest-950 lg:text-4xl">Siap berkolaborasi?</h2>
          <p className="mt-1.5 text-[#2a3b18]">
            Bergabung sebagai desa atau universitas, atau coba dulu lewat panel demo di pojok kanan bawah.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href={routes.register} className="inline-flex items-center rounded-full bg-forest-900 px-[26px] py-[13px] text-sm font-semibold text-ondark transition hover:bg-forest-700">
            Daftar sebagai desa
          </Link>
          <Link href={routes.register} className="inline-flex items-center rounded-full border border-forest-900 px-[26px] py-[13px] text-sm font-semibold text-forest-900 transition hover:bg-forest-900/8">
            Daftar sebagai universitas
          </Link>
        </div>
      </Reveal>
      <Reveal className="px-7 pt-9 pb-11 text-center text-[#9fb2a6]">
        <Link href={routes.home} className="inline-flex items-center gap-2 font-display text-xl font-semibold text-ondark">
          <Icon name="leaf" className="text-lime" /> SevaKarsa
        </Link>
        <div className="mt-2 text-xs">Prototipe demo · data tersimpan di browser Anda, tanpa server</div>
      </Reveal>
    </>
  );
}
