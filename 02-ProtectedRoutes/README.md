# Protected Route
Create a route which can only be accessed by entering a user and a password.

## How to do

### 1 Create the Route
Create a Folder called `/src/routes/protected/`, this will be the protected route 

### 2 Create the Hook
Create a File `/src/hooks.server.ts` and fill in the following:
```ts
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

const auth: Handle = async ({ event, resolve }) => {
    console.log(event.route.id)
	if (event.route.id?.startsWith('/protected')) {
		if (!env.ADMIN_AUTH) {
			return new Response('Not authorized, no ADMIN_AUTH', {
				status: 401
			});
		}
		const basicAuth = event.request.headers.get('Authorization');
		if (basicAuth !== `Basic ${btoa(env.ADMIN_AUTH)}`) {
			return new Response('Not authorized', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="User Visible Realm", charset="UTF-8"'
				}
			});
		}
	}

	const response = await resolve(event);
	return response;
};

export const handle: Handle = sequence(auth);
```



### 3 env
You also need a env file `/.env` in which you write `ADMIN_AUTH=user:password`
