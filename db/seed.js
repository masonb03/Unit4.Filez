import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  await db.query("DELETE FROM files")
  await db.query("DELETE FROM folders")

  const folderNames = ["Documents", "Pictures", "Music"];
  const folderIds = []

  for(const name of folderNames){
    const {
      rows: [folder],
    } = await db.query(
      `INSERT INTO folders(name)
      VALUES ($1)
      RETURNING *`
      [name]
    );
    folderIds.push(folder.id);
  }

  for (const folderId of folderIds){
    for (let i = 1; i <=5; i++){
      await db.query(
        `INSERT INTO files(name, size, folder_id)
        VALUES ($1, #2, $3)`,
        [`files${i}.txt`, Math.floor(Math.random() * 1000), folderId]
      );
    }
  }
}
