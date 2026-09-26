"use client";

import { useRef, useState } from "react";
import { getDb, isDatabaseReady, type User } from "@/domain";
import { useDatabaseVersion } from "@/hooks/useDatabase";
import { useCountUp } from "@/hooks/useCountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ButtonLink, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { homeFor, routes } from "@/lib/routes";
import { ThreeCanvas } from "@/three/ThreeCanvas";
import { createHeroScene } from "@/three/scenes/HeroScene";
import { HeroNav } from "./Navs";
import { scrollToSection, useParallax } from "./useLandingScroll";

const rise = (delay: number) => ({ animationDelay: `${delay}ms` });

function Stat({ value, label, active }: { value: number; label: string; active: boolean }) {
  const shown = useCountUp(value, 0, active);
  return (
    <div className="border-ondark/14 pr-[18px] not-last:mr-[18px] not-last:border-r lg:pr-9 lg:not-last:mr-9">
      <div className="font-display text-[26px] leading-[1.1] font-semibold text-lime lg:text-[34px]">{shown}+</div>
      <small className="text-[13px] text-[#9fb2a6]">{label}</small>
    </div>
  );
}

/** Ilustrasi cadangan bila WebGL tidak tersedia. */
function HillsFallback() {
  return (
    <svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" className="block size-full">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4E7B0" />
          <stop offset=".55" stopColor="#CFE5D3" />
          <stop offset="1" stopColor="#B5D5C0" />
        </linearGradient>
      </defs>
      <rect width="400" height="480" fill="url(#hero-sky)" />
      <circle cx="292" cy="96" r="38" fill="#FBF1C4" />
      <path d="M0 250 Q90 190 190 240 T400 220 V480 H0Z" fill="#8DB89D" />
      <path d="M0 300 Q120 240 230 290 T400 275 V480 H0Z" fill="#5F9376" />
      <path d="M0 355 Q100 305 210 345 T400 335 V480 H0Z" fill="#3F6B54" />
      <path d="M0 410 Q140 370 260 405 T400 395 V480 H0Z" fill="#22432F" />
      <g>
        <rect x="86" y="292" width="34" height="22" fill="#E3B28F" />
        <path d="M80 292 L103 272 L126 292Z" fill="#C0583A" />
        <rect x="232" y="318" width="40" height="26" fill="#EBC9A8" />
        <path d="M226 318 L252 294 L278 318Z" fill="#B24B31" />
      </g>
    </svg>
  );
}

