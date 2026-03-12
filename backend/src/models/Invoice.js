import mongoose from "mongoose"

const invoiceSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true
        },

        stripeInvoiceId: {
            type: String
        },

        amount: Number,

        currency: String,

        status: String,

        pdfUrl: String,

        periodStart: Date,

        periodEnd: Date
    },
    { timestamps: true }
)

import { tenantScopePlugin } from "../middleware/tenantScopePlugin.js"

invoiceSchema.plugin(tenantScopePlugin)

const Invoice = mongoose.model("Invoice", invoiceSchema)

export default Invoice