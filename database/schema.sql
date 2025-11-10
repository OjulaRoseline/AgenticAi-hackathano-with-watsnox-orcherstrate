-- MediFlow AI - Production Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE nurses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'nurse', -- nurse, admin, doctor
    department VARCHAR(100),
    phone VARCHAR(20),
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PATIENTS
-- =====================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_type VARCHAR(5),
    phone VARCHAR(20),
    email VARCHAR(255),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    allergies TEXT[],
    chronic_conditions TEXT[],
    admission_date TIMESTAMP,
    discharge_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- active, discharged, transferred
    room_number VARCHAR(20),
    department VARCHAR(100),
    assigned_nurse_id UUID REFERENCES nurses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VITAL SIGNS
-- =====================================================

CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES nurses(id),
    systolic_bp INTEGER, -- mmHg
    diastolic_bp INTEGER, -- mmHg
    heart_rate INTEGER, -- bpm
    temperature DECIMAL(4,1), -- Fahrenheit
    respiratory_rate INTEGER, -- breaths per minute
    oxygen_saturation INTEGER, -- percentage
    blood_glucose INTEGER, -- mg/dL
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
    weight_kg DECIMAL(5,2),
    notes TEXT,
    is_critical BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEDICATIONS
-- =====================================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by VARCHAR(200),
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(50), -- oral, IV, topical, etc.
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    reason TEXT,
    side_effects TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEDICATION ADMINISTRATION
-- =====================================================

CREATE TABLE medication_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    administered_by UUID NOT NULL REFERENCES nurses(id),
    scheduled_time TIMESTAMP NOT NULL,
    administered_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, administered, missed, refused
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEDICAL NOTES
-- =====================================================

CREATE TABLE medical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES nurses(id),
    note_type VARCHAR(50) NOT NULL, -- assessment, progress, incident, handoff
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_critical BOOLEAN DEFAULT false,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BOARD MEETINGS
-- =====================================================

CREATE TABLE board_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(200),
    meeting_type VARCHAR(50), -- daily_rounds, case_review, emergency
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    agenda TEXT,
    minutes TEXT,
    created_by UUID REFERENCES nurses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEETING ATTENDEES
-- =====================================================

CREATE TABLE meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES nurses(id),
    attendance_status VARCHAR(50) DEFAULT 'invited', -- invited, confirmed, attended, absent
    notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, nurse_id)
);

-- =====================================================
-- MEETING CASES (Patients discussed in meeting)
-- =====================================================

CREATE TABLE meeting_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES board_meetings(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    priority VARCHAR(20) DEFAULT 'normal', -- critical, high, normal, low
    discussion_notes TEXT,
    action_items TEXT,
    decision TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ALERTS & NOTIFICATIONS
-- =====================================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- critical_vitals, medication_due, lab_result, emergency
    severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES nurses(id),
    acknowledged_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ALERT RECIPIENTS
-- =====================================================

CREATE TABLE alert_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    nurse_id UUID NOT NULL REFERENCES nurses(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alert_id, nurse_id)
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES nurses(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AGENT INTERACTIONS
-- =====================================================

CREATE TABLE agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nurse_id UUID REFERENCES nurses(id),
    agent_type VARCHAR(100) NOT NULL, -- patient_retrieval, meeting_coordinator, shift_handoff, emergency_prioritizer
    query TEXT NOT NULL,
    response TEXT,
    intent VARCHAR(100),
    confidence_score DECIMAL(3,2),
    execution_time_ms INTEGER,
    was_successful BOOLEAN,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CACHE METRICS (for monitoring Redis performance)
-- =====================================================

CREATE TABLE cache_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) NOT NULL,
    cache_hit BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    data_size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Patients
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_department ON patients(department);
CREATE INDEX idx_patients_assigned_nurse ON patients(assigned_nurse_id);
CREATE INDEX idx_patients_mrn ON patients(medical_record_number);

-- Vital Signs
CREATE INDEX idx_vitals_patient ON vital_signs(patient_id);
CREATE INDEX idx_vitals_recorded_at ON vital_signs(recorded_at DESC);
CREATE INDEX idx_vitals_critical ON vital_signs(is_critical) WHERE is_critical = true;

-- Medications
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(is_active) WHERE is_active = true;

-- Medical Notes
CREATE INDEX idx_notes_patient ON medical_notes(patient_id);
CREATE INDEX idx_notes_nurse ON medical_notes(nurse_id);
CREATE INDEX idx_notes_created ON medical_notes(created_at DESC);

-- Meetings
CREATE INDEX idx_meetings_scheduled ON board_meetings(scheduled_time);
CREATE INDEX idx_meetings_status ON board_meetings(status);

-- Alerts
CREATE INDEX idx_alerts_patient ON alerts(patient_id);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Agent Interactions
CREATE INDEX idx_agent_nurse ON agent_interactions(nurse_id);
CREATE INDEX idx_agent_type ON agent_interactions(agent_type);
CREATE INDEX idx_agent_created ON agent_interactions(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nurses_updated_at BEFORE UPDATE ON nurses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_notes_updated_at BEFORE UPDATE ON medical_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_meetings_updated_at BEFORE UPDATE ON board_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR DEMO
-- =====================================================

-- Insert demo nurses (password is 'demo123' hashed with bcrypt)
INSERT INTO nurses (email, password_hash, first_name, last_name, role, department, phone, license_number) VALUES
('alice.nurse@mediflow.ai', '$2a$10$XQKZvZqPX4xW5bqF4Y6rLOmVqZ3YXHdV3lQzHXvU0Kh3XRmzLQwbG', 'Alice', 'Johnson', 'nurse', 'ICU', '555-0101', 'RN-12345'),
('bob.nurse@mediflow.ai', '$2a$10$XQKZvZqPX4xW5bqF4Y6rLOmVqZ3YXHdV3lQzHXvU0Kh3XRmzLQwbG', 'Bob', 'Smith', 'nurse', 'ER', '555-0102', 'RN-12346'),
('admin@mediflow.ai', '$2a$10$XQKZvZqPX4xW5bqF4Y6rLOmVqZ3YXHdV3lQzHXvU0Kh3XRmzLQwbG', 'Admin', 'User', 'admin', 'Administration', '555-0100', 'ADMIN-001');

-- Note: More sample data will be added via seed script
