import express from "express";
import db from "./db/client.js";
import { getFiles } from "./queries/files.js";
import { getFolder, getFolderById } from "./queries/folders.js";


const app = express();
app.use(express.json());

app.get("/files", async (req, res) => {
  const { rows: files } = await db.query(`
    SELECT files.*, folders.name AS folder_name
    FROM files
    JOIN folders ON files.folder_id = folders.id
  `);
  res.status(200).json(files);
});


app.get("/folders", async (req, res) => {
  const folders = await getFolder();
  res.status(200).json(folders);
});


app.get("/folders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const folder = await getFolderById(id);

  if (!folder) return res.sendStatus(404);

  const { rows: files } = await db.query(`
    SELECT * FROM files WHERE folder_id = $1
  `, [id]);

  folder.files = files;
  res.status(200).json(folder);
});


app.post("/folders/:id/files", async (req, res) => {
  const folderId = Number(req.params.id);
  const { name, size } = req.body;

  const folder = await getFolderById(folderId);
  if (!folder) return res.sendStatus(404);
  if (!name || size === undefined) return res.sendStatus(400);

  try {
    const { rows: [file] } = await db.query(`
      INSERT INTO files (name, size, folder_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, size, folderId]);

    res.status(201).json(file);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "File name already exists in this folder" });
    } else {
      throw err;
    }
  }
});

export default app;
