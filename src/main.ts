import { PropertyStruct, AnyType } from './model-structs';
import { ValuesError } from './utils';

type ModelStructure = Record<string, PropertyStruct<unknown, boolean>>
export type ModelRequestStructure = Record<string, PropertyStruct<unknown, boolean> | CallableFunction>
export type ModelParams<T> = {
		[K in keyof T & string as T[K] extends CallableFunction? never : K]?: T[K] extends PropertyStruct? (
			StructValue<T[K]>
			) : T[K];
	} & {
		[K in keyof T & string as T[K] extends CallableFunction? never : T[K] extends PropertyStruct<any, true>? (
			K
		): never]: T[K] extends PropertyStruct? (
			StructValue<T[K]>
			) : T[K];
}

type StructValue<T extends PropertyStruct<unknown, boolean>> = T extends PropertyStruct<AnyType, boolean> ? (
		any
	) : T extends PropertyStruct<string, boolean>? (
		string
	) : T extends PropertyStruct<boolean, boolean>? (
		boolean
	) : T extends PropertyStruct<number, boolean>? (
		number
	) : any

type MethodsMap = Map<string, CallableFunction>

class JsModel {
}

export type ModelInstance<T> = {
	[K in keyof T]: T[K] extends PropertyStruct<unknown, boolean> ? StructValue<T[K]> : T[K];
};

export interface Model<T> {
	new (data: ModelParams<T>): ModelInstance<T>;
	instance:()=>ModelInstance<T>
}

// eslint-disable-next-line @typescript-eslint/ban-types
function createClass<T>(model_name:string, structure:ModelStructure, structKeys:string[]):Function{
	return class extends JsModel {
		constructor(data:ModelParams<T>) {
			super();
			const dataKeys = Object.keys(data);
			const invalid_keys:string[] = [];
			for (const key of structKeys) {
				const struc = structure[key];
				if (typeof struc == 'function') {
					this[key] = struc;
					continue;
				}
				if (!dataKeys.includes(key)) {
					this[key] = struc.default_value;
					if (struc.required) {
						invalid_keys.push('Invalid data: Missing required key ' + key);
					}
					continue;
				}
				const value = data[key];
				const result = struc.validation(value);
				if (result.valid) {
					this[key] = result.value;
				} else {
					const message = `Invalid key '${key}': ${result.value}`;
					invalid_keys.push(message);
				}
			}
			if (invalid_keys.length > 0) {
				throw new ValuesError(model_name, invalid_keys);
			}
			return this;
		}
	};
}

function getDefaultData<T>(user_structure:ModelRequestStructure, structure: ModelStructure, structKeys:string[], methods:MethodsMap): ModelParams<T> {
	const default_data: Partial<ModelParams<T>> = {}
	for (const key of structKeys) {
		if (typeof structure[key] != 'object' || structure[key] == null) {
			continue;
		}
		const struc = user_structure[key];
		if (typeof struc == 'function') {
			methods.set(key, struc);
			continue;
		}
		default_data[key] = struc.default_value;
		if (!struc.nullable && struc.base_type == 'object') {
			if (struc.Model) {
				const M = struc.Model;
				Object.defineProperty(default_data, key, {
					get() { return M.instance() }
				});
			} else if (struc.Class) {
				const C = struc.Class;
				Object.defineProperty(default_data, key, {
					get() { return new C() }
				});
			}
		}
	}
	return default_data as ModelParams<T>;
}

export function createModel<T extends ModelRequestStructure>(model_name:string, user_structure:T):Model<T> {
	const structure:ModelStructure = {};
	const methods:MethodsMap = new Map<string, CallableFunction>();
	const structKeys = Object.keys(user_structure);
	const default_data: ModelParams<T> = getDefaultData(
		user_structure,
		structure,
		structKeys,
		methods
	);
	const ModelClass = createClass(model_name, structure, structKeys) as Model<T>;
	// Read only properties of the class
	Object.defineProperties(ModelClass, {
		instance: {
			get() {
				return function () {
					return new ModelClass(default_data);
				}
			}
		},
		name: {
			get() { return model_name }
		},
		defaults: {
			get() { return default_data }
		}
	});
	
	// Adding all the passed "methods" to the prototype
	const methodNamesIter = methods.keys();
	for(const key of methodNamesIter) {
		ModelClass.prototype[key] = methods.get(key);
	}

	return ModelClass;
}
