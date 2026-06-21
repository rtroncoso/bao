import { describe, expect, it } from "vitest";

import {
  parseBool,
  parseCompositeItem,
  parseIniFile,
  sqlValue,
  upsertSql,
} from "./iniParser.js";

describe("parseIniFile", () => {
  it("parses sections and key-value pairs", () => {
    const sections = parseIniFile(`
[OBJ1]
Name=Espada
ObjType=2
GrhIndex=100

[OBJ2]
Name=Escudo
`);
    expect(sections.OBJ1).toEqual({
      Name: "Espada",
      ObjType: "2",
      GrhIndex: "100",
    });
    expect(sections.OBJ2.Name).toBe("Escudo");
  });

  it("skips comments and blank lines", () => {
    const sections = parseIniFile(`
; comment
# also comment
' apostrophe comment

[SEC]
Key=Value
`);
    expect(sections.SEC.Key).toBe("Value");
  });
});

describe("sqlValue", () => {
  it("escapes strings and handles null", () => {
    expect(sqlValue(null)).toBe("NULL");
    expect(sqlValue("O'Brien")).toBe("'O''Brien'");
    expect(sqlValue(42)).toBe("42");
    expect(sqlValue(true)).toBe("1");
  });
});

describe("upsertSql", () => {
  it("builds an upsert statement", () => {
    const sql = upsertSql("objects", { id: 1, name: "Sword" }, ["id"]);
    expect(sql).toContain("INSERT INTO `objects`");
    expect(sql).toContain("ON DUPLICATE KEY UPDATE");
  });
});

describe("parseBool", () => {
  it("recognizes truthy AO values", () => {
    expect(parseBool("1")).toBe(true);
    expect(parseBool("true")).toBe(true);
    expect(parseBool("si")).toBe(true);
    expect(parseBool("0")).toBe(false);
  });
});

describe("parseCompositeItem", () => {
  it("parses objectId-amount pairs", () => {
    expect(parseCompositeItem("100-5")).toEqual({ objectId: 100, amount: 5 });
    expect(parseCompositeItem("200")).toEqual({ objectId: 200, amount: 1 });
  });
});
