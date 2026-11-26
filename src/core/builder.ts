import { cloneConfig } from './equality';
import { fieldKey, toPath } from './path';
import { FormFieldType } from './types';
import type { BuildContext, FieldConfig, FormTemplate, FormValues, Middleware } from './types';
import { MiniMiddleware } from './middleware';

export class FormConfigBuilder<
  Values extends object = FormValues,
  Field extends FieldConfig<Values> = FieldConfig<Values>,
> extends MiniMiddleware<BuildContext<Values, Field>> {
  private context: Partial<Omit<BuildContext<Values, Field>, 'fieldProps' | 'name' | 'fields' | 'template'>> = {};

  constructor(
    private template: FormTemplate<Values, Field> = [],
    private fields: Readonly<Record<string, Field>> = {},
  ) {
    super();
  }

  setTemplate(template: FormTemplate<Values, Field>): this {
    this.template = template;
    return this;
  }

  setFields(fields: Readonly<Record<string, Field>>): this {
    this.fields = fields;
    return this;
  }

  setGlobalCtx(context: typeof this.context, fields?: Readonly<Record<string, Field>>): this {
    this.context = context;
    if (fields) this.setFields(fields);
    return this;
  }

  addMiddleware(middleware: Middleware<BuildContext<Values, Field>>): this {
    return this.use(middleware);
  }

  addMiddlewareGroup(middlewares: readonly Middleware<BuildContext<Values, Field>>[]): this {
    for (const middleware of middlewares) this.use(middleware);
    return this;
  }

  addMiddlewares(middlewares: readonly Middleware<BuildContext<Values, Field>>[]): this {
    return this.addMiddlewareGroup(middlewares);
  }

  build(): (Field & FieldConfig<Values>)[] {
    const fields = cloneConfig(this.fields);
    return this.template.map((templateField) => {
      const name = templateField.name;
      if (name !== undefined) toPath(name);
      if (
        name === undefined &&
        templateField.type !== FormFieldType.Span &&
        templateField.type !== FormFieldType.Title
      ) {
        throw new TypeError('A non-layout field requires a name.');
      }
      const key = name === undefined ? undefined : fieldKey(name);
      const definition =
        key !== undefined && Object.prototype.hasOwnProperty.call(fields, key) ? fields[key] : undefined;
      const fieldProps = cloneConfig({ ...templateField, ...definition }) as Field;
      const context: BuildContext<Values, Field> = {
        ...this.context,
        template: this.template,
        fields,
        name,
        fieldProps,
      };
      this.execute(context);
      return { ...templateField, ...context.fieldProps };
    });
  }
}
