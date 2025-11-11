// Mock data for hackathon demo - no database required!

const mockNurses = [
    {
        id: '1',
        email: 'alice.nurse@mediflow.ai',
        password_hash: '$2a$10$AsN7gxTfgmuzfPVx7Ea32uo3ORWwdjRo0uKmZyTrTcSRV.qANTCWq', // demo123
        first_name: 'Alice',
        last_name: 'Johnson',
        role: 'nurse',
        department: 'ICU',
        is_active: true
    },
    {
        id: '2',
        email: 'bob.nurse@mediflow.ai',
        password_hash: '$2a$10$AsN7gxTfgmuzfPVx7Ea32uo3ORWwdjRo0uKmZyTrTcSRV.qANTCWq', // demo123
        first_name: 'Bob',
        last_name: 'Smith',
        role: 'nurse',
        department: 'ER',
        is_active: true
    },
    {
        id: '3',
        email: 'admin@mediflow.ai',
        password_hash: '$2a$10$AsN7gxTfgmuzfPVx7Ea32uo3ORWwdjRo0uKmZyTrTcSRV.qANTCWq', // demo123
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        department: 'Administration',
        is_active: true
    }
];

const mockPatients = [
    {
        id: 'p1',
        medical_record_number: 'MRN001',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1965-03-15',
        gender: 'Male',
        blood_type: 'A+',
        phone: '555-1001',
        email: 'john.doe@email.com',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '555-1002',
        allergies: ['Penicillin'],
        chronic_conditions: ['diabetic', 'hypertension'],
        status: 'active',
        room_number: '101',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p2',
        medical_record_number: 'MRN002',
        first_name: 'Sarah',
        last_name: 'Smith',
        date_of_birth: '1978-07-22',
        gender: 'Female',
        blood_type: 'O-',
        phone: '555-2001',
        allergies: ['Sulfa drugs'],
        chronic_conditions: ['cardiac'],
        status: 'active',
        room_number: '102',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p3',
        medical_record_number: 'MRN003',
        first_name: 'Robert',
        last_name: 'Johnson',
        date_of_birth: '1952-11-08',
        gender: 'Male',
        blood_type: 'B+',
        chronic_conditions: ['pneumonia'],
        status: 'active',
        room_number: '201',
        department: 'ER',
        assigned_nurse_id: '2'
    }
];

const mockVitals = [
    {
        id: 'v1',
        patient_id: 'p1',
        systolic_bp: 145,
        diastolic_bp: 92,
        heart_rate: 78,
        temperature: 98.6,
        respiratory_rate: 16,
        oxygen_saturation: 96,
        blood_glucose: 140,
        pain_level: 3,
        is_critical: false,
        recorded_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'v2',
        patient_id: 'p2',
        systolic_bp: 165,
        diastolic_bp: 105,
        heart_rate: 95,
        temperature: 99.2,
        respiratory_rate: 22,
        oxygen_saturation: 92,
        pain_level: 7,
        is_critical: true,
        recorded_at: new Date(Date.now() - 1800000).toISOString()
    }
];

const mockAlerts = [
    {
        id: 'a1',
        patient_id: 'p2',
        alert_type: 'critical_vitals',
        severity: 'critical',
        title: 'Critical Blood Pressure',
        message: 'Patient Sarah Smith (Room 102) has critically elevated blood pressure: 165/105 mmHg.',
        is_read: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'a2',
        patient_id: 'p1',
        alert_type: 'medication_due',
        severity: 'medium',
        title: 'Medication Due',
        message: 'Patient John Doe (Room 101) - Metformin 500mg due in 30 minutes.',
        is_read: false,
        created_at: new Date(Date.now() - 900000).toISOString()
    }
];

module.exports = {
    mockNurses,
    mockPatients,
    mockVitals,
    mockAlerts
};
