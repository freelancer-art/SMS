import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, AlertTriangle, Trash2, ShieldCheck, Heart } from 'lucide-react';
import { FacilityBooking, Member } from '../types';

interface FacilityBookingManagerProps {
  societyId: string;
  loggedInMemberFlat: string;
  loggedInMemberName: string;
  members: Member[];
  onAddDues: (flatNo: string, amount: number, desc: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

const FACILITIES_DATA = [
  { Name: 'Clubhouse' as const, Icon: '🏡', Rate: 500, Unit: 'hour', Description: 'Air-conditioned lounge with indoor games, sound system, and comfortable seating.' },
  { Name: 'Swimming Pool' as const, Icon: '🏊', Rate: 100, Unit: 'hour', Description: 'Filtered semi-olympic swimming pool with changing rooms and lifeguards.' },
  { Name: 'Tennis Court' as const, Icon: '🎾', Rate: 150, Unit: 'hour', Description: 'Synthetic turf floodlit tennis court. Booking includes rackets & balls.' },
  { Name: 'Banquet Hall' as const, Icon: '🎉', Rate: 1500, Unit: 'event slot (4 hrs)', Description: 'Elegant spacious hall perfect for birthdays, anniversaries, and community meetups.' },
  { Name: 'Gym' as const, Icon: '🏋️', Rate: 50, Unit: 'hour', Description: 'Fully equipped health center with treadmills, weights, and premium trainer assistance.' }
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
  '08:00 PM - 10:00 PM'
];

export default function FacilityBookingManager({
  societyId,
  loggedInMemberFlat,
  loggedInMemberName,
  members,
  onAddDues,
  onAddAuditLog
}: FacilityBookingManagerProps) {
  const [selectedFacility, setSelectedFacility] = useState<typeof FACILITIES_DATA[0]>(FACILITIES_DATA[0]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing bookings from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`facility_bookings_${societyId}`);
    if (saved) {
      setBookings(JSON.parse(saved));
    } else {
      // Seed initial dummy booking for visual variety
      const seed: FacilityBooking[] = [
        {
          id: 'B-seed-1',
          SocietyId: societyId,
          FlatNo: '102',
          ResidentName: 'Rahul Verma',
          FacilityName: 'Clubhouse',
          Date: new Date().toISOString().split('T')[0],
          TimeSlot: '04:00 PM - 06:00 PM',
          Purpose: 'Family Reunion',
          Charges: 1000,
          Status: 'Confirmed',
          BookedAt: new Date().toISOString()
        }
      ];
      setBookings(seed);
      localStorage.setItem(`facility_bookings_${societyId}`, JSON.stringify(seed));
    }
  }, [societyId]);

  const saveBookings = (updated: FacilityBooking[]) => {
    setBookings(updated);
    localStorage.setItem(`facility_bookings_${societyId}`, JSON.stringify(updated));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!bookingDate) {
      setMessage({ type: 'error', text: 'Please select a valid date' });
      return;
    }

    // 1. Check for slot conflict
    const conflict = bookings.some(b => 
      b.SocietyId === societyId &&
      b.FacilityName === selectedFacility.Name &&
      b.Date === bookingDate &&
      b.TimeSlot === selectedSlot &&
      b.Status === 'Confirmed'
    );

    if (conflict) {
      setMessage({ type: 'error', text: 'This slot is already reserved. Please choose another slot or date!' });
      return;
    }

    // 2. Calculate charges
    const hours = selectedFacility.Unit === 'hour' ? 2 : 4; // banquet slot is 4 hours, others are 2-hour slots
    const totalCharges = selectedFacility.Rate * (selectedFacility.Unit === 'hour' ? 2 : 1);

    // 3. Create booking object
    const newBooking: FacilityBooking = {
      id: `BK-${Date.now()}`,
      SocietyId: societyId,
      FlatNo: loggedInMemberFlat,
      ResidentName: loggedInMemberName,
      FacilityName: selectedFacility.Name,
      Date: bookingDate,
      TimeSlot: selectedSlot,
      Purpose: bookingPurpose.trim() || 'General Use',
      Charges: totalCharges,
      Status: 'Confirmed',
      BookedAt: new Date().toISOString()
    };

    const nextBookings = [newBooking, ...bookings];
    saveBookings(nextBookings);

    // 4. Charge Ledger (Add outstanding dues to the Flat/Member)
    onAddDues(loggedInMemberFlat, totalCharges, `${selectedFacility.Name} Booking on ${bookingDate} (${selectedSlot})`);

    // 5. Audit Log action
    onAddAuditLog(
      'Facility Booking', 
      `Flat ${loggedInMemberFlat} booked ${selectedFacility.Name} on ${bookingDate} (${selectedSlot}) for ₹${totalCharges}`
    );

    setBookingPurpose('');
    setMessage({ 
      type: 'success', 
      text: `🎉 Booking confirmed! ₹${totalCharges} has been billed to your flat's maintenance ledger.` 
    });

