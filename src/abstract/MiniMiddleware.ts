export type Middleware<T = any, R = any> = (
    context: T,
    next: () => any
) => R;

export class MiniMiddleware<T = any> {
  #middlewares: Middleware<T>[] = [];

  constructor() {}

  // 注册中间件逻辑不变（支持链式调用）
  use(middleware: Middleware<T>): this {
    this.#middlewares.push(middleware);
    return this;
  }

  // 关键修改：接收完整context，返回修改后的context
  execute(context: T): T {
    let index = 0;
    // 不再创建局部executionContext，直接使用传入的context（调用者保证独立）
    // 若需避免修改原始对象，可先深拷贝（解决浅拷贝问题）
    // const executionContext = JSON.parse(JSON.stringify(context));

    const next = (): void => {
      if (index < this.#middlewares.length) {
        const middleware = this.#middlewares[index++];
        middleware.bind(this)(context, next);
        // middleware(context, next); // 中间件修改executionContext
      }
    };

    next();
    return context; // 返回修改后的上下文！
  }
}

export default MiniMiddleware;