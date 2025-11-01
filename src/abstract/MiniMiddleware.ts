export type Middleware<T = any, R = any> = (
    context: T,
    next: () => any
) => R;

export class MiniMiddleware<T = any> {
    private middlewares: Middleware<T>[] = [];
    public context?: any;

    constructor(initialContext?: any) {
        this.context = initialContext;
    }

    // 注册中间件
    use(middleware: Middleware<T>): this {
        this.middlewares.push(middleware);
        return this; // 支持链式调用
    }

    execute(content: any) {
        let index = 0;
        const executionContext = { ...this.context, ...content };

        const next = (): void => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                middleware(executionContext, next);
            }
        };

        next();

        if (executionContext.fieldProps) {
            this.context.fieldProps = executionContext.fieldProps;
        }
    }
}

export default MiniMiddleware;