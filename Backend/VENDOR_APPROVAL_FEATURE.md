## Vendor Approval with approved_at and days_count

### What Was Implemented:

1. **Database Schema** (`prisma/schema.prisma`):
   - Added `approved_at` field (DateTime, IST timezone)
   - Added `days_count` field (Integer, calculated from created_at to approval time)

2. **Backend Logic** (`src/admin/admin.service.ts`):
   - When admin approves a vendor, the system:
     - Calculates days since vendor creation
     - Stores current time in IST (UTC + 5:30)
     - Updates both `approved_at` and `days_count` fields
     - Logs the operation for debugging

3. **Verification**:
   - Simulation script successfully updated vendor ID 2
   - Code is compiled and ready in `dist/` folder

### How to Use:

**When you click "Approve" for a vendor:**
- Status changes from "pending" → "APPROVED"
- `approved_at` is set to current IST time
- `days_count` is calculated and stored

### Important Notes:

⚠️ **Your server MUST be restarted** after the code changes for them to take effect.

If using `npm run start:dev`:
1. Stop the server (Ctrl+C)
2. Run `npm run start:dev` again

If deployed to production:
1. Rebuild: `npm run build`
2. Restart your production server

### Logs to Check:

When you approve a vendor, you should see in your server logs:
```
Approving vendor X. CreatedAt: ..., Now: ..., Days: Y, ApprovedAtIST: ...
Vendor X updated. DB Result - ApprovedAt: ..., Days: Y
```

If you don't see these logs, your server is not running the updated code.

### Database Columns:

Check your `vendors` table - you should see:
- `approved_at` (timestamp) - IST time when approved
- `days_count` (integer) - number of days from creation to approval
