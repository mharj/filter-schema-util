import 'mocha';

import {expect} from 'chai';
import {filterSchema, IFilterSchema} from '../src/index';

interface ITest {
	param1: number;
	param2: string;
	param3?: number;
	param4: string;
	secret?: string;
	isOk: boolean;
}
interface ITestSub {
	name: string;
	test?: number;
	secret: string;
	default: boolean;
}

interface ITestMain {
	sub: ITestSub;
}

interface ITestArrayMain {
	sub: ITestSub[];
}

interface IArrayTest {
	names: string[];
}
let stringTestFilter: IFilterSchema<{value: string}>;
let stringUpperTestFilter: IFilterSchema<{value: string}>;
let stringLowerTestFilter: IFilterSchema<{value: string}>;
let integerTestFilter: IFilterSchema<{value: number}>;
let booleanTestFilter: IFilterSchema<{value: boolean}>;
let objectTestFilter: IFilterSchema<{value: object}>;
let dateTestFilter: IFilterSchema<{value: Date}>;

describe('filter', () => {
	describe('typeTestinig', () => {
		it('check hidden type', () => {
			const hiddenTest1: IFilterSchema<{value?: string}> = {value: {type: 'string'}};
			expect(filterSchema({value: '1'}, hiddenTest1)).to.be.eql({value: '1'});
			const hiddenTest2: IFilterSchema<{value: number}> = {value: {type: 'integer', required: true}};
			expect(filterSchema({value: '1'}, hiddenTest2)).to.be.eql({value: 1});
		});
	});
	describe('filterConversions', () => {
		before(() => {
			stringTestFilter = {
				value: {type: 'string', required: true},
			};
			integerTestFilter = {
				value: {type: 'integer', required: true},
			};
			booleanTestFilter = {
				value: {type: 'boolean', required: true},
			};
			objectTestFilter = {
				value: {type: 'object', required: true},
			};
			dateTestFilter = {
				value: {type: 'date', required: true},
			};
			stringUpperTestFilter = {
				value: {type: 'string', required: true, forceCase: 'upper'},
			};
			stringLowerTestFilter = {
				value: {type: 'string', required: true, forceCase: 'lower'},
			};
		});
		it('should not convert null or undefined values', () => {
			expect(filterSchema.bind({value: undefined}, stringTestFilter)).to.throw(TypeError);
			expect(filterSchema.bind({value: null}, stringTestFilter)).to.throw(TypeError);
		});
		describe('filterConversions: string', () => {
			it('string: number => string', () => {
				expect(filterSchema({value: 1}, stringTestFilter)).to.be.eql({value: '1'});
			});
			it('string: boolean => string', () => {
				expect(filterSchema({value: true}, stringTestFilter)).to.be.eql({value: 'true'});
				expect(filterSchema({value: false}, stringTestFilter)).to.be.eql({value: 'false'});
			});
			it('string: object => throw TypeError', () => {
				expect(filterSchema.bind({value: {}}, stringTestFilter)).to.throw(TypeError);
			});
			it('string: string => STRING', () => {
				expect(filterSchema({value: 'upper'}, stringUpperTestFilter)).to.be.eql({value: 'UPPER'});
			});
			it('string: STRING => string', () => {
				expect(filterSchema({value: 'LOWER'}, stringLowerTestFilter)).to.be.eql({value: 'lower'});
			});
		});
		describe('filterConversions: integer', () => {
			it('integer: string => integer', () => {
				expect(filterSchema({value: '1'}, integerTestFilter)).to.be.eql({value: 1});
			});
			it('integer: float => integer', () => {
				expect(filterSchema({value: 4.5}, integerTestFilter)).to.be.eql({value: 5});
			});
			it('integer: date => integer', () => {
				expect(filterSchema({value: new Date(1569166591952)}, integerTestFilter)).to.be.eql({value: 1569166591952});
			});
		});
		describe('filterConversions: boolean', () => {
			it('boolean: 0 => boolean', () => {
				expect(filterSchema({value: 0}, booleanTestFilter)).to.be.eql({value: false});
			});
			it('boolean: 1 => boolean', () => {
				expect(filterSchema({value: 1}, booleanTestFilter)).to.be.eql({value: true});
			});

			it('boolean: "0" => boolean', () => {
				expect(filterSchema({value: '0'}, booleanTestFilter)).to.be.eql({value: false});
			});
			it('boolean: "1" => boolean', () => {
				expect(filterSchema({value: '1'}, booleanTestFilter)).to.be.eql({value: true});
			});
			it('boolean: "false" => boolean', () => {
				expect(filterSchema({value: 'false'}, booleanTestFilter)).to.be.eql({value: false});
			});
			it('boolean: "true => boolean', () => {
				expect(filterSchema({value: 'true'}, booleanTestFilter)).to.be.eql({value: true});
			});
			it('boolean: -1 => throw TypeError', () => {
				expect(filterSchema.bind({value: -1}, booleanTestFilter)).to.throw(TypeError);
			});
		});
		describe('filterConversions: object', () => {
			it('object: string => object (JSON)', () => {
				expect(filterSchema({value: '{}'}, objectTestFilter)).to.be.eql({value: {}});
			});
		});
		describe('filterConversions: date', () => {
			it('date: number => date', () => {
				expect(filterSchema({value: 1569166591952}, dateTestFilter)).to.be.eql({value: new Date(1569166591952)});
			});

			it('date: date => number (with toWire)', () => {
				expect(filterSchema({value: new Date(1569166591952)}, dateTestFilter, {toWire: true})).to.be.eql({value: 1569166591952});
			});
		});
	});
	describe('filterObject', () => {
		it('basic string type filter', () => {
			const filter: IFilterSchema<ITest> = {
				isOk: {type: 'boolean', required: true},
				param1: {type: 'integer', required: true},
				param2: {type: 'string', required: true},
				param3: {type: 'float'},
				param4: {type: 'string', required: true},
				secret: {type: 'string', hidden: true},
			};
			expect(filterSchema({param1: '1', param2: '2', param3: '3.5', param4: '4', secret: 'stuff', isOk: true}, filter)).to.be.eql({
				isOk: true,
				param1: 1,
				param2: '2',
				param3: 3.5,
				param4: '4',
			});
			expect(filterSchema({param1: '1', param2: '2', param4: '4', secret: 'stuff', isOk: true}, filter)).to.be.eql({
				isOk: true,
				param1: 1,
				param2: '2',
				param4: '4',
			});
		});
		it('array filter', () => {
			const filter: IFilterSchema<IArrayTest> = {
				names: [{type: 'string', required: true}],
			};
			const output = filterSchema({names: ['test', 'test', 1]}, filter);
			expect(output).to.be.eql({names: ['test', 'test', '1']});
		});
		it('sub filtering', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', required: true, default: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			const filter: IFilterSchema<ITestMain> = {
				sub: {type: 'schema', required: true, filter: subFilter},
			};
			const output = filterSchema(
				{
					sub: {
						default: true,
						name: 'hello',
						secret: 'stuff',
						test: '1',
					},
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: {name: 'hello', test: 1, default: true},
			});
		});
		it('sub filter array', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', default: true, required: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			// sub: [{type: 'schema', filter: subFilter}],
			const filter: IFilterSchema<ITestArrayMain> = {
				sub: [{type: 'schema', required: true, filter: subFilter}],
			};
			const output = filterSchema(
				{
					sub: [
						{
							default: true,
							name: 'hello',
							secret: 'stuff',
							test: '1',
						},
						{
							default: true,
							name: 'hello',
							secret: 'stuff',
							test: '1',
						},
					],
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: [{name: 'hello', test: 1, default: true}, {name: 'hello', test: 1, default: true}],
			});
		});
		it('match testing', () => {
			const filter: IFilterSchema<{test: string}> = {
				test: {type: 'string', required: true, match: new RegExp(/^a/)},
			};
			expect(filterSchema({test: 'abc'}, filter)).to.be.eql({test: 'abc'});
			expect(filterSchema.bind({test: 'qwe'}, filter)).to.throw();
		});
		it('sub filtering without solving', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', required: true, default: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			const filter: IFilterSchema<ITestMain> = {
				sub: {type: 'schema', required: true, filter: subFilter},
			};
			const output = filterSchema(
				{
					sub: {id: 'test', _bsontype: 'ObjectID', name: 'test', secret: 'super', test: 666},
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: {default: true, name: 'test', test: 666},
			});
		});
		it('sub filtering with required solving', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', required: true, default: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			const filter: IFilterSchema<ITestMain> = {
				sub: {type: 'schema', filter: subFilter, required: true},
			};
			expect(
				filterSchema.bind(
					{
						sub: {id: 'test', _bsontype: 'ObjectID'},
					},
					filter,
				),
			).to.throw();
		});
		it('sub filtering array without solving', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', required: true, default: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			const filter: IFilterSchema<ITestArrayMain> = {
				sub: [{type: 'schema', required: true, filter: subFilter}],
			};
			const output = filterSchema(
				{
					sub: [{id: 'test', _bsontype: 'ObjectID', name: 'test', secret: 'super', test: 666}],
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: [{default: true, name: 'test', test: 666}],
			});
		});
		it('sub filtering array with required solving', () => {
			const subFilter: IFilterSchema<ITestSub> = {
				default: {type: 'boolean', required: true, default: true},
				name: {type: 'string', required: true},
				secret: {type: 'string', required: true, hidden: true},
				test: {type: 'integer', required: false},
			};
			const filter: IFilterSchema<ITestArrayMain> = {
				sub: [{type: 'schema', filter: subFilter, required: true}],
			};
			expect(
				filterSchema.bind(
					{
						sub: [{id: 'test', _bsontype: 'ObjectID'}],
					},
					filter,
				),
			).to.throw();
		});
		it('single to array conversion', () => {
			const filter: IFilterSchema<{objectClass: string[]}> = {
				objectClass: [{type: 'string', required: true}],
			};
			const output = filterSchema(
				{
					objectClass: 'posixAccount',
				},
				filter,
			);
			expect(output).to.be.eql({
				objectClass: ['posixAccount'],
			});
		});
		it('should handle wire format', () => {
			const filter: IFilterSchema<{date: Date}> = {
				date: {type: 'date', required: true},
			};
			const date = new Date();
			const output = filterSchema(
				{
					date,
				},
				filter,
				{toWire: true},
			);
			expect(output).to.be.eql({
				date: date.getTime(),
			});
		});
	});
});
