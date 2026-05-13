export interface WorkspaceGeracaoType {
  idWorkspaceGeracao?: number;
  idTipoGeracao: number;
  tipoGeracao?: string;
  nome?: string;
  arquivo: string;
  dataInclusao?: Date;
  idOperadorInclusao?: number;
}