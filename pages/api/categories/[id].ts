import { getPostsByCategory, addPost } from '../../../data/db/PostDB';
import { getTokenData } from '../../../data/services/auth';
import { cors, runMiddleware } from '../../../middleware/cors';

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
			await getPostsReq(req, res);
			return;
		case 'POST':
			await addPostReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getPostsReq(req, res) {
	const { id } = req.query;
	try {
		let posts = await getPostsByCategory(id);
		res.status(200).json({ posts, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function addPostReq(userId, req, res) {
	const { id } = req.query;
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { title, description, content } = body;

	try {
		res.status(200).json({
			id: await addPost({
				categoryId: id,
				userId,
				title,
				description,
				content,
			}),
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
