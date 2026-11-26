import { getValue, toPath } from './path';
import { DependentTypeEnum, normalizeDependenciesConfig } from './types';
import type { DataContext, FieldConfig, FormValues, NamePath } from './types';

export interface DependencyWrite {
  path: NamePath;
  value: unknown;
  validate?: boolean | readonly NamePath[];
}

export interface DependencyResult {
  componentProps: Record<string, unknown>;
  writes: DependencyWrite[];
}

export function dependencyPaths<Values extends object>(field: FieldConfig<Values>): NamePath[] {
  return normalizeDependenciesConfig(field.dependenciesConfig).flatMap((config) => [...(config.dependsOn ?? [])]);
}

export async function resolveDependencies<Values extends object = FormValues>(
  field: FieldConfig<Values>,
  values: Readonly<Values>,
  context: DataContext = {},
  signal?: AbortSignal,
): Promise<DependencyResult> {
  const componentProps = { ...field.componentProps };
  const writes: DependencyWrite[] = [];
  for (const config of normalizeDependenciesConfig(field.dependenciesConfig)) {
    if (signal?.aborted) return { componentProps, writes: [] };
    const dependencies = (config.dependsOn ?? []).map((path) => getValue(values, path));
    if (config.type === DependentTypeEnum.ATTRIBUTE) {
      const patch = config.calculate?.(dependencies, componentProps);
      if (patch) Object.assign(componentProps, patch);
    } else {
      const value = await config.calculate?.(dependencies, context.dependencyData ?? context.store, signal);
      if (signal?.aborted) return { componentProps, writes: [] };
      const path = config.applyTo ?? field.name;
      if (value !== undefined && path !== undefined) {
        toPath(path);
        writes.push({ path, value, validate: config.triggerValidate });
      }
    }
  }
  return { componentProps, writes };
}
