export type FormValues = Record<string, unknown>;
export type PathSegment = string | number;
export type NamePath = PathSegment | PathSegment[];
export type FieldName<Values extends object = FormValues> = Extract<keyof Values, string> | PathSegment[];

export enum FormFieldType {
  Input = 'Input',
  NumberInput = 'NumberInput',
  Select = 'Select',
  RichTextSelect = 'RichTextSelect',
  TextArea = 'TextArea',
  Date = 'Date',
  Custom = 'Custom',
  Span = 'Span',
  Title = 'Title',
}

export enum FormMode {
  edit = 'edit',
  preview = 'preview',
  snapshot = 'snapshot',
}

export enum DataSourceType {
  API = 'api',
  STORE = 'store',
  CEPT = 'cept',
  INLINE = 'inline',
}

export enum DependentTypeEnum {
  COMPUTE = 'compute',
  FETCH = 'fetch',
  STORE = 'store',
  ATTRIBUTE = 'attribute',
}

export interface SelectOption {
  label: unknown;
  value: string | number;
  disabled?: boolean;
  children?: readonly SelectOption[];
}

export interface SnapshotValues {
  before?: unknown;
  after?: unknown;
}

export interface DataContext {
  store?: Readonly<Record<string, unknown>>;
  enums?: Readonly<Record<string, readonly SelectOption[]>>;
  dependencyData?: unknown;
}

interface SourceBase {
  dependsOn?: readonly NamePath[];
}

export interface ApiDataSource<Values extends object = FormValues> extends SourceBase {
  type: DataSourceType.API;
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, unknown> | ((values: Readonly<Values>) => Record<string, unknown>);
  headers?: Record<string, string>;
  select?: (response: unknown) => readonly SelectOption[];
}

export interface StoreDataSource extends SourceBase {
  type: DataSourceType.STORE;
  module: string;
  storeKey?: NamePath;
}

export interface EnumDataSource extends SourceBase {
  type: DataSourceType.CEPT;
  enumName: string;
}

export interface InlineDataSource extends SourceBase {
  type: DataSourceType.INLINE;
  options: readonly SelectOption[];
}

export type DataSource<Values extends object = FormValues> =
  | string
  | ApiDataSource<Values>
  | StoreDataSource
  | EnumDataSource
  | InlineDataSource;

interface DependencyBase<Values extends object> {
  dependsOn?: readonly NamePath[];
  applyTo?: FieldName<Values>;
  triggerValidate?: boolean | readonly NamePath[];
}

export interface AttributeDependency<Values extends object = FormValues> extends DependencyBase<Values> {
  type: DependentTypeEnum.ATTRIBUTE;
  calculate?: (
    values: unknown[],
    props: Readonly<Record<string, unknown>>,
  ) => Record<string, unknown> | undefined | null;
}

export interface ValueDependency<Values extends object = FormValues> extends DependencyBase<Values> {
  type: DependentTypeEnum.COMPUTE | DependentTypeEnum.FETCH | DependentTypeEnum.STORE;
  calculate?: (values: unknown[], data: unknown, signal?: AbortSignal) => unknown | Promise<unknown>;
}

export type DependenciesConfig<Values extends object = FormValues> =
  | AttributeDependency<Values>
  | ValueDependency<Values>;
export type DependenciesConfigInput<Values extends object = FormValues> =
  | DependenciesConfig<Values>
  | readonly DependenciesConfig<Values>[];

export function normalizeDependenciesConfig<Values extends object>(
  config?: DependenciesConfigInput<Values> | null,
): readonly DependenciesConfig<Values>[] {
  if (!config) return [];
  return Array.isArray(config) ? config : [config as DependenciesConfig<Values>];
}

export interface FieldConfig<Values extends object = FormValues> {
  type?: FormFieldType;
  name?: FieldName<Values>;
  span?: number;
  hidden?: boolean;
  label?: unknown;
  componentName?: string;
  componentProps?: Record<string, unknown>;
  dataSource?: DataSource<Values>;
  dependenciesConfig?: DependenciesConfigInput<Values> | null;
  snapshotValues?: SnapshotValues;
  /** @deprecated Use snapshotValues. */
  snapshootValues?: SnapshotValues;
  meta?: Readonly<Record<string, unknown>>;
}

export interface BasicTemplateProps<Values extends object = FormValues> {
  type: FormFieldType;
  name?: FieldName<Values>;
  span?: number;
}

export type FormTemplate<
  Values extends object = FormValues,
  Field extends FieldConfig<Values> = FieldConfig<Values>,
> = readonly (BasicTemplateProps<Values> & Partial<Field>)[];

export interface BuildContext<
  Values extends object = FormValues,
  Field extends FieldConfig<Values> = FieldConfig<Values>,
> {
  template: FormTemplate<Values, Field>;
  fields: Readonly<Record<string, Field>>;
  name: FieldName<Values> | undefined;
  fieldProps: Field;
  displayMode?: FormMode;
  permission?: boolean;
  disabled?: boolean;
  dataSource?: unknown;
}

export type Middleware<Context = BuildContext> = (context: Context, next: () => void) => unknown;
