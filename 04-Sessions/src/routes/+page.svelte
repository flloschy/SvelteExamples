<script lang="ts">
	import { onMount } from 'svelte';

	let fail: any = false;
	let loggedIn: any = false;
	let sessionId: any = null;
	let userId: any = null;
	let response: any = null;

	// when opening the page
	onMount(async () => {
		// request the login status
		const response = await fetch('/api/login');
		const data = await response.json();
		// if the user is logged in (sessionID and userId are set in the cookies and valid) then proceed
		if (data.validCredentials) {
			loggedIn = true;
			sessionId = data.sessionID;
			userId = data.userId;
		}
	});

	const login = async () => {
		// get the email and password from the input fields
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;

		// send the login request to the server
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		// convert the response to json
		response.json().then((data) => {
			// if the login was successful, proceed
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
		// get the selected value from the select field
		const select = (document.getElementById('select') as HTMLSelectElement).value;
		// request the server to execute the function
		response = await fetch('/api/request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(select)
		}).then((res) => res.json());
	};

	const logout = async () => {
		// request the server to logout
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
