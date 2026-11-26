import type { BuildContext, Middleware } from './types';

export class MiniMiddleware<Context = BuildContext> {
  protected middlewares: Middleware<Context>[] = [];

  use(middleware: Middleware<Context>): this {
    if (typeof middleware !== 'function') throw new TypeError('A middleware must be a function.');
    this.middlewares.push(middleware);
    return this;
  }

  setMiddlewares(middlewares: readonly Middleware<Context>[]): this {
    this.middlewares = [];
    for (const middleware of middlewares) this.use(middleware);
    return this;
  }

  execute(context: Context): Context {
    const chain = [...this.middlewares];
    let lastIndex = -1;
    const dispatch = (index: number): void => {
      if (index <= lastIndex) throw new Error('A middleware called next() more than once.');
      lastIndex = index;
      const middleware = chain[index];
      if (!middleware) return;
      const result = middleware(context, () => dispatch(index + 1));
      if (result && typeof (result as { then?: unknown }).then === 'function') {
        throw new TypeError(
          'Configuration middleware must be synchronous; use data-source resolvers for asynchronous work.',
        );
      }
    };
    dispatch(0);
    return context;
  }
}

export default MiniMiddleware;
