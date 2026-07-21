import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const user = this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role
    });

    const saved = await this.users.save(user);
    return this.toPublicUser(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }),
      user: this.toPublicUser(user)
    };
  }

  async me(id: string) {
    const user = await this.users.findOneOrFail({ where: { id } });
    return this.toPublicUser(user);
  }

  private toPublicUser(user: User) {
    return { id: user.id, email: user.email, role: user.role };
  }
}
