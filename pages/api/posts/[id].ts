import { updatePost, getPostById, deletePost } from '../../../data/db/PostDB';
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
			await getPostReq(req, res);
			return;
		case 'PUT':
			await updatePostReq(tokenData.id, req, res);
			return;
		case 'DELETE':
			await deletePostReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getPostReq(req, res) {
	const { id } = req.query;
	try {
		let post = await getPostById(id);
		if (!post) {
			res.status(404).json({
				message: 'Post not found',
				status: 'error',
			});
			return;
		}
		res.status(200).json({ post, status: 'success' });
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function updatePostReq(userId, req, res) {
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

	const post = await updatePost({
		id,
		userId,
		title,
		description,
		content,
	});

	if (!post) {
		res.status(404).json({ message: 'Post not found', status: 'error' });
		return;
	}

	try {
		res.status(200).json({
			id: post,
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function deletePostReq(userId, req, res) {
	const { id } = req.query;
	try {
		const post = await deletePost({
			id,
			userId,
		});
		if (!post) {
			res.status(404).json({
				message: 'Post not found',
				status: 'error',
			});
			return;
		}
		res.status(200).json({
			id: post,
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
