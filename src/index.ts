interface IFilterChema {
	type: any;
	required?: boolean;
	hidden?: true;
	default?: any;
	filter?: IFilter;
	match?: RegExp;
}

export interface IFilter {
	[key: string]: IFilterChema | IFilterChema[];
}

export type FilterRequire<C> = {[P in keyof C]-?: IFilterChema | IFilterChema[]};

const doTypeConversions = (type: any, inValue: any) => {
	let value = inValue;
	if (Array.isArray(inValue)) {
		value = inValue.map((v) => doTypeConversions(type, v));
	} else {
		if (type === Number && !Number.isInteger(value)) {
			value = Number.parseFloat(value);
		}
		if (type === String && typeof value !== 'string') {
			value = '' + value;
		}
	}
	return value;
};

const doFilterRequirementKeys = <T>(object: object, filter: IFilter) => {
	const out = {};
	Object.keys(filter).forEach((k) => {
		let isArray = false;
		let schema = filter[k];
		if (Array.isArray(schema)) {
			schema = schema[0];
			isArray = true;
		}
		if (schema.type !== String && schema.match) {
			throw new Error(`Can only match with String type [key: ${k}]`);
		}
		if (schema.required && !(k in object)) {
			throw new Error(`missing required key ${k}`);
		} else {
			let value = object[k];
			// sub filtering for Object type
			if (schema.type === Object && schema.filter) {
				if (isArray) {
					value = filterObjectArray(value, schema.filter);
				} else {
					value = filterObject(value, schema.filter);
				}
			}
			// attach default value if no value;
			if (!value && schema.default !== undefined) {
				value = schema.default;
			}
			// do match
			if (schema.match) {
				if (!value.match(schema.match)) {
					throw new Error(`value '${value}' does not match to key: '${k}' in regular expression match`);
				}
			}
			if (!schema.hidden) {
				out[k] = doTypeConversions(schema.type, value);
			}
		}
	});
	return out as T;
};

/**
 * Filter object or objects
 * @param object to filter
 * @param filter schema object which describes what to do with values in object
 * @return typed object or object array based on interface
 */
export const filterObject = <T extends object>(object: object, filter: IFilter): T => {
	if (Array.isArray(object)) {
		const outArray: any[] = [];
		object.forEach((o) => {
			outArray.push(filterObject(o, filter));
		});
		return outArray as T;
	} else {
		return doFilterRequirementKeys<T>(object, filter);
	}
};

/**
 * Filter objects
 * @param object to filter
 * @param filter schema object which describes what to do with values in object
 * @return typed object array based on interface
 */
export const filterObjectArray = <T extends object>(objects: object[], filter: IFilter): T[] => {
	const outArray: T[] = [];
	objects.forEach((object) => {
		outArray.push(filterObject<T>(object, filter));
	});
	return outArray as T[];
};
