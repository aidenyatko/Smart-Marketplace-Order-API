import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { Role } from "../../common/roles";

export class RegisterDto {
  @ApiProperty({ example: "buyer@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role, example: Role.Buyer })
  @IsEnum(Role)
  role: Role;
}
