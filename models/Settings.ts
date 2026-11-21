import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpotlightBenefit {
  icon: string;
  text: string;
}

export interface ISpotlightConfig {
  isActive: boolean;
  productId?: string;
  badgeText: string;
  headingPrefix: string;
  productTitle: string;
  shortDescription: string;
  productImage: string;
  benefits: ISpotlightBenefit[];
  ctaLabel: string;
  ctaLink?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ISettings extends Document {
  key: string;
  activeTheme?: 'v1' | 'v2';
  enableOnlinePayment?: boolean;
  enableUPI: boolean;
  enableCOD: boolean;
  fssaiNumber?: string;
  gstin?: string;
  enableWholesale?: boolean;
  spotlight?: ISpotlightConfig;
  spotlights?: ISpotlightConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const SpotlightItemSchema = new Schema({
  isActive: { type: Boolean, default: true },
  productId: { type: String, default: '' },
  badgeText: { type: String, default: 'NEW ARRIVAL ✨' },
  headingPrefix: { type: String, default: 'Introducing Our' },
  productTitle: { type: String, default: 'Pure Forest Honey' },
  shortDescription: {
    type: String,
    default:
      'Raw, unprocessed and 100% natural honey directly from trusted farm beekeepers in Western Ghats, Kanyakumari.',
  },
  productImage: {
    type: String,
    default: '/images/beeshub-pure-forest-honey-spotlight.webp',
  },
  benefits: {
    type: [
      {
        icon: { type: String, default: 'natural' },
        text: { type: String, default: '100% Natural' },
      },
    ],
    default: [
      { icon: 'natural', text: '100% Natural' },
      { icon: 'additives', text: 'No Additives' },
      { icon: 'farm', text: 'Farm Sourced' },
    ],
  },
  ctaLabel: { type: String, default: 'Shop New Product' },
  ctaLink: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
});

const SettingsSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    activeTheme: { type: String, enum: ['v1', 'v2'], default: 'v2' },
    enableOnlinePayment: { type: Boolean, default: true },
    enableUPI: { type: Boolean, default: true },
    enableCOD: { type: Boolean, default: true },
    fssaiNumber: { type: String, default: '22424000000000' },
    gstin: { type: String, default: '33AAAAA0000A1Z5' },
    enableWholesale: { type: Boolean, default: true },
    spotlight: SpotlightItemSchema,
    spotlights: [SpotlightItemSchema],
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
