import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // Encrypted content (the actual stored value)
    encryptedContent: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    isEmergency: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const safeCircleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Circle name is required'],
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [messageSchema],
}, {
    timestamps: true
});

// Ensure creator is always a member
safeCircleSchema.pre('save', function (next) {
    if (this.createdBy && !this.members.includes(this.createdBy)) {
        this.members.push(this.createdBy);
    }
    next();
});

const SafeCircle = mongoose.model('SafeCircle', safeCircleSchema);
export default SafeCircle;
