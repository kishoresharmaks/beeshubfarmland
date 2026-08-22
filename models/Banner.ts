import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  image: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

BannerSchema.index({ createdAt: -1 });

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
