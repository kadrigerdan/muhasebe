/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: muhasebe
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `alis_fatura_detaylari`
--

DROP TABLE IF EXISTS `alis_fatura_detaylari`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alis_fatura_detaylari` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fatura_id` int(11) NOT NULL,
  `urun_id` int(11) NOT NULL,
  `miktar` int(11) NOT NULL DEFAULT 0,
  `birim_fiyat` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_alis_detay_fatura` (`fatura_id`),
  KEY `idx_alis_detay_urun` (`urun_id`),
  CONSTRAINT `fk_alis_detay_fatura` FOREIGN KEY (`fatura_id`) REFERENCES `alis_faturalar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alis_detay_urun` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alis_faturalar`
--

DROP TABLE IF EXISTS `alis_faturalar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alis_faturalar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cari_id` int(11) NOT NULL,
  `tarih` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_alis_cari` (`cari_id`),
  CONSTRAINT `fk_alis_cari` FOREIGN KEY (`cari_id`) REFERENCES `cariler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cariler`
--

DROP TABLE IF EXISTS `cariler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cariler` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unvan` varchar(255) DEFAULT NULL,
  `tip` enum('tedarikci','musteri','her_ikisi') NOT NULL DEFAULT 'her_ikisi',
  `telefon` varchar(20) DEFAULT NULL,
  `adres` text DEFAULT NULL,
  `vergi_no` varchar(20) DEFAULT NULL,
  `vergi_dairesi` varchar(100) DEFAULT NULL,
  `yetkili` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_unvan` (`unvan`),
  KEY `idx_tip` (`tip`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `musteriler_old`
--

DROP TABLE IF EXISTS `musteriler_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `musteriler_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unvan` varchar(255) NOT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `adres` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personel`
--

DROP TABLE IF EXISTS `personel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ad` varchar(100) NOT NULL,
  `soyad` varchar(100) NOT NULL,
  `tc_kimlik` varchar(11) DEFAULT NULL,
  `sgk_no` varchar(20) DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `adres` text DEFAULT NULL,
  `dogum_tarihi` date DEFAULT NULL,
  `egitim_durumu` enum('ilkokul','ortaokul','lise','onlisans','lisans','yuksek_lisans','doktora') DEFAULT NULL,
  `ehliyet_sinifi` varchar(10) DEFAULT NULL,
  `ehliyet_tarihi` date DEFAULT NULL,
  `ise_giris_tarihi` date NOT NULL,
  `isten_cikis_tarihi` date DEFAULT NULL,
  `gorev` varchar(100) DEFAULT NULL,
  `departman` varchar(100) DEFAULT NULL,
  `maas` decimal(12,2) NOT NULL DEFAULT 0.00,
  `banka_adi` varchar(100) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `notlar` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tc` (`tc_kimlik`),
  KEY `idx_aktif` (`aktif`),
  KEY `idx_departman` (`departman`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personel_odeme`
--

DROP TABLE IF EXISTS `personel_odeme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personel_odeme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `personel_id` int(11) NOT NULL,
  `odeme_tipi` enum('maas','avans','prim','ikramiye','kesinti','diger') NOT NULL DEFAULT 'maas',
  `tutar` decimal(12,2) NOT NULL,
  `tarih` date NOT NULL,
  `donem` varchar(7) DEFAULT NULL,
  `aciklama` varchar(255) DEFAULT NULL,
  `kasadan_dus` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_personel` (`personel_id`),
  KEY `idx_tarih` (`tarih`),
  KEY `idx_donem` (`donem`),
  CONSTRAINT `fk_odeme_personel` FOREIGN KEY (`personel_id`) REFERENCES `personel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `satis_fatura_detaylari`
--

DROP TABLE IF EXISTS `satis_fatura_detaylari`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `satis_fatura_detaylari` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fatura_id` int(11) NOT NULL,
  `urun_id` int(11) NOT NULL,
  `birim_fiyat` decimal(10,2) DEFAULT 0.00,
  `adet` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_satis_detay_fatura` (`fatura_id`),
  KEY `idx_satis_detay_urun` (`urun_id`),
  CONSTRAINT `fk_satis_detay_fatura` FOREIGN KEY (`fatura_id`) REFERENCES `satis_faturalar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_satis_detay_urun` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `satis_faturalar`
--

DROP TABLE IF EXISTS `satis_faturalar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `satis_faturalar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cari_id` int(11) NOT NULL,
  `tarih` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_satis_cari` (`cari_id`),
  CONSTRAINT `fk_satis_cari` FOREIGN KEY (`cari_id`) REFERENCES `cariler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stok_hareketleri`
--

DROP TABLE IF EXISTS `stok_hareketleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stok_hareketleri` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `urun_id` int(11) NOT NULL,
  `tip` enum('giris','cikis') NOT NULL,
  `miktar` int(11) NOT NULL,
  `aciklama` varchar(255) DEFAULT NULL,
  `kaynak` enum('alis_fatura','satis_fatura','manuel','iade','sayim') NOT NULL DEFAULT 'manuel',
  `kaynak_id` int(11) DEFAULT NULL,
  `tarih` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_urun` (`urun_id`),
  KEY `idx_tarih` (`tarih`),
  CONSTRAINT `1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tedarikciler_old`
--

DROP TABLE IF EXISTS `tedarikciler_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tedarikciler_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unvan` varchar(255) NOT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `adres` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `urunler`
--

DROP TABLE IF EXISTS `urunler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `urunler` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `urun_adi` varchar(255) NOT NULL,
  `kritik_seviye` int(11) DEFAULT 10,
  `varsayilan_alis_fiyati` decimal(10,2) DEFAULT 0.00,
  `varsayilan_satis_fiyati` decimal(10,2) DEFAULT 0.00,
  `durum` tinyint(1) DEFAULT 1,
  `stok` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_urun_adi` (`urun_adi`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-01 20:17:56
