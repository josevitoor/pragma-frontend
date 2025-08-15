import { ConnectionFilterType } from './ConnectionFilterType';
import { GenerateBackendFilterType } from './GenerateBackendFilterType';
import { GenerateFrontendFilterType } from './GenerateFrontendFilterType';

export type GenerateFilterType = {
  tableName: string;
  entityName: string;
  isServerSide: boolean;
  hasTceBase: boolean;
  tableColumnsFilter: Array<string>;
  idConfiguracaoEstrutura: number;
  generateBackendFilter: GenerateBackendFilterType;
  generateFrontendFilter: GenerateFrontendFilterType;
  connectionFilter: ConnectionFilterType;
};
