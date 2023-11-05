import { login } from '$lib';

// used when pressing the login button
export async function POST({ request, cookies }) {
	// get email and password from the request data
	const { email, password } = await request.json();
	// process login request
	const response = login(email, password);

	// if login is successful, store sessionID and userID in cookies
	if (response.validCredentials) {
		cookies.set('session', response.sessionID as string);
		cookies.set('userId', (response.userId as number).toString());
	}

	// return response
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

// used when loading the page
export async function GET({ cookies }) {
	// get cookies
	const sessionID = cookies.get('session');
	const userId = cookies.get('userId');
	// check if sessionID and userId are valid
	if (!sessionID || !userId)
		return new Response(JSON.stringify({ validCredentials: false }), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	// return response
	return new Response(JSON.stringify({ validCredentials: true, sessionID, userId: userId }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
