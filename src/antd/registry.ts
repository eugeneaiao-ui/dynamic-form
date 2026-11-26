import type { ElementType } from 'react';
import { FormMode } from '../core';
export interface ModeComponents {
  edit: ElementType;
  preview?: ElementType;
  snapshot?: ElementType;
}
export type ComponentRegistration = ElementType | ModeComponents;
export class ComponentRegistry {
  private components = new Map<string, { component: ComponentRegistration; token: symbol }>();
  private listeners = new Set<() => void>();
  private revision = 0;
  get version(): number {
    return this.revision;
  }
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  register(name: string, component: ComponentRegistration): () => void {
    const token = Symbol(name);
    this.components.set(name, { component, token });
    this.revision += 1;
    this.listeners.forEach((listener) => listener());
    return () => {
      if (this.components.get(name)?.token === token) {
        this.components.delete(name);
        this.revision += 1;
        this.listeners.forEach((listener) => listener());
      }
    };
  }
  registerAll(components: Readonly<Record<string, ComponentRegistration>>): () => void {
    const disposers = Object.entries(components).map(([name, component]) => this.register(name, component));
    return () => disposers.forEach((dispose) => dispose());
  }
  get(name: string, mode: FormMode = FormMode.edit): ElementType | undefined {
    const registration = this.components.get(name)?.component;
    if (registration && typeof registration === 'object' && 'edit' in registration)
      return registration[mode] ?? registration.edit;
    return registration as ElementType | undefined;
  }
}
export const defaultComponentRegistry = new ComponentRegistry();
export function registerCustomComponents(components: Readonly<Record<string, ComponentRegistration>>): () => void {
  return defaultComponentRegistry.registerAll(components);
}
