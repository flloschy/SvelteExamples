# Sessions

Authenticate Users by using Sessions to verify their identity and keep them logged in.

## How to do

### 1 Create the backend

Create a folder `src/lib` and create a `index.ts` file, in there you will manage the users and sessions.

#### 1 Store the users and sessions

```ts
interface User {
	email: string;
	password: string;
	id: number;
}

interface Session {
	// key: sessionID
	// value: userID
	[key: string]: {
		userID: number;
		expiry: Date;
	};
}

const users: User[] = [
	{
		email: 'e',
		password: 'p',
		id: 1
	}
];
const sessions: Session = {};
```

(here a placeholder user got created too)

#### 2 Manage login's and logout's

```ts
export const login = (email: string, password: string) => {
	const user = users.find((user) => user.email === email && user.password === password);
	if (user) {
		const sessionID = Math.random().toString(36).slice(2);
		const expiry = new Date();
		expiry.setDate(expiry.getDate() + 1);
		sessions[sessionID] = {
			userID: user.id,
			expiry: expiry
		};
		return { validCredentials: true, userId: user.id, sessionID };
	} else {
		return { validCredentials: false };
	}
};
```

```ts
export const logout = (sessionID: string) => {
	const session = sessions[sessionID];
	if (session) {
		delete sessions[sessionID];
		return { validCredentials: true, loggedOut: true };
	} else {
		return { validCredentials: false };
	}
};
```

and a way to process incoming requests:

```ts
export const processRequest = (sessionID: string, requestData: any) => {
	const session = sessions[sessionID];
	if (session) {
		const now = new Date();
		if (session.expiry > now) {
			/* Process request here */
			return {
				validCredentials: true,
				requestProcessed: true,
				requestResponse: `successfully executed ${requestData}`
			};
		} else {
			logout(sessionID);
			return {
				validCredentials: true,
				requestProcessed: false,
				requestResponse: 'Session expired'
			};
		}
	} else {
		return { validCredentials: false };
	}
};
```

### 2 Create the API

Add three folders named `login`, `logout` and `request` in `src/routes/api`. Each of those Api endpoints create a `+server.ts`.

#### login

```ts
import { login } from '$lib';

export async function POST({ request, cookies }) {
	const { email, password } = await request.json();
	const response = login(email, password);
	if (response.validCredentials) {
		cookies.set('session', response.sessionID as string);
		cookies.set('userId', (response.userId as number).toString());
	}

	return new Response(JSON.stringify(response), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function GET({ cookies }) {
	const sessionID = cookies.get('session');
	const userId = cookies.get('userId');
	if (!sessionID || !userId)
		return new Response(JSON.stringify({ validCredentials: false }), {
			headers: { 'Content-Type': 'application/json' }
		});

	return new Response(JSON.stringify({ validCredentials: true, sessionID, userId: userId }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
```

#### logout

```ts
import { logout } from '$lib';

export async function GET({ cookies }) {
	const sessionID = cookies.get('session');
	cookies.delete('session');
	cookies.delete('userId');

	const response = logout(sessionID);
	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
```

#### request

```ts
import { processRequest } from '$lib';

export async function POST({ request, cookies }) {
	const sessionID = cookies.get('session');

	const data = await request.json();
	const response = processRequest(sessionID, data);

	return new Response(JSON.stringify(response), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
```

### 3 UI

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let fail: any = false;
	let loggedIn: any = false;
	let sessionId: any = null;
	let userId: any = null;
	let response: any = null;

	onMount(async () => {
		const response = await fetch('/api/login');
		const data = await response.json();
		if (data.validCredentials) {
			loggedIn = true;
			sessionId = data.sessionID;
			userId = data.userId;
		}
	});

	const login = async () => {
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;

		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		response.json().then((data) => {
			if (data.validCredentials) {
				loggedIn = true;
				sessionId = data.sessionID;
				userId = data.userId;
			} else {
				fail = true;
			}
		});
	};

	const makeRequest = async () => {
		const select = (document.getElementById('select') as HTMLSelectElement).value;
		response = await fetch('/api/request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(select)
		}).then((res) => res.json());

		console.log(response);
	};

	const logout = async () => {
		await fetch('/api/logout');
		loggedIn = false;
		sessionId = null;
		userId = null;
	};
</script>

{#if !fail}
	{#if loggedIn}
		<button on:click={logout}>Logout</button>

		<h1>Session: {sessionId}</h1>
		<br />
		<h1>User: {userId}</h1>

		<select id="select">
			<option value="a">function 1</option>
			<option value="b">function 2</option>
			<option value="c" selected>function 3</option>
			<option value="d">function 4</option>
		</select>

		<button on:click={makeRequest}>Execute</button>

		{#if response}
			{JSON.stringify(response)}
		{/if}
	{:else}
		<input id="email" type="text" placeholder="email" />
		<input id="password" type="password" placeholder="password" />
		<button on:click={login}>Login</button>
		<h1>Not logged in</h1>
	{/if}
{:else}
	<h1>Failed to login</h1>
{/if}
```

### 4 Info

This is a very basic implementation and **I wouldn't recommend using this the exact same way**. \
Why?

1. Users are stored in memory
2. Sessions are stored in memory
3. Passwords are stored in plaintext
4. The responses from backend/api aren't consistent
5. Pages are shipped to everyone, no mater if logged in or not
6. There is no user specific page content - everyone sees the same
7. executing functions via. one single backend function is probably not a good idea
8. All routes are accessible; Possible fix: using `hooks` to decide on if to ship the route/page to a user or not
9. Everything works with an api endpoint aka. needing to use `fetch`, actions with a `+page.server.ts` would make everything easier
10. We are using two cookies to store the sessionID and the userID instead of storing both in one cookie or only using the sessionID for everything
11. Multiple clients using the same account wont work properly (when using two or more clients and one logs off, every other client wont work anymore)
