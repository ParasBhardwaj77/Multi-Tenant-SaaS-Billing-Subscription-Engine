import mongoose from "mongoose";

// Async Local Storage allows us to securely pass the tenantId down the async chain
// without modifying every single function signature.
import { AsyncLocalStorage } from "async_hooks";

export const tenantStorage = new AsyncLocalStorage();

/**
 * A Mongoose plugin that intercepts querying methods to automatically
 * append a `{ tenantId: currentTenantId }` filter, enforcing multi-tenant isolation.
 */
export function tenantScopePlugin(schema) {
  if (!schema.paths.tenantId) {
    return;
  }

  const queryOps = [
    "find", "findOne", "findOneAndUpdate", "update", "updateOne",
    "updateMany", "deleteOne", "deleteMany", "count",
    "countDocuments", "estimatedDocumentCount",
  ];

  queryOps.forEach((op) => {
    schema.pre(op, function () {
      const tenantId = tenantStorage.getStore();
      if (tenantId) {
        this.where({ tenantId });
      }
    });
  });

  schema.pre("aggregate", function () {
    const tenantId = tenantStorage.getStore();
    if (tenantId) {
      this.pipeline().unshift({ $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } });
    }
  });

  schema.pre("save", function () {
    const tenantId = tenantStorage.getStore();
    
    if (tenantId) {
      if (!this.tenantId) {
        this.tenantId = tenantId;
      } else if (this.tenantId.toString() !== tenantId.toString()) {
        throw new Error("Tenant isolation violation: Cannot save document to a different tenant.");
      }
    }
  });
}
