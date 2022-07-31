import { createModel } from "./main";
declare const _default: {
    createModel: typeof createModel;
    Structs: {
        int<R>(u_config?: {
            required?: R;
            nullable?: boolean;
            default_value?: number;
        }): import("./model-structs").PropertyStruct<number, R>;
        number<R_1>(u_config?: {
            required?: R_1;
            nullable?: boolean;
            default_value?: number;
        }): import("./model-structs").PropertyStruct<number, R_1>;
        string<R_2>(u_config?: {
            required?: R_2;
            nullable?: boolean;
            default_value?: string;
        }): import("./model-structs").PropertyStruct<string, R_2>;
        model<T extends import("./main").Model<unknown>, R_3>(ModelClass: T, u_config?: {
            required?: R_3;
            nullable?: boolean;
            default_value?: T;
        }): import("./model-structs").PropertyStruct<T, R_3>;
        bigint<R_4>(u_config?: {
            required?: R_4;
            nullable?: boolean;
            default_value?: bigint;
        }): import("./model-structs").PropertyStruct<bigint, R_4>;
        bool<R_5>(u_config?: {
            required?: R_5;
            nullable?: boolean;
            default_value?: boolean;
        }): import("./model-structs").PropertyStruct<boolean, R_5>;
        map<R_6, T_1 = any>(u_config?: {
            required?: R_6;
            nullable?: boolean;
            default_value?: Map<string, T_1>;
        }): import("./model-structs").PropertyStruct<Map<string, T_1>, R_6>;
    };
};
export default _default;
