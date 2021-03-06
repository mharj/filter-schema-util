type SchemaKey = 'integer' | 'float' | 'string' | 'object' | 'date' | 'boolean' | 'schema';
/* istanbul ignore next : IE polyfill */
const NumberIsInteger = (value: number) => {
	return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
Number.isInteger = Number.isInteger || NumberIsInteger;

type TypedObjectValues = undefined | null | Error | string | number | Date | boolean | ITypedObject;

interface ITypedObject {
	[index: string]: TypedObjectValues;
}

interface IRequired {
	required: true;
	hidden?: boolean;
	default?: any;
}
interface INotRequired {
	required?: false;
	hidden?: boolean;
	default?: any;
}

interface ISchemaKeySchemaType<S extends SchemaKey> {
	type: S;
	filter: IFilterSchema<any>;
}

interface ISchemaKeyStringType<S extends SchemaKey> {
	type: S;
	match?: RegExp;
	forceCase?: 'upper' | 'lower';
}

interface ISchemaKeyNumberType<S extends SchemaKey> {
	type: S;
}

interface ISchemaKeyObjectType<S extends SchemaKey> {
	type: S;
}

interface ISchemaKeyDateType<S extends SchemaKey> {
	type: S;
}

interface ISchemaKeyBooleanType<S extends SchemaKey> {
	type: S;
	default?: boolean;
}

interface ISchemaKeyInteger<T = TypedObjectValues> extends ISchemaKeyNumberType<'integer'> {
	type: T extends number ? 'integer' : never;
}
interface ISchemaKeyIntegerArray<T = TypedObjectValues> extends ISchemaKeyNumberType<'integer'> {
	type: T extends number[] ? 'integer' : never;
}
interface ISchemaKeyFloat<T = TypedObjectValues> extends ISchemaKeyNumberType<'float'> {
	type: T extends number ? 'float' : never;
}
interface ISchemaKeyFloatArray<T = TypedObjectValues> extends ISchemaKeyNumberType<'float'> {
	type: T extends number[] ? 'float' : never;
}

interface ISchemaKeyString<T = TypedObjectValues> extends ISchemaKeyStringType<'string'> {
	type: T extends string ? 'string' : never;
}
interface ISchemaKeyStringArray<T = TypedObjectValues> extends ISchemaKeyStringType<'string'> {
	type: T extends string[] ? 'string' : never;
}

interface ISchemaKeyObject<T = TypedObjectValues> extends ISchemaKeyObjectType<'object'> {
	type: T extends object ? 'object' : never;
}
interface ISchemaKeyObjectArray<T = TypedObjectValues> extends ISchemaKeyObjectType<'object'> {
	type: T extends object ? 'object' : never;
}
interface ISchemaKeyDate<T = TypedObjectValues> extends ISchemaKeyDateType<'date'> {
	type: T extends Date ? 'date' : never;
}
interface ISchemaKeyDateArray<T = TypedObjectValues> extends ISchemaKeyDateType<'date'> {
	type: T extends Date[] ? 'date' : never;
}

interface ISchemaKeyBoolean<T = TypedObjectValues> extends ISchemaKeyBooleanType<'boolean'> {
	type: T extends boolean ? 'boolean' : never;
}
interface ISchemaKeyBooleanArray<T = TypedObjectValues> extends ISchemaKeyBooleanType<'boolean'> {
	type: T extends boolean[] ? 'boolean' : never;
}

interface ISchemaKeyFilterSchema<T = TypedObjectValues> extends ISchemaKeySchemaType<'schema'> {
	type: T extends object ? 'schema' : never;
}

interface ISchemaKeyFilterSchemaArray<T = TypedObjectValues> extends ISchemaKeySchemaType<'schema'> {
	type: T extends object[] ? 'schema' : never;
}
const isSchemaFilterKey = <T extends object>(key: SchemaKeys<T>): key is ISchemaKeyFilterSchema<T> => {
	return key.type === 'schema';
};
const isStringFilterKey = <T extends object>(key: SchemaKeys<T>): key is ISchemaKeyString<T> => {
	return key.type === 'string';
};

interface IStringIndexSignature {
	[index: string]: any;
}


type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
/**
 * get only optional properties
 */
type OptionalPropertyOf<T extends object> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T extends Record<K, T[K]> ? never : K;
		}[keyof T],
		undefined
	>
