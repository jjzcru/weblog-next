import { addComment } from '../../data/db/PostDB';
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
		case 'POST':
			await addPostsReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function addPostsReq(userId, req, res) {
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { content, parent, postId } = body;
	try {
		let comment = await addComment({
            postId,
            userId,
            content,
            parent
        });
		res.status(200).json({ id: comment, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
