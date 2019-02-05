import {expect} from 'chai';
import {describe, it} from 'mocha';
import {FilterBuilder, filterObject} from '../src/index';

interface ITest {
	param1: number;
	param2: string;
	param3?: number;
	param4: string;
	secret: string;
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

describe('filter', () => {
	describe('filterObject', () => {
		it('basic filter', () => {
			const filter: FilterBuilder<ITest> = {
				param1: {type: Number, required: true},
				param2: {type: String, required: true},
				param3: {type: Number},
				param4: {type: String, required: true},
				secret: {type: String, hidden: true},
			};
			const output = filterObject<ITest>({param1: '1', param2: '2', param3: '3', param4: '4', secret: 'stuff'}, filter);
			expect(output).to.be.eql({param1: 1, param2: '2', param3: 3, param4: '4'});
		});
		it('array filter', () => {
			const filter: FilterBuilder<IArrayTest> = {
				names: [{type: String, required: true}],
			};
			const output = filterObject<IArrayTest>({names: ['test', 'test', 1]}, filter);
			expect(output).to.be.eql({names: ['test', 'test', '1']});
		});
		it('sub filtering', () => {
			const subFilter: FilterBuilder<ITestSub> = {
				default: {type: Boolean, default: true},
				name: {type: String, required: true},
				secret: {type: String, hidden: true},
				test: {type: Number, required: true},
			};
			const filter: FilterBuilder<ITestMain> = {
				sub: {type: Object, filter: subFilter},
			};
			const output = filterObject<ITestMain>(
				{
					sub: {name: 'hello', test: '1', secret: 'stuff'},
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: {name: 'hello', test: 1, default: true},
			});
		});
		it('sub filter array', () => {
			const subFilter = {
				name: {type: String, required: true},
			};
			const filter: FilterBuilder<ITestArrayMain> = {
				sub: [{type: Object, filter: subFilter}],
			};
			const output = filterObject<ITestArrayMain>(
				{
					sub: [{name: 'hello'}, {name: 1}],
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: [{name: 'hello'}, {name: '1'}],
			});
		});
		it('match testing', () => {
			const filter = {
				test: {type: String, match: new RegExp(/^a/)},
			};
			expect(filterObject({test: 'abc'}, filter)).to.be.eql({test: 'abc'});
			expect(filterObject.bind({test: 'qwe'}, filter)).to.throw();
		});
		it('sub filtering without solving', () => {
			const subFilter: FilterBuilder<{name: true}> = {
				name: {type: String},
			};
			const filter: FilterBuilder<ITestMain> = {
				sub: {type: Object, filter: subFilter},
			};
			const output = filterObject<ITestMain>(
				{
					sub: {id: 'test', _bsontype: 'ObjectID'},
				},
				filter,
			);
			expect(output).to.be.eql({
				sub: undefined,
			});
		});
		it('sub filtering with required solving', () => {
			const subFilter: FilterBuilder<{name: true}> = {
				name: {type: String, required: true},
			};
			const filter: FilterBuilder<ITestMain> = {
				sub: {type: Object, filter: subFilter, required: true},
			};
			expect(
				filterObject.bind(
					{
						sub: {id: 'test', _bsontype: 'ObjectID'},
					},
					filter,
				),
			).to.throw();
		});
	});
});
