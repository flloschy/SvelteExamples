# File Upload
Create a page to upload a file to the server

## How to do

### 1 Create the Upload folder
Create a Folder called `/uploads`, this will be the final destination of your uploaded files 

### 2 Create the page

From here you will be able to upload your files

```svelte
<script>
    export let form;
</script>

<form method="post" enctype="multipart/form-data">
    <input type="file" name="file" placeholder="avatar" />
    <button type="submit">upload</button>
</form>

sucess: {form?.sucess}<br>
{#if form?.sucess}
    path: {form?.path}<br>
    file name: {form?.name}<br>
{:else}
    error: {form?.error}
{/if}
```

### 3 Crete the backend

Here the server will get the file and put it in the uploads folder

```ts
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
```




### 3 env
You also need a env file `/.env` in which you write `ADMIN_AUTH=user:password`
