import { getValue } from './path';
import { FormFieldType } from './types';
import type { BuildContext, FieldConfig, FormValues, Middleware } from './types';

export function guideMiddleware<Values extends object, Field extends FieldConfig<Values>>(
  context: BuildContext<Values, Field>,
  next: () => void,
): void {
  if (context.permission === false || context.disabled) {
    context.fieldProps = {
      ...context.fieldProps,
      componentProps: { ...context.fieldProps.componentProps, disabled: true },
    };
  }
  next();
}

export function snapshotMiddleware<Values extends object, Field extends FieldConfig<Values>>(
  context: BuildContext<Values, Field>,
  next: () => void,
  before: Readonly<object> = {},
  after: Readonly<object> = {},
): void {
  if (context.name !== undefined) {
    const values = { before: getValue(before, context.name), after: getValue(after, context.name) };
    context.fieldProps = {
      ...context.fieldProps,
      snapshotValues: values,
      snapshootValues: values,
      ...(context.fieldProps.type === FormFieldType.Custom
        ? {
            componentProps: { ...context.fieldProps.componentProps, snapshotValues: values, snapshootValues: values },
          }
        : {}),
    };
  }
  next();
}

export function createSnapshotMiddleware<
  Values extends object = FormValues,
  Field extends FieldConfig<Values> = FieldConfig<Values>,
>(before: Readonly<object> = {}, after: Readonly<object> = {}): Middleware<BuildContext<Values, Field>> {
  return (context, next) => snapshotMiddleware(context, next, before, after);
}
