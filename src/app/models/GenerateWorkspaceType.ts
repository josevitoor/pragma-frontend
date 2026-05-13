import { ConnectionFilterType } from "./ConnectionFilterType";
import { DatabaseWorkspaceType } from "./DatabaseWorkspaceType";
import { ErWorkspaceType } from "./ErWorkspaceType";
import { SqlWorkspaceType } from "./SqlWorkspaceType";

export type GenerateWorkspaceType = {
  mode: 'database' | 'er' | 'sql';

  configuration: {
    hasTceBase: boolean;
    hasApiVersion: boolean;
    isServerSide: boolean;
    idConfiguracaoEstrutura: number;
    projectApiPath: string;
    projectClientPath: string;
  };

  connectionFilter?: ConnectionFilterType;

  databaseMode?: DatabaseWorkspaceType;

  erMode?: ErWorkspaceType;

  sqlMode?: SqlWorkspaceType;
};