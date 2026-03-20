import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Alert title is required'],
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Alert description is required'],
        trim: true,
        minlength: 20,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: ['crime', 'scam', 'digital_threat', 'hazard', 'weather', 'health']
    },
    subcategory: {
        type: String,
        trim: true,
        default: null
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical']
    },
    location: {
        type: String,
        required: true,
        enum: ['Downtown', 'Riverside', 'Oakwood', 'Hilltop', 'Lakeview', 'Greenfield']
    },
    source: {
        type: String,
        enum: ['system', 'community'],
        default: 'community'
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'under_review'],
        default: 'active'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // AI-generated fields
    aiSummary: {
        type: String,
        default: null
    },
    aiCategory: {
        type: String,
        default: null
    },
    scamScore: {
        type: Number,
        default: 0
    },
    scamJustification: {
        type: String,
        default: null
    },
    actionableSteps: {
        type: [String],
        default: []
    },
    aiSource: {
        type: String,
        enum: ['ai', 'rule-based'],
        default: 'rule-based'
    },
    // Community Vouching
    verifiedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    flaggedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Metadata
    date: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual counts for vouching
alertSchema.virtual('verifyCount').get(function() {
    return this.verifiedBy ? this.verifiedBy.length : 0;
});
alertSchema.virtual('flagCount').get(function() {
    return this.flaggedBy ? this.flaggedBy.length : 0;
});

// Text index for search
alertSchema.index({ title: 'text', description: 'text' });

// Compound indexes for common queries
alertSchema.index({ location: 1, category: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ date: -1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
