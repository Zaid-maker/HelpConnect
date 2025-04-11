✅ **UPDATE: All review suggestions have been implemented**
- The `getGeoLocation` function has been moved to `lib/utils/location.ts` and is now imported in both form components
- The database schema has been updated to include `updated_at` columns with proper triggers for both Messages and Feedback tables
- All type definitions are now properly aligned with the database schema

## Review suggestion for file: components/requests/RequestEditForm.tsx

🛠️ Refactor suggestion

**This geocoding function is duplicated.**

The `getGeoLocation` function is duplicated from `NewRequestForm.tsx`. To follow the DRY principle, consider extracting this to a shared utility file.

Move this function to a shared utility file (e.g., `lib/utils/location.ts`) and import it in both components:

```diff
-async function getGeoLocation(
-  address: string
-): Promise<{ lat: number; lon: number } | null> {
-  try {
-    const response = await fetch(
-      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
-        address
-      )}`
-    );
-    const data = await response.json();
-
-    if (data && data[0]) {
-      return {
-        lat: parseFloat(data[0].lat),
-        lon: parseFloat(data[0].lon),
-      };
-    }
-    return null;
-  } catch (error) {
-    console.error("Error getting coordinates:", error);
-    return null;
-  }
-}
```

And at the top of this file:

```diff
+import { getGeoLocation } from "@/lib/utils/location";
```

## Review suggestion for file: lib/types/index.ts

Changes requested on lines from 87 to 98

⚠️ Potential issue

**_Missing updated_at column in the Feedback table._**
The interface references `updated_at`, but the `feedback` table only has a `created_at` column. This will lead to issues if your code attempts to read or update `updated_at`.

If you need that field, add an `updated_at` column to the table and a trigger to keep it current. Otherwise, remove or adjust the interface to avoid mismatches.

## Review suggestion for file: supabase/schema.sql

Changes requested on lines from 80 to 88

```diff
+ -- Messages table
+ CREATE TABLE IF NOT EXISTS messages (
+     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
+     sender_id UUID REFERENCES profiles(id) NOT NULL,
+     receiver_id UUID REFERENCES profiles(id) NOT NULL,
+     content TEXT NOT NULL,
+     read BOOLEAN DEFAULT FALSE,
+     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
+ );
```

⚠️ Potential issue

Messages table lacks updated_at.
The interface Message in lib/types references updated_at, but here there is no such column. This mismatch may cause errors if the code attempts to read or write to a non-existent column.

Consider adding:

```sql
ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

along with an update trigger, or remove the updated_at field from the interface if not needed.

## Review suggestions for file: supabase/schema.sql

Changes requested on lines from 121 to 131

```diff
+ -- Feedback table
+ CREATE TABLE IF NOT EXISTS feedback (
+     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
+     request_id UUID REFERENCES help_requests(id) NOT NULL,
+     rater_id UUID REFERENCES profiles(id) NOT NULL,
+     rated_id UUID REFERENCES profiles(id) NOT NULL,
+     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
+     comment TEXT,
+     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
+     UNIQUE(request_id, rater_id, rated_id)
+ );
```

⚠️ Potential issue

Feedback table missing updated_at column.
Your interface references updated_at, which doesn’t exist here. Add that column if needed and ensure it is maintained via triggers, or remove the field from the interface.
