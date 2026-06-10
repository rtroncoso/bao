-- Default spawn: Ullathorpe (map 1) at tile 50,50

START TRANSACTION;

ALTER TABLE `characters`
  MODIFY COLUMN `mapId` int(11) NOT NULL DEFAULT 1;

UPDATE `characters`
SET
  `mapId` = 1,
  `world` = 1,
  `x` = 50,
  `y` = 50,
  `worldX` = 50,
  `worldY` = 50
WHERE `mapId` = 34 AND `x` = 44 AND `y` = 88;

COMMIT;
