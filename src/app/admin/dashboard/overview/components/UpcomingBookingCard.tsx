import { CalendarClock } from "lucide-react";
interface UpcomingBookingProps {
  id: string;
  customerName: string;
  serviceType: string;
  date: string;
  time?: string;
  status: string;
}
const UpcomingBookingCard: React.FC<UpcomingBookingProps> = ({
  customerName,
  serviceType,
  date,
  time,
  status,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-[#0088B1]/10 rounded-lg">
        <CalendarClock className="w-4 h-4 text-[#0088B1]" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{customerName}</p>
        <p className="text-xs text-gray-500">{serviceType}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-medium text-gray-700">{date}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);
export default UpcomingBookingCard;
