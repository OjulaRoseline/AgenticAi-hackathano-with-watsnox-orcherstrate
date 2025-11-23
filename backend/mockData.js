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
    },
    {
        id: 'p4',
        medical_record_number: 'MRN004',
        first_name: 'Emily',
        last_name: 'Davis',
        date_of_birth: '1990-05-12',
        gender: 'Female',
        blood_type: 'AB+',
        phone: '555-3001',
        allergies: ['Latex'],
        chronic_conditions: ['diabetic', 'asthma'],
        status: 'active',
        room_number: '103',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p5',
        medical_record_number: 'MRN005',
        first_name: 'Michael',
        last_name: 'Brown',
        date_of_birth: '1945-09-30',
        gender: 'Male',
        blood_type: 'O+',
        phone: '555-4001',
        chronic_conditions: ['cardiac', 'hypertension'],
        status: 'active',
        room_number: '104',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p6',
        medical_record_number: 'MRN006',
        first_name: 'Lisa',
        last_name: 'Martinez',
        date_of_birth: '1982-12-18',
        gender: 'Female',
        blood_type: 'A-',
        phone: '555-5001',
        allergies: ['Iodine'],
        chronic_conditions: ['kidney disease'],
        status: 'active',
        room_number: '202',
        department: 'ER',
        assigned_nurse_id: '2'
    },
    {
        id: 'p7',
        medical_record_number: 'MRN007',
        first_name: 'David',
        last_name: 'Wilson',
        date_of_birth: '1970-04-25',
        gender: 'Male',
        blood_type: 'B-',
        phone: '555-6001',
        chronic_conditions: ['diabetic'],
        status: 'active',
        room_number: '105',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p8',
        medical_record_number: 'MRN008',
        first_name: 'Jennifer',
        last_name: 'Taylor',
        date_of_birth: '1988-08-14',
        gender: 'Female',
        blood_type: 'AB-',
        phone: '555-7001',
        allergies: ['Aspirin'],
        chronic_conditions: ['asthma'],
        status: 'active',
        room_number: '203',
        department: 'ER',
        assigned_nurse_id: '2'
    },
    {
        id: 'p9',
        medical_record_number: 'MRN009',
        first_name: 'Christopher',
        last_name: 'Anderson',
        date_of_birth: '1955-02-07',
        gender: 'Male',
        blood_type: 'A+',
        phone: '555-8001',
        chronic_conditions: ['cardiac', 'diabetic'],
        status: 'active',
        room_number: '106',
        department: 'ICU',
        assigned_nurse_id: '1'
    },
    {
        id: 'p10',
        medical_record_number: 'MRN010',
        first_name: 'Amanda',
        last_name: 'Thomas',
        date_of_birth: '1995-06-20',
        gender: 'Female',
        blood_type: 'O+',
        phone: '555-9001',
        allergies: ['Peanuts'],
        chronic_conditions: ['hypertension'],
        status: 'active',
        room_number: '204',
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
    // Critical Alerts (2)
    {
        id: 'a1',
        patient_id: 'p2',
        alert_type: 'critical_vitals',
        severity: 'critical',
        title: 'Critical Blood Pressure',
        message: 'Patient Sarah Smith (Room 102) has critically elevated blood pressure: 165/105 mmHg. Immediate attention required.',
        is_read: false,
        created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: 'a2',
        patient_id: 'p9',
        alert_type: 'critical_vitals',
        severity: 'critical',
        title: 'Cardiac Arrhythmia Detected',
        message: 'Patient Christopher Anderson (Room 106) showing irregular heart rhythm. Cardiology consult recommended.',
        is_read: false,
        created_at: new Date(Date.now() - 600000).toISOString()
    },

    // High Severity Alerts (3)
    {
        id: 'a3',
        patient_id: 'p5',
        alert_type: 'vital_signs',
        severity: 'high',
        title: 'Elevated Heart Rate',
        message: 'Patient Michael Brown (Room 104) heart rate at 110 bpm. Monitor closely.',
        is_read: false,
        created_at: new Date(Date.now() - 2400000).toISOString()
    },
    {
        id: 'a4',
        patient_id: 'p4',
        alert_type: 'respiratory',
        severity: 'high',
        title: 'Low Oxygen Saturation',
        message: 'Patient Emily Davis (Room 103) O2 saturation at 90%. Oxygen therapy may be needed.',
        is_read: false,
        created_at: new Date(Date.now() - 1200000).toISOString()
    },
    {
        id: 'a5',
        patient_id: 'p6',
        alert_type: 'lab_result',
        severity: 'high',
        title: 'Abnormal Lab Results',
        message: 'Patient Lisa Martinez (Room 202) creatinine levels elevated. Kidney function assessment needed.',
        is_read: false,
        created_at: new Date(Date.now() - 3000000).toISOString()
    },

    // Medium Severity Alerts (3)
    {
        id: 'a6',
        patient_id: 'p1',
        alert_type: 'medication_due',
        severity: 'medium',
        title: 'Medication Due',
        message: 'Patient John Doe (Room 101) - Metformin 500mg due in 30 minutes.',
        is_read: false,
        created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
        id: 'a7',
        patient_id: 'p7',
        alert_type: 'blood_glucose',
        severity: 'medium',
        title: 'Elevated Blood Glucose',
        message: 'Patient David Wilson (Room 105) blood glucose at 180 mg/dL. Insulin adjustment may be needed.',
        is_read: false,
        created_at: new Date(Date.now() - 1500000).toISOString()
    },
    {
        id: 'a8',
        patient_id: 'p3',
        alert_type: 'temperature',
        severity: 'medium',
        title: 'Mild Fever',
        message: 'Patient Robert Johnson (Room 201) temperature at 100.4°F. Continue monitoring.',
        is_read: false,
        created_at: new Date(Date.now() - 2100000).toISOString()
    },

    // Low Severity Alerts (2)
    {
        id: 'a9',
        patient_id: 'p8',
        alert_type: 'routine_checkup',
        severity: 'low',
        title: 'Routine Vital Signs Due',
        message: 'Patient Jennifer Taylor (Room 203) scheduled for routine vital signs check.',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'a10',
        patient_id: 'p10',
        alert_type: 'medication_reminder',
        severity: 'low',
        title: 'Medication Refill Needed',
        message: 'Patient Amanda Thomas (Room 204) blood pressure medication refill due in 3 days.',
        is_read: false,
        created_at: new Date(Date.now() - 4200000).toISOString()
    }
];

module.exports = {
    mockNurses,
    mockPatients,
    mockVitals,
    mockAlerts
};
