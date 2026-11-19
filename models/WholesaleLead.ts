import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWholesaleItem {
  productId?: string;
  productName: string;
  quantity: number;
  unit: 'KG' | 'LITRE' | 'CASES' | 'PIECES';
  targetPrice?: number;
}

export interface IWholesaleLead extends Document {
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin?: string;
  city: string;
  pincode: string;
  items: IWholesaleItem[];
  orderType: 'ONE_TIME' | 'MONTHLY_RECURRING' | 'CONTRACT_FARMING';
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'REJECTED';
  adminNotes?: string;
  quotedAmount?: number;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleItemSchema = new Schema({
  productId: { type: String, default: '' },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, enum: ['KG', 'LITRE', 'CASES', 'PIECES'], default: 'KG' },
  targetPrice: { type: Number },
});

const WholesaleLeadSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    gstin: { type: String, trim: true, uppercase: true, default: '' },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    items: { type: [WholesaleItemSchema], required: true },
    orderType: {
      type: String,
      enum: ['ONE_TIME', 'MONTHLY_RECURRING', 'CONTRACT_FARMING'],
      default: 'ONE_TIME',
    },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'REJECTED'],
      default: 'NEW',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    quotedAmount: { type: Number },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

WholesaleLeadSchema.index({ createdAt: -1 });
WholesaleLeadSchema.index({ phone: 1 });

const WholesaleLead: Model<IWholesaleLead> =
  mongoose.models.WholesaleLead ||
  mongoose.model<IWholesaleLead>('WholesaleLead', WholesaleLeadSchema);

export default WholesaleLead;
