import mongoose from "mongoose"

const webhookEventSchema = new mongoose.Schema(
    {
        stripeEventId: {
            type: String,
            unique: true
        },

        type: String,

        payload: Object,

        status: String,

        processedAt: Date
    },
    { timestamps: true }
)

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema)

export default WebhookEvent