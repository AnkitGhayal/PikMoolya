# Security Architecture

## Authentication
- JWT access/refresh tokens
- OTP verification
- secure password hashing where passwords are used
- token expiry and rotation

## Authorization
- RBAC
- ownership checks for farmer/buyer resources
- admin routes protected separately
- logistics routes limited to assigned shipments

## API protection
- request validation
- rate limiting
- pagination limits
- structured error responses
- secure CORS configuration
- audit logging for sensitive actions

## Upload security
- allowlist image/video MIME types
- size limits
- generated storage keys
- never trust user-supplied file paths
- malware scanning where supported
- private objects by default; use signed URLs where needed

## Secrets
Never place API keys, database passwords or service credentials in frontend code.
Use environment variables / secret manager.

## Payments
- server-side payment verification
- idempotency keys
- webhook signature verification
- never trust client payment status

## AI safety
- never guarantee future price/profit
- never fabricate market data
- never label a user a scammer automatically
- preserve evidence for disputes
- label synthetic data
- label cached predictions as cached/offline