>;
/**
 * get only required properties
 */

type RequirePropertyOf<T extends object> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T extends Record<K, T[K]> ? K : never;
		}[keyof T],
		undefined
	>
>;

export type NewRequirePropertyOf<T extends object> = Pick<
	T,
	RequiredKeys<T>
>;

export type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

interface IDemo {
	test?: string;
}
export const data: RequirePropertyOf<IDemo> = {
	test: 'asd'
}

export type IncludeTypes<T, D> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T[K] extends D ? K : never;
		}[keyof T],
		undefined
	>
>;

export type ExcludeTypes<T, D> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T[K] extends D ? never : K;
		}[keyof T],
		undefined
	>
>;

type SchemaArrayKeys<T> =
	| ISchemaKeyFilterSchemaArray<T>
	| ISchemaKeyObjectArray<T>
	| ISchemaKeyIntegerArray<T>
	| ISchemaKeyFloatArray<T>
	| ISchemaKeyStringArray<T>
	| ISchemaKeyDateArray<T>
	| ISchemaKeyBooleanArray<T>;

type SchemaKeys<T extends object> =
	| ISchemaKeyInteger<T>
	| ISchemaKeyFloat<T>
	| ISchemaKeyFilterSchema<T>
	| ISchemaKeyObject<T>
	| ISchemaKeyString<T>
	| ISchemaKeyDate<T>
	| ISchemaKeyBoolean<T>;

type IFilterSchemaBase<T extends IStringIndexSignature, R extends IRequired | INotRequired> = IStringIndexSignature &
	{
		[K in Extract<keyof T, string>]: T[K] extends any[] ? (SchemaArrayKeys<T[K]> & R)[] : SchemaKeys<T[K]> & R;
	};

export type IFilterSchema<T extends IStringIndexSignature> = IFilterSchemaBase<RequirePropertyOf<T>, IRequired> &
	IFilterSchemaBase<Required<OptionalPropertyOf<T>>, INotRequired>;

