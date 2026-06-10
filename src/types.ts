export interface Room {
  id: number;
  room_no: string;
  type: string;
  floor: string;
  capacity: number;
  daily_price: number;
  monthly_price: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  energy_saver?: boolean;
  auto_ac?: boolean;
  ac_temp?: number;
  smart_lights?: boolean;
}

export interface Guest {
  id: number;
  name: string;
  phone: string;
  id_passport: string;
  email: string;
  emergency: string;
  history: string;
  tier?: 'Standard' | 'VIP' | 'Authorized';
  discount?: number;
  is_authorized?: boolean;
}

export interface Reservation {
  id: number;
  guest_name: string;
  room_no: string;
  checkin: string;
  checkout: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  deposit: number;
}

export interface UtilityBill {
  id: number;
  room_no: string;
  elec_prev: number;
  elec_curr: number;
  water_prev: number;
  water_curr: number;
  internet: number;
  parking: number;
  total: number;
  date?: string;
}

export interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: 'Income' | 'Expense';
  date: string;
}

export interface Staff {
  id: number;
  name: string;
  position: string;
  salary: number;
  attendance: 'Present' | 'Absent' | 'On Leave';
  payroll: 'Paid' | 'Pending';
}

export interface CrmNote {
  id: number;
  name: string;
  type: 'Note' | 'Complaint' | 'Request';
  message: string;
  date?: string;
  status?: 'Pending' | 'In Progress' | 'Resolved';
}

export interface SystemNotification {
  id: number;
  text: string;
  type: 'Info' | 'Warning' | 'Important' | 'Success';
  time: string;
}
