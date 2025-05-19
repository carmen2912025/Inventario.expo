const { query } = require('../mysqlClient');

describe('MySQL Client', () => {
  it('debería obtener categorías si existen', async () => {
    const rows = await query('SELECT * FROM categorias');
    expect(Array.isArray(rows)).toBe(true);
  });
});
