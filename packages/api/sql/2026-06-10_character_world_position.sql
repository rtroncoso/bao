-- Character world position: mapId + local tiles + denormalized world coords

START TRANSACTION;

ALTER TABLE `characters`
  ADD COLUMN `mapId` int(11) NOT NULL DEFAULT 34 AFTER `genre`,
  ADD COLUMN `worldX` int(11) NOT NULL DEFAULT 0 AFTER `y`,
  ADD COLUMN `worldY` int(11) NOT NULL DEFAULT 0 AFTER `worldX`;

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

ALTER TABLE `characters`
  ADD KEY `characters_mapId` (`mapId`),
  ADD CONSTRAINT `characters_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`);

COMMIT;
