-- MediFlow AI - Demo Data Seed Script
-- Run this after schema.sql to populate database with demo data

-- Insert demo patients
INSERT INTO patients (
    medical_record_number, first_name, last_name, date_of_birth, gender, blood_type,
    phone, email, emergency_contact_name, emergency_contact_phone, address,
    insurance_provider, insurance_policy_number, allergies, chronic_conditions,
    admission_date, status, room_number, department, assigned_nurse_id
) VALUES
    ('MRN001', 'John', 'Doe', '1965-03-15', 'Male', 'A+', '555-1001', 'john.doe@email.com',
     'Jane Doe', '555-1002', '123 Main St, City, State 12345', 'BlueCross', 'BC123456',
     ARRAY['Penicillin'], ARRAY['diabetic', 'hypertension'], 
     NOW() - INTERVAL '3 days', 'active', '101', 'ICU',
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai')),
    
    ('MRN002', 'Sarah', 'Smith', '1978-07-22', 'Female', 'O-', '555-2001', 'sarah.smith@email.com',
     'Mike Smith', '555-2002', '456 Oak Ave, City, State 12345', 'Aetna', 'AT789012',
     ARRAY['Sulfa drugs'], ARRAY['cardiac'], 
     NOW() - INTERVAL '1 day', 'active', '102', 'ICU',
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai')),
    
    ('MRN003', 'Robert', 'Johnson', '1952-11-08', 'Male', 'B+', '555-3001', 'robert.j@email.com',
     'Mary Johnson', '555-3002', '789 Pine St, City, State 12345', 'UnitedHealth', 'UH345678',
     NULL, ARRAY['pneumonia'], 
     NOW() - INTERVAL '5 hours', 'active', '201', 'ER',
     (SELECT id FROM nurses WHERE email = 'bob.nurse@mediflow.ai')),
    
    ('MRN004', 'Emily', 'Davis', '1990-05-30', 'Female', 'AB+', '555-4001', 'emily.d@email.com',
     'Tom Davis', '555-4002', '321 Elm St, City, State 12345', 'Cigna', 'CG901234',
     ARRAY['Latex'], ARRAY['diabetic'], 
     NOW() - INTERVAL '2 days', 'active', '103', 'ICU',
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai')),
    
    ('MRN005', 'Michael', 'Brown', '1945-09-12', 'Male', 'O+', '555-5001', 'michael.b@email.com',
     'Lisa Brown', '555-5002', '654 Maple Dr, City, State 12345', 'Medicare', 'MD567890',
     ARRAY['Aspirin'], ARRAY['hypertension', 'cardiac'], 
     NOW() - INTERVAL '1 week', 'active', '104', 'ICU',
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'));

-- Insert vital signs for patients
INSERT INTO vital_signs (
    patient_id, recorded_by, systolic_bp, diastolic_bp, heart_rate, 
    temperature, respiratory_rate, oxygen_saturation, blood_glucose,
    pain_level, is_critical, recorded_at
) VALUES
    -- John Doe vitals (MRN001)
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     145, 92, 78, 98.6, 16, 96, 140, 3, false, NOW() - INTERVAL '1 hour'),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     138, 88, 72, 98.4, 15, 97, 135, 2, false, NOW() - INTERVAL '5 hours'),
    
    -- Sarah Smith vitals (MRN002) - Critical
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN002'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     165, 105, 95, 99.2, 22, 92, NULL, 7, true, NOW() - INTERVAL '30 minutes'),
    
    -- Robert Johnson vitals (MRN003)
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN003'),
     (SELECT id FROM nurses WHERE email = 'bob.nurse@mediflow.ai'),
     120, 80, 72, 98.6, 14, 99, NULL, 1, false, NOW() - INTERVAL '2 hours'),
    
    -- Emily Davis vitals (MRN004)
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN004'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     130, 85, 68, 98.5, 15, 98, 120, 2, false, NOW() - INTERVAL '3 hours'),
    
    -- Michael Brown vitals (MRN005)
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN005'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     150, 95, 80, 98.7, 16, 95, NULL, 4, false, NOW() - INTERVAL '4 hours');

-- Insert medications
INSERT INTO medications (
    patient_id, prescribed_by, medication_name, dosage, frequency, route,
    start_date, reason, is_active
) VALUES
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     'Dr. Anderson', 'Metformin', '500mg', 'Twice daily', 'Oral',
     NOW() - INTERVAL '3 days', 'Type 2 Diabetes', true),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     'Dr. Anderson', 'Lisinopril', '10mg', 'Once daily', 'Oral',
     NOW() - INTERVAL '3 days', 'Hypertension', true),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN002'),
     'Dr. Martinez', 'Aspirin', '81mg', 'Once daily', 'Oral',
     NOW() - INTERVAL '1 day', 'Cardiac protection', true),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN003'),
     'Dr. Lee', 'Azithromycin', '500mg', 'Once daily', 'IV',
     NOW() - INTERVAL '5 hours', 'Pneumonia', true);

