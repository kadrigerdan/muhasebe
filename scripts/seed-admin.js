const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envIcerik = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const satir of envIcerik.split('\n')) {
  const esitlik = satir.indexOf('=');
  if (esitlik > 0) {
    const k = satir.slice(0, esitlik).trim();
    const v = satir.slice(esitlik + 1).trim();
    env[k] = v;
  }
}

const pool = mariadb.createPool({
  host: env.DB_HOST || '127.0.0.1',
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  connectionLimit: 1,
});

async function main() {
  const conn = await pool.getConnection();
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query(
      `INSERT INTO kullanicilar (kullanici_adi, sifre_hash, ad_soyad, rol)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE sifre_hash = VALUES(sifre_hash)`,
      ['admin', hash, 'Yönetici', 'admin']
    );
    console.log('');
    console.log('✓ Admin oluşturuldu');
    console.log('  Kullanıcı: admin');
    console.log('  Şifre:     admin123');
    console.log('');
    console.log('⚠️  Girişten sonra şifreyi değiştirin!');
    console.log('');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
});
