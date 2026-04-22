export const nodes = [
  {
    key: 'Usuario',
    columns: [
      { name: 'Id', type: 'INT', pk: true, fk: false, nn: true, uq: false, ai: true },
      { name: 'Nome', type: 'VARCHAR(150)', pk: false, fk: false, nn: true, uq: false, ai: false }
    ]
  },
  {
    key: 'Pedido',
    columns: [
      { name: 'Id', type: 'INT', pk: true, fk: false, nn: true, uq: false, ai: true },
      { name: 'Nome', type: 'VARCHAR(150)', pk: false, fk: false, nn: true, uq: false, ai: false },
      { name: 'UsuarioId', type: 'INT', pk: false, fk: true, nn: false, uq: false, ai: false }
    ]
  }
];

export const links = [
  {
    from: 'Pedido',
    to: 'Usuario',
    fromColumn: 'UsuarioId',
    toColumn: 'Id'
  }
];