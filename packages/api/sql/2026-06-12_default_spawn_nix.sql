-- Default spawn: Nix (map 34) at tile 42,44 — walkable grass (50,50 is water-adjacent blocked)

START TRANSACTION;

ALTER TABLE `characters`
  MODIFY COLUMN `mapId` int(11) NOT NULL DEFAULT 34;

UPDATE `characters`
SET
  `mapId` = 34,
  `world` = 34,
  `x` = 42,
  `y` = 44,
  `worldX` = (34 * 84) + 42,
  `worldY` = 44
WHERE (`mapId` = 1 AND `x` = 50 AND `y` = 50)
   OR (`mapId` = 34 AND `x` = 50 AND `y` = 50);

COMMIT;
