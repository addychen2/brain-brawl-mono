import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  score: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
}

const UserSchema: Schema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  gamesPlayed: { 
    type: Number, 
    default: 0 
  },
  gamesWon: { 
    type: Number, 
    default: 0 
  },
  gamesLost: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Define a virtual property for win rate
UserSchema.virtual('winRate').get(function(this: IUser) {
  if (this.gamesPlayed === 0) return 0;
  return Math.round((this.gamesWon / this.gamesPlayed) * 100);
});

// Make virtuals available when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);