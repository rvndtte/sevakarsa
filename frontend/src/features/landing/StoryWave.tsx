/** Transisi gelombang perbukitan di antara section story dan section berikutnya. */
export function StoryWave() {
  return (
    <div aria-hidden className="bg-wave relative -mt-px h-[150px] overflow-hidden lg:h-[260px]">
      <div className="absolute bottom-[-110px] left-1/2 -ml-[380px] h-[380px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(255,206,130,0.5),rgba(255,184,107,0.14)_55%,transparent_76%)]" />
      <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="absolute bottom-[-1px] left-0 block size-full">
        <g className="animate-drift motion-reduce:animate-none">
          <path d="M-40 120 C180 60 360 80 540 110 S900 150 1080 100 S1340 60 1500 90 V240 H-40Z" fill="#183B2A" />
        </g>
        <g className="animate-drift [animation-direction:alternate-reverse] [animation-duration:19s] motion-reduce:animate-none">
          <path d="M-40 150 C200 110 420 120 620 145 S1000 175 1200 140 S1400 118 1500 130 V240 H-40Z" fill="#1F5138" />
          <g fill="#0B1F16">
            <path d="M250 136l7-14 7 14z" />
            <path d="M262 138l9-18 9 18z" />
            <path d="M1010 158l8-16 8 16z" />
            <path d="M1026 160l7-13 7 13z" />
          </g>
        </g>
        <path d="M0 182 C240 150 480 160 720 178 S1160 196 1440 166 V240 H0Z" fill="#4C8C63" />
        <g>
          <rect x="640" y="164" width="26" height="15" fill="#F0DCC0" />
          <path d="M636 164l17-13 17 13z" fill="#C0583A" />
          <rect x="684" y="168" width="20" height="12" fill="#F0DCC0" />
          <path d="M680 168l14-11 14 11z" fill="#B24B31" />
          <rect x="1130" y="170" width="22" height="13" fill="#F0DCC0" />
          <path d="M1126 170l15-12 15 12z" fill="#C0583A" />
        </g>
        <g fill="#2C5A41">
          <path d="M560 178l8-16 8 16z" />
          <path d="M578 180l6-12 6 12z" />
          <path d="M780 182l8-17 8 17z" />
          <path d="M1220 176l8-16 8 16z" />
          <path d="M1240 178l6-12 6 12z" />
          <path d="M180 172l8-16 8 16z" />
        </g>
        <path d="M0 208 C300 188 620 198 940 204 S1320 194 1440 200 V240 H0Z" fill="#2A6B4A" />
        <path d="M0 226 C320 212 700 220 1040 224 S1360 216 1440 220 V240 H0Z" fill="#10291D" />
      </svg>
    </div>
  );
}
