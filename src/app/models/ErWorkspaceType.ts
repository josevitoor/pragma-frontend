export type ErWorkspaceType = {
  diagramModel: any;

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