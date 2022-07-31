import { createModel, Model } from "./main";
import { ValidationResult } from "./utils";

export type PropertyBaseTypes = 'any' | 'string' | 'boolean' | 'object' | 'number' | 'bigint';
export type AnyType = null;

type ValidationFunction<T> = (u_value: any) => ValidationResult<T>;

export type PropertyStruct<T=unknown, R = true> = {
	base_type:PropertyBaseTypes,
	required:R;
	default_value: T;
	nullable:boolean,
	validation: ValidationFunction<T>;
	Model?: any;
	Class?: any;
}


function createBaseStruct<T, R=true>(base_type:PropertyBaseTypes, required:R, nullable:boolean, default_value:T):PropertyStruct<T, R> {
	return {
		get base_type(): PropertyBaseTypes {
			return base_type
		},
		get required():R {
			return required;
		},
		get default_value() {
			return default_value;
		},
		nullable,
		validation(this:PropertyStruct, u_value:any) {
			const type = this.base_type;
			const result = { valid: true, value: u_value };
			if (type == 'any') {
				return result;
			}
			const u_type = typeof u_value;
			if (u_type != type) {
				result.valid = false;
				result.value = 'Types don\'t align expected `' + base_type + '` but got `' + u_type + '`'
			}
			return result;
		}
	}
}

type UserStructSettings<T, R=true> = {
	required?: R,
	nullable?: boolean,
	default_value?: T,
}

const StructSettings = createModel('StructSettings', {
	required: createBaseStruct<boolean, false>('boolean', false, false, true),
	default_value: createBaseStruct<AnyType, true>('any', true, true, undefined),
	nullable: createBaseStruct<boolean, false>('boolean', false, false, true),
});

function getStructSettings<T, R>(u_config:UserStructSettings<T, R>, default_value:T, nullable = true) {
	const settings_config = { nullable, required: true, default_value, ...u_config };
	if (settings_config.nullable && !('default_value' in u_config)) {
		settings_config.default_value = null;
	}
	
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return new StructSettings(settings_config);
}


export const Structs = {
	int<R>(u_config:UserStructSettings<number, R> = {}):PropertyStruct<number, R> {
		const cfg = getStructSettings(u_config, 0, false);
		const struc = createBaseStruct<number, R>('number',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);

		const base_validation:ValidationFunction<number> = struc.validation.bind(struc);
		struc.validation = function (u_value) {
			const result = base_validation(u_value);
			if (result.valid) {
				if (!Number.isInteger(result.value)) {
					result.valid = false;
					result.value = 'Types don\'t fully align expected an integer number but got a floating point number';
				}
			}
			return result;
		}
		return struc;
	},
	number<R>(u_config:UserStructSettings<number, R> = {}):PropertyStruct<number, R> {
		const cfg = getStructSettings(u_config, 0.0, false);
		return createBaseStruct<number, R>('number',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
	},
	string<R>(u_config:UserStructSettings<string, R> = {}):PropertyStruct<string, R> {
		const cfg = getStructSettings(u_config, '', false);
		return createBaseStruct(
			'string',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
	},
	model<T extends Model<unknown>, R>(ModelClass:T, u_config:UserStructSettings<T, R> = {}):PropertyStruct<T, R> {
		if (!ModelClass) {
			throw new TypeError('Passed model class must be a valid model that inherits from JsModel');
		}
		const cfg = getStructSettings(u_config, null)

		const struc = createBaseStruct<T, R>(
			'object',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
		const base_validation:ValidationFunction<T> = struc.validation.bind(struc);
		struc.Model = ModelClass;
		struc.validation = function (u_value) {
			const result = base_validation(u_value);
			if (result.valid) {
				if (result.value == null) {
					if (!cfg.nullable) {
						result.valid = false;
						result.value = 'Value can\'t be null';
					}
					return result;
				}

				try {
					const model = new ModelClass(u_value) as T;
					result.value = model;
				} catch (e) {
					result.valid = false;
					result.value = e.message;
				}
			}
			return result;
		}

		return struc;
	},
	bigint<R>(u_config:UserStructSettings<bigint, R> ={}):PropertyStruct<bigint, R> {
		const cfg = getStructSettings(u_config, BigInt(0), false);
		return createBaseStruct<bigint, R>(
			'bigint',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
	},
	bool<R>(u_config:UserStructSettings<boolean, R> = {}):PropertyStruct<boolean, R> {
		const cfg = getStructSettings(u_config, false, false);
		return createBaseStruct<boolean, R>(
			'boolean',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
	},
	map<R, T=any>(u_config:UserStructSettings<Map<string, T>, R> = {}):PropertyStruct<Map<string, T>, R> {
		const cfg = getStructSettings(u_config, new Map<string, T>(), false);

		const struc = createBaseStruct<Map<string, T>, R>('object',
			cfg.required as unknown as R,
			cfg.nullable,
			cfg.default_value);
		
		const base_validation:ValidationFunction<Map<string, T>> = struc.validation.bind(struc);
		struc.Class = Map;
		struc.validation = function (u_value) {
			const result = base_validation(u_value);
			if (result.valid) {
				if (result.value == null) {
					if (!cfg.nullable) {
						result.valid = false;
						result.value = 'Value can\'t be null';
					}
					return result;
				}

				const entries = Object.entries(result.value);
				result.value = new Map(entries);
			}
			return result;
		}
		return struc;
	}
}
