import { ipcMain } from "electron";
import { getDb } from "../db/db";

export function registerNodeHandlers() {
  ipcMain.handle("nodes:listChildren", (_event, parentId: number) => {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, name, kind
         FROM nodes
         WHERE parent_id = ?
         ORDER BY kind DESC, sort_order ASC, name COLLATE NOCASE ASC`
      )
      .all(parentId);
  });

  ipcMain.handle("nodes:createFolder", (_event, parentId: number, name: string) => {
    const db = getDb();
    const info = db
      .prepare(`INSERT INTO nodes (parent_id, name, kind) VALUES (?, ?, 'folder')`)
      .run(parentId, name);
    return info.lastInsertRowid;
  });

  ipcMain.handle("nodes:createFile", (_event, parentId: number, name: string, content: string) => {
    const db = getDb();

    // Transaction so node + content are created together
    const tx = db.transaction(() => {
      const info = db
        .prepare(`INSERT INTO nodes (parent_id, name, kind) VALUES (?, ?, 'file')`)
        .run(parentId, name);

      db.prepare(`INSERT INTO file_contents (node_id, content) VALUES (?, ?)`).run(
        info.lastInsertRowid,
        content
      );

      return info.lastInsertRowid;
    });

    return tx();
  });

  ipcMain.handle("files:read", (_event, nodeId: number) => {
    const db = getDb();
    return db
      .prepare(
        `SELECT n.id, n.name, c.content
         FROM nodes n
         JOIN file_contents c ON c.node_id = n.id
         WHERE n.id = ? AND n.kind = 'file'`
      )
      .get(nodeId);
  });

  ipcMain.handle("files:write", (_event, nodeId: number, content: string) => {
    const db = getDb();
    db.prepare(`UPDATE file_contents SET content = ? WHERE node_id = ?`).run(content, nodeId);
    db.prepare(`UPDATE nodes SET updated_at = datetime('now') WHERE id = ?`).run(nodeId);
    return true;
  });

  ipcMain.handle("nodes:delete", (_event, nodeId: number) => {
    const db = getDb();
    // Cascades delete children + file_contents
    db.prepare(`DELETE FROM nodes WHERE id = ?`).run(nodeId);
    return true;
  });
}
