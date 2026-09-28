// Campus Complaint Categories and Dynamic Field Configuration

export const CATEGORIES_CONFIG = [
  {
    id: 'hostel',
    label: 'Hostel',
    department: 'Hostel',
    iconName: 'Home',
    description: 'Issues related to rooms, water, electricity, or cleanliness in hostels.',
    fields: [
      { name: 'block', label: 'Hostel Block', type: 'text', placeholder: 'e.g. Block A, Boys Hostel 2', required: true },
      { name: 'roomNumber', label: 'Room Number', type: 'text', placeholder: 'e.g. 302', required: true },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Water', 'Electricity', 'Cleanliness', 'Roommate', 'Other']
      }
    ]
  },
  {
    id: 'mess',
    label: 'Mess / Canteen',
    department: 'Mess',
    iconName: 'Utensils',
    description: 'Food quality, hygiene, timings, or canteen pricing issues.',
    fields: [
      {
        name: 'meal',
        label: 'Meal Type',
        type: 'select',
        required: true,
        options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
      },
      { name: 'date', label: 'Date of Incident', type: 'date', required: true },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Food quality', 'Hygiene', 'Timing', 'Overcharging', 'Other']
      }
    ]
  },
  {
    id: 'academics',
    label: 'Academics',
    department: 'Academics',
    iconName: 'GraduationCap',
    description: 'Attendance, marks, faculty behavior, or timetable conflicts.',
    fields: [
      { name: 'courseSubject', label: 'Course / Subject Code', type: 'text', placeholder: 'e.g. CS101 - Data Structures', required: true },
      { name: 'facultyName', label: 'Faculty Name (Optional)', type: 'text', placeholder: 'e.g. Dr. Sharma', required: false },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Attendance', 'Marks', 'Timetable', 'Faculty behavior', 'Other']
      }
    ]
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    department: 'Infrastructure',
    iconName: 'Building',
    description: 'Damaged benches, projectors, fans, washrooms, or lab equipment.',
    fields: [
      { name: 'building', label: 'Building / Block', type: 'text', placeholder: 'e.g. Science Block, Main Academic Building', required: true },
      { name: 'roomLabNumber', label: 'Room / Lab Number', type: 'text', placeholder: 'e.g. Lab 4, Seminar Hall 2', required: true },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Bench', 'Projector', 'Fan / AC', 'Washroom', 'Other']
      }
    ]
  },
  {
    id: 'it',
    label: 'IT / WiFi',
    department: 'IT',
    iconName: 'Wifi',
    description: 'Campus WiFi network connectivity, portal login, or lab computers.',
    fields: [
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['WiFi Connectivity', 'Lab Computer', 'Student Portal Login', 'Other']
      },
      { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Central Library 2nd Floor, Hostel B', required: true }
    ]
  },
  {
    id: 'library',
    label: 'Library',
    department: 'Library',
    iconName: 'BookOpen',
    description: 'Book availability, reading room noise, or library operating hours.',
    fields: [
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Book unavailable', 'Noise level', 'Timings', 'Digital Resources', 'Other']
      },
      { name: 'bookOrSection', label: 'Book Name / Section (Optional)', type: 'text', placeholder: 'e.g. Reference Section, Algorithms Book', required: false }
    ]
  },
  {
    id: 'transport',
    label: 'Transport',
    department: 'Transport',
    iconName: 'Bus',
    description: 'Campus bus route timings, delays, or driver behavior.',
    fields: [
      { name: 'busRouteNumber', label: 'Bus / Route Number', type: 'text', placeholder: 'e.g. Route 12 - City Center', required: true },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Delay', 'Route Modification', 'Overcrowding', 'Driver Behavior', 'Other']
      }
    ]
  },
  {
    id: 'safety',
    label: 'Safety / Harassment',
    department: 'Safety',
    iconName: 'ShieldAlert',
    description: 'Security issues, harassment, bullying, or safety concerns.',
    allowAnonymous: true,
    fields: [
      { name: 'location', label: 'Location of Incident', type: 'text', placeholder: 'e.g. Near Sports Ground, Parking Area', required: true },
      {
        name: 'issueType',
        label: 'Issue Type',
        type: 'select',
        required: true,
        options: ['Harassment / Bullying', 'Security Concern', 'Lighting / Dark Area', 'Unauthorized Personnel', 'Other']
      }
    ]
  },
  {
    id: 'other',
    label: 'Other',
    department: 'General',
    iconName: 'HelpCircle',
    description: 'Any general campus issue not listed above.',
    fields: []
  }
];

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

export const DEPARTMENT_OPTIONS = [
  'Hostel',
  'Mess',
  'Academics',
  'Infrastructure',
  'IT',
  'Library',
  'Transport',
  'Safety'
];
