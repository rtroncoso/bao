-- Character world position: mapId + local tiles + denormalized world coords

START TRANSACTION;

SET @db = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'characters' AND COLUMN_NAME = 'mapId') = 0,
  'ALTER TABLE `characters` ADD COLUMN `mapId` int(11) NOT NULL DEFAULT 34 AFTER `genre`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'characters' AND COLUMN_NAME = 'worldX') = 0,
  'ALTER TABLE `characters` ADD COLUMN `worldX` int(11) NOT NULL DEFAULT 0 AFTER `y`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'characters' AND COLUMN_NAME = 'worldY') = 0,
  'ALTER TABLE `characters` ADD COLUMN `worldY` int(11) NOT NULL DEFAULT 0 AFTER `worldX`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `characters`
SET `mapId` = CASE WHEN `world` > 0 THEN `world` ELSE 34 END;

UPDATE `characters`
SET
  `x` = CASE WHEN `x` = 0 AND `y` = 0 THEN 44 ELSE `x` END,
  `y` = CASE WHEN `x` = 0 AND `y` = 0 THEN 88 ELSE `y` END;

-- Linear fallback until worlds.json backfill runs (mapId * map size + local)
UPDATE `characters`
SET
  `worldX` = (`mapId` * 84) + `x`,
  `worldY` = `y`;

-- Migrations run before `bao seed apply`; stub any referenced maps so the FK can be added.
INSERT INTO `maps` (`id`, `name`)
SELECT DISTINCT c.`mapId`, ''
FROM `characters` c
LEFT JOIN `maps` m ON m.`id` = c.`mapId`
WHERE m.`id` IS NULL;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'characters' AND INDEX_NAME = 'characters_mapId') = 0,
  'ALTER TABLE `characters` ADD KEY `characters_mapId` (`mapId`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
   WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'characters' AND CONSTRAINT_NAME = 'characters_mapId_fk') = 0,
  'ALTER TABLE `characters` ADD CONSTRAINT `characters_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

COMMIT;
