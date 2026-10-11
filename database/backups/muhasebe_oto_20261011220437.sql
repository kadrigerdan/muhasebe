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
-- Table structure for table `adisyon_kalemleri`
--

DROP TABLE IF EXISTS `adisyon_kalemleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `adisyon_kalemleri` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adisyon_id` int(11) NOT NULL,
  `urun_id` int(11) NOT NULL,
  `adet` int(11) NOT NULL DEFAULT 1,
  `birim_fiyat` decimal(10,2) NOT NULL,
  `toplam` decimal(12,2) NOT NULL,
  `mutfak_durum` enum('secildi','bekliyor','hazir','servis') NOT NULL DEFAULT 'secildi',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_adisyon` (`adisyon_id`),
  KEY `idx_urun` (`urun_id`),
  KEY `idx_mutfak` (`mutfak_durum`),
  CONSTRAINT `fk_kalem_adisyon` FOREIGN KEY (`adisyon_id`) REFERENCES `adisyonlar` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kalem_urun` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adisyon_kalemleri`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `adisyon_kalemleri` WRITE;
/*!40000 ALTER TABLE `adisyon_kalemleri` DISABLE KEYS */;
INSERT INTO `adisyon_kalemleri` VALUES
(1,1,28,1,200.00,200.00,'bekliyor','2026-10-08 12:10:44'),
(2,1,50,1,20.00,20.00,'bekliyor','2026-10-08 12:10:47'),
(3,1,53,1,60.00,60.00,'bekliyor','2026-10-08 12:10:50'),
(4,1,52,1,10.00,10.00,'bekliyor','2026-10-08 12:10:57'),
(5,1,54,1,80.00,80.00,'bekliyor','2026-10-08 12:11:01'),
(6,2,28,1,200.00,200.00,'bekliyor','2026-10-08 12:15:36'),
(7,2,39,1,550.00,550.00,'bekliyor','2026-10-08 12:15:37'),
(8,2,46,1,180.00,180.00,'bekliyor','2026-10-08 12:15:39'),
(9,2,51,1,40.00,40.00,'bekliyor','2026-10-08 12:15:40'),
(10,3,50,1,20.00,20.00,'bekliyor','2026-10-08 12:17:28'),
(11,3,39,1,550.00,550.00,'bekliyor','2026-10-08 12:17:30'),
(12,3,41,1,80.00,80.00,'bekliyor','2026-10-08 12:17:33'),
(13,3,49,1,170.00,170.00,'bekliyor','2026-10-08 12:17:34'),
(16,4,28,1,200.00,200.00,'servis','2026-10-08 12:26:04'),
(17,4,28,1,200.00,200.00,'servis','2026-10-08 12:26:06'),
(18,4,41,1,80.00,80.00,'servis','2026-10-08 12:26:18'),
(19,5,28,1,200.00,200.00,'servis','2026-10-08 13:17:23'),
(20,5,39,1,550.00,550.00,'servis','2026-10-08 13:17:24'),
(21,5,42,1,100.00,100.00,'servis','2026-10-08 13:17:26'),
(22,5,52,1,10.00,10.00,'servis','2026-10-08 13:17:28'),
(23,5,50,1,20.00,20.00,'servis','2026-10-08 13:17:34'),
(24,6,28,1,200.00,200.00,'servis','2026-10-08 13:20:26'),
(25,6,50,1,20.00,20.00,'servis','2026-10-08 13:20:27'),
(26,6,36,1,320.00,320.00,'servis','2026-10-08 13:20:28'),
(27,6,53,1,60.00,60.00,'servis','2026-10-08 13:20:29'),
(28,7,28,1,200.00,200.00,'bekliyor','2026-10-08 13:56:31'),
(29,8,28,1,200.00,200.00,'bekliyor','2026-10-08 13:58:11'),
(30,9,28,1,200.00,200.00,'bekliyor','2026-10-08 14:04:51'),
(31,10,28,1,200.00,200.00,'bekliyor','2026-10-08 14:07:23'),
(32,11,50,1,20.00,20.00,'servis','2026-10-08 14:09:35'),
(33,11,28,1,200.00,200.00,'servis','2026-10-08 14:09:37'),
(34,12,44,1,140.00,140.00,'bekliyor','2026-10-08 14:54:04'),
(35,13,53,1,60.00,60.00,'bekliyor','2026-10-08 14:56:34'),
(36,13,50,1,20.00,20.00,'bekliyor','2026-10-08 14:56:34'),
(37,13,50,1,20.00,20.00,'bekliyor','2026-10-08 14:56:37'),
(38,13,53,1,60.00,60.00,'bekliyor','2026-10-08 14:56:39'),
(39,13,45,1,200.00,200.00,'bekliyor','2026-10-08 14:56:42'),
(40,13,41,1,80.00,80.00,'bekliyor','2026-10-08 14:56:42'),
(41,13,47,1,380.00,380.00,'bekliyor','2026-10-08 14:56:43'),
(42,13,38,1,380.00,380.00,'bekliyor','2026-10-08 14:56:43'),
(43,14,39,1,550.00,550.00,'servis','2026-10-08 14:57:31'),
(44,14,37,1,220.00,220.00,'servis','2026-10-08 14:57:40'),
(45,17,28,1,200.00,200.00,'servis','2026-10-09 07:33:01'),
(46,17,50,1,20.00,20.00,'servis','2026-10-09 07:36:54'),
(47,17,39,1,550.00,550.00,'servis','2026-10-09 07:43:36'),
(49,18,28,3,200.00,600.00,'servis','2026-10-09 08:55:18'),
(50,21,44,1,140.00,140.00,'bekliyor','2026-10-09 11:09:07'),
(51,22,48,1,150.00,150.00,'bekliyor','2026-10-09 11:09:33'),
(52,22,52,2,10.00,20.00,'bekliyor','2026-10-09 11:09:35'),
(53,22,54,2,80.00,160.00,'bekliyor','2026-10-09 11:09:37'),
(54,23,28,1,200.00,200.00,'servis','2026-10-09 12:53:01'),
(55,23,39,1,550.00,550.00,'servis','2026-10-09 12:53:01'),
(56,23,42,1,100.00,100.00,'servis','2026-10-09 12:53:02'),
(57,23,36,1,320.00,320.00,'servis','2026-10-09 12:53:04'),
(58,23,53,1,60.00,60.00,'servis','2026-10-09 12:53:05'),
(59,24,39,1,550.00,550.00,'servis','2026-10-09 12:55:25'),
(60,24,43,1,160.00,160.00,'servis','2026-10-09 12:55:26'),
(62,25,39,1,550.00,550.00,'servis','2026-10-09 16:07:03'),
(63,25,46,1,180.00,180.00,'servis','2026-10-09 16:07:04'),
(65,25,53,1,60.00,60.00,'servis','2026-10-09 16:07:09'),
(68,27,48,2,150.00,300.00,'servis','2026-10-09 18:00:46'),
(69,27,35,1,280.00,280.00,'servis','2026-10-09 18:00:48'),
(85,31,39,2,550.00,1100.00,'servis','2026-10-09 19:11:58'),
(86,31,51,1,40.00,40.00,'servis','2026-10-09 19:12:26'),
(87,31,46,1,180.00,180.00,'servis','2026-10-09 19:12:30'),
(88,31,52,1,10.00,10.00,'servis','2026-10-09 19:12:32'),
(89,32,28,1,200.00,200.00,'servis','2026-10-09 20:22:46'),
(90,32,50,1,20.00,20.00,'servis','2026-10-09 20:22:47'),
(91,33,38,1,380.00,380.00,'servis','2026-10-09 20:23:44'),
(92,34,28,1,200.00,200.00,'servis','2026-10-09 20:24:53'),
(93,34,39,1,550.00,550.00,'servis','2026-10-09 20:24:54'),
(94,34,46,1,180.00,180.00,'servis','2026-10-09 20:24:55'),
(95,34,50,1,20.00,20.00,'servis','2026-10-09 20:24:56'),
(96,34,51,1,40.00,40.00,'servis','2026-10-09 20:24:57'),
(97,34,52,1,10.00,10.00,'servis','2026-10-09 20:25:01'),
(98,35,28,1,200.00,200.00,'bekliyor','2026-10-10 07:44:25'),
(100,37,28,1,200.00,200.00,'bekliyor','2026-10-10 07:47:04'),
(102,39,28,1,200.00,200.00,'secildi','2026-10-10 09:11:32'),
(103,40,28,2,200.00,400.00,'secildi','2026-10-10 09:35:56'),
(104,40,50,1,20.00,20.00,'secildi','2026-10-10 09:35:58'),
(105,41,28,2,200.00,400.00,'secildi','2026-10-10 09:48:57'),
(106,41,50,1,20.00,20.00,'secildi','2026-10-10 09:49:00'),
(107,44,43,3,160.00,480.00,'servis','2026-10-10 10:57:59'),
(108,44,50,1,20.00,20.00,'servis','2026-10-10 10:58:16'),
(109,44,53,1,60.00,60.00,'servis','2026-10-10 10:58:20'),
(110,45,28,2,200.00,400.00,'secildi','2026-10-10 12:25:32'),
(111,45,39,2,550.00,1100.00,'secildi','2026-10-10 12:25:32'),
(112,45,50,1,20.00,20.00,'secildi','2026-10-10 12:25:35'),
(113,45,52,1,10.00,10.00,'secildi','2026-10-10 12:25:39'),
(114,46,42,1,100.00,100.00,'secildi','2026-10-10 13:44:00'),
(115,46,50,1,20.00,20.00,'secildi','2026-10-10 13:44:02'),
(116,47,28,1,200.00,200.00,'servis','2026-10-11 11:54:38'),
(117,47,50,1,20.00,20.00,'servis','2026-10-11 11:54:40'),
(120,49,53,1,60.00,60.00,'servis','2026-10-11 15:45:25'),
(121,49,43,1,160.00,160.00,'servis','2026-10-11 15:45:26'),
(122,51,28,1,200.00,200.00,'secildi','2026-10-11 18:28:55'),
(123,52,53,1,60.00,60.00,'secildi','2026-10-11 18:56:52'),
(124,52,43,1,160.00,160.00,'secildi','2026-10-11 18:56:54'),
(125,52,51,1,40.00,40.00,'secildi','2026-10-11 18:56:56');
/*!40000 ALTER TABLE `adisyon_kalemleri` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `adisyonlar`
--

DROP TABLE IF EXISTS `adisyonlar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `adisyonlar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `masa_id` int(11) NOT NULL,
  `acilis_tarih` datetime NOT NULL DEFAULT current_timestamp(),
  `kapanis_tarih` datetime DEFAULT NULL,
  `toplam` decimal(12,2) NOT NULL DEFAULT 0.00,
  `durum` enum('acik','kapali','iptal') NOT NULL DEFAULT 'acik',
  `kasa_id` int(11) DEFAULT NULL,
  `odeme_yontemi` varchar(50) DEFAULT NULL,
  `notlar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_masa` (`masa_id`),
  KEY `idx_durum` (`durum`),
  KEY `idx_acilis` (`acilis_tarih`),
  KEY `fk_adisyon_kasa` (`kasa_id`),
  CONSTRAINT `fk_adisyon_kasa` FOREIGN KEY (`kasa_id`) REFERENCES `kasa_hesaplari` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_adisyon_masa` FOREIGN KEY (`masa_id`) REFERENCES `masalar` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adisyonlar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `adisyonlar` WRITE;
