import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { LocalAuthGuard } from 'src/auth/local.auth.guard';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //post/ signup
  @Post('/signup')
  async addUser(
    @Body('password') userPassword: string,
    @Body('username') userName: string,
  ) {
    //hash password
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(userPassword, saltOrRounds);

    const result = await this.usersService.insertUser(userName, hashedPassword);
    return {
      msg: 'User successfully registered',
      userId: result.id,
      userName: result.username,
    };
  }

  //Post / Login
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req): any {
    // return the user id and username
    return {
      msg: 'User successfully logged in',
      userId: req.user.userId,
      userName: req.user.userName,
    };
  }

  //Get / protected
  @UseGuards(AuthenticatedGuard)
  @Get('/protected')
  getHello(@Request() req): string {
    return req.user;
  }

  //Get / logout
  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();

    return { msg: 'The user session has ended' };
  }

  //Deleting  users  account
  @UseGuards(AuthenticatedGuard)
  @Delete('/delete')
  async deleteUser(@Request() req): Promise<any> {
    const userId = req.user.userId; // Extract the userId from req.user
    const result = await this.usersService.deleteUser(userId);
    return {
      msg: 'User successfully deleted',
    };
  }
}