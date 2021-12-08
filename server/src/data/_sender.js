import { getToday } from "@/api";

const { exec } = require("child_process");
const fs = require('fs');

export default (fileList = []) => {
    const validList = [];
    const gzFileName = `result_${getToday(true)}.tar.gz`;

    // validation
    for(let i = 0; i < fileList.length; ++i)
    {
        const dir = `${__dirname}/${fileList[i]}`;

        const isExist = fs.existsSync(dir);

        if(!isExist) console.log(`ERROR :: File(${fileList[i]} not exists)`);
        else validList.push(fileList[i]);
    }

    // 압축
    const query = `tar zcvf ${gzFileName} ${validList.join(' ')}`;
    exec(query, (err, out) => {
        if(err) throw err;

        console.log("Successfully zipped");
        console.log(out);
     })

    return gzFileName;
}