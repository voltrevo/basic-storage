import { io, sqlite } from "./deps.ts";

import assertType from "./assertType.ts";
import ioBuffer from "./ioBuffer.ts";
import nil from "./nil.ts";

export default class Database {
  constructor(public sqliteDb: sqlite.DB) {
    sqliteDb.query(`
      CREATE TABLE IF NOT EXISTS basicStorage (
        key BLOB PRIMARY KEY,
        value BLOB NOT NULL
      )
    `);
  }

  read(key: Uint8Array): Uint8Array | nil {
    const rows = this.sqliteDb.query(
      `SELECT value FROM basicStorage WHERE key = (?)`,
      [key],
    );

    assertType(rows, io.array(io.tuple([ioBuffer])));

    if (rows.length === 0) {
      return nil;
    }

    return rows[0][0];
  }

  write(key: Uint8Array, value: Uint8Array | nil) {
    if (value === nil) {
      this.sqliteDb.query(
        `
          DELETE FROM basicStorage WHERE key = (?)
        `,
        [key],
      );
    } else {
      this.sqliteDb.query(
        `
          INSERT OR REPLACE INTO basicStorage VALUES (?, ?)
        `,
        [key, value],
      );
    }
  }
}
