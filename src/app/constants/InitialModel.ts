export const nodes = [
  {
    key: 'Usuario',
    columns: [
      { name: 'Id', type: 'int', pk: true, fk: false },
      { name: 'Nome', type: 'varchar(150)', pk: false, fk: false }
    ]
  },
  {
    key: 'Pedido',
    columns: [
      { name: 'Id', type: 'int', pk: true, fk: false },
      { name: 'Nome', type: 'varchar(150)', pk: false, fk: false },
      { name: 'UsuarioId', type: 'varchar(150)', pk: false, fk: true }
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