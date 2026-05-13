export type SqlWorkspaceType = {
  sqlScript: string;

  tables: {
    tableName: string;
    entityName: string;

    tableColumnsFilter: string[];
    tableColumnsList: string[];

    tableColumnsFormArray: {
      databaseColumn: string;
      displayName: string;
    }[];
  }[];
};