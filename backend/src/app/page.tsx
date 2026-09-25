import styles from "./page.module.css";

const features = [
  "Next.js API Routes untuk autentikasi dan CRUD backend",
  "Supabase private dengan RLS dan service-role hanya di server",
  "Schema PostgreSQL siap dipakai untuk desa, universitas, kebutuhan, dan kerja sama",
  "Struktur modul siap dikembangkan ke landing page, admin, desa, dan univ",
];

const endpoints = [
  { label: "Health", url: "/api/health" },
  { label: "Profile", url: "/api/profile" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.badge}>Sevakarsa Backend</div>
        <h1>Private backend layer untuk platform Sevakarsa.</h1>
        <p>
          Projek ini berfungsi sebagai server-side API, autentikasi, dan integrasi
          dengan Supabase untuk arsitektur desa, universitas, admin, serta kerja
          sama program sosial.
        </p>

        <div className={styles.actions}>
          <a href="/api/health" className={styles.primary}>Cek Health API</a>
          <a href="/api/profile" className={styles.secondary}>Coba Endpoint Profile</a>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Fitur utama</h2>
          <ul>
            {features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h2>Endpoint</h2>
          <ul>
            {endpoints.map((endpoint) => (
              <li key={endpoint.label}>
                <span>{endpoint.label}</span>
                <code>{endpoint.url}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
