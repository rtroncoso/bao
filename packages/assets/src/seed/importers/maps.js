import path from 'path';
import fs from 'fs';
import { upsertSql } from '../lib/iniParser.js';

const readMetaFiles = (mapsMetaDir) => {
  if (!fs.existsSync(mapsMetaDir)) {
    return [];
  }

  return fs
    .readdirSync(mapsMetaDir)
    .filter((fileName) => fileName.endsWith('.meta.json'))
    .map((fileName) => {
      const metaPath = path.join(mapsMetaDir, fileName);
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const mapId = meta.mapId ?? Number.parseInt(fileName.replace('.meta.json', ''), 10);
      return { mapId, meta };
    })
    .filter(({ mapId }) => Number.isFinite(mapId))
    .sort((left, right) => left.mapId - right.mapId);
};

export const importMaps = ({ mapsMetaDir }) => {
  const metaFiles = readMetaFiles(mapsMetaDir);
  if (metaFiles.length === 0) {
    return { statements: [], count: 0, skipped: true };
  }

  const statements = [
    'DELETE FROM `map_tile_exits`;',
    'DELETE FROM `map_object_spawns`;',
    'DELETE FROM `map_npc_spawns`;',
  ];

  for (const { mapId, meta } of metaFiles) {
    const info = meta.info ?? {};

    statements.push(
      upsertSql(
        'maps',
        {
          id: mapId,
          name: info.name ?? '',
          zone: info.zona ?? info.zone ?? '',
          terrain: info.terreno ?? info.terrain ?? '',
          musicId: info.musicNum ?? info.musicId ?? 0,
          pk: info.pk ? 1 : 0,
          backup: info.backup ? 1 : 0,
          magiaSinEfecto: info.magiaSinEfecto ? 1 : 0,
          noEncriptarMP: info.noEncriptarMP ? 1 : 0,
          restringir: info.restringir ?? 'No',
        },
        ['id'],
      ),
    );

    for (const npc of meta.npcs ?? []) {
      statements.push(
        `INSERT INTO \`map_npc_spawns\` (\`mapId\`, \`npcId\`, \`x\`, \`y\`) VALUES (${mapId}, ${npc.npcId}, ${npc.x}, ${npc.y});`,
      );
    }

    for (const objectSpawn of meta.objects ?? []) {
      statements.push(
        `INSERT INTO \`map_object_spawns\` (\`mapId\`, \`objectId\`, \`amount\`, \`x\`, \`y\`) VALUES (${mapId}, ${objectSpawn.objectId}, ${objectSpawn.amount ?? 1}, ${objectSpawn.x}, ${objectSpawn.y});`,
      );
    }

    for (const tileExit of meta.tileExits ?? []) {
      statements.push(
        `INSERT INTO \`map_tile_exits\` (\`mapId\`, \`x\`, \`y\`, \`targetMapId\`, \`targetX\`, \`targetY\`) VALUES (${mapId}, ${tileExit.x}, ${tileExit.y}, ${tileExit.targetMapId}, ${tileExit.targetX}, ${tileExit.targetY});`,
      );
    }
  }

  return { statements, count: metaFiles.length, skipped: false };
};
