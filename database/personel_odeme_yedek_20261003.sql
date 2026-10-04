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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personel_odeme`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personel_odeme` WRITE;
/*!40000 ALTER TABLE `personel_odeme` DISABLE KEYS */;
INSERT INTO `personel_odeme` VALUES
(1,1,'maas',30000.00,'2026-10-01',NULL,NULL,0,NULL,NULL,'2026-10-01 12:51:51'),
(2,3,'maas',10000.00,'2026-10-01',NULL,NULL,0,NULL,NULL,'2026-10-01 22:50:25'),
(3,2,'maas',20000.00,'2026-10-01','2026/10',NULL,1,1,3,'2026-10-01 23:04:56');
/*!40000 ALTER TABLE `personel_odeme` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-03 16:13:29
