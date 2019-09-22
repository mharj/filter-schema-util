type SchemaKey = 'integer' | 'float' | 'string' | 'object' | 'date' | 'boolean' | 'schema';
// IE polyfill
const NumberIsInteger = (value: number) => {
	return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
Number.isInteger = Number.isInteger || NumberIsInteger;

interface ISchemaKeyCommon<S extends SchemaKey> {
	type: S;
	required?: boolean;
	hidden?: boolean;
	[index: string]: any;
}
interface IRequired {
	required: true;
}
interface INotRequired {
	required?: false;
}

interface ISchemaKeySchemaType<S extends SchemaKey> extends ISchemaKeyCommon<S> {
	filter: IFilterSchema<any>;
}

interface ISchemaKeyStringType<S extends SchemaKey> extends ISchemaKeyCommon<'string'> {
	match?: RegExp;
}

interface ISchemaKeyNumber<T> extends ISchemaKeyCommon<'float' | 'integer'> {
	type: T extends number ? ('float' | 'integer') : never;
}
interface ISchemaKeyNumberArray<T> extends ISchemaKeyCommon<'float' | 'integer'> {
	type: T extends number[] ? ('float' | 'integer') : never;
}

interface ISchemaKeyString<T> extends ISchemaKeyStringType<'string'> {
	type: T extends string ? 'string' : never;
}
interface ISchemaKeyStringArray<T> extends ISchemaKeyStringType<'string'> {
	type: T extends string[] ? 'string' : never;
}

interface ISchemaKeyObject<T> extends ISchemaKeyCommon<'object'> {
	type: T extends object ? 'object' : never;
}
interface ISchemaKeyObjectArray<T> extends ISchemaKeyCommon<'object'> {
	type: T extends object ? 'object' : never;
}

interface ISchemaKeyDate<T> extends ISchemaKeyCommon<'date'> {
	type: T extends Date ? 'date' : never;
}
interface ISchemaKeyDateArray<T> extends ISchemaKeyCommon<'date'> {
	type: T extends Date[] ? 'date' : never;
}

interface ISchemaKeyBoolean<T> extends ISchemaKeyCommon<'boolean'> {
	type: T extends boolean ? 'boolean' : never;
}
interface ISchemaKeyBooleanArray<T> extends ISchemaKeyCommon<'boolean'> {
	type: T extends boolean[] ? 'boolean' : never;
}

interface ISchemaKeyFilterSchema<T> extends ISchemaKeySchemaType<'schema'> {
	type: T extends object ? 'schema' : never;
}

interface ISchemaKeyFilterSchemaArray<T> extends ISchemaKeySchemaType<'schema'> {
	type: T extends object[] ? 'schema' : never;
}

interface IStringIndexSignature {
	[index: string]: any;
}

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

type SchemaArrayKeys<T> =
	| ISchemaKeyFilterSchemaArray<T>
	| ISchemaKeyObjectArray<T>
	| ISchemaKeyNumberArray<T>
	| ISchemaKeyStringArray<T>
	| ISchemaKeyDateArray<T>
	| ISchemaKeyBooleanArray<T>;

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

type SchemaKeys<T> = ISchemaKeyFilterSchema<T> | ISchemaKeyObject<T> | ISchemaKeyNumber<T> | ISchemaKeyString<T> | ISchemaKeyDate<T> | ISchemaKeyBoolean<T>;

type IFilterSchemaBase<T extends object, R extends IRequired | INotRequired> = IStringIndexSignature &
	{
		[K in Extract<keyof T, string>]: (T[K] extends any[] ? Array<SchemaArrayKeys<T[K]>> : SchemaKeys<T[K]>) & R;
	};

export type IFilterSchema<T extends object> = IFilterSchemaBase<RequirePropertyOf<T>, IRequired> | IFilterSchemaBase<OptionalPropertyOf<T>, INotRequired>;

const convert = (targetType: string, sourceValue: any | any[]): any | any[] => {
	let targetValue = sourceValue;
	if (Array.isArray(sourceValue)) {
		targetValue = sourceValue.map((d) => convert(targetType, d));
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

const handlefilter = <T extends IStringIndexSignature | IStringIndexSignature[]>(data: object, filter: IFilterSchema<T>, required?: boolean) => {
	if (required) {
		if (Array.isArray(data)) {
			return filterSchemaArray(data, filter);
		} else {
			return filterSchema(data, filter);
		}
	} else {
		// if it's not requied and we are failing to filter, we just return empty data
		if (Array.isArray(data)) {
			try {
				return filterSchemaArray(data, filter);
			} catch (err) {
				return [];
			}
		} else {
			try {
				return filterSchema(data, filter);
			} catch (err) {
				return undefined;
			}
		}
	}
};

export const filterSchema = <T extends IStringIndexSignature>(data: object, filter: IFilterSchema<T>) => {
	const out: any = {};
	Object.keys(filter).forEach((key) => {
		let isArray = false;
		let sk: SchemaKeys<T>;
		if (Array.isArray(filter[key])) {
			isArray = true;
			sk = filter[key][0] as SchemaKeys<T>;
		} else {
			sk = filter[key] as SchemaKeys<T>;
		}
		let value = data[key] as any;
		if (isArray === true && !Array.isArray(value)) {
			// if we expect array and it's not, we nicely upgrade to array value
			value = [value];
		}
		if (isArray === false && Array.isArray(value)) {
			throw new TypeError(`data for ${key} should not be array`);
		}
		if (sk.required && sk.required === true && !(key in data)) {
			throw new TypeError(`key ${key} is required`);
		}
		if (key in data && !(sk.hidden && sk.hidden === true)) {
			out[key] = sk.type === 'schema' ? handlefilter(value, sk.filter, sk.required) : convert(sk.type, value);
		}
	});
	return out as T;
};

export const filterSchemaArray = <T extends IStringIndexSignature[]>(dataArray: object[], filter: IFilterSchema<T>) => {
	return dataArray.map((e) => filterSchema<T>(e, filter));
};
