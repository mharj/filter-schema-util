# filter-schema-util

Schema type filtering utility

### Basic example

```typescript
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

const output = filterSchema<IUser>(
	{
		_id: '3b5e3abc-9218-413f-8ef0-644656d1680f',
		email: 'Some.nasty@BUG.com',
		passwordHash: 'xxyyzzzzzwwwrrrr',
	},
	userFilter,
);
```

### sub schema example

```typescript
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
```

### example to Wire conversion, (converts Date => msec);

```typescript
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
```

More examples from unit tests

[./test/testFilters.ts](./test/testFilters.ts)
