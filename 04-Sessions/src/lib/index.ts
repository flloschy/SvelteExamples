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
	// dummy user data
	{
		email: 'e',
		password: 'p',
		id: 1
	}
];
const sessions: Session = {};

interface loginResponse {
	validCredentials: boolean;
	userId?: number;
	sessionID?: string;
}

export const login = (email: string, password: string): loginResponse => {
	console.log('Got login request: ', email, password);
	const user = users.find((user) => user.email === email && user.password === password);
	if (user) {
		console.log('Found user: ', user.id);
		const sessionID = Math.random().toString(36).slice(2);
		const expiry = new Date();
		expiry.setDate(expiry.getDate() + 1);

		sessions[sessionID] = {
			userID: user.id,
			expiry: expiry
		};

		console.log('Created session: ', sessionID);

		return { validCredentials: true, userId: user.id, sessionID };
	} else {
		console.log('No user found');
		return { validCredentials: false };
	}
};

interface validateRequestResponse {
	validCredentials: boolean;
	requestProcessed?: boolean;
	requestResponse?: any;
}

export const processRequest = (sessionID: string, requestData: any): validateRequestResponse => {
	console.log('Got request: ', sessionID, requestData);
	const session = sessions[sessionID];
	if (session) {
		console.log('Found session: ', sessionID);
		const now = new Date();
		if (session.expiry > now) {
			/*
                Process
                request
                here
            */
			console.log('Request processed');
			return {
				validCredentials: true,
				requestProcessed: true,
				requestResponse: `successfully executed ${requestData}`
			};
		} else {
			console.log('Session expired');
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

interface logoutResponse {
	validCredentials: boolean;
	loggedOut?: boolean;
}

export const logout = (sessionID: string): logoutResponse => {
	console.log('Got logout request: ', sessionID);

	const session = sessions[sessionID];
	if (session) {
		console.log('Found session: ', sessionID);
		delete sessions[sessionID];
		console.log('Deleted session');
		return { validCredentials: true, loggedOut: true };
	} else {
		console.log('No session found');
		return { validCredentials: false };
	}
};
