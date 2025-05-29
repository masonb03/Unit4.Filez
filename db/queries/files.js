import db from "#db/client";

//ALL FILES
export async function getFiles(){
    const sql = `
    SELECT * 
    FROM files
    `;
    const {rows: files} = await db.query(sql)
    return files;
}

//FILES BY ID
export async function getFilesById(id){
    const sql = `
    SELECT *
    FROM files
    WHERE id = $1
    `;
    const {
        rows: [files],
    } = await db.query(sql, [id])
    return files;
}

//