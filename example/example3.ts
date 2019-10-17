import {filterSchema, IFilterSchema} from '../src';

interface IUser {
	_id?: string;
	email: string;
	lastLogin?: Date;
}

const userFilter: IFilterSchema<IUser> = {
	_id: {type: 'string', required: false},
	email: {type: 'string', required: true, forceCase: 'lower'},
	lastLogin: {type: 'date'},
};

const output = filterSchema<IUser>(
	{
		_id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
		email: 'Some.nasty@BUG.com',
		lastLogin: new Date(),
	},
	userFilter,
	{toWire: true},
);
console.log(output);
/*
 *   { _id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
 *     email: 'some.nasty@bug.com',
 *     lastLogin: 1571288852963 }
 */
