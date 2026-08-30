# LegalMetrix AI: Database Schema Proposal

Below is the proposed PostgreSQL database schema using Supabase for the LegalMetrix AI application. This schema has been designed to support AI-assisted inspections, OCR bounding boxes, legal rules referencing, and Row Level Security.

---

## 1. `profiles`
Stores inspector details and extends the default Supabase `auth.users` table.

- **id**: `UUID`, PRIMARY KEY, FOREIGN KEY (`auth.users.id`) ON DELETE CASCADE
- **updated_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **full_name**: `TEXT`, NOT NULL
- **region**: `TEXT`, Nullable
- **role**: `TEXT`, Default: `'Inspector'`, Check: `role IN ('Inspector', 'Admin')`
- **RLS**:
  - `SELECT`: Users can view their own profile.
  - `UPDATE`: Users can update their own profile.

---

## 2. `products`
Repository of products that can be inspected multiple times.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **name**: `TEXT`, NOT NULL
- **brand**: `TEXT`, Nullable
- **category**: `TEXT`, Nullable (e.g., 'Packaged Food', 'Cosmetics')
- **image_url**: `TEXT`, Nullable
- **Indexes**: `idx_products_name`, `idx_products_brand`
- **Relationships**: A product can have many `inspections`.
- **RLS**:
  - `SELECT`: All authenticated users can view products.
  - `INSERT/UPDATE`: Authenticated users can insert or edit products.

---

## 3. `legal_rules`
Reference table for Legal Metrology acts and declarations (e.g., LMPC 2011).

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **act_name**: `TEXT`, NOT NULL (e.g., 'LMPC Rules 2011')
- **rule_reference**: `TEXT`, NOT NULL, UNIQUE (e.g., 'Rule 6(1)(f)')
- **requirement_description**: `TEXT`, NOT NULL
- **RLS**:
  - `SELECT`: All authenticated users can read rules.
  - `INSERT/UPDATE/DELETE`: Restricted to Admin users only.

---

## 4. `inspections`
The core entity tying an inspection session to a product and an inspector.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspector_id**: `UUID`, NOT NULL, FOREIGN KEY (`profiles.id`) ON DELETE CASCADE
- **product_id**: `UUID`, NOT NULL, FOREIGN KEY (`products.id`) ON DELETE RESTRICT
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **inspection_date**: `DATE`, NOT NULL, Default: `current_date`
- **location_zone**: `TEXT`, Nullable
- **batch_lot_number**: `TEXT`, Nullable
- **notes**: `TEXT`, Nullable
- **status**: `TEXT`, NOT NULL, Default: `'Needs Review'`, Enum/Check: `status IN ('Compliant', 'Non-Compliant', 'Needs Review')`
- **compliance_score**: `INTEGER`, Nullable, Check: `compliance_score BETWEEN 0 AND 100`
- **Indexes**: `idx_inspections_inspector`, `idx_inspections_product`
- **Relationships**:
  - Belongs to `profiles` (Inspector) and `products`.
  - Has many `evidence`, `compliance_results`, `violations`, `audit_events`.
  - Has one `reports`.
- **RLS**:
  - `SELECT / UPDATE / DELETE`: Users can only access where `auth.uid() = inspector_id`.
  - `INSERT`: Users can only insert with their own `inspector_id`.

---

## 5. `evidence`
Stores uploaded images for an inspection.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspection_id**: `UUID`, NOT NULL, FOREIGN KEY (`inspections.id`) ON DELETE CASCADE
- **image_url**: `TEXT`, NOT NULL
- **view_type**: `TEXT`, NOT NULL, Enum/Check: `view_type IN ('Front View', 'Back View', 'Side/Panel', 'Top/Bottom')`
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **Indexes**: `idx_evidence_inspection_id`
- **Relationships**: Belongs to `inspections`. Has many `violations` (image reference).
- **RLS**:
  - Inherits ownership via `inspection_id`. Users can read/write if they own the related `inspection`.

---

