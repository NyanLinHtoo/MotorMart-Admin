export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface AddAdminUserPayload {
  "email": string,
  "name": string,
  "role": 'Admin' | 'User',
  "password": string,
}

export interface UpdateAdminUserPayload {
  "email": string,
  "name": string,
  "phonenumber": number,
  "password": string,
}

export interface UpdateAdminPayload {
  "email": string,
  "name": string,
  "phonenumber": number,
  "password": string,
}

