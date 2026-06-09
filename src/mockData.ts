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
  { id: 2, guest_name: 'Nisay Roth', room_no: '102', checkin: '2026-06-12', checkout: '2026-06-20', status: 'Pending', deposit: 0 },
  { id: 3, guest_name: 'Sok Mean', room_no: '101', checkin: '2026-01-05', checkout: '2026-01-15', status: 'Confirmed', deposit: 30 },
  { id: 4, guest_name: 'Chhun Ly', room_no: '102', checkin: '2026-01-10', checkout: '2026-01-28', status: 'Confirmed', deposit: 100 },
  { id: 5, guest_name: 'Alice Smith', room_no: '301', checkin: '2026-01-20', checkout: '2026-01-25', status: 'Confirmed', deposit: 40 },
  { id: 6, guest_name: 'Bob Johnson', room_no: '201', checkin: '2026-02-01', checkout: '2026-02-12', status: 'Confirmed', deposit: 60 },
  { id: 7, guest_name: 'Charlie Brown', room_no: '202', checkin: '2026-02-15', checkout: '2026-02-25', status: 'Confirmed', deposit: 80 },
  { id: 8, guest_name: 'David Miller', room_no: '302', checkin: '2026-03-05', checkout: '2026-03-20', status: 'Confirmed', deposit: 120 },
  { id: 9, guest_name: 'Eve White', room_no: '401', checkin: '2026-03-10', checkout: '2026-03-15', status: 'Confirmed', deposit: 200 },
  { id: 10, guest_name: 'Frank Green', room_no: '101', checkin: '2026-03-20', checkout: '2026-03-30', status: 'Confirmed', deposit: 50 },
  { id: 11, guest_name: 'Grace Taylor', room_no: '102', checkin: '2026-04-02', checkout: '2026-04-15', status: 'Confirmed', deposit: 45 },
  { id: 12, guest_name: 'Henry Wilson', room_no: '202', checkin: '2026-04-10', checkout: '2026-04-25', status: 'Confirmed', deposit: 90 },
  { id: 13, guest_name: 'Ivy Thomas', room_no: '301', checkin: '2026-04-20', checkout: '2026-04-29', status: 'Confirmed', deposit: 75 },
  { id: 14, guest_name: 'Jack Jackson', room_no: '201', checkin: '2026-05-01', checkout: '2026-05-12', status: 'Confirmed', deposit: 50 },
  { id: 15, guest_name: 'Karen Harris', room_no: '302', checkin: '2026-05-10', checkout: '2026-05-28', status: 'Confirmed', deposit: 110 },
  { id: 16, guest_name: 'Leo Martin', room_no: '401', checkin: '2026-05-15', checkout: '2026-05-22', status: 'Confirmed', deposit: 250 },
  { id: 17, guest_name: 'Mia Garcia', room_no: '101', checkin: '2026-07-05', checkout: '2026-07-15', status: 'Confirmed', deposit: 35 },
  { id: 18, guest_name: 'Noah Martinez', room_no: '202', checkin: '2026-07-12', checkout: '2026-07-25', status: 'Confirmed', deposit: 85 },
  { id: 19, guest_name: 'Olivia Robinson', room_no: '302', checkin: '2026-08-01', checkout: '2026-08-15', status: 'Confirmed', deposit: 115 },
  { id: 20, guest_name: 'Peter Clark', room_no: '401', checkin: '2026-08-10', checkout: '2026-08-22', status: 'Confirmed', deposit: 220 },
  { id: 21, guest_name: 'Quincy Rodriguez', room_no: '101', checkin: '2026-09-15', checkout: '2026-09-25', status: 'Confirmed', deposit: 40 },
  { id: 22, guest_name: 'Ruby Lewis', room_no: '201', checkin: '2026-10-05', checkout: '2026-10-15', status: 'Confirmed', deposit: 70 },
  { id: 23, guest_name: 'Samuel Lee', room_no: '102', checkin: '2026-11-12', checkout: '2026-11-22', status: 'Confirmed', deposit: 50 },
  { id: 24, guest_name: 'Tina Walker', room_no: '302', checkin: '2026-12-20', checkout: '2026-12-29', status: 'Confirmed', deposit: 130 }
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
