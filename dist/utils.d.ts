export declare function getMapFromObj<V>(obj: Record<string, V>): Map<string, V>;
declare type ValidationError = string;
export declare type ValidationResult<T> = {
    valid: boolean;
    value: T | ValidationError;
};
export declare class ValuesError extends TypeError {
    invalid_values: string[];
    constructor(model_name: string, invalid_values: string[]);
    values(): string;
}
export {};
