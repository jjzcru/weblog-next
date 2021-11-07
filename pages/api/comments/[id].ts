import { updateComment, deleteComment } from '../../../data/db/PostDB';
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
		case 'PUT':
			await updateCommentReq(tokenData.id, req, res);
			return;
		case 'DELETE':
			await deleteCommentReq(tokenData.id, req, res);
			return;
		default:
			res.status(404).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function updateCommentReq(userId, req, res) {
	const { id } = req.query;
	const { body } = req;
	if (!body) {
		res.status(400).send({
			status: 'error',
			message: 'Missing body',
		});
		return;
	}

	const { content } = body;

	const comment = await updateComment({
		id,
		userId,
		content,
	});

	if (!comment) {
		res.status(404).json({ message: 'comment not found', status: 'error' });
		return;
	}

	try {
		res.status(200).json({
			id: comment,
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}

async function deleteCommentReq(userId, req, res) {
	const { id } = req.query;
	try {
		const comment = await deleteComment({
			id,
			userId,
		});
		if (!comment) {
			res.status(404).json({
				message: 'Post not found',
				status: 'error',
			});
			return;
		}
		res.status(200).json({
			id: comment,
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}
