const email = 'node.session.' + Date.now() + '@example.com';
const password = 'Password123!';
let cookies = '';

async function req(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (cookies) headers.Cookie = cookies;
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const cookie = setCookie.split(';')[0];
    const key = cookie.split('=')[0];
    const existing = cookies.split('; ').find(v => v.startsWith(key + '='));
    if (existing) {
      cookies = cookies.replace(existing, cookie);
    } else {
      cookies = cookies ? cookies + '; ' + cookie : cookie;
    }
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

(async () => {
  const reg = await req('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      role: 'desa',
      nama: 'Node Session Desa',
      kota: 'Kab. Malang',
      provinsi: 'Jawa Timur',
      alamat: 'Jl. Node',
      nomor_hp: '0811111111',
    }),
  });

  const login = await req('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const me = await req('http://localhost:3000/api/auth/me');
  console.log(JSON.stringify({ register: reg, login: login, me: me }, null, 2));
})();
