import { getToday } from "@/api";

const { exec } = require("child_process");
const fs = require('fs');

export default async (fileList = [], nowLevel = 0, location = __dirname) => {
    const validList = [];
    const gzFileName = `result_${getToday(true)}_${nowLevel}.tar.gz`.replace(/ /g, '').replace(/[:-]/g, '_');

    // validation
    for(let i = 0; i < fileList.length; ++i)
    {
        const dir = `${location}/${fileList[i]}`;

        const isExist = fs.existsSync(dir);

        if(!isExist) console.log(`[ERROR] File(${fileList[i]} not exists)`);
        else validList.push(fileList[i]);
    }

    // 압축
    
    const zipFileDir = `${__dirname}/${gzFileName}`;
    const query = `tar -zcvf ${zipFileDir} -C ${location} ${validList.join(' ')}`;
    await exec(query, (err, out) => {
        if(err) throw err;

        console.log(`[INFO] ZIP :: ${out}`)
    })
    
    console.log(`[INFO] ${fileList[0]}, ... ( total ${fileList.length} items) successfully zipped`);
    return gzFileName;
}