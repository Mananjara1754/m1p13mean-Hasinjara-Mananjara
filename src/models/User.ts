import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    BUYER = 'BUYER',
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(UserRole), default: UserRole.BUYER },
        phone: { type: String },
    },
    { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
