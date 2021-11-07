import { authenticate } from '../../data/db/UserDB';
import { getSignedToken } from '../../data/services/auth';
import { runMiddleware, cors } from '../../middleware/cors';

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);
	if (req.method === 'POST') {
		const { body } = req;
		const { email, password } = body;
		const employee = await authenticate(email, password);
		if (!employee) {
            res.status(401).json({
				message: 'Invalid credentials',
				status: 'error',
			});
			return 
		}
        const {token, expiredAt} = await getSignedToken(employee)
        res.status(200).json({ 
            authToken: token,
            expiredAt: expiredAt,
            message: 'Successfully logged in.',
            status: 'success'
         });
		return;
	}

    res.status(400).json({ 
        message: 'Not found',
        status: 'error'
     });
}
