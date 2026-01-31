import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    location: {
        lat: number;
        lng: number;
        floor?: string;
        address: string;
    };
    category: string;
    openingHours: string;
}

const ShopSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            floor: { type: String },
            address: { type: String, required: true },
        },
        category: { type: String, required: true },
        openingHours: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IShop>('Shop', ShopSchema);
