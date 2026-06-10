# Upload Audit Trail

The upload workflow records one audit event for each accepted upload.

## Audit Fields

- `Id`
- `UploadId`
- `JobId`
- `UploadedAt`
- `UploadedByUserId` when authenticated user context exists
- `SourceIpAddress` when available and allowed by the privacy boundary
- `CorrelationId`

## Privacy Rules

- Do not store raw statement text, balances, account numbers, or transaction descriptions.
- Do not persist file contents in the audit record.
- Optional metadata must be trimmed and bounded before storage.
- Validation failures are excluded from this audit trail by design because the event is emitted only after the upload is accepted into the workflow.
