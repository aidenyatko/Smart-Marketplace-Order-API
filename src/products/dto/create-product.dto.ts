import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateProductDto {
  @ApiProperty({ example: "Wireless keyboard" })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: "Compact keyboard for work setups" })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 4999 })
  @IsInt()
  @Min(1)
  priceCents: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stock: number;
}
