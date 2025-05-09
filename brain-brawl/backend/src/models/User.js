"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
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
    }
}, { timestamps: true });
// Define a virtual property for win rate
UserSchema.virtual('winRate').get(function () {
    if (this.gamesPlayed === 0)
        return 0;
    return Math.round((this.gamesWon / this.gamesPlayed) * 100);
});
// Make virtuals available when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('User', UserSchema);