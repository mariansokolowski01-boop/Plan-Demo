export interface OrderData {
  id: string; // Nr zlecenia
  company: string;
  description: string;
  weightT: number;
  status: string;
  totalRbh: number;
  deadlineStr: string;
  daysLeft: number | null;
  isPortal: boolean;
  isHala100: boolean;
  isStalTech: boolean;
  isErrorWeight: boolean;
}

