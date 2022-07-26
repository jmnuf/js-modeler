class ValuesError extends TypeError {
	constructor(model_name, invalid_values) {
		super('Invalid value(s) used to instance Model<' + model_name + '> -> ' + invalid_values.join(', '));
		// Duplicate array
		let invalids = invalid_values.splice();
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

	values() {
		return this._invalid_values.join(', ');
	}
}

// Flag interface
class JsModel {}

function getMapFromObj(obj) {
	let map = new Map();
	if (typeof obj != 'object' || obj == null) {
		return map;
	}
	for(let key of Object.keys(obj)) {
		map.set(key, obj[key]);
	}
	return map;
}

function createModel(model_name, user_structure = {}) {
	const structure = Object.assign({}, user_structure);
	const methods = getMapFromObj(structure.methods);
	delete structure.methods
	const structKeys = Object.keys(structure);
	const default_data = {};
	for (let key of structKeys) {
		if (typeof structure[key] != 'object' || structure[key] == null) {
			continue;
		}
		const struc = structure[key];
		default_data[key] = struc.default_value;
		if (!struc.nullable) {
			if (struc.Model) {
				const M = struc.Model;
				Object.defineProperty(default_data, key, {
					get() { return M.instance() }
				});
			} else if (struc.Class) {
				const C = struc.Class;
				Object.defineProperty(default_data, key, {
					get() { return new Class() }
				});
			}
		}
	}
	const ModelClass = class extends JsModel {
		constructor(data = {}) {
			super();
			const dataKeys = Object.keys(data);
			let invalid_keys = [];
			for (let key of structKeys) {
				const struc = structure[key];
				console.log(key, struc);
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
				let value = data[key];
				let result = struc.validation(value);
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
		}
		
		static instance() {
			return new ModelClass(default_data);
		}
	};
	// Read only properties of the class
	Object.defineProperties(ModelClass, {
		name: {
			get() { return model_name }
		},
		defaults: {
			get() { return default_data }
		}
	});
	
	// Adding all the passed "methods" to the prototype
	const methodNamesIter = methods.keys();
	for(let key of methodNamesIter) {
		ModelClass.prototype[key] = methods.get(key);
	}

	return ModelClass;
}

function createBaseStruct(base_type, required, default_value) {
	return {
		get required() {
			return required;
		},
		get default_value() {
			return default_value;
		},
		validation(u_value) {
			const result = { valid: true, value: u_value };
			if (base_type == 'any') {
				return result;
			}
			const u_type = typeof u_value;
			if (u_type != base_type) {
				result.valid = false;
				result.value = 'Types don\'t align expected `' + base_type + '` but got `' + u_type + '`'
			}
			return result;
		}
	}
}

const StructSettings = createModel('StructSettings', {
	required: createBaseStruct('boolean', false, true),
	default_value: createBaseStruct('any', true, undefined),
	nullable: createBaseStruct('boolean', false, true),
});


function getStructSettings(u_config, default_value, nullable = true) {
	const settings_config = { nullable, required: true, default_value, ...u_config };
	if (settings_config.nullable && settings_config.default_value === default_value) {
		settings_config.default_value = null;
	}
	
	return new StructSettings(settings_config);
}


const Structs = {
	int(u_config={required: true, default_value: 0}) {
		const cfg = getStructSettings(u_config, 0, false);
		const struc = createBaseStruct('number', cfg.required, cfg.default_value);

		const base_validation = struc.validation;
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
	number(u_config={required: true, default_value: 0.0}) {
		const cfg = getStructSettings(u_config, 0.0, false);
		return createBaseStruct('number', cfg.required, cfg.default_value);
	},
	string(u_config={required: true, default_value: ''}) {
		const cfg = getStructSettings(u_config, '', false);
		return createBaseStruct('string', cfg.required, cfg.default_value);
	},
	model(ModelClass, u_config={nullable: true, required: true}) {
		if (!ModelClass || !(ModelClass.prototype instanceof JsModel)) {
			throw new TypeError('Passed model class must be a valid model that inherits from JsModel');
		}
		const cfg = getStructSettings(u_config, null)

		const base = createBaseStruct('object', cfg.required, cfg.default_value);
		const base_validation = base.validation;
		base.Model = ModelClass;
		base.validation = function (u_value) {
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
					const model = new ModelClass(u_value);
					result.value = model;
				} catch (e) {
					result.valid = false;
					result.value = e.message;
				}
			}
			return result;
		}

		return base;
	},
	bigint(u_config={required: true, default_value: BigInt(0)}) {
		const cfg = getStructSettings(u_config, BigInt(0), false);
		return createBaseStruct('bigint', cfg.required, cfg.default_value);
	},
	bool(u_config={required: true, default_value: false}) {
		const cfg = getStructSettings(u_config, false, false);
		return createBaseStruct('boolean', cfg.required, cfg.default_value);
	},
	func(u_config={required: true, default_value: console.log}) {
		const cfg = getStructSettings(u_config, console.log, false);
		return createBaseStruct('function', cfg.required, cfg.default_value);
	},
	map(u_config = { nullable: true, required: true }) {
		const cfg = getStructSettings(u_config, new Map(), false);

		const base = createBaseStruct('object', cfg.required, cfg.default_value);
		const base_validation = base.validation;
		base.Class = Map;
		base.validation = function (u_value) {
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
		return base;
	}
}


// Testing
const FooModel = createModel('Foo', {
	a: Structs.int({ required:false, default_value: 2 }),
	b: Structs.string(),
	d: Structs.map({ nullable:false, required: false }),
});
const BahModel = createModel('Bah', {
	foo: Structs.model(FooModel, { nullable: true }),
	c: Structs.number({ required: false }),
	foos() {
		if (this.foo) {
			console.log(this.foo.a, this.foo.d)
		} else {
			console.log('No foo');
		}
	},
})
const TestModel = createModel('TestModel', {
	'bah': Structs.model(BahModel, { required: false }),
	methods: {
		hello() {
			console.log('Hello world');
		}
	},
})

let data = {
	'bah': {
		'c': Math.random(),
		'foo': {
			// 'a': 5,
			'b': 'Hello world!',
		}
	}
};


console.log(FooModel.name, BahModel.name, TestModel.name)

let model;

model = new TestModel(data);

/** @type {Map<string,any>} */
let map = model.bah.foo.d;

console.log(model);
console.log(map.keys(), map.values())
model.hello();
model.bah.foos();
