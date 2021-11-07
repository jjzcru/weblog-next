import { runQuery } from './db';

export interface User {
	id: string;
	email?: string;
    picture?: string;
    name?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

function mapData(row: any): User {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
    const updatedAt = row.updated_at ? new Date(row.updated_at) : null;
	return {
		id: row.id,
		email: row.email,
        name: row.name,
		createdAt,
        updatedAt
	};
}

export async function authenticate(
	email: string,
	password: string
): Promise<User> {
	const query = `SELECT * FROM app_user where email = $1 and password = sha512('${password}') LIMIT 1;`;
	let { rows } = await runQuery(query, [email]);
	if (!rows.length) {
		return null;
	}
	return rows.map(mapData)[0];
}


export async function getUserById(id: string): Promise<Array<User>> {
	const query = `SELECT * FROM app_user where id = $1;`;
	let { rows } = await runQuery(query);
	return rows.map(mapData);
}

export async function getCategory(id: string): Promise<User> {
	const query = `SELECT * FROM category WHERE id = $1;`;
	let { rows } = await runQuery(query, [id]);
	return rows.length ? rows.map(mapData)[0] : null;
}