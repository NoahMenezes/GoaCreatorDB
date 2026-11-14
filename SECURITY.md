# Security Policy

## Supported Versions

The current version of GoaConnect is actively maintained. Security patches are applied to the latest release.

## Reporting a Vulnerability

Please report security vulnerabilities privately. Do not create public issues for security concerns.

## Security Implementation

### Authentication
- Passwords are hashed with bcrypt (12 salt rounds)
- Session tokens stored in `goa_session` cookie (httpOnly, secure in production, SameSite=lax)
- Sessions expire after 7 days
- Protected routes enforce server-side authorization via `/api/auth/me`

### Authorization
- Role-based access control: `admin`, `business`, `creator`
- Server-side ownership checks on all data access operations
- Business users cannot access creator-only endpoints and vice versa
- Collaboration requests can only be accepted/declined by the target creator
- Reviews can only be submitted by the collaboration creator for completed collaborations

### Data Protection
- All database queries use parameterized statements (SQL injection prevention)
- No secrets or credentials stored in client-side bundles
- Error messages are generic to prevent information leakage
- Audit logs record sensitive operations (password resets, account changes)

### Session Management
- Session tokens are cryptographically random UUIDs
- Sessions are invalidated on logout
- Expired sessions are automatically rejected
- Remember Me functionality uses the same secure session cookie

### Social Media Integration
- OAuth flows are used where credentials are configured
- Social media passwords are never requested or stored
- Metrics without API credentials are labelled as "creator_submitted" (not verified)
- No private account data is scraped or stored without consent

## Security Checklist for Production

- [ ] Set `AUTH_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Ensure cookies are `secure` in production (automatic when `NODE_ENV=production`)
- [ ] Run `bun run build` and verify no TypeScript errors
- [ ] Run `bun run lint` and address any new warnings
- [ ] Run `bun run test` to verify all tests pass
- [ ] Configure OAuth credentials for verified social media sync (optional)
- [ ] Configure SMTP for password reset emails (optional)

## Dependencies

All dependencies are managed via Bun. Run `bun install` to install locked versions.
