import { streams } from "$lib";


// When this API endpoint is called,
// it will return a stream which is
// used to send messages from server to client
export async function GET() {
    let controller: ReadableStreamDefaultController | undefined;
    const stream = new ReadableStream({
        start(control) {
            console.log("Client connected");
            controller = control;
            controller.enqueue(new TextEncoder().encode(": ping\n\n"));
            streams.add(controller);
        },

        cancel() {
            console.log("Client disconnected");
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