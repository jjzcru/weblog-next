import { getPostByUser } from '../../data/db/PostDB';
import { getTokenData } from '../../data/services/auth';
import { cors, runMiddleware } from '../../middleware/cors';

export default async function handler(req, res) {
	let tokenData;
	try {
		await runMiddleware(req, res, cors);
		tokenData = await getTokenData(req);
	} catch (e) {
		res.status(400).json({ message: e.message, status: 'error' });
		return;
	}

	switch (req.method) {
		case 'GET':
			await getPostsReq(tokenData.id, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getPostsReq(userId, res) {
	try {
		let posts = await getPostByUser(userId);
		res.status(200).json({ posts, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
