import { IUserModel } from "../models/User";
import { User, UserResponse } from "../types";
import { inject, injectable } from "tsyringe";

export interface IUserApplication {
    getUserByEmail(email: string): Promise<User>;
    getUserById(id: number): Promise<User>;
    listUsers(): Promise<UserResponse[]>;
    verifyUserPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    toUserResponse(user: User): Promise<UserResponse>;
    createUser(name: string, email: string, password: string, role?: string): Promise<UserResponse>;
    deleteUser(id: number): Promise<void>;
}

@injectable()
export class userApplication implements IUserApplication {
    constructor(
        @inject("IUserModel") private userModel: IUserModel
    ) { }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findByEmail(email);

        console.log('Fetched user by email:', user);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userModel.findById(id);
        
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async listUsers(): Promise<UserResponse[]> {
        const users = await this.userModel.findAll();

        if (!users) {
            return [];
        }
        return users;
    }

    async createUser(name: string, email: string, password: string, role?: string): Promise<UserResponse> {

        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const newUser = await this.userModel.create(name, email, password, role as any);

        return newUser;
    }

    async verifyUserPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {

        const isValid = await this.userModel.verifyPassword(plainPassword, hashedPassword);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return true;
    }

    async deleteUser(id: number): Promise<void> {
        await this.userModel.delete(id);
    }

    async toUserResponse(user: User): Promise<UserResponse> {
        return this.userModel.toUserResponse(user);
    }


}