-- SafeLink database schema
-- Run with: psql $DATABASE_URL -f src/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(30),
    role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== PHONES ==========
-- status: active (registered, in owner's possession)
--         lost | stolen (reported missing)
--         recovered (found / returned to owner)
CREATE TABLE IF NOT EXISTS phones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    imei            VARCHAR(17) UNIQUE NOT NULL,
    brand           VARCHAR(80) NOT NULL,
    model           VARCHAR(120) NOT NULL,
    color           VARCHAR(60),
    purchase_date   DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'lost', 'stolen', 'recovered')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phones_imei ON phones (imei);
CREATE INDEX IF NOT EXISTS idx_phones_owner ON phones (owner_id);
CREATE INDEX IF NOT EXISTS idx_phones_status ON phones (status);

-- ========== REPORTS ==========
-- One phone can have multiple reports over its lifetime (lost, then found, stolen again, etc).
CREATE TABLE IF NOT EXISTS reports (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_id                UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
    reporter_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                    VARCHAR(20) NOT NULL CHECK (type IN ('lost', 'stolen')),
    description             TEXT,
    last_known_location     VARCHAR(255),
    police_report_number    VARCHAR(80),
    status                  VARCHAR(20) NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'resolved', 'disputed')),
    admin_notes             TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_phone ON reports (phone_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- ========== IMEI LOOKUP LOG ==========
-- Powers the future analytics dashboard; tracks anonymous public verification checks.
CREATE TABLE IF NOT EXISTS imei_lookups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imei            VARCHAR(17) NOT NULL,
    result_status   VARCHAR(20) NOT NULL, -- 'clear' | 'lost' | 'stolen' | 'not_found'
    ip_address      VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lookups_imei ON imei_lookups (imei);
CREATE INDEX IF NOT EXISTS idx_lookups_created ON imei_lookups (created_at);

-- ========== updated_at trigger ==========
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_phones_updated ON phones;
CREATE TRIGGER trg_phones_updated BEFORE UPDATE ON phones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
