#!/bin/bash
# Muhasebe — Otomatik Yedekleme
# Her gece 03:00'te çalışır (cron ile)

set -e

PROJE_DIR="/home/kadri/Desktop/muhasebe"
BACKUP_DIR="$PROJE_DIR/database/backups"

# .env.local'dan DB bilgilerini oku
ENV_FILE="$PROJE_DIR/.env.local"
DB_HOST=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d'=' -f2)
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d'=' -f2)
DB_PASS=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2)
DB_NAME=$(grep "^DB_DATABASE=" "$ENV_FILE" | cut -d'=' -f2)

# Klasörü oluştur
mkdir -p "$BACKUP_DIR"

# Tarih damgası
TARIH=$(date +%Y%m%d_%H%M%S)
DOSYA="muhasebe_oto_${TARIH}.sql"
TAM_YOL="$BACKUP_DIR/$DOSYA"

# Yedek al
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Yedek başlıyor: $DOSYA"

if mariadb-dump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$TAM_YOL" 2>/dev/null; then
  BOYUT=$(du -h "$TAM_YOL" | cut -f1)
  echo "✓ Yedek alındı: $DOSYA ($BOYUT)"
else
  echo "✗ HATA: Yedek alınamadı!"
  rm -f "$TAM_YOL"
  exit 1
fi

# 30 günden eski otomatik yedekleri sil
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Eski yedekler temizleniyor (30 gün)..."
SILINEN=$(find "$BACKUP_DIR" -name "muhasebe_oto_*.sql" -mtime +30 -print -delete | wc -l)
echo "✓ $SILINEN eski yedek silindi"

# Toplam yedek sayısı ve disk kullanımı
TOPLAM=$(ls -1 "$BACKUP_DIR"/muhasebe_*.sql 2>/dev/null | wc -l)
DISK=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "📊 Toplam yedek: $TOPLAM adet, Disk: $DISK"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Bitti"
echo "---"

exit 0
