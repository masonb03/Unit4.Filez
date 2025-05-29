import db from "#db/client";

export async function getFolder(){
    const sql = `
    SELECT * 
    FROM folders
    `;
    const {rows: folders} = await db.query(sql)
    return folders;
}

export async function getFolderWithFile(){
    const sql = `
    SELECT folders.*
    FROM
    folders
    JOIN files ON folders.id = files.folder_id
    `;
    const {rows: folders} = await db.query(sql)
    return folders;
}

export async function getFolderWithoutFile(){
    const sql = `
    SELECT folders.*
    FROM folders
    LEFT JOIN files ON folders.id = files.folder_id
    WHERE files.id IS NULL
    `;
    const {rows: folders} = await db.query(sql)
    return folders;
}

export async function getFolderById(id){
    const sql = `
    SELECT *
    FROM folders
    WHERE id = $1
    `;
    const {
        rows: [folders],
    } = await db.query(sql,[id])
    return folders;
}
