-- World integration schema: maps, NPCs, spells, balance, operational tables
-- Applied via: pnpm db:migrate (transaction + schema_migrations ledger)

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `maps` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `zone` varchar(64) NOT NULL DEFAULT '',
  `terrain` varchar(64) NOT NULL DEFAULT '',
  `musicId` int(11) NOT NULL DEFAULT 0,
  `pk` tinyint(1) NOT NULL DEFAULT 0,
  `backup` tinyint(1) NOT NULL DEFAULT 0,
  `magiaSinEfecto` tinyint(1) NOT NULL DEFAULT 0,
  `noEncriptarMP` tinyint(1) NOT NULL DEFAULT 0,
  `restringir` varchar(32) NOT NULL DEFAULT 'No',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npcs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `npcType` int(11) NOT NULL DEFAULT 0,
  `head` int(11) NOT NULL DEFAULT 0,
  `body` int(11) NOT NULL DEFAULT 0,
  `heading` tinyint(4) NOT NULL DEFAULT 3,
  `movement` int(11) NOT NULL DEFAULT 0,
  `attackable` tinyint(1) NOT NULL DEFAULT 0,
  `hostile` tinyint(1) NOT NULL DEFAULT 0,
  `comercia` tinyint(1) NOT NULL DEFAULT 0,
  `tipoItems` int(11) NOT NULL DEFAULT 0,
  `minHp` int(11) NOT NULL DEFAULT 0,
  `maxHp` int(11) NOT NULL DEFAULT 0,
  `minHit` int(11) NOT NULL DEFAULT 0,
  `maxHit` int(11) NOT NULL DEFAULT 0,
  `def` int(11) NOT NULL DEFAULT 0,
  `giveExp` int(11) NOT NULL DEFAULT 0,
  `giveGld` int(11) NOT NULL DEFAULT 0,
  `respawn` tinyint(1) NOT NULL DEFAULT 0,
  `backup` tinyint(1) NOT NULL DEFAULT 0,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `spells` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `magicWords` varchar(255) NOT NULL DEFAULT '',
  `spellType` tinyint(4) NOT NULL DEFAULT 0,
  `targetType` tinyint(4) NOT NULL DEFAULT 0,
  `minSkill` int(11) NOT NULL DEFAULT 0,
  `manaCost` int(11) NOT NULL DEFAULT 0,
  `staminaCost` int(11) NOT NULL DEFAULT 0,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_npc_spawns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapId` int(11) NOT NULL,
  `npcId` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `map_npc_spawns_mapId` (`mapId`),
  KEY `map_npc_spawns_npcId` (`npcId`),
  CONSTRAINT `map_npc_spawns_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `map_npc_spawns_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_object_spawns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapId` int(11) NOT NULL,
  `objectId` int(11) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 1,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `map_object_spawns_mapId` (`mapId`),
  KEY `map_object_spawns_objectId` (`objectId`),
  CONSTRAINT `map_object_spawns_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `map_object_spawns_objectId_fk` FOREIGN KEY (`objectId`) REFERENCES `objects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_tile_exits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapId` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `targetMapId` int(11) NOT NULL,
  `targetX` int(11) NOT NULL,
  `targetY` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `map_tile_exits_mapId` (`mapId`),
  CONSTRAINT `map_tile_exits_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_object_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapId` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `objectId` int(11) NOT NULL,
  `state` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `map_object_states_unique` (`mapId`,`x`,`y`,`objectId`),
  CONSTRAINT `map_object_states_mapId_fk` FOREIGN KEY (`mapId`) REFERENCES `maps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npc_drops` (
  `npcId` int(11) NOT NULL,
  `slot` tinyint(4) NOT NULL,
  `objectId` int(11) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`npcId`,`slot`),
  CONSTRAINT `npc_drops_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npc_shop_items` (
  `npcId` int(11) NOT NULL,
  `slot` int(11) NOT NULL,
  `objectId` int(11) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`npcId`,`slot`),
  CONSTRAINT `npc_shop_items_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npc_spells` (
  `npcId` int(11) NOT NULL,
  `slot` tinyint(4) NOT NULL,
  `spellId` int(11) NOT NULL,
  PRIMARY KEY (`npcId`,`slot`),
  CONSTRAINT `npc_spells_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npc_trainer_creatures` (
  `npcId` int(11) NOT NULL,
  `slot` tinyint(4) NOT NULL,
  `creatureNpcId` int(11) NOT NULL,
  `displayName` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`npcId`,`slot`),
  CONSTRAINT `npc_trainer_creatures_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `npc_shop_backups` (
  `npcId` int(11) NOT NULL,
  `data` json NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`npcId`),
  CONSTRAINT `npc_shop_backups_npcId_fk` FOREIGN KEY (`npcId`) REFERENCES `npcs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `game_balance` (
  `category` varchar(64) NOT NULL,
  `key` varchar(64) NOT NULL,
  `value` decimal(10,4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`category`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `mapId` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cities_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `crafting_recipes` (
  `profession` varchar(32) NOT NULL,
  `slot` int(11) NOT NULL,
  `objectId` int(11) NOT NULL,
  PRIMARY KEY (`profession`,`slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `faction_armor_map` (
  `classId` int(11) NOT NULL,
  `tier` varchar(32) NOT NULL,
  `faction` varchar(16) NOT NULL,
  `gender` varchar(16) NOT NULL DEFAULT 'any',
  `objectId` int(11) NOT NULL,
  PRIMARY KEY (`classId`,`tier`,`faction`,`gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `motd_lines` (
  `lineOrder` int(11) NOT NULL,
  `text` text NOT NULL,
  `colorData` json DEFAULT NULL,
  PRIMARY KEY (`lineOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `help_lines` (
  `lineOrder` int(11) NOT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`lineOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forbidden_names` (
  `name` varchar(64) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `banned_ips` (
  `ip` varchar(45) NOT NULL,
  PRIMARY KEY (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `gm_summon_npcs` (
  `slot` int(11) NOT NULL,
  `npcId` int(11) NOT NULL,
  `displayName` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `map_area_stats` (
  `mapId` int(11) NOT NULL,
  `dayType` tinyint(4) NOT NULL,
  `hourBlock` tinyint(4) NOT NULL,
  `avgConnections` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`mapId`,`dayType`,`hourBlock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `casino_stats` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `losses` int(11) NOT NULL DEFAULT 0,
  `plays` int(11) NOT NULL DEFAULT 0,
  `wins` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `polls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `poll_options` (
  `pollId` int(11) NOT NULL,
  `slot` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `votes` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`pollId`,`slot`),
  CONSTRAINT `poll_options_pollId_fk` FOREIGN KEY (`pollId`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
