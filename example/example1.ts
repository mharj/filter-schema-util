import {filterSchema, IFilterSchema} from '../src';

interface IUser {
	_id?: string;
	email: string;
	passwordHash: string;
}

const userFilter: IFilterSchema<IUser> = {
	_id: {type: 'string', required: false},
	email: {type: 'string', required: true, forceCase: 'lower'},
	passwordHash: {type: 'string', required: true, hidden: true},
};

const output = filterSchema<IUser>({_id: '3b5e3abc-9218-413f-8ef0-644656d1680f', email: 'Some.nasty@BUG.com', passwordHash: 'xxyyzzzzzwwwrrrr'}, userFilter);
console.log(output);
/**
 * { _id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
 *   email: 'some.nasty@bug.com' }
 */
