import { logout } from '$lib';

// used when pressing the logout button
export async function GET({ cookies }) {
	// store sessionID in cookies
	const sessionID = cookies.get('session');
	// delete cookies
	cookies.delete('session');
	cookies.delete('userId');

	// logout
	const response = logout(sessionID as string);

	// return response
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
