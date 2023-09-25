<script lang="ts">
	import { onMount } from "svelte";

    let messages:any[] = [];
    onMount(async () => {
        console.log("Connecting to SSE")
        const SSE = new EventSource("/api/stream")
        console.log("Connected to SSE")
        SSE.onmessage = async (event:MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message)
            messages = [...messages, message];
        }
    })
</script>

<div>
    {#each messages as message}
        <p>{message.time}: {message.content}</p>
    {/each}
</div>