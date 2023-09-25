// A list of all connected clients
export const streams = new Set<ReadableStreamDefaultController>();

// Send a message to all connected clients
export const broadcast = (message: any) => {
    console.log("Broadcasting message:", message);
    for (const stream of streams) {
        stream.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`));
    }
};


// Send a ping message every second to all connected clients
// just to show that it works
setInterval(() => {
    broadcast({content: "ping", time: Date.now()});
}, 1000);