const convert = (targetType: string, sourceValue: any | any[], options?: IFilterOptions, forceCase?: 'upper' | 'lower' | undefined): any | any[] => {
	let targetValue = sourceValue;
	if (Array.isArray(sourceValue)) {
		targetValue = sourceValue.map((d) => convert(targetType, d, options, forceCase));
	} else {
		if (sourceValue === undefined || sourceValue === null) {
			throw new TypeError('trying to convert empty data');
		}
		const sourceType = typeof sourceValue;
		switch (targetType) {
			case 'integer': {
				if (sourceType !== 'number' || !Number.isInteger(sourceValue)) {
					switch (sourceType) {
						case 'string':
							targetValue = parseInt(sourceValue, 10);
							break;
						case 'number':
							targetValue = Math.round(sourceValue);
							break;
						case 'object': {
							if (sourceValue instanceof Date) {
								targetValue = sourceValue.getTime();
								break;
							}
						}
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				break;
			}
			case 'float': {
				if (sourceType !== 'number') {
					switch (sourceType) {
						case 'string':
							targetValue = parseFloat(sourceValue);
							break;
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				break;
			}
			case 'boolean': {
				if (sourceType !== 'boolean') {
					switch (sourceType) {
						case 'string': {
							if (sourceValue === 'true' || sourceValue === '1') {
								targetValue = true;
								break;
							}
							if (sourceValue === 'false' || sourceValue === '0') {
								targetValue = false;
								break;
							}
							throw new TypeError(`can\'t convert value ${sourceValue} => ${targetType}`);
						}
						case 'number': {
							if (sourceValue === 1) {
								targetValue = true;
								break;
							}
							if (sourceValue === 0) {
								targetValue = false;
								break;
							}
							throw new TypeError(`can\'t convert value ${sourceValue} => ${targetType}`);
						}
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				break;
			}
			case 'date': {
				if (sourceType !== 'object' && !(sourceValue instanceof Date)) {
					switch (sourceType) {
						case 'number':
							targetValue = new Date(sourceValue);
							break;
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				// we convert Date object to milliseconds for wire as JSON can't handle Date's
				if (options && options.toWire) {
					targetValue = targetValue.getTime();
				}
				break;
			}
			case 'string': {
				if (sourceType !== 'string') {
					switch (sourceType) {
						case 'number':
							targetValue = '' + sourceValue;
							break;
						case 'boolean':
							targetValue = sourceValue ? 'true' : 'false';
							break;
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				if (forceCase) {
					switch (forceCase) {
						case 'upper':
							targetValue = sourceValue.toUpperCase();
							break;
						case 'lower':
							targetValue = sourceValue.toLowerCase();
							break;
					}
				}
				break;
			}
			case 'object': {
				if (sourceType !== 'object') {
					switch (sourceType) {
						case 'string':
							targetValue = JSON.parse(sourceValue);
							break;
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				break;
			}
			case 'schema': {
				if (sourceType !== 'object') {
					switch (sourceType) {
						default:
							throw new TypeError('not found type conversion ' + sourceType + ' => ' + targetType);
					}
				}
				break;
			}
			default:
				throw new TypeError(`unknown targetType ${targetType}`);
		}
	}
	return targetValue;
};

const handlefilter = <T extends IStringIndexSignature | IStringIndexSignature[]>(sk: ISchemaKeyFilterSchema<T> & (IRequired | INotRequired), data: object) => {
	if (sk.required) {
		if (Array.isArray(data)) {
			return filterSchemaArray(data, sk.filter);
		} else {
			return filterSchema(data, sk.filter);
		}
	} else {
		// if it's not requied and we are failing to filter, we just return empty data
		if (Array.isArray(data)) {
			try {
				return filterSchemaArray(data, sk.filter);
			} catch (err) {
				return [];
			}
		} else {
			try {
				return filterSchema(data, sk.filter);
			} catch (err) {
				return undefined;
			}
		}
	}
};
type SchemaKeysWithRequirements<T extends IStringIndexSignature> = SchemaKeys<T> & (IRequired | INotRequired);

const getSchemaKey = <T extends IStringIndexSignature>(
	filterKey: SchemaKeys<any> | SchemaKeys<any>[],
): {isArray: boolean; sk: SchemaKeysWithRequirements<T>} => {
	let isArray = false;
	let sk: SchemaKeys<T> & (IRequired | INotRequired);
	if (Array.isArray(filterKey)) {
		isArray = true;
		sk = filterKey[0];
	} else {
		sk = filterKey;
	}
	return {isArray, sk};
};

interface IFilterOptions {
	toWire?: boolean;
}

/**
 * Filter data using schema file
 * @param {object} data to filter
 * @param {object} filter schema to use filter data
 * @param {object} options
 * @param {boolean} options.toWire handle conversions to more wire friendly (ie. Data to msec)
 */
export const filterSchema = <T extends IStringIndexSignature>(data: object, filter: IFilterSchema<T>, options?: IFilterOptions) => {
	const out: any = {};
	Object.keys(filter).forEach((filterKey) => {
		const filterValue = filter[filterKey] as SchemaKeys<any> | SchemaKeys<any>[];
		const {isArray, sk} = getSchemaKey<T>(filterValue);
		const isHidden = sk.hidden && sk.hidden === true ? true : false;
		let value = data[filterKey] as any;
		if (isArray === true && !Array.isArray(value)) {
			// if we expect array and it's not, we nicely upgrade to array value
			value = [value];
		}
		if (isArray === false && Array.isArray(value)) {
			throw new TypeError(`data for ${filterKey} should not be array`);
		}
		// insert default value if value is not defined
		if (value === undefined && sk.default) {
			value = sk.default;
		}
		if (sk.required && sk.required === true && value === undefined) {
			throw new TypeError(`key ${filterKey} is required`);
		}
		if (value !== undefined && !isHidden) {
			if (isSchemaFilterKey(sk)) {
				out[filterKey] = handlefilter(sk, value);
			} else if (isStringFilterKey(sk)) {
				out[filterKey] = convert(sk.type, value, options, sk.forceCase);
			} else {
				out[filterKey] = convert(sk.type, value, options);
			}
		}
	});
	return out as T;
};

/**
 * Filter array of data using schema file
 * @param {object[]} data array to filter
 * @param {object} filter schema to use filter data
 * @param {object} options
 * @param {boolean} options.toWire handle conversions to more wire friendly (ie. Data to msec)
 */
export const filterSchemaArray = <T extends IStringIndexSignature[]>(dataArray: object[], filter: IFilterSchema<T>, options?: IFilterOptions) => {
	return dataArray.map((e) => filterSchema<T>(e, filter, options));
};
