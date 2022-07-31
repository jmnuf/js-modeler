import { PropertyStruct, AnyType } from './model-structs';
export declare type ModelRequestStructure = Record<string, PropertyStruct<unknown, boolean> | CallableFunction>;
export declare type ModelParams<T> = {
    [K in keyof T & string as T[K] extends CallableFunction ? never : K]?: T[K] extends PropertyStruct ? (StructValue<T[K]>) : T[K];
} & {
    [K in keyof T & string as T[K] extends CallableFunction ? never : T[K] extends PropertyStruct<any, true> ? (K) : never]: T[K] extends PropertyStruct ? (StructValue<T[K]>) : T[K];
};
declare type StructValue<T extends PropertyStruct<unknown, boolean>> = T extends PropertyStruct<AnyType, boolean> ? (any) : T extends PropertyStruct<string, boolean> ? (string) : T extends PropertyStruct<boolean, boolean> ? (boolean) : T extends PropertyStruct<number, boolean> ? (number) : any;
export declare type ModelInstance<T> = {
    [K in keyof T]: T[K] extends PropertyStruct<unknown, boolean> ? StructValue<T[K]> : T[K];
};
export interface Model<T> {
    new (data: ModelParams<T>): ModelInstance<T>;
    instance: () => ModelInstance<T>;
}
export declare function createModel<T extends ModelRequestStructure>(model_name: string, user_structure: T): Model<T>;
export {};