    // Clear alert message after 6 seconds
    setTimeout(() => setMessage(null), 6000);
  };

  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    // We change status to cancelled
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, Status: 'Cancelled' as const };
      }
      return b;
    });
    saveBookings(updated);

    // Give partial or full credit back!
    const refundAmount = -bookingToCancel.Charges;
    onAddDues(
      bookingToCancel.FlatNo, 
      refundAmount, 
      `Refund: Cancelled ${bookingToCancel.FacilityName} Booking of ${bookingToCancel.Date}`
    );

    onAddAuditLog(
      'Cancel Booking', 
      `Flat ${bookingToCancel.FlatNo} cancelled ${bookingToCancel.FacilityName} booking of ${bookingToCancel.Date}. Refunded ₹${bookingToCancel.Charges}.`
    );

    setMessage({ 
      type: 'success', 
      text: `✕ Booking cancelled. ₹${bookingToCancel.Charges} has been refunded back to your flat dues ledger!` 
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const activeBookings = bookings.filter(b => b.SocietyId === societyId);
  const myBookings = activeBookings.filter(b => b.FlatNo === loggedInMemberFlat);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Rate Card Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-purple-200/40 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Shared Facility & Amenity Booking</h4>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
          Reserve communal amenities instantly. All booking rates are set by the Managing Committee. Fees are automatically posted to your monthly flat maintenance dues ledger.
        </p>
      </div>

      {/* Facility Slider Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        {FACILITIES_DATA.map((fac) => {
          const isActive = selectedFacility.Name === fac.Name;
          return (
            <button
              key={fac.Name}
              onClick={() => {
                setSelectedFacility(fac);
                setMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm font-black'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="text-xs">{fac.Icon}</span>
              <span>{fac.Name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Facility Details Card */}
      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-150 grid grid-cols-1 gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h5 className="font-black text-slate-800 text-xs">{selectedFacility.Icon} {selectedFacility.Name}</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">{selectedFacility.Description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-black text-purple-700 bg-purple-100/60 border border-purple-200/40 px-2 py-0.5 rounded-full block">
              ₹{selectedFacility.Rate} / {selectedFacility.Unit === 'hour' ? 'hr' : 'slot'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-xl border text-[10px] font-medium leading-normal animate-fadeIn flex items-start gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-3xs' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="flex-1">{message.text}</p>
        </div>
      )}

      {/* Booking Selector Form */}
      <form onSubmit={handleBookingSubmit} className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-3xs space-y-3">
        <h6 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Slot Reservation Form
        </h6>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-500 text-[9px] uppercase block">Select Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-slate-700 text-[10px]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 text-[9px] uppercase block">Time Slot (2-Hr Block)</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-slate-700 text-[10px]"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-500 text-[9px] uppercase block">Purpose of Booking</label>
          <input
            type="text"
            required
            placeholder="e.g. Birthday dinner, morning drills"
            value={bookingPurpose}
            onChange={(e) => setBookingPurpose(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-slate-700 text-[10px]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider text-[10px] cursor-pointer text-center"
        >
          Confirm Reservation • ₹{selectedFacility.Rate * (selectedFacility.Unit === 'hour' ? 2 : 1)} Billed to Ledger
        </button>
      </form>

      {/* Booking History Log */}
      <div className="space-y-2">
        <h6 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center justify-between">
          <span>📋 Your Saved Bookings ({myBookings.length})</span>
          <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Refundable Cancels</span>
        </h6>

        {myBookings.length === 0 ? (
          <div className="bg-slate-50 text-slate-400 p-4 rounded-xl border border-slate-100 text-center text-[10px]">
            No active reservations found for Flat {loggedInMemberFlat}.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {myBookings.map((bk) => {
              const facMeta = FACILITIES_DATA.find(f => f.Name === bk.FacilityName);
              const isConfirmed = bk.Status === 'Confirmed';
              const isCancelled = bk.Status === 'Cancelled';
              
              return (
                <div key={bk.id} className={`p-3 rounded-xl border ${isCancelled ? 'bg-slate-100/50 border-slate-200' : 'bg-white border-slate-150'} flex justify-between items-center transition-all shadow-3xs`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{facMeta?.Icon || '🏢'}</span>
                      <span className={`font-extrabold text-[10px] ${isCancelled ? 'line-through text-slate-400' : 'text-slate-800'}`}>{bk.FacilityName}</span>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider leading-none ${
                        isCancelled ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {bk.Status}
                      </span>
                    </div>
                    
                    <div className="text-[9px] text-slate-500 space-y-0.5 leading-none">
                      <p className="flex items-center gap-1">📅 {bk.Date} <span className="text-slate-300">•</span> 🕒 {bk.TimeSlot}</p>
                      <p className="italic text-slate-400 mt-0.5">"{bk.Purpose}"</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className={`font-mono font-bold text-[10px] ${isCancelled ? 'text-slate-400' : 'text-purple-700'}`}>
                      {isCancelled ? 'Refunded' : `₹${bk.Charges}`}
                    </span>
                    
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(bk.id)}
                        className="text-[8px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-1.5 py-1 rounded-md font-bold uppercase cursor-pointer flex items-center gap-0.5"
                        title="Cancel Booking and refund dues"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
