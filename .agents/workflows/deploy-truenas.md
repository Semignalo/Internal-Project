---
description: Deploy / update project to TrueNAS server via SSH
---

# 🐾 Pao Planner — Panduan Deploy & Update

> **Live URL**: https://paoplanner.starincofficial.id
> **Server**: TrueNAS @ 192.168.1.201
> **Stack**: Next.js (frontend) + NestJS (backend) + PostgreSQL + Cloudflare Tunnel

---

## ⚡ Update Cepat (Rutin)

Ini adalah alur kerja standar setiap kali ada perubahan kode.

### Di PC Lokal

```powershell
cd "c:\laragon\www\Internal Project Starinc"

# Stage semua perubahan
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: deskripsi perubahan"

# Push ke GitHub
git push
```

### Di TrueNAS (via SSH)

```powershell
# Buka SSH dari PowerShell
ssh truenas_admin@192.168.1.201
```

```bash
# Masuk ke folder project
cd "/mnt/STARINC_SERVER/Storage_STARINC/Local Project ( !! Jangan di apa-apa in !! )/starinc-internal"

# Pull kode terbaru
git pull

# Rebuild dan restart semua container
sudo docker compose down
sudo docker compose up -d --build

# Verifikasi semua container berjalan
sudo docker compose ps
```

✅ Selesai! Cek https://paoplanner.starincofficial.id

---

## 🚀 Setup Pertama Kali (One-Time)

Hanya perlu dilakukan sekali saat setup server baru.

### 1. Clone Repository

```bash
cd /mnt/STARINC_SERVER/Storage_STARINC/
git clone https://github.com/Semignalo/Internal-Project.git starinc-internal
cd starinc-internal
```

### 2. Buat File `.env`

```bash
# Buat file .env dengan Cloudflare Tunnel Token
# Token didapat dari: https://one.dash.cloudflare.com → Zero Trust → Networks → Tunnels
cat > .env << 'EOF'
CLOUDFLARE_TUNNEL_TOKEN=token_anda_disini
EOF
```

### 3. Jalankan Container Pertama Kali

```bash
sudo docker compose up -d --build
```

### 4. Verifikasi Tunnel Terhubung

```bash
sudo docker compose logs tunnel --follow
# Harus muncul: "INF Registered tunnel connection connIndex=0"
# Tekan Ctrl+C untuk keluar
```

---

## ☁️ Konfigurasi Cloudflare (One-Time)

### DNS Record (di Cloudflare Dashboard → starincofficial.id → DNS)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | paoplanner | `b5c8113d-6b1c-42c7-847a-878250e28839.cfargotunnel.com` | ☁️ ON |

> ⚠️ Jika ada A record lama yang pointing ke IP lokal (192.168.x.x), **delete dulu** sebelum tambah CNAME.

### Route Tunnel (di Cloudflare → Networking → Tunnels → pao-planner → Routes)

| Field | Value |
|-------|-------|
| Subdomain | `paoplanner` |
| Domain | `starincofficial.id` |
| Path | *(kosong)* |
| Service URL | `http://frontend:3000` |

---

## 🔍 Cek Status Container

```bash
# Lihat status semua container
sudo docker compose ps

# Output yang diharapkan (semua "Up"):
# NAME                 STATUS
# cloudflared-tunnel   Up
# starinc-backend      Up
# starinc-frontend     Up
# starinc-postgres     Up
```

---

## 🛠️ Troubleshooting

### Tunnel tidak terhubung
```bash
sudo docker compose logs tunnel --tail=30
# Cari baris "ERR" untuk melihat error spesifik

# Jika token expired, edit .env lalu restart tunnel:
nano .env
sudo docker compose restart tunnel
```

### Aplikasi error (500/crash)
```bash
sudo docker compose logs backend --tail=50
sudo docker compose logs frontend --tail=50
```

### Container mati sendiri
```bash
# Restart semua tanpa rebuild
sudo docker compose up -d

# Atau restart container tertentu
sudo docker compose restart backend
```

### Update schema database (setelah ada perubahan Prisma)
```bash
sudo docker compose exec backend npx prisma migrate deploy
```

### Reset database (⚠️ HATI-HATI: semua data hilang!)
```bash
sudo docker compose down -v   # hapus volume database
sudo docker compose up -d --build
sudo docker compose exec backend npx prisma migrate deploy
sudo docker compose exec backend npx prisma db seed
```

---

## 📁 Struktur Penting

```
starinc-internal/
├── docker-compose.yml     ← Konfigurasi semua container
├── .env                   ← Token Cloudflare (JANGAN di-commit!)
├── .env.example           ← Template .env (aman di-commit)
├── frontend/              ← Next.js app
├── backend/               ← NestJS API + Prisma
│   └── prisma/
│       └── schema.prisma  ← Skema database
└── .agents/
    └── workflows/
        └── deploy-truenas.md  ← File ini
```

---

## 💡 Catatan Penting

| Hal | Keterangan |
|-----|------------|
| **Database** | Data aman saat `docker compose down` — tersimpan di Docker volume `pgdata` |
| **Uploads** | File upload aman — tersimpan di volume `backend_uploads` |
| **Port** | DB (5432) & backend (5000) tidak terbuka ke internet — hanya lewat tunnel |
| **SSH** | Gunakan `truenas_admin`, bukan `root` |
| **sudo** | Semua perintah docker harus pakai `sudo` karena `truenas_admin` belum di grup docker |
| **Token** | Jika token Cloudflare bocor/expired, buat token baru di Cloudflare → Rotate token di halaman tunnel |
