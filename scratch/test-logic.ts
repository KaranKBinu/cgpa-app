import { groupSemesters } from '../src/lib/calculator';

const mockSemesters = [
  { id: '1', name: 'S1', subjects: [] },
  { id: '2', name: 'S2', subjects: [] },
  { id: '3', name: 'S3', subjects: [] },
];

const result = groupSemesters(mockSemesters);
console.log('Result length:', result.length);
console.log('Sample result:', JSON.stringify(result[0], null, 2));
