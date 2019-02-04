# filter-schema-util
Schema type filtering utility

Simple usage
```typescript
interface IUser {
	_id?: number;
	email: string;
	passwordHash?: number;
}

const userFilter: FilterBuilder<IUser> = {
	_id: {type: String},
	email: {type: String, required: true},
	passwordHash: {type: String, hidden: true},
};

const output = filterObject<IUser>(req.body, userFilter);
```