export declare class ConfResource {
    resource:string;
    url:string;
    options?:{
        user?: string,
        password?:string,
        host?: string,
        port?: string,
        database?: string,
        connection?:any,
        timeout?:number
    };
}