export function Hero({ me }: { me: User | null }) {
  useDatabaseVersion();
  const reduced = useReducedMotion();
  const [noGL, setNoGL] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const floatA = useRef<HTMLDivElement>(null);
  const floatB = useRef<HTMLDivElement>(null);
  useParallax(textRef, 0.12, reduced);
  useParallax(floatA, -0.05, reduced);
  useParallax(floatB, -0.09, reduced);

  const ready = isDatabaseReady();
  const db = ready ? getDb() : null;
  const stats = {
    desa: db ? db.users.filter((u) => u.role === "desa" && u.verified === "approved").length : 0,
    univ: db ? db.users.filter((u) => u.role === "univ" && u.verified === "approved").length : 0,
    collab: db ? db.partnerships.filter((p) => p.status === "matched").length : 0,
  };

  return (
    <div className="bg-hero relative flex min-h-svh flex-col overflow-hidden px-5 pt-5 pb-8 text-ondark lg:px-[max(56px,calc((100vw-1240px)/2))] lg:pb-14">
      <div aria-hidden className="bg-dots-fade pointer-events-none absolute inset-0" />
      <HeroNav me={me} />

      <div className="relative mt-6 grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div ref={textRef} className="relative z-2">
          <span className="mb-[22px] inline-flex animate-rise items-center gap-2 rounded-full border border-lime/28 bg-lime/12 px-3.5 py-1.5 text-xs font-semibold text-lime" style={rise(100)}>
            <Icon name="sparkles" /> Platform KKN Desa & Universitas
          </span>
          <h1 className="animate-rise font-display text-[42px] leading-[1.05] font-semibold tracking-[-0.02em] wrap-anywhere lg:text-[64px]" style={rise(250)}>
            Dari Desa,
            <br />
            Untuk <em className="text-lime italic">Masa Depan</em>
          </h1>
          <p className="mt-[22px] max-w-[490px] animate-rise text-[16.5px] leading-[1.65] text-[#c9d4cc]" style={rise(400)}>
            Platform yang menghubungkan desa yang memiliki kebutuhan dengan universitas dan tim mahasiswa yang memiliki
            kompetensi untuk membantu, berdasarkan kebutuhan, permasalahan, dan keahlian.
          </p>
          <div className="mt-6 flex animate-rise flex-wrap gap-2.5" style={rise(550)}>
            {me ? (
              <ButtonLink href={homeFor(me.role)} variant="lime" size="lg">
                Buka dasbor <Icon name="arrow-right" />
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href={routes.register} variant="lime" size="lg" className="animate-glow motion-reduce:animate-none">
                  Mulai sekarang <Icon name="arrow-right" />
                </ButtonLink>
                <button
                  type="button"
                  onClick={() => scrollToSection("how")}
                  className="inline-flex items-center justify-center rounded-full border border-[#6e8a79] px-[26px] py-[13px] text-sm font-semibold text-ondark transition hover:bg-forest-800"
                >
                  Pelajari lebih lanjut
                </button>
              </>
            )}
          </div>
          <div className="mt-11 flex animate-rise flex-wrap gap-y-3.5 border-t border-ondark/14 pt-6" style={rise(700)}>
            <Stat value={stats.desa} label="Desa terdaftar" active={ready} />
            <Stat value={stats.univ} label="Universitas" active={ready} />
            <Stat value={stats.collab} label="Kolaborasi" active={ready} />
          </div>
        </div>

        <div className="relative h-[340px] animate-rise lg:h-[clamp(440px,68vh,640px)]" style={rise(150)}>
          <div aria-hidden className="pointer-events-none absolute -inset-x-[10%] -inset-y-[6%] bg-[radial-gradient(closest-side,rgba(216,236,110,0.16),transparent_72%)]" />
          {noGL ? (
            <div className="absolute inset-[16px_0_0_28px] overflow-hidden rounded-[220px_32px_220px_32px] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
              <HillsFallback />
            </div>
          ) : (
            <ThreeCanvas
              create={createHeroScene}
              onUnavailable={() => setNoGL(true)}
              className="pointer-events-none absolute -inset-x-[30px] -inset-y-5 z-0 lg:-inset-x-[300px] lg:-inset-y-[60px]"
            />
          )}
          <div
            ref={floatA}
            className={cn(
              "absolute bottom-6 left-0 z-2 flex animate-bob items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_36px_rgba(0,0,0,0.28)] motion-reduce:animate-none lg:-left-6 lg:bottom-24",
            )}
          >
            <span className="flex size-[34px] items-center justify-center rounded-full bg-leaf-100 text-base text-leaf-700">
              <Icon name="home-heart" />
            </span>
            <div>
              <div className="text-xs font-semibold">Perbaikan irigasi desa</div>
              <div className="text-[11px] text-muted">Butuh: Teknik Sipil, Pertanian</div>
            </div>
          </div>
          <div
            ref={floatB}
            className="absolute top-14 right-0 z-2 flex animate-bob items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_36px_rgba(0,0,0,0.28)] [animation-delay:-2s] motion-reduce:animate-none lg:right-3.5"
          >
            <Icon name="heart-handshake" className="text-2xl text-leaf-500" />
            <div>
              <div className="text-xs font-semibold">Aktif</div>
              <div className="text-[11px] text-muted">Desa ⇄ Universitas</div>
            </div>
          </div>
          <div className="absolute right-[-6px] bottom-16 z-2 hidden rounded-full bg-cream-50 px-[22px] py-2.5 font-display text-base font-semibold text-forest-900 shadow-[0_12px_28px_rgba(0,0,0,0.25)] lg:block">
            Solusi nyata untuk desa
          </div>
        </div>
      </div>
    </div>
  );
}
