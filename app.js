import express from "express";
import { getFiles } from "./db/files.js";
import { getFolder, getFolderById } from "./db/folders.js";
import db from "./db/client.js";


const app = express();
app.use(express.json());

// GET /files
app.get("/files", async (req, res) => {
  const files = await getFiles();
  res.status(200).json(files);
});

// GET /folders
app.get("/folders", async (req, res) => {
  const folders = await getFolder();
  res.status(200).json(folders);
});

// GET /folders/:id
app.get("/folders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const folder = await getFolderById(id);

  if (!folder) return res.sendStatus(404);

  const files = await db.query(`SELECT * FROM files WHERE folder_id = $1`, [
    id,
  ]);
  folder.files = files.rows;

  res.status(200).json(folder);
});

// POST /folders/:id/files
app.post("/folders/:id/files", async (req, res) => {
  const folderId = Number(req.params.id);
  const { name, size } = req.body;

  // Folder must exist
  const folder = await getFolderById(folderId);
  if (!folder) return res.sendStatus(404);

  if (!name || size === undefined) return res.sendStatus(400);

  try {
    const {
      rows: [file],
    } = await db.query(
      `
      INSERT INTO files (name, size, folder_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [name, size, folderId]
    );

    res.status(201).json(file);
  } catch (err) {
    if (err.code === "23505") {
      // Unique violation
      return res.status(400).json({ error: "File already exists in folder" });
    }
    throw err;
  }
});

export default app;
