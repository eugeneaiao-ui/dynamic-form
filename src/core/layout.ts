export function parseFormLayout<Field extends { span?: number }>(fields: readonly Field[], columns = 24): Field[][] {
  if (!Number.isInteger(columns) || columns < 1) throw new RangeError('columns must be a positive integer.');
  const rows: Field[][] = [];
  let row: Field[] = [],
    total = 0;
  for (const field of fields) {
    const span = field.span ?? columns;
    if (!Number.isInteger(span) || span < 1 || span > columns)
      throw new RangeError('Field span must be between 1 and ' + columns + '.');
    if (total + span > columns) {
      rows.push(row);
      row = [];
      total = 0;
    }
    row.push(field);
    total += span;
  }
  if (row.length) rows.push(row);
  return rows;
}

export interface FormSegmentBatch<Field> {
  title?: string;
  segment: Field[];
}

export function splitIntoBatches<Field extends { span?: number }>(
  fields: readonly Field[] = [],
  title?: string,
  rowsPerBatch = 3,
): FormSegmentBatch<Field>[] {
  if (!Number.isInteger(rowsPerBatch) || rowsPerBatch < 1)
    throw new RangeError('rowsPerBatch must be a positive integer.');
  const rows = parseFormLayout(fields);
  const batches: FormSegmentBatch<Field>[] = [];
  for (let index = 0; index < rows.length; index += rowsPerBatch) {
    batches.push({ title: index === 0 ? title : undefined, segment: rows.slice(index, index + rowsPerBatch).flat() });
  }
  return batches;
}

export function sliceBySubmitLength(value: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) throw new RangeError('maxLength must be a non-negative integer.');
  if (value.length <= maxLength) return value;
  let end = maxLength;
  const char = value.charCodeAt(end - 1);
  if (char >= 0xd800 && char <= 0xdbff) end -= 1;
  return value.slice(0, end);
}
