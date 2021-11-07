import { runQuery } from '../db/db'

test.only('Run query', async () => {
    const { rows } = await runQuery('SELECT * FROM category');
    expect(typeof rows).toBe('object')
});


