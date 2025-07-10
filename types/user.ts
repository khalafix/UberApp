export interface User {
    id?: string;
    displayName: string;
    username: string;
    token: string;
    email: string;
    roles: string[];
}

export interface UserIdAndName {
    id: string;
    displayName: string;
    email:string;
    password:string;
}


///