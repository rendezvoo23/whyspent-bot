declare module 'sql.js' {
    interface SqlJsStatic {
        Database: typeof Database;
    }

    interface QueryExecResult {
        columns: string[];
        values: any[][];
    }

    interface ParamsObject {
        [key: string]: any;
    }

    interface ParamsCallback {
        (obj: ParamsObject): void;
    }

    interface Statement {
        bind(params?: any[]): boolean;
        step(): boolean;
        getAsObject(params?: ParamsObject): ParamsObject;
        get(params?: any[]): any[];
        free(): boolean;
        run(params?: any[]): void;
        reset(): void;
    }

    class Database {
        constructor();
        constructor(data?: ArrayLike<number> | Buffer | null);
        run(sql: string, params?: any[]): void;
        exec(sql: string): QueryExecResult[];
        prepare(sql: string): Statement;
        export(): Uint8Array;
        close(): void;
    }

    function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;

    export default initSqlJs;
    export { Database, Statement, QueryExecResult, ParamsObject, SqlJsStatic };
}
