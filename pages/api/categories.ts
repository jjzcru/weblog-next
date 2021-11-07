import { getCategories } from '../../data/db/CategoryDB';
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
		case 'GET':
			await getCategoriesReq(res);
			return;
		default:
			res.status(400).json({
				message: 'Not found',
				status: 'error',
			});
	}
}

async function getCategoriesReq(res) {
	try {
		res.status(200).json({
			categories: await getCategories(),
			status: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: e.message, status: 'error' });
		return;
	}
}