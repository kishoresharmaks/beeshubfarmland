import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  enableOnlinePayment?: boolean;
  enableUPI: boolean;
  enableCOD: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    enableOnlinePayment: { type: Boolean, default: true },
    enableUPI: { type: Boolean, default: true },
    enableCOD: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
