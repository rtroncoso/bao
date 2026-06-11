CREATE TABLE IF NOT EXISTS `map_blocked_tiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapId` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `map_blocked_tiles_unique` (`mapId`,`x`,`y`),
  KEY `map_blocked_tiles_mapId` (`mapId`),
  CONSTRAINT `map_blocked_tiles_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
