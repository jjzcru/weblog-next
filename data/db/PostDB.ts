import { runQuery } from './db';

import { Category } from './CategoryDB';
import { User } from './UserDB';

export interface Post {
	id: string;
	category?: Category;
	user?: User;
	title?: string;
	description?: string;
	content?: string;
	comments?: Array<Comment>;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

interface Comment {
	id: string;
	user?: User;
	content?: string;
	parent?: number;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

interface AddPost {
	categoryId: string;
	userId: string;
	title: string;
	description: string;
	content: string;
}

interface UpdatePost {
	id: string;
	userId: string;
	title: string;
	description: string;
	content: string;
}

interface DeletePost {
	id: string;
	userId: string;
}

interface AddComment {
	postId: string;
	userId: string;
	content: string;
	parent?: string;
}

interface UpdateComment {
	id: string;
	userId: string;
	content: string;
}

interface DeleteComment {
	id: string;
	userId: string;
}

function mapDataPost(row: any): Post {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
	const updatedAt = row.updated_at ? new Date(row.updated_at) : null;
	return {
		id: row.id,
		category: {
			id: row.category_id,
			name: row.category_name,
		},
		user: {
			id: row.user_id,
			name: row.user_name,
			picture: row.user_picture,
		},
		title: row.title,
		description: row.description,
		content: row.content,
		comments: [],
		createdAt,
		updatedAt,
	};
}

function mapDataComment(row: any): Comment {
	const createdAt = row.created_at ? new Date(row.created_at) : null;
	const updatedAt = row.updated_at ? new Date(row.updated_at) : null;
	return {
		id: row.id,
		user: {
			id: row.user_id,
			name: row.user_name,
			picture: row.user_picture,
		},
		content: row.content,
		parent: row.parent,
		createdAt,
		updatedAt,
	};
}

// Posts

const rowsQuery = `p.id, p.category_id, c."name" as category_name, 
p.user_id, u.name as user_name, u.picture as user_picture,
p.title, p.description, p.content, p.created_at, p.updated_at`;

export async function getPostsByCategory(
	categoryId: string
): Promise<Array<Post>> {
	const query = `SELECT ${rowsQuery} FROM post p 
	LEFT JOIN category c ON (p.category_id = c.id)
	LEFT JOIN app_user u ON (p.user_id = u.id)
    WHERE p.category_id = $1;`;
	let { rows } = await runQuery(query, [categoryId]);
	const posts: Array<Post> = rows.map(mapDataPost);
	const response = [];
	for (const post of posts) {
		post.comments = await getComments(post.id);
		response.push(post);
	}
	return response;
}

export async function getPostById(id: string): Promise<Post> {
	const query = `SELECT ${rowsQuery} FROM post p 
	LEFT JOIN category c ON (p.category_id = c.id)
	LEFT JOIN app_user u ON (p.user_id = u.id)
    WHERE p.id = $1;`;
	let { rows } = await runQuery(query, [id]);
	if (!rows.length) {
		return null;
	}
	const post = rows.map(mapDataPost)[0];
	post.comments = await getComments(post.id);
	return post;
}

export async function getPostByUser(userId: string): Promise<Array<Post>> {
	const query = `SELECT ${rowsQuery} FROM post p 
	LEFT JOIN category c ON (p.category_id = c.id)
	LEFT JOIN app_user u ON (p.user_id = u.id)
    WHERE p.user_id = $1;`;
	let { rows } = await runQuery(query, [userId]);
	const posts: Array<Post> = rows.map(mapDataPost);
	const response: Array<Post> = [];
	for (const post of posts) {
		post.comments = await getComments(post.id);
		response.push(post);
	}
	return response;
}

export async function addPost(post: AddPost): Promise<string> {
	let query = `INSERT INTO post (category_id, user_id, title, 
        "description", content)
	VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
	let { rows } = await runQuery(query, [
		post.categoryId,
		post.userId,
		post.title,
		post.description,
		post.content,
	]);
	return rows[0].id;
}

export async function updatePost(post: UpdatePost): Promise<string> {
	let query = `UPDATE post SET title = $1, "description" = $2, 
    content = $3 WHERE id = $4 AND user_id = $5 RETURNING id;`;
	let { rows } = await runQuery(query, [
		post.title,
		post.description,
		post.content,
		post.id,
		post.userId,
	]);
	return rows.length ? rows[0].id : null;
}

export async function deletePost(post: DeletePost): Promise<string> {
	let query = `DELETE FROM post where id = $1 AND 
    user_id = $2 RETURNING id;`;
	let { rows } = await runQuery(query, [post.id, post.userId]);
	return rows.length ? rows[0].id : null;
}

// Comments

export async function getComments(postId: string): Promise<Array<Comment>> {
	const query = `SELECT pc.id, pc.post_id, p.user_id, u.name as user_name,
	u.picture as user_picture, pc."content", pc.parent,
	pc.created_at, pc.updated_at
	FROM post_comment pc 
	LEFT JOIN post p ON (pc.post_id = p.id)
	LEFT JOIN app_user u ON (pc.user_id = u.id)
    WHERE pc.post_id = $1`;
	let { rows } = await runQuery(query, [postId]);
	return rows.map(mapDataComment);
}
export async function addComment(comment: AddComment): Promise<string> {
	if (!comment.postId) {
		throw new Error('Invalid value for postId');
	}
	console.log(`COMMENT`, comment);
	const values = [comment.postId, comment.userId, comment.content];
	let query = `INSERT INTO post_comment (post_id, user_id, content)
	VALUES ($1, $2, $3) RETURNING id;`;
	if (comment.parent) {
		query = `INSERT INTO post_comment (post_id, user_id, content, parent)
	    VALUES ($1, $2, $3, $4) RETURNING id;`;
		values.push(comment.parent);
	}

	const post = await getPostById(comment.postId);
	console.log(`POSt`, post);
	if (!post) {
		throw new Error('Post do not exist');
	}

	let { rows } = await runQuery(query, values);
	return rows[0].id;
}

export async function updateComment(comment: UpdateComment): Promise<string> {
	let query = `UPDATE post_comment SET content = $2
    WHERE id = $1 AND user_id = $3 RETURNING id;`;
	let { rows } = await runQuery(query, [
		comment.id,
		comment.content,
		comment.userId,
	]);
	return rows.length ? rows[0].id : null;
}

export async function deleteComment(comment: DeleteComment): Promise<string> {
	let query = `DELETE FROM post_comment where id = $1 AND 
    user_id = $2 RETURNING id;`;
	let { rows } = await runQuery(query, [comment.id, comment.userId]);
	return rows.length ? rows[0].id : null;
}
