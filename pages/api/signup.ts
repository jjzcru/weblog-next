import { signUp, getUserByEmail } from '../../data/db/UserDB';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
	await runMiddleware(req, res, cors);
	switch (req.method) {
		case 'POST':
			await signUpReq(req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function signUpReq(req, res) {
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { email, name, password } = body;
	try {
		let user = await getUserByEmail(email);
		if (user) {
			res.status(409).json({
				message: 'User already exists',
				status: 'error',
			});
			return;
		}
		user = await signUp({
			email,
			name,
			password,
		});
		res.status(200).json({ id: user.id, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
