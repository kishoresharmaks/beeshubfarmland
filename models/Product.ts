import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  image: string;
  mrp: number;
  price: number;
  discount?: number;
  quantity: number;
  gst: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    gst: { type: Number, required: true, min: 0, default: 18 },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

// Indexes to optimize MongoDB Atlas queries & avoid 32MB memory sort limit
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' });

// Pre-save hook to calculate discount percentage if not manually specified
ProductSchema.pre('save', function (this: IProduct, next) {
  if (this.mrp && this.price && this.mrp > this.price) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
