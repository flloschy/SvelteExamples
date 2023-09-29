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