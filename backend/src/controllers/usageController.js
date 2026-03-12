import UsageRecord from "../models/UsageRecord.js"

export const getUsageReport = async (req, res) => {
    try {
        const report = await UsageRecord.aggregate([
            {
                $match: {
                    tenantId: req.tenantId,
                    metric: "api_calls"
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$recordedAt" } },
                    calls: { $sum: "$value" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])

        res.json(report)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
