export function getMapFromObj<V>(obj:Record<string, V>):Map<string, V> {
	const map = new Map();
	if (typeof obj != 'object' || obj == null) {
		return map;
	}
	for(const key of Object.keys(obj)) {
		map.set(key, obj[key]);
	}
	return map;
}

type ValidationError = string
export type ValidationResult<T> = { valid:boolean, value: T|ValidationError }

export class ValuesError extends TypeError {
	invalid_values: string[]
	
	constructor(model_name:string, invalid_values:string[]) {
		super('Invalid value(s) used to instance Model<' + model_name + '> -> ' + invalid_values.join(', '));
		// Duplicate array
		const invalids = invalid_values.splice(0);
		// Declare Read Only properties
		Object.defineProperties(this, {
			"model_name": {
				get() { return model_name; }
			},
			"invalid_values": {
				get() { return invalids }
			}
		});
	}

	values():string {
		return this.invalid_values.join(', ');
	}
}
