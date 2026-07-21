import { Role } from "../common/roles";

export interface JwtUser {
  sub: string;
  email: string;
  role: Role;
}
