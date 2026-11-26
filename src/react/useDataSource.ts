import { useEffect, useRef, useState } from 'react';
import { getValue, isEqual } from '../core';
import type { DataSource, FormValues, SelectOption } from '../core';
import { useDynamicFormContext } from './context';
function useStable<T>(value: T): T {
  const reference = useRef(value);
  if (!isEqual(reference.current, value)) reference.current = value;
  return reference.current;
}
export function useDataSource<Values extends object = FormValues>(
  source: DataSource<Values> | undefined,
  values?: Readonly<Values>,
) {
  const { dataSources, dataSourceVersion, dataContext, onError } = useDynamicFormContext<Values>();
  const [state, setState] = useState<{ options: readonly SelectOption[]; loading: boolean; error?: Error }>({
    options: [],
    loading: Boolean(source),
  });
  const errorHandler = useRef(onError);
  errorHandler.current = onError;
  let selectedValues: unknown[] = [];
  if (source !== undefined) {
    try {
      selectedValues = (dataSources.get(source).dependsOn ?? []).map((path) => getValue(values, path));
    } catch {
      /* The resolving effect reports missing registrations. */
    }
  }
  const dependencies = useStable(selectedValues);
  const latestValues = useRef(values);
  latestValues.current = values;
  useEffect(() => {
    if (source === undefined) {
      setState({ options: [], loading: false });
      return;
    }
    let active = true;
    const controller = new AbortController();
    setState({ options: [], loading: true });
    dataSources
      .resolve(source, { ...dataContext, values: latestValues.current, signal: controller.signal })
      .then((options) => {
        if (active) setState({ options, loading: false });
      })
      .catch((reason: unknown) => {
        if (!active || controller.signal.aborted) return;
        const error = reason instanceof Error ? reason : new Error(String(reason));
        setState({ options: [], loading: false, error });
        errorHandler.current?.(error);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [source, dataSources, dataSourceVersion, dataContext, dependencies]);
  return state;
}
