export type CurrentUser = {
  id: number;
  email: string;
  isAdmin: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: CurrentUser;
};
