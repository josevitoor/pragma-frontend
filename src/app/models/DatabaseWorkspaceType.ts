export type DatabaseWorkspaceType = {
  tableName: string;
  entityName: string;

  tableColumnsFilter: string[];
  tableColumnsList: string[];

  tableColumnsFormArray: {
    databaseColumn: string;
    displayName: string;
  }[];
};