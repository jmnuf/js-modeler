import { Model } from "./main";
import { ValidationResult } from "./utils";
export declare type PropertyBaseTypes = 'any' | 'string' | 'boolean' | 'object' | 'number' | 'bigint';
export declare type AnyType = null;
declare type ValidationFunction<T> = (u_value: any) => ValidationResult<T>;
export declare type PropertyStruct<T = unknown, R = true> = {
    base_type: PropertyBaseTypes;
    required: R;
    default_value: T;
    nullable: boolean;
    validation: ValidationFunction<T>;
    Model?: any;
    Class?: any;
};
declare type UserStructSettings<T, R = true> = {
    required?: R;
    nullable?: boolean;
    default_value?: T;
};
export declare const Structs: {
    int<R>(u_config?: UserStructSettings<number, R>): PropertyStruct<number, R>;
    number<R_1>(u_config?: UserStructSettings<number, R_1>): PropertyStruct<number, R_1>;
    string<R_2>(u_config?: UserStructSettings<string, R_2>): PropertyStruct<string, R_2>;
    model<T extends Model<unknown>, R_3>(ModelClass: T, u_config?: UserStructSettings<T, R_3>): PropertyStruct<T, R_3>;
    bigint<R_4>(u_config?: UserStructSettings<bigint, R_4>): PropertyStruct<bigint, R_4>;
    bool<R_5>(u_config?: UserStructSettings<boolean, R_5>): PropertyStruct<boolean, R_5>;
    map<R_6, T_1 = any>(u_config?: UserStructSettings<Map<string, T_1>, R_6>): PropertyStruct<Map<string, T_1>, R_6>;
};
export {};
