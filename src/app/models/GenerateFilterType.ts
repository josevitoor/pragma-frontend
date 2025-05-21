import { ConnectionFilterType } from './ConnectionFilterType';
import { GenerateBackendFilterType } from './GenerateBackendFilterType';
import { GenerateFrontendFilterType } from './GenerateFrontendFilterType';

export type GenerateFilterType = {
  tableName: string;
  entityName: string;
  generateBackendFilter: GenerateBackendFilterType;
  generateFrontendFilter: GenerateFrontendFilterType;
  connectionFilter: ConnectionFilterType;
};
