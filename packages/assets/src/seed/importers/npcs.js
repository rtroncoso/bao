import path from 'path';
import fs from 'fs';
import {
  parseBool,
  parseCompositeItem,
  parseIniFile,
  readLatin1File,
  upsertSql,
} from '../lib/iniParser.js';

const TRAINER_NPC_TYPE = 3;

export const importNpcs = ({ datsDir }) => {
  const filePath = path.join(datsDir, 'NPCs.dat');
  if (!fs.existsSync(filePath)) {
    return { statements: [], count: 0, skipped: true };
  }

  const sections = parseIniFile(readLatin1File(filePath, fs));
  const statements = [];
  let count = 0;

  for (const [sectionName, fields] of Object.entries(sections)) {
    const match = sectionName.match(/^NPC(\d+)$/i);
    if (!match) {
      continue;
    }

    const npcId = Number.parseInt(match[1], 10);
    const data = { ...fields };
    delete data.Name;
    delete data.Desc;

    statements.push(
      upsertSql(
        'npcs',
        {
          id: npcId,
          name: fields.Name ?? '',
          description: fields.Desc ?? '',
          npcType: Number.parseInt(fields.NpcType ?? '0', 10),
          head: Number.parseInt(fields.Head ?? '0', 10),
          body: Number.parseInt(fields.Body ?? '0', 10),
          heading: Number.parseInt(fields.Heading ?? '3', 10),
          movement: Number.parseInt(fields.Movement ?? '0', 10),
          attackable: parseBool(fields.Attackable) ? 1 : 0,
          hostile: parseBool(fields.Hostile) ? 1 : 0,
          comercia: parseBool(fields.Comercia) ? 1 : 0,
          tipoItems: Number.parseInt(fields.TipoItems ?? '0', 10),
          minHp: Number.parseInt(fields.MinHP ?? '0', 10),
          maxHp: Number.parseInt(fields.MaxHP ?? '0', 10),
          minHit: Number.parseInt(fields.MinHit ?? fields.MinHIT ?? '0', 10),
          maxHit: Number.parseInt(fields.MaxHit ?? fields.MaxHIT ?? '0', 10),
          def: Number.parseInt(fields.DEF ?? fields.Def ?? '0', 10),
          giveExp: Number.parseInt(fields.GiveEXP ?? '0', 10),
          giveGld: Number.parseInt(fields.GiveGLD ?? '0', 10),
          respawn: parseBool(fields.ReSpawn) ? 1 : 0,
          backup: parseBool(fields.BackUp) ? 1 : 0,
          data: JSON.stringify(data),
        },
        ['id'],
      ),
    );

    for (let slot = 1; slot <= 5; slot += 1) {
      const dropValue = fields[`Drop${slot}`];
      if (!dropValue) {
        continue;
      }

      const { objectId, amount } = parseCompositeItem(dropValue);
      if (!Number.isFinite(objectId)) {
        continue;
      }

      statements.push(
        upsertSql(
          'npc_drops',
          {
            npcId,
            slot,
            objectId,
            amount,
          },
          ['npcId', 'slot'],
        ),
      );
    }

    const shopCount = Number.parseInt(fields.NROITEMS ?? '0', 10);
    for (let slot = 1; slot <= shopCount; slot += 1) {
      const shopValue = fields[`Obj${slot}`] ?? fields[`obj${slot}`];
      if (!shopValue) {
        continue;
      }

      const { objectId, amount } = parseCompositeItem(shopValue);
      if (!Number.isFinite(objectId)) {
        continue;
      }

      statements.push(
        upsertSql(
          'npc_shop_items',
          {
            npcId,
            slot,
            objectId,
            amount,
          },
          ['npcId', 'slot'],
        ),
      );
    }

    if (parseBool(fields.LanzaSpells)) {
      for (const [key, value] of Object.entries(fields)) {
        const spellMatch = key.match(/^Sp(\d+)$/i);
        if (!spellMatch || !value) {
          continue;
        }

        const slot = Number.parseInt(spellMatch[1], 10);
        const spellId = Number.parseInt(value, 10);
        if (!Number.isFinite(spellId)) {
          continue;
        }

        statements.push(
          upsertSql(
            'npc_spells',
            {
              npcId,
              slot,
              spellId,
            },
            ['npcId', 'slot'],
          ),
        );
      }
    }

    const npcType = Number.parseInt(fields.NpcType ?? '0', 10);
    if (npcType === TRAINER_NPC_TYPE) {
      const creatureCount = Number.parseInt(fields.NroCriaturas ?? '0', 10);
      for (let slot = 1; slot <= creatureCount; slot += 1) {
        const creatureNpcId = Number.parseInt(fields[`CI${slot}`], 10);
        if (!Number.isFinite(creatureNpcId)) {
          continue;
        }

        statements.push(
          upsertSql(
            'npc_trainer_creatures',
            {
              npcId,
              slot,
              creatureNpcId,
              displayName: fields[`CN${slot}`] ?? '',
            },
            ['npcId', 'slot'],
          ),
        );
      }
    }

    count += 1;
  }

  return { statements, count, skipped: false };
};
