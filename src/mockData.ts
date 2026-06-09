import { Room, Guest, Reservation, UtilityBill, Transaction, Staff, CrmNote } from './types';

export const initialRooms: Room[] = [
  { id: 1, room_no: '101', type: 'Single Deluxe', floor: '1st', capacity: 2, daily_price: 25, monthly_price: 350, status: 'Available' },
  { id: 2, room_no: '102', type: 'Single Deluxe', floor: '1st', capacity: 2, daily_price: 25, monthly_price: 350, status: 'Occupied' },
  { id: 3, room_no: '201', type: 'Double VIP', floor: '2nd', capacity: 4, daily_price: 45, monthly_price: 550, status: 'Reserved' },
  { id: 4, room_no: '202', type: 'Double VIP', floor: '2nd', capacity: 4, daily_price: 45, monthly_price: 550, status: 'Available' },
  { id: 5, room_no: '301', type: 'Family Suite', floor: '3rd', capacity: 6, daily_price: 75, monthly_price: 900, status: 'Maintenance' },
  { id: 6, room_no: '302', type: 'Family Suite', floor: '3rd', capacity: 6, daily_price: 75, monthly_price: 900, status: 'Occupied' },
  { id: 7, room_no: '401', type: 'Penthouse President', floor: '4th', capacity: 8, daily_price: 150, monthly_price: 1800, status: 'Available' }
];

export const initialGuests: Guest[] = [
  { id: 1, name: 'Sok Mean', phone: '+855 12 345 678', id_passport: 'N0918237', email: 'sokmean@gmail.com', emergency: 'Chhun Ly (+855 99 111 222)', history: '3 stays, 0 incident reports' },
  { id: 2, name: 'John Doe', phone: '+1 415 888 9999', id_passport: 'A56123984', email: 'johndoe@gmail.com', emergency: 'Jane Doe (+1 415 888 1111)', history: 'First time guest' },
  { id: 3, name: 'Nisay Roth', phone: '+855 85 555 123', id_passport: 'N231456', email: 'nisay@outlook.com', emergency: 'Pheap Roth (+855 10 999 888)', history: '2 stays' }
];

export const initialReservations: Reservation[] = [
  { id: 1, guest_name: 'John Doe', room_no: '201', checkin: '2026-06-10', checkout: '2026-06-15', status: 'Confirmed', deposit: 50 },
  { id: 2, guest_name: 'Nisay Roth', room_no: '102', checkin: '2026-06-12', checkout: '2026-06-20', status: 'Pending', deposit: 0 }
];

export const initialUtilityBills: UtilityBill[] = [
  { id: 1, room_no: '102', elec_prev: 1250, elec_curr: 1390, water_prev: 450, water_curr: 472, internet: 10, parking: 5, total: 44.4 },
  { id: 2, room_no: '302', elec_prev: 3100, elec_curr: 3310, water_prev: 810, water_curr: 840, internet: 10, parking: 10, total: 69.0 }
];

export const initialTransactions: Transaction[] = [
  { id: 1, category: 'Room Rental 102', amount: 350, type: 'Income', date: '2026-06-01' },
  { id: 2, category: 'Room Rental 302', amount: 900, type: 'Income', date: '2026-06-03' },
  { id: 3, category: 'Electric Utility Bill (Room 102)', amount: 44.4, type: 'Income', date: '2026-06-05' },
  { id: 4, category: 'Staff Base Salary Payments', amount: 1200, type: 'Expense', date: '2026-06-05' },
  { id: 5, category: 'Plumbing Repair (Room 301)', amount: 150, type: 'Expense', date: '2026-06-07' }
];

export const initialStaff: Staff[] = [
  { id: 1, name: 'Mengly Seng', position: 'Manager', salary: 650, attendance: 'Present', payroll: 'Paid' },
  { id: 2, name: 'Srey Leak', position: 'Receptionist', salary: 350, attendance: 'Present', payroll: 'Paid' },
  { id: 3, name: 'Chan Chet', position: 'Accountant', salary: 450, attendance: 'Present', payroll: 'Paid' },
  { id: 4, name: 'Kosal Phum', position: 'Security & Maintenance', salary: 300, attendance: 'Present', payroll: 'Paid' }
];

export const initialCrmNotes: CrmNote[] = [
  { id: 1, name: 'John Doe', type: 'Note', message: 'Prefers extra towels and quiet rooms far from elevators.', status: 'Resolved' },
  { id: 2, name: 'Sok Mean', type: 'Complaint', message: 'Reported weak Wi-Fi signal in Room 102. Action taken: Reset AP on 1st Floor.', status: 'In Progress' }
];
