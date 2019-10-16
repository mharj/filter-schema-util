import {filterSchema, IFilterSchema} from '../src';

interface IUser {
	_id?: string;
	email: string;
	roles: IRole[];
}

interface IRole {
	_id?: string;
	name: string;
}

const roleFilter: IFilterSchema<IRole> = {
	_id: {type: 'string'},
	name: {type: 'string', required: true, forceCase: 'upper'},
};

const userFilter: IFilterSchema<IUser> = {
	_id: {type: 'string', required: false},
	email: {type: 'string', required: true, forceCase: 'lower'},
	roles: [{type: 'schema', required: true, filter: roleFilter}],
};

const output = filterSchema<IUser>(
	{
		_id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
		email: 'Some.nasty@BUG.com',
		roles: [{name: 'sOmE_rOLe'}],
	},
	userFilter,
);
console.log(output);
/*
 *   { _id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
 *     email: 'some.nasty@bug.com',
 *     roles: [ { name: 'SOME_ROLE' } ] }
 */
