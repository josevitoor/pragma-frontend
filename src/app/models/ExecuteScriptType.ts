import { ConnectionFilterType } from "./ConnectionFilterType"

export type ExecuteScriptDTO = {
    filter: ConnectionFilterType;
    script: string;
    tabelas: string[];
}