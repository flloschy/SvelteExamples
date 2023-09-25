# SSE - Server Sent Event
A Server sent Event in short is the method to send live data from the server to the client *(the browser)*. \
This is usefull when you for example create a realtime chat or execute a command on the server's system and you want to show its output


## How to do

### 1 Create the Backend
Create a Folder called `/src/lib/` and in there the file `index.ts`. This is your backend code

### 2 Create the Streams 
In the `index.ts` create a set where all the current active connections will be stored
```ts
export const streams = new Set<ReadableStreamDefaultController>();
```

### 3 Broadcast
To be able to send the data you need a method to send it. This is done like the following 
```ts
export const broadcast = (message: any) => {
    for (const stream of streams) {
        stream.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`));
    }
};
```

### 4 API endpoint
For the frontend to receive the Stream you may use a API endpoint - this is no must have but I like it :) \
So, create a API and an API endpoint like `/src/routes/api/stream`, in which you create a server file `+server.ts` \
In there create a `GET` method and paste in the following:
```ts
import { streams } from "$lib";

export async function GET() {
    let controller: ReadableStreamDefaultController | undefined;
    const stream = new ReadableStream({
        start(control) {
            controller = control;
            controller.enqueue(new TextEncoder().encode(": ping\n\n"));
            streams.add(controller);
        },

        cancel() {
            if (controller)
                streams.delete(controller);
        },
    });
    const response = new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    }); 

    return response;
}
```

### 5 Front end
In the front end you just need to create a `EventSource` wich references to the API endpoint.
```svelte
<script lang="ts">
	import { onMount } from "svelte";

    let messages:any[] = [];
    onMount(async () => {
        const SSE = new EventSource("/api/stream")
        SSE.onmessage = async (event:MessageEvent) => {
            const message = JSON.parse(event.data);
            messages = [...messages, message];
        }
    })
</script>

<div>
    {#each messages as message}
        <p>{message.time}: {message.content}</p>
    {/each}
</div>
```
IMPORTANT: Do **NOT** use `messages.push`, because the following loop wont update, you need to overwrite the whole variable!!