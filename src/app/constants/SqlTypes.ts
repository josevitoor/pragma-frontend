export const SqlTypes: RegExp[] = [
  // Inteiros
  /^tinyint$/i,
  /^smallint$/i,
  /^int$/i,
  /^bigint$/i,

  // Booleano
  /^bit$/i,

  // Decimais
  /^decimal(\(\d+\s*,\s*\d+\))?$/i,
  /^numeric(\(\d+\s*,\s*\d+\))?$/i,
  /^money$/i,
  /^smallmoney$/i,

  // Float
  /^float(\(\d+\))?$/i,
  /^real$/i,

  // Data/Hora
  /^date$/i,
  /^time(\(\d+\))?$/i,
  /^datetime$/i,
  /^datetime2(\(\d+\))?$/i,
  /^smalldatetime$/i,
  /^datetimeoffset(\(\d+\))?$/i,

  // Texto
  /^char(\(\d+\))?$/i,
  /^varchar(\((max|\d+)\))?$/i,
  /^text$/i,
  /^nchar(\(\d+\))?$/i,
  /^nvarchar(\((max|\d+)\))?$/i,
  /^ntext$/i,

  // Binário
  /^binary(\(\d+\))?$/i,
  /^varbinary(\((max|\d+)\))?$/i,
  /^image$/i,

  // Outros
  /^uniqueidentifier$/i,
  /^xml$/i,
  /^json$/i,
  /^sql_variant$/i,
  /^rowversion$/i,
  /^hierarchyid$/i,
  /^geometry$/i,
  /^geography$/i,
  /^table$/i
];