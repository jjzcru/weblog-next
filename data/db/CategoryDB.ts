import { runQuery } from './db';

export interface Category {
	id: string;
	name?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

function mapData(row: any): Category {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
	const updatedAt = row.updated_at ? new Date(row.updated_at) : null;
	return {
		id: row.id,
		name: row.name,
		createdAt,
		updatedAt,
	};
}

export async function getCategories(): Promise<Array<Category>> {
	const query = `SELECT * FROM category;`;
	let { rows } = await runQuery(query);
	return rows.map(mapData);
}

export async function getCategory(id: string): Promise<Category> {
	const query = `SELECT * FROM category WHERE id = $1;`;
	let { rows } = await runQuery(query, [id]);
	return rows.length ? rows.map(mapData)[0] : null;
}
