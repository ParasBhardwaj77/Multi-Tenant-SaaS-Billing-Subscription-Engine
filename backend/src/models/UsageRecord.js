import mongoose from "mongoose"

const usageRecordSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },

    metric: {
        type: String,
        enum: ["api_calls", "storage_gb", "seats"]
    },

    value: {
        type: Number,
        default: 1
    },

    recordedAt: {
        type: Date,
        default: Date.now
    }
})

usageRecordSchema.index({ tenantId: 1, metric: 1, recordedAt: 1 })

import { tenantScopePlugin } from "../middleware/tenantScopePlugin.js"

usageRecordSchema.plugin(tenantScopePlugin)

const UsageRecord = mongoose.model("UsageRecord", usageRecordSchema)

export default UsageRecord