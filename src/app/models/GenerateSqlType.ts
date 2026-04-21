export type GenerateSqlRequest = {
  tables: TableDto[];
  links: LinkDto[];
};

export type ColumnDto = {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nn: boolean;
  uq: boolean;
  ai: boolean;
};

export type TableDto = {
  key: string;
  columns: ColumnDto[];
};

export type LinkDto = {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
}