## 6. `compliance_results`
Records the AI extraction and pass/fail match for standard declarations.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspection_id**: `UUID`, NOT NULL, FOREIGN KEY (`inspections.id`) ON DELETE CASCADE
- **rule_id**: `UUID`, Nullable, FOREIGN KEY (`legal_rules.id`) ON DELETE SET NULL
- **field_name**: `TEXT`, NOT NULL (e.g., 'Net Quantity')
- **expected_value**: `TEXT`, NOT NULL
- **extracted_value**: `TEXT`, Nullable
- **status**: `TEXT`, NOT NULL, Enum/Check: `status IN ('PASS', 'FAIL')`
- **confidence_score**: `NUMERIC(5,2)`, Nullable, Check: `confidence_score BETWEEN 0 AND 100`
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **Indexes**: `idx_compliance_inspection_id`
- **Relationships**: Belongs to `inspections` and `legal_rules`.
- **RLS**:
  - Read/Write restricted to the owner of the parent `inspection`.

---

## 7. `violations`
Flags potential non-compliance issues identified by AI or manually.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspection_id**: `UUID`, NOT NULL, FOREIGN KEY (`inspections.id`) ON DELETE CASCADE
- **rule_id**: `UUID`, NOT NULL, FOREIGN KEY (`legal_rules.id`) ON DELETE RESTRICT
- **evidence_id**: `UUID`, Nullable, FOREIGN KEY (`evidence.id`) ON DELETE SET NULL
- **title**: `TEXT`, NOT NULL
- **severity**: `TEXT`, NOT NULL, Enum/Check: `severity IN ('Low', 'Medium', 'High')`
- **detection_type**: `TEXT`, NOT NULL, Enum/Check: `detection_type IN ('Auto-Flagged', 'Manual')`
- **ai_analysis**: `TEXT`, Nullable
- **ai_confidence**: `NUMERIC(5,2)`, Nullable, Check: `ai_confidence BETWEEN 0 AND 100`
- **expected_value**: `TEXT`, Nullable
- **detected_text**: `TEXT`, Nullable
- **inspector_notes**: `TEXT`, Nullable
- **verification_status**: `TEXT`, NOT NULL, Default: `'Pending'`, Enum/Check: `verification_status IN ('Pending', 'Confirmed Violation', 'False Positive')`
- **bounding_box**: `JSONB`, Nullable (e.g., `{"top": "45%", "left": "25%", "width": "40%", "height": "15%"}`)
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **Indexes**: `idx_violations_inspection_id`
- **Relationships**: Belongs to `inspections`, `legal_rules`, and optionally `evidence` where it was detected.
- **RLS**:
  - Read/Write restricted to the owner of the parent `inspection`.

---

## 8. `audit_events`
Tracks the progress and lifecycle of an inspection for the audit trail timeline.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspection_id**: `UUID`, NOT NULL, FOREIGN KEY (`inspections.id`) ON DELETE CASCADE
- **event_type**: `TEXT`, NOT NULL (e.g., 'Started', 'Evidence Uploaded', 'AI Scan Completed', 'Violation Flagged')
- **description**: `TEXT`, Nullable
- **created_at**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **Indexes**: `idx_audit_inspection_id`
- **Relationships**: Belongs to `inspections`.
- **RLS**:
  - Read/Write restricted to the owner of the parent `inspection`.

---

## 9. `reports`
Represents the finalized inspection report generated.

- **id**: `UUID`, PRIMARY KEY, Default: `uuid_generate_v4()`
- **inspection_id**: `UUID`, NOT NULL, UNIQUE, FOREIGN KEY (`inspections.id`) ON DELETE CASCADE
- **report_date**: `TIMESTAMP WITH TIME ZONE`, Default: `now()`
- **status**: `TEXT`, NOT NULL, Default: `'Pending Review'`, Enum/Check: `status IN ('Generated', 'Pending Review')`
- **pdf_url**: `TEXT`, Nullable
- **Relationships**: 1:1 relationship with `inspections`.
- **RLS**:
  - Read/Write restricted to the owner of the parent `inspection`.

---

## Row Level Security (RLS) Implementation Strategy

To secure the data using Supabase Auth, each table should have policies similar to this pattern:

```sql
-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Select Policy for Inspections
CREATE POLICY "Users can view their own inspections" ON inspections
  FOR SELECT USING (auth.uid() = inspector_id);

-- Select Policy for Violations (Inherited via JOIN)
CREATE POLICY "Users can view violations of their inspections" ON violations
  FOR SELECT USING (
    inspection_id IN (
      SELECT id FROM inspections WHERE inspector_id = auth.uid()
    )
  );
```
*Note: This RLS inheritance strategy via `IN (SELECT id...)` ensures evidence, compliance_results, violations, audit_events, and reports are exclusively locked to the user who created the root inspection.*