/*!40000 ALTER TABLE `adisyonlar` DISABLE KEYS */;
INSERT INTO `adisyonlar` VALUES
(1,1,'2026-10-08 11:46:54','2026-10-08 15:11:22',370.00,'kapali',1,'pos',NULL),
(2,1,'2026-10-08 15:15:33','2026-10-08 15:15:58',970.00,'kapali',2,'pos',NULL),
(3,2,'2026-10-08 15:17:26','2026-10-08 15:18:06',820.00,'kapali',2,'kredi_karti',NULL),
(4,3,'2026-10-08 15:24:40','2026-10-08 15:30:25',480.00,'kapali',1,'nakit',NULL),
(5,1,'2026-10-08 16:17:11','2026-10-08 16:18:36',880.00,'kapali',1,'nakit',NULL),
(6,2,'2026-10-08 16:20:24','2026-10-08 16:21:03',600.00,'kapali',1,'pos',NULL),
(7,3,'2026-10-08 16:56:27','2026-10-08 16:57:35',200.00,'kapali',3,'pos',NULL),
(8,4,'2026-10-08 16:58:07','2026-10-08 16:58:36',200.00,'kapali',1,'nakit',NULL),
(9,5,'2026-10-08 17:04:49','2026-10-08 17:04:58',200.00,'kapali',3,'pos',NULL),
(10,4,'2026-10-08 17:07:22','2026-10-08 17:07:49',200.00,'kapali',3,'pos',NULL),
(11,2,'2026-10-08 17:09:33','2026-10-08 17:32:48',220.00,'kapali',3,'pos',NULL),
(12,4,'2026-10-08 17:53:41','2026-10-08 17:56:21',140.00,'kapali',1,'nakit',NULL),
(13,1,'2026-10-08 17:56:29','2026-10-08 17:57:11',1200.00,'kapali',3,'pos',NULL),
(14,1,'2026-10-08 17:57:29','2026-10-08 18:11:17',770.00,'kapali',2,'iban',NULL),
(17,2,'2026-10-09 10:32:57','2026-10-09 10:49:42',770.00,'kapali',1,'nakit',NULL),
(18,5,'2026-10-09 11:54:45','2026-10-09 12:10:43',600.00,'kapali',3,'pos',NULL),
(21,7,'2026-10-09 14:09:03','2026-10-09 14:09:23',140.00,'kapali',1,'nakit',NULL),
(22,8,'2026-10-09 14:09:27','2026-10-09 14:10:02',330.00,'kapali',3,'pos',NULL),
(23,1,'2026-10-09 15:52:56','2026-10-09 19:08:53',1230.00,'kapali',3,'pos',NULL),
(24,2,'2026-10-09 15:55:23','2026-10-09 19:09:00',710.00,'kapali',1,'nakit',NULL),
(25,6,'2026-10-09 19:06:58','2026-10-09 19:09:11',790.00,'kapali',1,'nakit',NULL),
(27,1,'2026-10-09 20:31:50','2026-10-09 21:03:57',580.00,'kapali',3,'pos',NULL),
(31,2,'2026-10-09 22:11:18','2026-10-09 22:13:50',1330.00,'kapali',1,'nakit',NULL),
(32,2,'2026-10-09 23:22:43','2026-10-10 06:14:21',220.00,'kapali',1,'nakit',NULL),
(33,5,'2026-10-09 23:23:28','2026-10-10 06:14:27',380.00,'kapali',1,'nakit',NULL),
(34,6,'2026-10-09 23:24:50','2026-10-10 06:14:33',1000.00,'kapali',1,'nakit',NULL),
(35,1,'2026-10-10 10:44:23','2026-10-10 10:45:12',200.00,'kapali',1,'nakit',NULL),
(37,7,'2026-10-10 10:47:01','2026-10-10 10:47:26',200.00,'kapali',1,'nakit',NULL),
(39,1,'2026-10-10 12:11:27','2026-10-10 12:35:51',200.00,'kapali',1,'nakit',NULL),
(40,2,'2026-10-10 12:35:54','2026-10-10 12:48:51',420.00,'kapali',1,'nakit',NULL),
(41,1,'2026-10-10 12:48:53','2026-10-10 13:01:14',420.00,'kapali',1,'nakit',NULL),
(44,1,'2026-10-10 13:57:49','2026-10-10 13:59:21',560.00,'kapali',3,'kredi_karti',NULL),
(45,1,'2026-10-10 15:25:28','2026-10-10 15:35:06',1530.00,'kapali',1,'nakit',NULL),
(46,1,'2026-10-10 16:43:57','2026-10-11 00:33:16',120.00,'kapali',1,'nakit',NULL),
(47,1,'2026-10-11 14:54:34','2026-10-11 14:56:19',220.00,'kapali',1,'nakit',NULL),
(49,1,'2026-10-11 18:45:20','2026-10-11 20:48:17',220.00,'kapali',1,'nakit',NULL),
(51,2,'2026-10-11 21:28:52','2026-10-11 21:29:00',200.00,'kapali',1,'nakit',NULL),
(52,1,'2026-10-11 21:56:36','2026-10-12 00:01:25',260.00,'kapali',1,'nakit',NULL);
/*!40000 ALTER TABLE `adisyonlar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alis_fatura_detaylari`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alis_fatura_detaylari` WRITE;
/*!40000 ALTER TABLE `alis_fatura_detaylari` DISABLE KEYS */;
INSERT INTO `alis_fatura_detaylari` VALUES
(1,1,1,40,200.00),
(2,1,4,12,200.00),
(3,1,2,30,10.00),
(4,1,5,15,500.00),
(5,2,15,1,50.00);
/*!40000 ALTER TABLE `alis_fatura_detaylari` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `odenen_tutar` decimal(12,2) NOT NULL DEFAULT 0.00,
  `durum` enum('odenmedi','kismi','odendi') NOT NULL DEFAULT 'odenmedi',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_alis_cari` (`cari_id`),
  CONSTRAINT `fk_alis_cari` FOREIGN KEY (`cari_id`) REFERENCES `cariler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alis_faturalar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `alis_faturalar` WRITE;
/*!40000 ALTER TABLE `alis_faturalar` DISABLE KEYS */;
INSERT INTO `alis_faturalar` VALUES
(1,1,'2026-09-30',18200.00,'odendi','2026-09-30 16:43:25'),
(2,1,'2026-10-03',50.00,'odendi','2026-10-03 19:20:57');
/*!40000 ALTER TABLE `alis_faturalar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ayarlar`
--

DROP TABLE IF EXISTS `ayarlar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ayarlar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sirket_adi` varchar(255) NOT NULL DEFAULT 'ŞİRKET ADI',
  `adres` text DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `vergi_no` varchar(20) DEFAULT NULL,
  `vergi_dairesi` varchar(100) DEFAULT NULL,
  `fatura_alt_not` varchar(255) DEFAULT NULL,
  `fis_alt_not` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ayarlar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ayarlar` WRITE;
/*!40000 ALTER TABLE `ayarlar` DISABLE KEYS */;
INSERT INTO `ayarlar` VALUES
(1,'Kadri Ticaret','Örnek Mah. No:1, İstanbul','0212 555 55 55',NULL,NULL,NULL,NULL,'Afiyet olsun! Bizi tercih ettiğiniz için teşekkürler.',NULL,'2026-10-10 12:25:12');
/*!40000 ALTER TABLE `ayarlar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
-- Dumping data for table `cariler`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cariler` WRITE;
/*!40000 ALTER TABLE `cariler` DISABLE KEYS */;
INSERT INTO `cariler` VALUES
(1,'Ergaz San.Ltd.Şti.','her_ikisi','0 555 580 6677','Kemalpaşa V.D Ulucak beldesi.Kemalpaşa/İzmir',NULL,NULL,NULL,NULL,1,'2026-09-27 16:44:38'),
(2,'kerem','musteri','05551115588','Akıncılar mh.',NULL,NULL,NULL,NULL,1,'2026-09-02 14:24:13'),
(3,'İkram','musteri','05558844445','dinçer',NULL,NULL,NULL,NULL,1,'2026-09-02 14:25:25'),
(4,'Metin','musteri','05557775544','1.Anafartalar mh.',NULL,NULL,NULL,NULL,1,'2026-09-02 14:28:12'),
(5,'Serdar','musteri','05551213311','Peker mh.',NULL,NULL,NULL,NULL,1,'2026-09-03 16:22:45');
/*!40000 ALTER TABLE `cariler` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fatura_odemeleri`
--

DROP TABLE IF EXISTS `fatura_odemeleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fatura_odemeleri` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fatura_tipi` enum('alis','satis') NOT NULL,
  `fatura_id` int(11) NOT NULL,
  `tutar` decimal(12,2) NOT NULL,
  `tarih` date NOT NULL,
  `aciklama` varchar(255) DEFAULT NULL,
  `kasadan_dus` tinyint(1) NOT NULL DEFAULT 0,
  `kasa_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fatura` (`fatura_tipi`,`fatura_id`),
  KEY `idx_kasa` (`kasa_id`,`kasadan_dus`),
  KEY `idx_tarih` (`tarih`),
  CONSTRAINT `fk_fo_kasa` FOREIGN KEY (`kasa_id`) REFERENCES `kasa_hesaplari` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fatura_odemeleri`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fatura_odemeleri` WRITE;
/*!40000 ALTER TABLE `fatura_odemeleri` DISABLE KEYS */;
INSERT INTO `fatura_odemeleri` VALUES
(1,'alis',1,18200.00,'2026-10-03',NULL,0,NULL,'2026-10-03 16:33:17'),
(2,'alis',2,50.00,'2026-10-03',NULL,1,1,'2026-10-03 19:22:19'),
(3,'satis',61,140.00,'2026-10-03',NULL,1,1,'2026-10-03 20:13:28'),
(4,'satis',62,220.00,'2026-10-03',NULL,1,1,'2026-10-03 21:24:22'),
(5,'satis',64,700.00,'2026-10-04',NULL,1,1,'2026-10-04 10:24:23'),
(6,'satis',65,76.50,'2026-10-05',NULL,1,1,'2026-10-05 13:02:05'),
(7,'satis',63,280.00,'2026-10-05',NULL,1,1,'2026-10-05 13:30:05'),
(8,'satis',60,250.00,'2026-10-05',NULL,1,1,'2026-10-05 13:30:28'),
(9,'satis',59,30.00,'2026-10-05',NULL,1,1,'2026-10-05 13:30:41'),
(10,'satis',58,290.00,'2026-10-05',NULL,1,1,'2026-10-05 13:30:53'),
(11,'satis',57,580.00,'2026-10-05',NULL,1,1,'2026-10-05 13:31:11'),
(12,'satis',56,300.00,'2026-10-05',NULL,1,1,'2026-10-05 13:31:27'),
(13,'satis',55,6.00,'2026-10-05',NULL,1,1,'2026-10-05 13:31:38'),
(14,'satis',54,580.00,'2026-10-05',NULL,1,1,'2026-10-05 13:31:55'),
(15,'satis',53,100.00,'2026-10-05',NULL,1,1,'2026-10-05 13:32:26'),
(16,'satis',51,400.00,'2026-10-05',NULL,1,1,'2026-10-05 13:33:07'),
(17,'satis',50,153.00,'2026-10-05',NULL,1,1,'2026-10-05 13:33:53'),
(18,'satis',52,3.00,'2026-10-05',NULL,1,1,'2026-10-05 13:34:11'),
(19,'satis',49,50.00,'2026-10-05',NULL,1,2,'2026-10-05 13:34:35'),
(20,'satis',48,37.00,'2026-10-05',NULL,1,2,'2026-10-05 13:34:46'),
(21,'satis',47,70.00,'2026-10-05',NULL,1,2,'2026-10-05 13:34:58'),
(22,'satis',46,150.00,'2026-10-05',NULL,1,1,'2026-10-05 13:35:14'),
(23,'satis',45,30.00,'2026-10-05',NULL,1,2,'2026-10-05 13:35:33'),
(24,'satis',44,300.00,'2026-10-05',NULL,1,2,'2026-10-05 13:36:02'),
(25,'satis',41,70.00,'2026-10-05',NULL,1,2,'2026-10-05 13:36:30'),
(26,'satis',43,150.00,'2026-10-05',NULL,1,2,'2026-10-05 13:36:47'),
(27,'satis',42,220.00,'2026-10-05',NULL,1,1,'2026-10-05 13:36:59'),
(28,'satis',66,70.00,'2026-10-05',NULL,1,1,'2026-10-05 14:03:56'),
(29,'satis',67,950.00,'2026-10-11',NULL,1,3,'2026-10-11 17:50:40');
/*!40000 ALTER TABLE `fatura_odemeleri` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Temporary table structure for view `kasa_bakiye_view`
--

DROP TABLE IF EXISTS `kasa_bakiye_view`;
/*!50001 DROP VIEW IF EXISTS `kasa_bakiye_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `kasa_bakiye_view` AS SELECT
 1 AS `id`,
  1 AS `ad`,
  1 AS `tip`,
  1 AS `banka_adi`,
  1 AS `iban`,
  1 AS `acilis_bakiye`,
  1 AS `aktif`,
  1 AS `created_at`,
  1 AS `bakiye` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `kasa_hareketleri`
--

DROP TABLE IF EXISTS `kasa_hareketleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kasa_hareketleri` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kasa_id` int(11) NOT NULL,
  `tip` enum('giris','cikis') NOT NULL,
  `tutar` decimal(12,2) NOT NULL,
  `tarih` date NOT NULL,
  `aciklama` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_kasa` (`kasa_id`),
  KEY `idx_tarih` (`tarih`),
  CONSTRAINT `fk_kasa_hareket_kasa` FOREIGN KEY (`kasa_id`) REFERENCES `kasa_hesaplari` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kasa_hareketleri`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `kasa_hareketleri` WRITE;
/*!40000 ALTER TABLE `kasa_hareketleri` DISABLE KEYS */;
INSERT INTO `kasa_hareketleri` VALUES
(1,1,'giris',500000.00,'2026-10-01',NULL,'2026-10-01 22:20:05'),
(7,1,'giris',35000.00,'2026-10-03','Elden','2026-10-03 19:14:19'),
(8,1,'cikis',1010.00,'2026-10-04','Masraf','2026-10-04 10:25:26'),
(9,1,'cikis',85000.00,'2026-10-04','Virman → Ziraat Bankası','2026-10-04 14:01:34'),
(10,2,'giris',85000.00,'2026-10-04','Virman ← Merkez Nakit','2026-10-04 14:01:34'),
(11,1,'giris',370.00,'2026-10-08','Masa ödemesi #1 (pos)','2026-10-08 12:11:22'),
(12,2,'giris',970.00,'2026-10-08','Masa ödemesi #2 (pos)','2026-10-08 12:15:58'),
(13,2,'giris',820.00,'2026-10-08','Masa ödemesi #3 (kredi_karti)','2026-10-08 12:18:06'),
(14,1,'giris',480.00,'2026-10-08','Masa ödemesi #4 (nakit)','2026-10-08 12:30:25'),
(15,1,'giris',880.00,'2026-10-08','Masa ödemesi #5 (nakit)','2026-10-08 13:18:36'),
(16,1,'giris',600.00,'2026-10-08','Masa ödemesi #6 (pos)','2026-10-08 13:21:03'),
(17,3,'giris',200.00,'2026-10-08','Masa ödemesi #7 (pos)','2026-10-08 13:57:35'),
(18,1,'giris',200.00,'2026-10-08','Masa ödemesi #8 (nakit)','2026-10-08 13:58:36'),
(19,3,'giris',200.00,'2026-10-08','Masa ödemesi #9 (pos)','2026-10-08 14:04:58'),
(20,3,'giris',200.00,'2026-10-08','Masa ödemesi #10 (pos)','2026-10-08 14:07:49'),
(21,3,'giris',220.00,'2026-10-08','Masa ödemesi #11 (pos)','2026-10-08 14:32:48'),
(22,1,'giris',140.00,'2026-10-08','Masa ödemesi #12 (nakit)','2026-10-08 14:56:21'),
(23,3,'giris',1200.00,'2026-10-08','Masa ödemesi #13 (pos)','2026-10-08 14:57:11'),
(24,2,'giris',770.00,'2026-10-08','Masa ödemesi #14 (iban)','2026-10-08 15:11:17'),
(25,1,'giris',770.00,'2026-10-09','Masa ödemesi #17 (nakit)','2026-10-09 07:49:42'),
(26,3,'giris',600.00,'2026-10-09','Masa ödemesi #18 (pos)','2026-10-09 09:10:43'),
(27,1,'giris',140.00,'2026-10-09','Masa ödemesi #21 (nakit)','2026-10-09 11:09:23'),
(28,3,'giris',330.00,'2026-10-09','Masa ödemesi #22 (pos)','2026-10-09 11:10:02'),
(29,3,'giris',1230.00,'2026-10-09','Masa ödemesi #23 (pos)','2026-10-09 16:08:53'),
(30,1,'giris',710.00,'2026-10-09','Masa ödemesi #24 (nakit)','2026-10-09 16:09:00'),
(31,1,'giris',790.00,'2026-10-09','Masa ödemesi #25 (nakit)','2026-10-09 16:09:11'),
(32,3,'giris',580.00,'2026-10-09','Masa ödemesi #27 (pos)','2026-10-09 18:03:57'),
(33,1,'giris',1330.00,'2026-10-09','Masa ödemesi #31 (nakit)','2026-10-09 19:13:50'),
(34,1,'giris',220.00,'2026-10-10','Masa ödemesi #32 (nakit)','2026-10-10 03:14:21'),
(35,1,'giris',380.00,'2026-10-10','Masa ödemesi #33 (nakit)','2026-10-10 03:14:27'),
(36,1,'giris',1000.00,'2026-10-10','Masa ödemesi #34 (nakit)','2026-10-10 03:14:33'),
(37,1,'giris',200.00,'2026-10-10','Masa ödemesi #35 (nakit)','2026-10-10 07:45:12'),
(38,1,'giris',200.00,'2026-10-10','Masa ödemesi #37 (nakit)','2026-10-10 07:47:26'),
(39,1,'giris',200.00,'2026-10-10','Masa ödemesi #39 (nakit)','2026-10-10 09:35:51'),
(40,1,'giris',420.00,'2026-10-10','Masa ödemesi #40 (nakit)','2026-10-10 09:48:51'),
(41,1,'giris',420.00,'2026-10-10','Masa ödemesi #41 (nakit)','2026-10-10 10:01:14'),
(42,3,'giris',560.00,'2026-10-10','Masa ödemesi #44 (kredi_karti)','2026-10-10 10:59:21'),
(43,1,'giris',1530.00,'2026-10-10','Masa ödemesi #45 (nakit)','2026-10-10 12:35:06'),
(44,1,'giris',120.00,'2026-10-11','Masa ödemesi #46 (nakit)','2026-10-10 21:33:16'),
(45,1,'giris',220.00,'2026-10-11','Masa ödemesi #47 (nakit)','2026-10-11 11:56:19'),
(46,1,'giris',220.00,'2026-10-11','Masa ödemesi #49 (nakit)','2026-10-11 17:48:17'),
(47,1,'giris',200.00,'2026-10-11','Masa ödemesi #51 (nakit)','2026-10-11 18:29:00'),
(48,1,'giris',260.00,'2026-10-12','Masa ödemesi #52 (nakit)','2026-10-11 21:01:25');
/*!40000 ALTER TABLE `kasa_hareketleri` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `kasa_hesaplari`
--

DROP TABLE IF EXISTS `kasa_hesaplari`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kasa_hesaplari` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ad` varchar(100) NOT NULL,
  `tip` enum('nakit','banka','pos') NOT NULL DEFAULT 'nakit',
  `banka_adi` varchar(100) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `acilis_bakiye` decimal(12,2) NOT NULL DEFAULT 0.00,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kasa_ad` (`ad`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kasa_hesaplari`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `kasa_hesaplari` WRITE;
/*!40000 ALTER TABLE `kasa_hesaplari` DISABLE KEYS */;
INSERT INTO `kasa_hesaplari` VALUES
(1,'Merkez Nakit','nakit',NULL,NULL,0.00,1,'2026-10-01 18:06:19'),
(2,'Ziraat Bankası','banka',NULL,NULL,0.00,1,'2026-10-04 14:01:08'),
(3,'POS','pos',NULL,NULL,0.00,1,'2026-10-08 13:37:10');
/*!40000 ALTER TABLE `kasa_hesaplari` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `kullanicilar`
--

DROP TABLE IF EXISTS `kullanicilar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kullanicilar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kullanici_adi` varchar(50) NOT NULL,
  `sifre_hash` varchar(255) NOT NULL,
  `ad_soyad` varchar(100) NOT NULL,
  `rol` enum('admin','personel') NOT NULL DEFAULT 'personel',
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kullanici` (`kullanici_adi`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kullanicilar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `kullanicilar` WRITE;
/*!40000 ALTER TABLE `kullanicilar` DISABLE KEYS */;
INSERT INTO `kullanicilar` VALUES
(1,'admin','$2b$10$PyRnblFRE6x8ILvHG.rRyOC2dit3HkBbcAS27gP1Kzj7c8nmGTBiO','Yönetici','admin',1,'2026-10-10 16:14:32'),
(5,'baran','$2b$10$/6uMLy4KlbdotjOHD24mSuDr5J09A0v7YWyQXO.tTQ84xFMMFTBaq','baran','admin',1,'2026-10-11 04:24:30'),
(6,'berke','$2b$10$WaYkjB7RLboL7pniyOuZIOIyr9SFJEMZLlcVVhT8l6.CDciRf2yv2','berke','personel',1,'2026-10-11 08:56:41');
/*!40000 ALTER TABLE `kullanicilar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `masalar`
--

DROP TABLE IF EXISTS `masalar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `masalar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ad` varchar(50) NOT NULL,
  `tip` enum('masa','paket','gelal') NOT NULL DEFAULT 'masa',
  `sira` int(11) NOT NULL DEFAULT 0,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_aktif` (`aktif`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `masalar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `masalar` WRITE;
/*!40000 ALTER TABLE `masalar` DISABLE KEYS */;
INSERT INTO `masalar` VALUES
(1,'Masa 1','masa',1,1,'2026-10-07 17:15:39'),
(2,'Masa 2','masa',2,1,'2026-10-07 17:15:39'),
(3,'Masa 3','masa',3,1,'2026-10-07 17:15:39'),
(4,'Masa 4','masa',4,1,'2026-10-07 17:15:39'),
(5,'Masa 5','masa',5,1,'2026-10-07 17:15:39'),
(6,'Masa 6','masa',6,1,'2026-10-07 17:15:39'),
(7,'Paket','paket',100,1,'2026-10-07 17:15:39'),
(8,'Gel-Al','gelal',101,1,'2026-10-07 17:15:39');
/*!40000 ALTER TABLE `masalar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
-- Dumping data for table `musteriler_old`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `musteriler_old` WRITE;
/*!40000 ALTER TABLE `musteriler_old` DISABLE KEYS */;
INSERT INTO `musteriler_old` VALUES
(6,'kerem','05551115588','Akıncılar mh.','2026-09-02 14:24:13'),
(7,'İkram','05558844445','dinçer','2026-09-02 14:25:25'),
(8,'Metin','05557775544','1.Anafartalar mh.','2026-09-02 14:28:12'),
(9,'Serdar','05551213311','Peker mh.','2026-09-03 16:22:45');
/*!40000 ALTER TABLE `musteriler_old` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personel`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personel` WRITE;
/*!40000 ALTER TABLE `personel` DISABLE KEYS */;
INSERT INTO `personel` VALUES
(1,'Cemil','Neşeligil','51212365456','1321303',NULL,NULL,NULL,'2026-10-23',NULL,NULL,NULL,'2026-10-13',NULL,NULL,NULL,50000.00,NULL,NULL,1,NULL,'2026-10-01 11:19:39'),
(2,'İsmail','Güllü',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-30',NULL,NULL,NULL,60000.00,NULL,NULL,1,NULL,'2026-10-01 22:03:11'),
(3,'Semih','Balcı',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-30',NULL,NULL,NULL,40000.00,NULL,NULL,1,NULL,'2026-10-01 22:49:29');
/*!40000 ALTER TABLE `personel` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `kasa_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_personel` (`personel_id`),
  KEY `idx_tarih` (`tarih`),
  KEY `idx_donem` (`donem`),
  KEY `idx_po_kasa` (`kasa_id`,`kasadan_dus`),
  CONSTRAINT `fk_odeme_personel` FOREIGN KEY (`personel_id`) REFERENCES `personel` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personel_odeme`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personel_odeme` WRITE;
/*!40000 ALTER TABLE `personel_odeme` DISABLE KEYS */;
INSERT INTO `personel_odeme` VALUES
(1,1,'maas',30000.00,'2026-10-01',NULL,NULL,0,NULL,'2026-10-01 12:51:51'),
(2,3,'maas',10000.00,'2026-10-01',NULL,NULL,0,NULL,'2026-10-01 22:50:25'),
(3,2,'maas',20000.00,'2026-10-01','2026/10',NULL,1,1,'2026-10-01 23:04:56'),
(4,1,'maas',5000.00,'2026-10-03',NULL,NULL,1,1,'2026-10-03 15:20:15'),
(5,3,'maas',5000.00,'2026-10-03',NULL,NULL,1,1,'2026-10-03 16:35:12'),
(6,3,'maas',5000.00,'2026-10-03',NULL,NULL,1,1,'2026-10-03 16:37:52'),
(7,1,'maas',14999.98,'2026-10-04',NULL,NULL,1,1,'2026-10-04 10:51:53'),
(8,1,'maas',0.02,'2026-10-04',NULL,NULL,1,1,'2026-10-04 10:53:20');
/*!40000 ALTER TABLE `personel_odeme` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `satis_fatura_detaylari`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `satis_fatura_detaylari` WRITE;
/*!40000 ALTER TABLE `satis_fatura_detaylari` DISABLE KEYS */;
INSERT INTO `satis_fatura_detaylari` VALUES
(3,41,12,70.00,1),
(4,42,12,70.00,1),
(5,42,16,150.00,1),
(6,43,16,150.00,1),
(7,44,16,150.00,1),
(8,44,13,150.00,1),
(9,45,17,30.00,1),
(10,46,10,150.00,1),
(11,47,15,70.00,1),
(12,48,6,30.00,1),
(13,48,7,7.00,1),
(14,49,18,50.00,1),
(15,50,11,3.00,1),
(16,50,13,150.00,1),
(17,51,21,250.00,1),
(18,51,10,150.00,1),
(19,52,11,3.00,1),
(20,53,24,300.00,1),
(21,53,20,-200.00,1),
(22,54,1,140.00,2),
(23,54,24,300.00,1),
(24,55,11,3.00,2),
(25,56,24,300.00,1),
(26,57,1,140.00,2),
(27,57,24,300.00,1),
(28,58,15,70.00,2),
(29,58,13,150.00,1),
(30,59,5,3.00,10),
(31,60,21,250.00,1),
(32,61,19,140.00,1),
(33,62,15,70.00,1),
(34,62,10,150.00,1),
(35,63,19,140.00,2),
(37,65,27,25.50,3),
(38,66,15,70.00,1),
(39,67,55,950.00,1),
(40,67,61,0.00,8);
/*!40000 ALTER TABLE `satis_fatura_detaylari` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `odenen_tutar` decimal(12,2) NOT NULL DEFAULT 0.00,
  `durum` enum('odenmedi','kismi','odendi') NOT NULL DEFAULT 'odenmedi',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_satis_cari` (`cari_id`),
  CONSTRAINT `fk_satis_cari` FOREIGN KEY (`cari_id`) REFERENCES `cariler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `satis_faturalar`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `satis_faturalar` WRITE;
/*!40000 ALTER TABLE `satis_faturalar` DISABLE KEYS */;
INSERT INTO `satis_faturalar` VALUES
(41,3,'2026-09-18',70.00,'odendi','2026-09-18 16:48:09'),
(42,4,'2026-09-18',220.00,'odendi','2026-09-18 17:29:06'),
(43,2,'2026-09-18',150.00,'odendi','2026-09-18 19:08:41'),
(44,3,'2026-09-19',300.00,'odendi','2026-09-18 21:27:01'),
(45,3,'2026-09-19',30.00,'odendi','2026-09-18 21:31:23'),
(46,2,'2026-09-19',150.00,'odendi','2026-09-19 10:47:03'),
(47,3,'2026-09-19',70.00,'odendi','2026-09-19 11:00:28'),
(48,2,'2026-09-19',37.00,'odendi','2026-09-19 11:59:10'),
(49,3,'2026-09-19',50.00,'odendi','2026-09-19 12:33:52'),
(50,3,'2026-09-20',153.00,'odendi','2026-09-19 22:06:46'),
(51,3,'2026-09-20',400.00,'odendi','2026-09-20 09:31:38'),
(52,5,'2026-09-20',3.00,'odendi','2026-09-20 13:06:26'),
(53,3,'2026-09-21',100.00,'odendi','2026-09-21 19:12:21'),
(54,2,'2026-09-25',580.00,'odendi','2026-09-25 11:27:42'),
(55,3,'2026-09-27',6.00,'odendi','2026-09-27 14:36:09'),
(56,1,'2026-10-01',300.00,'odendi','2026-10-01 01:19:50'),
(57,3,'2026-10-01',580.00,'odendi','2026-10-01 17:05:40'),
(58,2,'2026-10-02',290.00,'odendi','2026-10-02 17:06:35'),
(59,3,'2026-10-03',30.00,'odendi','2026-10-03 19:18:37'),
(60,5,'2026-10-03',250.00,'odendi','2026-10-03 19:31:10'),
(61,4,'2026-10-03',140.00,'odendi','2026-10-03 19:35:54'),
(62,1,'2026-10-03',220.00,'odendi','2026-10-03 21:09:23'),
(63,2,'2026-10-04',280.00,'odendi','2026-10-04 10:05:18'),
(65,2,'2026-10-05',76.50,'odendi','2026-10-05 13:01:19'),
(66,3,'2026-10-05',70.00,'odendi','2026-10-05 14:03:48'),
(67,2,'2026-10-11',950.00,'odendi','2026-10-11 16:14:10');
/*!40000 ALTER TABLE `satis_faturalar` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
  `kaynak` enum('alis_fatura','satis_fatura','manuel','iade','sayim','perakende','fire') NOT NULL DEFAULT 'manuel',
  `kaynak_id` int(11) DEFAULT NULL,
  `tarih` date NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_urun` (`urun_id`),
  KEY `idx_tarih` (`tarih`),
  CONSTRAINT `1` FOREIGN KEY (`urun_id`) REFERENCES `urunler` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stok_hareketleri`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `stok_hareketleri` WRITE;
/*!40000 ALTER TABLE `stok_hareketleri` DISABLE KEYS */;
INSERT INTO `stok_hareketleri` VALUES
(1,1,'giris',15,NULL,'manuel',NULL,'2026-09-25','2026-09-25 11:18:24'),
(2,1,'giris',40,'Alış faturası #1','alis_fatura',1,'2026-09-30','2026-09-30 16:43:25'),
(3,4,'giris',12,'Alış faturası #1','alis_fatura',1,'2026-09-30','2026-09-30 16:43:25'),
(4,2,'giris',30,'Alış faturası #1','alis_fatura',1,'2026-09-30','2026-09-30 16:43:25'),
(5,5,'giris',15,'Alış faturası #1','alis_fatura',1,'2026-09-30','2026-09-30 16:43:25'),
(6,13,'giris',15,NULL,'manuel',NULL,'2026-10-01','2026-10-01 00:53:05'),
(7,21,'giris',20,NULL,'manuel',NULL,'2026-10-01','2026-10-01 00:56:14'),
(8,24,'giris',20,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:00:28'),
(9,6,'giris',20,'Manuel','manuel',NULL,'2026-10-01','2026-10-01 01:07:11'),
(10,11,'giris',50,'Manuel','manuel',NULL,'2026-10-01','2026-10-01 01:16:10'),
(11,11,'giris',50,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:16:42'),
(12,11,'giris',50,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:18:03'),
(13,15,'giris',5,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:18:27'),
(14,15,'giris',15,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:18:54'),
(15,24,'cikis',1,'Satış faturası #56','satis_fatura',56,'2026-10-01','2026-10-01 01:19:50'),
(16,10,'giris',5,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:33:44'),
(17,10,'giris',10,NULL,'manuel',NULL,'2026-10-01','2026-10-01 01:34:02'),
(18,20,'giris',25,NULL,'manuel',NULL,'2026-10-01','2026-10-01 17:01:12'),
(19,19,'giris',28,NULL,'manuel',NULL,'2026-10-01','2026-10-01 17:01:29'),
(20,7,'giris',30,NULL,'manuel',NULL,'2026-10-01','2026-10-01 17:01:54'),
(21,1,'cikis',2,'Satış faturası #57','satis_fatura',57,'2026-10-01','2026-10-01 17:05:40'),
(22,24,'cikis',1,'Satış faturası #57','satis_fatura',57,'2026-10-01','2026-10-01 17:05:40'),
(23,18,'giris',25,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:45:47'),
(24,23,'giris',25,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:46:05'),
(25,22,'giris',25,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:46:23'),
(26,16,'giris',20,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:46:39'),
(27,25,'giris',20,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:46:57'),
(28,12,'giris',20,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:47:12'),
(29,17,'giris',21,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:47:24'),
(30,8,'giris',30,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:47:42'),
(31,9,'giris',50,NULL,'manuel',NULL,'2026-10-02','2026-10-02 02:47:57'),
(32,15,'cikis',2,'Satış faturası #58','satis_fatura',58,'2026-10-02','2026-10-02 17:06:35'),
(33,13,'cikis',1,'Satış faturası #58','satis_fatura',58,'2026-10-02','2026-10-02 17:06:35'),
(34,5,'cikis',10,'Satış faturası #59','satis_fatura',59,'2026-10-03','2026-10-03 19:18:37'),
(35,15,'giris',1,'Alış faturası #2','alis_fatura',2,'2026-10-03','2026-10-03 19:20:57'),
(36,21,'cikis',1,'Satış faturası #60','satis_fatura',60,'2026-10-03','2026-10-03 19:31:10'),
(37,19,'cikis',1,'Satış faturası #61','satis_fatura',61,'2026-10-03','2026-10-03 19:35:54'),
(38,15,'cikis',1,'Satış faturası #62','satis_fatura',62,'2026-10-03','2026-10-03 21:09:23'),
(39,10,'cikis',1,'Satış faturası #62','satis_fatura',62,'2026-10-03','2026-10-03 21:09:23'),
(40,5,'giris',10,NULL,'manuel',NULL,'2026-10-04','2026-10-03 22:09:59'),
(41,19,'cikis',2,'Satış faturası #63','satis_fatura',63,'2026-10-04','2026-10-04 10:05:18'),
(43,27,'giris',15,NULL,'manuel',NULL,'2026-10-05','2026-10-05 12:59:58'),
(44,26,'giris',20,NULL,'manuel',NULL,'2026-10-05','2026-10-05 13:00:09'),
(45,27,'cikis',3,'Satış faturası #65','satis_fatura',65,'2026-10-05','2026-10-05 13:01:19'),
(46,15,'cikis',1,'Satış faturası #66','satis_fatura',66,'2026-10-05','2026-10-05 14:03:48'),
(47,28,'cikis',1,'Masa satışı #1','satis_fatura',1,'2026-10-08','2026-10-08 12:11:22'),
(48,50,'cikis',1,'Masa satışı #1','satis_fatura',1,'2026-10-08','2026-10-08 12:11:22'),
(49,53,'cikis',1,'Masa satışı #1','satis_fatura',1,'2026-10-08','2026-10-08 12:11:22'),
(50,52,'cikis',1,'Masa satışı #1','satis_fatura',1,'2026-10-08','2026-10-08 12:11:22'),
(51,54,'cikis',1,'Masa satışı #1','satis_fatura',1,'2026-10-08','2026-10-08 12:11:22'),
(52,28,'cikis',1,'Masa satışı #2','satis_fatura',2,'2026-10-08','2026-10-08 12:15:58'),
(53,39,'cikis',1,'Masa satışı #2','satis_fatura',2,'2026-10-08','2026-10-08 12:15:58'),
(54,46,'cikis',1,'Masa satışı #2','satis_fatura',2,'2026-10-08','2026-10-08 12:15:58'),
(55,51,'cikis',1,'Masa satışı #2','satis_fatura',2,'2026-10-08','2026-10-08 12:15:58'),
(56,50,'cikis',1,'Masa satışı #3','satis_fatura',3,'2026-10-08','2026-10-08 12:18:06'),
(57,39,'cikis',1,'Masa satışı #3','satis_fatura',3,'2026-10-08','2026-10-08 12:18:06'),
(58,41,'cikis',1,'Masa satışı #3','satis_fatura',3,'2026-10-08','2026-10-08 12:18:06'),
(59,49,'cikis',1,'Masa satışı #3','satis_fatura',3,'2026-10-08','2026-10-08 12:18:06'),
(60,28,'cikis',1,'Masa satışı #4','satis_fatura',4,'2026-10-08','2026-10-08 12:30:25'),
(61,28,'cikis',1,'Masa satışı #4','satis_fatura',4,'2026-10-08','2026-10-08 12:30:25'),
(62,41,'cikis',1,'Masa satışı #4','satis_fatura',4,'2026-10-08','2026-10-08 12:30:25'),
(63,28,'cikis',1,'Masa satışı #5','satis_fatura',5,'2026-10-08','2026-10-08 13:18:36'),
(64,39,'cikis',1,'Masa satışı #5','satis_fatura',5,'2026-10-08','2026-10-08 13:18:36'),
(65,42,'cikis',1,'Masa satışı #5','satis_fatura',5,'2026-10-08','2026-10-08 13:18:36'),
(66,52,'cikis',1,'Masa satışı #5','satis_fatura',5,'2026-10-08','2026-10-08 13:18:36'),
(67,50,'cikis',1,'Masa satışı #5','satis_fatura',5,'2026-10-08','2026-10-08 13:18:36'),
(68,28,'cikis',1,'Masa satışı #6','satis_fatura',6,'2026-10-08','2026-10-08 13:21:03'),
(69,50,'cikis',1,'Masa satışı #6','satis_fatura',6,'2026-10-08','2026-10-08 13:21:03'),
(70,36,'cikis',1,'Masa satışı #6','satis_fatura',6,'2026-10-08','2026-10-08 13:21:03'),
(71,53,'cikis',1,'Masa satışı #6','satis_fatura',6,'2026-10-08','2026-10-08 13:21:03'),
(72,28,'cikis',1,'Masa satışı #7','satis_fatura',7,'2026-10-08','2026-10-08 13:57:35'),
(73,28,'cikis',1,'Masa satışı #8','satis_fatura',8,'2026-10-08','2026-10-08 13:58:36'),
(74,28,'cikis',1,'Masa satışı #9','satis_fatura',9,'2026-10-08','2026-10-08 14:04:58'),
(75,28,'cikis',1,'Masa satışı #10','satis_fatura',10,'2026-10-08','2026-10-08 14:07:49'),
(76,50,'cikis',1,'Masa satışı #11','satis_fatura',11,'2026-10-08','2026-10-08 14:32:48'),
(77,28,'cikis',1,'Masa satışı #11','satis_fatura',11,'2026-10-08','2026-10-08 14:32:48'),
(78,44,'cikis',1,'Masa satışı #12','satis_fatura',12,'2026-10-08','2026-10-08 14:56:21'),
(79,53,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(80,50,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(81,50,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(82,53,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(83,45,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(84,41,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(85,47,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(86,38,'cikis',1,'Masa satışı #13','satis_fatura',13,'2026-10-08','2026-10-08 14:57:11'),
(87,39,'cikis',1,'Masa satışı #14','satis_fatura',14,'2026-10-08','2026-10-08 15:11:17'),
(88,37,'cikis',1,'Masa satışı #14','satis_fatura',14,'2026-10-08','2026-10-08 15:11:17'),
(89,28,'cikis',1,'Masa satışı #17','satis_fatura',17,'2026-10-09','2026-10-09 07:49:42'),
(90,50,'cikis',1,'Masa satışı #17','satis_fatura',17,'2026-10-09','2026-10-09 07:49:42'),
(91,39,'cikis',1,'Masa satışı #17','satis_fatura',17,'2026-10-09','2026-10-09 07:49:42'),
(92,28,'cikis',3,'Masa satışı #18','satis_fatura',18,'2026-10-09','2026-10-09 09:10:43'),
(93,44,'cikis',1,'Masa satışı #21','satis_fatura',21,'2026-10-09','2026-10-09 11:09:23'),
(94,48,'cikis',1,'Masa satışı #22','satis_fatura',22,'2026-10-09','2026-10-09 11:10:02'),
(95,52,'cikis',2,'Masa satışı #22','satis_fatura',22,'2026-10-09','2026-10-09 11:10:02'),
(96,54,'cikis',2,'Masa satışı #22','satis_fatura',22,'2026-10-09','2026-10-09 11:10:02'),
(97,28,'cikis',1,'Mutfak iptal - kalem #61','fire',25,'2026-10-09','2026-10-09 16:08:09'),
(98,50,'cikis',1,'Mutfak iptal - kalem #64','fire',25,'2026-10-09','2026-10-09 16:08:25'),
(99,28,'cikis',1,'Masa satışı #23','satis_fatura',23,'2026-10-09','2026-10-09 16:08:53'),
(100,39,'cikis',1,'Masa satışı #23','satis_fatura',23,'2026-10-09','2026-10-09 16:08:53'),
(101,42,'cikis',1,'Masa satışı #23','satis_fatura',23,'2026-10-09','2026-10-09 16:08:53'),
(102,36,'cikis',1,'Masa satışı #23','satis_fatura',23,'2026-10-09','2026-10-09 16:08:53'),
(103,53,'cikis',1,'Masa satışı #23','satis_fatura',23,'2026-10-09','2026-10-09 16:08:53'),
(104,39,'cikis',1,'Masa satışı #24','satis_fatura',24,'2026-10-09','2026-10-09 16:09:00'),
(105,43,'cikis',1,'Masa satışı #24','satis_fatura',24,'2026-10-09','2026-10-09 16:09:00'),
(106,39,'cikis',1,'Masa satışı #25','satis_fatura',25,'2026-10-09','2026-10-09 16:09:11'),
(107,46,'cikis',1,'Masa satışı #25','satis_fatura',25,'2026-10-09','2026-10-09 16:09:11'),
(108,53,'cikis',1,'Masa satışı #25','satis_fatura',25,'2026-10-09','2026-10-09 16:09:11'),
(109,28,'cikis',1,'Mutfak iptal - kalem #66','fire',26,'2026-10-09','2026-10-09 16:09:57'),
(110,28,'cikis',1,'Mutfak iptal - kalem #67','fire',27,'2026-10-09','2026-10-09 17:32:58'),
(111,48,'cikis',1,'Mutfak iptal - kalem #70','fire',27,'2026-10-09','2026-10-09 18:01:52'),
(112,48,'cikis',2,'Masa satışı #27','satis_fatura',27,'2026-10-09','2026-10-09 18:03:57'),
(113,35,'cikis',1,'Masa satışı #27','satis_fatura',27,'2026-10-09','2026-10-09 18:03:57'),
(114,39,'cikis',1,'Adisyon #28 iptal - Müşteri vazgeçti','fire',28,'2026-10-09','2026-10-09 18:35:01'),
(115,39,'cikis',1,'Adisyon #28 iptal - Müşteri vazgeçti','fire',28,'2026-10-09','2026-10-09 18:35:01'),
(116,39,'cikis',1,'Adisyon #28 iptal - Müşteri vazgeçti','fire',28,'2026-10-09','2026-10-09 18:35:01'),
(117,28,'cikis',3,'Adisyon #30 iptal - Müşteri vazgeçti','fire',30,'2026-10-09','2026-10-09 19:11:10'),
(118,28,'cikis',1,'Adisyon #30 iptal - Müşteri vazgeçti','fire',30,'2026-10-09','2026-10-09 19:11:10'),
(119,28,'cikis',3,'Mutfak iptal - kalem #84','fire',31,'2026-10-09','2026-10-09 19:13:26'),
(120,39,'cikis',2,'Masa satışı #31','satis_fatura',31,'2026-10-09','2026-10-09 19:13:50'),
(121,51,'cikis',1,'Masa satışı #31','satis_fatura',31,'2026-10-09','2026-10-09 19:13:50'),
(122,46,'cikis',1,'Masa satışı #31','satis_fatura',31,'2026-10-09','2026-10-09 19:13:50'),
(123,52,'cikis',1,'Masa satışı #31','satis_fatura',31,'2026-10-09','2026-10-09 19:13:50'),
(124,28,'cikis',1,'Masa satışı #32','satis_fatura',32,'2026-10-10','2026-10-10 03:14:21'),
(125,50,'cikis',1,'Masa satışı #32','satis_fatura',32,'2026-10-10','2026-10-10 03:14:21'),
(126,38,'cikis',1,'Masa satışı #33','satis_fatura',33,'2026-10-10','2026-10-10 03:14:27'),
(127,28,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(128,39,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(129,46,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(130,50,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(131,51,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(132,52,'cikis',1,'Masa satışı #34','satis_fatura',34,'2026-10-10','2026-10-10 03:14:33'),
(133,28,'cikis',1,'Masa satışı #35','satis_fatura',35,'2026-10-10','2026-10-10 07:45:12'),
(134,39,'cikis',1,'Adisyon #36 iptal - Müşteri vazgeçti','fire',36,'2026-10-10','2026-10-10 07:46:57'),
(135,28,'cikis',1,'Masa satışı #37','satis_fatura',37,'2026-10-10','2026-10-10 07:47:26'),
(136,28,'cikis',1,'Masa satışı #39','satis_fatura',39,'2026-10-10','2026-10-10 09:35:51'),
(137,28,'cikis',2,'Masa satışı #40','satis_fatura',40,'2026-10-10','2026-10-10 09:48:51'),
(138,50,'cikis',1,'Masa satışı #40','satis_fatura',40,'2026-10-10','2026-10-10 09:48:51'),
(139,28,'cikis',2,'Masa satışı #41','satis_fatura',41,'2026-10-10','2026-10-10 10:01:14'),
(140,50,'cikis',1,'Masa satışı #41','satis_fatura',41,'2026-10-10','2026-10-10 10:01:14'),
(141,43,'cikis',3,'Masa satışı #44','satis_fatura',44,'2026-10-10','2026-10-10 10:59:21'),
(142,50,'cikis',1,'Masa satışı #44','satis_fatura',44,'2026-10-10','2026-10-10 10:59:21'),
(143,53,'cikis',1,'Masa satışı #44','satis_fatura',44,'2026-10-10','2026-10-10 10:59:21'),
(144,28,'cikis',2,'Masa satışı #45','satis_fatura',45,'2026-10-10','2026-10-10 12:35:06'),
(145,39,'cikis',2,'Masa satışı #45','satis_fatura',45,'2026-10-10','2026-10-10 12:35:06'),
(146,50,'cikis',1,'Masa satışı #45','satis_fatura',45,'2026-10-10','2026-10-10 12:35:06'),
(147,52,'cikis',1,'Masa satışı #45','satis_fatura',45,'2026-10-10','2026-10-10 12:35:06'),
(148,42,'cikis',1,'Masa satışı #46','satis_fatura',46,'2026-10-11','2026-10-10 21:33:15'),
(149,50,'cikis',1,'Masa satışı #46','satis_fatura',46,'2026-10-11','2026-10-10 21:33:16'),
(150,28,'cikis',1,'Masa satışı #47','satis_fatura',47,'2026-10-11','2026-10-11 11:56:19'),
(151,50,'cikis',1,'Masa satışı #47','satis_fatura',47,'2026-10-11','2026-10-11 11:56:19'),
(152,36,'cikis',1,'Mutfak iptal - kalem #118','fire',48,'2026-10-11','2026-10-11 11:57:07'),
(153,53,'cikis',1,'Mutfak iptal - kalem #119','fire',48,'2026-10-11','2026-10-11 11:57:12'),
(154,55,'giris',15,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:09:02'),
(155,56,'giris',28,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:09:18'),
(156,59,'giris',27,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:09:27'),
(157,60,'giris',21,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:09:37'),
(158,57,'giris',23,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:09:47'),
(159,58,'giris',34,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:10:15'),
(160,13,'cikis',13,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:11:39'),
(161,55,'cikis',1,'Satış faturası #67','satis_fatura',67,'2026-10-11','2026-10-11 16:14:10'),
(162,61,'cikis',8,'Satış faturası #67','satis_fatura',67,'2026-10-11','2026-10-11 16:14:10'),
(163,13,'giris',19,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:14:51'),
(164,61,'giris',21,NULL,'manuel',NULL,'2026-10-11','2026-10-11 16:15:26'),
(165,53,'cikis',1,'Masa satışı #49','satis_fatura',49,'2026-10-11','2026-10-11 17:48:17'),
(166,43,'cikis',1,'Masa satışı #49','satis_fatura',49,'2026-10-11','2026-10-11 17:48:17'),
(167,28,'cikis',1,'Masa satışı #51','satis_fatura',51,'2026-10-11','2026-10-11 18:29:00'),
(168,53,'cikis',1,'Masa satışı #52','satis_fatura',52,'2026-10-12','2026-10-11 21:01:25'),
(169,43,'cikis',1,'Masa satışı #52','satis_fatura',52,'2026-10-12','2026-10-11 21:01:25'),
(170,51,'cikis',1,'Masa satışı #52','satis_fatura',52,'2026-10-12','2026-10-11 21:01:25');
/*!40000 ALTER TABLE `stok_hareketleri` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

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
-- Dumping data for table `tedarikciler_old`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tedarikciler_old` WRITE;
/*!40000 ALTER TABLE `tedarikciler_old` DISABLE KEYS */;
INSERT INTO `tedarikciler_old` VALUES
(1,'Ergaz San.Ltd.Şti.','0 555 580 6677','Kemalpaşa V.D Ulucak beldesi.Kemalpaşa/İzmir','2026-09-27 16:44:38');
/*!40000 ALTER TABLE `tedarikciler_old` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `urunler`
--

DROP TABLE IF EXISTS `urunler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `urunler` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `urun_adi` varchar(255) NOT NULL,
  `tip` enum('hammadde','satis_urunu') NOT NULL DEFAULT 'hammadde',
  `kritik_seviye` int(11) DEFAULT 10,
  `varsayilan_alis_fiyati` decimal(10,2) DEFAULT 0.00,
  `varsayilan_satis_fiyati` decimal(10,2) DEFAULT 0.00,
  `durum` tinyint(1) DEFAULT 1,
  `stok` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_urun_adi` (`urun_adi`),
  KEY `idx_tip` (`tip`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `urunler`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `urunler` WRITE;
/*!40000 ALTER TABLE `urunler` DISABLE KEYS */;
INSERT INTO `urunler` VALUES
(1,'12kg Mutfak Tüp','hammadde',10,200.00,300.00,1,51,'2026-09-02 19:30:43'),
(2,'2kg Piknik Tüp','hammadde',10,10.00,15.00,1,30,'2026-09-02 19:38:05'),
(4,'24kg Ticari Tüp','hammadde',10,200.00,300.00,1,12,'2026-09-02 19:52:36'),
(5,'45kg Sanayi Tüp','hammadde',10,500.00,700.00,1,15,'2026-09-02 22:17:54'),
(6,'Kaynak Su Damacana','hammadde',10,20.00,30.00,1,20,'2026-09-03 13:55:22'),
(7,'Piknik Süzgeç','hammadde',10,5.00,10.00,1,30,'2026-09-03 14:36:30'),
(8,'suzgec','hammadde',10,5.00,7.00,1,30,'2026-09-03 14:40:49'),
(9,'Tüp Hortumu','hammadde',10,10.00,13.00,1,50,'2026-09-03 14:53:28'),
(10,'ocak','hammadde',10,100.00,150.00,1,15,'2026-09-03 15:00:27'),
(11,'Kelepçe','hammadde',10,2.00,3.00,1,150,'2026-09-03 15:17:15'),
(12,'Soba','hammadde',10,50.00,70.00,1,20,'2026-09-03 15:22:20'),
(13,'Davul Fırın','hammadde',10,100.00,150.00,1,20,'2026-09-03 15:26:35'),
(15,'Mini Fırın','hammadde',10,50.00,70.00,1,18,'2026-09-03 16:45:01'),
(16,'Sanayi Dedantör','hammadde',10,100.00,150.00,1,20,'2026-09-03 16:50:39'),
(17,'Soba Başlığı','hammadde',10,20.00,30.00,1,21,'2026-09-03 17:03:38'),
(18,'Pürmüz','hammadde',10,30.00,50.00,1,25,NULL),
(19,'Ocak Tekli ','hammadde',10,100.00,140.00,1,25,NULL),
(20,'Ocak İkili ','hammadde',10,150.00,200.00,1,25,NULL),
(21,'Gaz Lambası','hammadde',10,150.00,250.00,1,19,NULL),
(22,'Pürmüz Küçük','hammadde',10,100.00,120.00,1,25,NULL),
(23,'Pürmüz Büyük','hammadde',10,200.00,240.00,1,25,NULL),
(24,'Gaz Lambası Büyük ','hammadde',10,200.00,300.00,1,18,NULL),
(25,'Set Üstü Ocak','hammadde',10,500.00,700.00,1,20,NULL),
(26,'Ocak Doğalgaz','hammadde',5,500.00,750.00,1,20,NULL),
(27,'Piknik Ocak Üstü','hammadde',10,20.00,25.50,1,12,NULL),
(28,'Adana Kebap','satis_urunu',10,120.00,200.00,1,-39,NULL),
(35,'Urfa Kebap','satis_urunu',0,120.00,280.00,1,-1,NULL),
(36,'Beyti','satis_urunu',0,150.00,320.00,1,-3,NULL),
(37,'Tavuk Şiş','satis_urunu',0,80.00,220.00,1,-1,NULL),
(38,'Kuzu Şiş','satis_urunu',0,180.00,380.00,1,-2,NULL),
(39,'Karışık Izgara','satis_urunu',0,250.00,550.00,1,-17,NULL),
(41,'Lahmacun','satis_urunu',0,25.00,80.00,1,-3,NULL),
(42,'Kaşarlı Lahmacun','satis_urunu',0,35.00,100.00,1,-3,NULL),
(43,'Kıymalı Pide','satis_urunu',0,60.00,160.00,1,-6,NULL),
(44,'Kaşarlı Pide','satis_urunu',0,50.00,140.00,1,-2,NULL),
(45,'Kuşbaşılı Pide','satis_urunu',0,80.00,200.00,1,-1,NULL),
(46,'Köfte','satis_urunu',0,70.00,180.00,1,-4,NULL),
(47,'Pirzola','satis_urunu',0,180.00,380.00,1,-1,NULL),
(48,'Tavuk Kanat','satis_urunu',0,60.00,150.00,1,-4,NULL),
(49,'Tavuk Pirzola','satis_urunu',0,70.00,170.00,1,-1,NULL),
(50,'Ayran','satis_urunu',0,5.00,20.00,1,-17,NULL),
(51,'Kola','satis_urunu',0,15.00,40.00,1,-4,NULL),
(52,'Su','satis_urunu',0,2.00,10.00,1,-7,NULL),
(53,'Çoban Salata','satis_urunu',0,20.00,60.00,1,-10,NULL),
(54,'Tatlı','satis_urunu',0,30.00,80.00,1,-3,NULL),
(55,'Dana Kıyma (kg)','hammadde',5,700.00,950.00,1,14,NULL),
(56,'Dana Kuşbaşı (kg)','hammadde',5,700.00,980.00,1,28,NULL),
(57,'Kuzu Eti (kg)','hammadde',5,750.00,950.00,1,23,NULL),
(58,'Tavuk (kg)','hammadde',5,100.00,150.00,1,34,NULL),
(59,'Kuyruk Yağı (kg)','hammadde',2,300.00,500.00,1,27,NULL),
(60,'Kuzu Beyti','hammadde',10,300.00,500.00,1,21,NULL),
(61,'Test Kıyma','hammadde',5,400.00,0.00,1,23,NULL),
(62,'Örnek Kalem','hammadde',10,5.00,10.00,1,100,NULL),
(63,'Örnek Defter','satis_urunu',5,20.00,40.00,1,50,NULL),
(64,'Çivi','satis_urunu',10,5.00,8.00,1,100,NULL),
(65,'Vida','satis_urunu',10,10.00,15.00,1,100,NULL);
/*!40000 ALTER TABLE `urunler` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Final view structure for view `kasa_bakiye_view`
--

/*!50001 DROP VIEW IF EXISTS `kasa_bakiye_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`kadri`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `kasa_bakiye_view` AS select `k`.`id` AS `id`,`k`.`ad` AS `ad`,`k`.`tip` AS `tip`,`k`.`banka_adi` AS `banka_adi`,`k`.`iban` AS `iban`,`k`.`acilis_bakiye` AS `acilis_bakiye`,`k`.`aktif` AS `aktif`,`k`.`created_at` AS `created_at`,`k`.`acilis_bakiye` + coalesce((select sum(case when `kasa_hareketleri`.`tip` = 'giris' then `kasa_hareketleri`.`tutar` else -`kasa_hareketleri`.`tutar` end) from `kasa_hareketleri` where `kasa_hareketleri`.`kasa_id` = `k`.`id`),0) - coalesce((select sum(`personel_odeme`.`tutar`) from `personel_odeme` where `personel_odeme`.`kasa_id` = `k`.`id` and `personel_odeme`.`kasadan_dus` = 1),0) + coalesce((select sum(case when `fatura_odemeleri`.`fatura_tipi` = 'satis' then `fatura_odemeleri`.`tutar` else -`fatura_odemeleri`.`tutar` end) from `fatura_odemeleri` where `fatura_odemeleri`.`kasa_id` = `k`.`id` and `fatura_odemeleri`.`kasadan_dus` = 1),0) AS `bakiye` from `kasa_hesaplari` `k` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-12  1:04:37
