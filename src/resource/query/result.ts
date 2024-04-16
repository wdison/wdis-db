export interface IResult {
    unique(): Promise<any>;
    list(): Promise<any[]>;
    count(): Promise<number>;
}