-- Insert medical notes
INSERT INTO medical_notes (
    patient_id, nurse_id, note_type, subject, content, is_critical
) VALUES
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     'assessment', 'Blood Sugar Management',
     'Patient reports feeling better. Blood glucose levels trending downward. Continue current medication regimen.',
     false),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN002'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     'progress', 'Cardiac Monitoring',
     'Blood pressure elevated. Heart rate increased. Notified physician. Close monitoring required.',
     true),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN003'),
     (SELECT id FROM nurses WHERE email = 'bob.nurse@mediflow.ai'),
     'assessment', 'Respiratory Status',
     'Patient breathing more comfortably. Oxygen saturation improving. Antibiotic treatment effective.',
     false);

-- Insert alerts
INSERT INTO alerts (
    patient_id, alert_type, severity, title, message, is_read
) VALUES
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN002'),
     'critical_vitals', 'critical', 'Critical Blood Pressure',
     'Patient Sarah Smith (Room 102) has critically elevated blood pressure: 165/105 mmHg. Immediate attention required.',
     false),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN001'),
     'medication_due', 'medium', 'Medication Due',
     'Patient John Doe (Room 101) - Metformin 500mg due in 30 minutes.',
     false),
    
    ((SELECT id FROM patients WHERE medical_record_number = 'MRN005'),
     'lab_result', 'high', 'Lab Results Available',
     'Patient Michael Brown (Room 104) - Cardiac enzyme results available for review.',
     false);

-- Insert a board meeting
INSERT INTO board_meetings (
    title, scheduled_time, duration_minutes, location, meeting_type, 
    status, agenda, created_by
) VALUES
    ('Daily ICU Rounds', NOW() + INTERVAL '2 hours', 60, 'ICU Conference Room', 
     'daily_rounds', 'scheduled', 
     'Review critical patients, discuss treatment plans, address concerns',
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'));

-- Insert meeting attendees
INSERT INTO meeting_attendees (
    meeting_id, nurse_id, attendance_status
) VALUES
    ((SELECT id FROM board_meetings WHERE title = 'Daily ICU Rounds'),
     (SELECT id FROM nurses WHERE email = 'alice.nurse@mediflow.ai'),
     'confirmed'),
    
    ((SELECT id FROM board_meetings WHERE title = 'Daily ICU Rounds'),
     (SELECT id FROM nurses WHERE email = 'bob.nurse@mediflow.ai'),
     'invited');

-- Insert meeting cases
INSERT INTO meeting_cases (
    meeting_id, patient_id, priority, discussion_notes
) VALUES
    ((SELECT id FROM board_meetings WHERE title = 'Daily ICU Rounds'),
     (SELECT id FROM patients WHERE medical_record_number = 'MRN002'),
     'critical', 'Critical vitals - elevated BP and HR. Needs immediate review.');

COMMIT;

-- Verification queries
SELECT 'Patients inserted:' AS info, COUNT(*) as count FROM patients;
SELECT 'Vital signs inserted:' AS info, COUNT(*) as count FROM vital_signs;
SELECT 'Medications inserted:' AS info, COUNT(*) as count FROM medications;
SELECT 'Medical notes inserted:' AS info, COUNT(*) as count FROM medical_notes;
SELECT 'Alerts inserted:' AS info, COUNT(*) as count FROM alerts;
SELECT 'Meetings inserted:' AS info, COUNT(*) as count FROM board_meetings;
