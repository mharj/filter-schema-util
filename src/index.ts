// Schema type
interface IFilterSchema {
	type: any;
	required?: boolean;
	hidden?: true;
	default?: any;
	filter?: IFilter;
	match?: RegExp;
}

// Filter type
export interface IFilter {
	[key: string]: IFilterSchema | IFilterSchema[];
}

// Type to control schema building
export type FilterBuilder<C> = {[P in keyof C]-?: IFilterSchema | IFilterSchema[]};

/**
 * Type conversion function
 * @param type is required type
 * @param inValue value to be fixed if there is need.
 */
const doTypeConversions = (type: any, inValue: any) => {
	let value = inValue;
	if (Array.isArray(inValue)) {
		value = inValue.map((v) => doTypeConversions(type, v));
	} else {
		if (type === Number && typeof value === 'string') {
			value = Number.parseFloat(value);
		}
		if (type === String && typeof value === 'number') {
			value = value.toString();
		}
	}
	return value;
};
/**
 * Filtering function
 * @param object to filter
 * @param filter schema object
 */
const doFilterRequirementKeys = <T>(object: object, filter: IFilter): T => {
	const out = {};
	Object.keys(filter).forEach((k) => {
		let isArray = false;
		let schema = filter[k] as IFilterSchema;
		if (Array.isArray(schema)) {
			schema = schema[0]  as IFilterSchema;
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
			if (schema.type === Object && schema.filter ) {
				if ('_bsontype' in value && Object.keys(value).length < 3) {
					// if Object value type is not matching (i.e. non populated mongodb object) we are returning undefined value
					value = undefined;
				} else {
					if (isArray) {
						value = filterObjectArray(value, schema.filter);
					} else {
						value = filterObject(value, schema.filter);
					}
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
		const data = filterObject<T>(object, filter);
		if (data) {
			outArray.push(data);
		}
	});
	return outArray as T[];
};
