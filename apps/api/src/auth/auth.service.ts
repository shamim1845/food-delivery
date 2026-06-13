import {
  ConflictException,
  UnauthorizedException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as bcrypt from 'bcrypt';
import * as schema from '../db/schema';
import type { AuthResponse, JwtPayload, UserRole } from '@food-delivery/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DB')
    private db: NeonHttpDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async register(userDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, ...rest } = userDto;
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email,
        password: hashedPassword,
        ...rest,
      })
      .returning();

    return {
      user: this.sanitizedUser(newUser),
      token: this.generateToken(newUser),
    };
  }

  async login(userDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = userDto;
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: this.sanitizedUser(existingUser),
      token: this.generateToken(existingUser),
    };
  }

  private sanitizedUser(user: schema.User) {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  private generateToken(user: schema.User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    return this.jwtService.sign(payload);
  }
}
