-- Default spawn: Nix (map 34) at tile 50,50 — water/shore testing map

START TRANSACTION;

ALTER TABLE `characters`
  MODIFY COLUMN `mapId` int(11) NOT NULL DEFAULT 34;

UPDATE `characters`
SET
  `mapId` = 34,
  `world` = 34,
  `x` = 50,
  `y` = 50,
  `worldX` = (34 * 84) + 50,
  `worldY` = 50
WHERE `mapId` = 1 AND `x` = 50 AND `y` = 50;

COMMIT;
