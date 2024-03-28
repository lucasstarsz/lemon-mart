import { Role } from '../../auth/auth.enum'
export interface IUser {
    _id: string
    email: string
    name: IName
    picture: string
    role: Role | string
    userStatus: boolean
    dateOfBirth: Date | null | string
    level: number
    address: {
        line1: string
        line2?: string
        city: string
        state: string
        zip: string
    }
    phones: IPhone[],
    readonly fullName?: string
}

export interface IName {
    first: string
    middle?: string
    last: string
}

export enum PhoneType {
    None = 'none',
    Mobile = 'mobile',
    Home = 'home',
    Work = 'work',
}

export interface IPhone {
    type: PhoneType
    digits: string
    id: number
}

export class User implements IUser {
    constructor(
        public _id = '',
        public email = '',
        public name = {
            first: '',
            middle: '',
            last: ''
        } as IName,
        public picture = '',
        public role = Role.None,
        public userStatus = false,
        public dateOfBirth: Date | null = null,
        public level = 0,
        public address = {
            line1: '',
            city: '',
            state: '',
            zip: ''
        },
        public phones: IPhone[] = []
    ) { }

    static Build(user: IUser) {
        if (!user) {
            return new User();
        }

        return new User(
            user._id,
            user.email,
            user.name,
            user.picture,
            user.role as Role,
            user.userStatus,
            typeof user.dateOfBirth === 'string'
                ? new Date(user.dateOfBirth)
                : user.dateOfBirth,
            user.level,
            user.address,
            user.phones
        );
    }

    public get fullName(): string {
        // if user's name property is falsy, aka it is any of:
        // - null
        // - undefined
        // - has a default value if it is a basic type (string, number, etc)
        //     - in our case, if it is an empty string it is considered falsy
        if (!this.name) {
            return '';
        }

        // if the middle name of the user is truthy, aka:
        // not null
        // defined
        // not a default value (not an empty string)
        if (this.name.middle) {
            return `${this.name.first} ${this.name.middle} ${this.name.last}`;
        }

        // first and last name will usually be truthy
        return `${this.name.first} ${this.name.last}`;
    }

    public toJSON(): object {
        // you can copy an object to another object instance, kinda stripping it of all
        // the type information teehee
        const serialized = Object.assign(this);

        // 'delete' keyword lets you remove properties from an object
        delete serialized._id;
        delete serialized.fullName;

        return serialized;
    }
}