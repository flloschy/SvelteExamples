import type { Actions  } from "@sveltejs/kit"
import fs from 'fs';

export const actions: Actions = {
    default: async ({ request }) => {
        const data = Object.fromEntries(await request.formData())
        const file = data.file as File
        const [fileName, fileExt] = file.name.split('.')
        if (fileExt === undefined) return { sucess: false, error: 'Invalid file extension' }
        const filePath = (num:number) => process.cwd() + `\\uploads\\${fileName}${num != 0 ? (' ('+num+')') : ''}.${fileExt}`;
    
        let num = 0;
        while (fs.existsSync(filePath(num))) {num++;}

        try {
            await fs.writeFile(filePath(num), Buffer.from(await (data.file as Blob).arrayBuffer()), (err) => {if (err) throw err;});
        } catch (err: any) {
            return { sucess: false, error: err }
        }

        return { sucess: true, path: filePath(num), name: filePath(num).split('\\').pop() }
    },
  }