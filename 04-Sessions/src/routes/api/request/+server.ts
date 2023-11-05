import { processRequest } from '$lib';

// used when pressing the Execute button
export async function POST({ request, cookies }) {
	// get sessionID from cookies
	const sessionID = cookies.get('session');
	// get request data
	const data = await request.json();
	// process request in the backend
	const response = processRequest(sessionID as string, data);
	// return response
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
