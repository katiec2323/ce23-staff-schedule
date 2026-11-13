import { useState, useMemo } from 'react';

// ==========================================
// 1. CUSTOMIZE YOUR GYM SETTINGS & PINS HERE
// ==========================================
const FORMSPREE_URL = 'https://formspree.io/f/xaeoydkk'; // Replace with your Formspree ID

const STAFF_DIRECTORY = [
  { name: 'Ethan Anstey', pin: '1122' },
  { name: 'Katie Burry', pin: '3344' },
  { name: 'Alex Cousens', pin: '5566' },
  { name: 'Abigail Moss', pin: '7788' },
  { name: 'Micoya Dinn', pin: '2670' },
  { name: 'Ben Mason', pin: '9700' },
  { name: 'Emily Cousens', pin: '9600' },
  { name: 'Katie Cousens', pin: '2323' },
];

// Generates hourly slots from 8:00 AM (8) to 11:00 PM (23)
const HOURLY_BLOCKS = [
  { id: '08:00', label: '8:00 AM' },
  { id: '09:00', label: '9:00 AM' },
  { id: '10:00', label: '10:00 AM' },
  { id: '11:00', label: '11:00 AM' },
  { id: '12:00', label: '12:00 PM' },
  { id: '13:00', label: '1:00 PM' },
  { id: '14:00', label: '2:00 PM' },
  { id: '15:00', label: '3:00 PM' },
  { id: '16:00', label: '4:00 PM' },
  { id: '17:00', label: '5:00 PM' },
  { id: '18:00', label: '6:00 PM' },
  { id: '19:00', label: '7:00 PM' },
  { id: '20:00', label: '8:00 PM' },
  { id: '21:00', label: '9:00 PM' },
  { id: '22:00', label: '10:00 PM' },
  { id: '23:00', label: '11:00 PM' },
];

// ==========================================
// 2. DATE HELPER (Calculates Next 14 Days)
// ==========================================
function getNext14Days() {
  const days = [];
  const today = new Date();
  const daysUntilNextMonday = ((1 + 7 - today.getDay()) % 7) || 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilNextMonday);

  for (let i = 0; i < 14; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');

    days.push({
      key: `${yyyy}-${mm}-${dd}`,
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      label: current.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    });
  }
  return days;
}

// ==========================================
// 3. MAIN APPLICATION
// ==========================================
export default function App() {
  const days = useMemo(() => getNext14Days(), []);
  const firstDay = days.at(0)?.label || '';
  const lastDay = days.at(-1)?.label || '';
  const payPeriodLabel = `${firstDay} – ${lastDay}`;

  // PIN & Authentication State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authenticatedStaffName, setAuthenticatedStaffName] = useState('');

  // Form State
  const [maxHours, setMaxHours] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedHours, setSelectedHours] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0); // Index 0 to 13 for each day

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const matchedStaff = STAFF_DIRECTORY.find((staff) => staff.pin === pinInput.trim());

    if (matchedStaff) {
      setIsUnlocked(true);
      setAuthenticatedStaffName(matchedStaff.name);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const toggleHour = (dayKey, hourId) => {
    const comboKey = `${dayKey}_${hourId}`;
    setSelectedHours((prev) => ({
      ...prev,
      [comboKey]: !prev[comboKey],
    }));
  };

  const formatAvailability = () => {
    const lines = [];
    days.forEach((day) => {
      const availableHours = HOURLY_BLOCKS.filter(
        (hour) => selectedHours[`${day.key}_${hour.id}`]
      ).map((h) => h.label);

      if (availableHours.length > 0) {
        lines.push(`${day.label}: Available from ${availableHours[0]} to ${availableHours[availableHours.length - 1]} (${availableHours.length} hrs total)`);
      }
    });
    return lines.length > 0 ? lines.join('\n') : 'No hours selected';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          staffName: authenticatedStaffName,
          payPeriod: payPeriodLabel,
          maxHours: maxHours || 'Not specified',
          availability: formatAvailability(),
          notes: notes || 'None',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Submission failed. Check your Formspree URL and try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SCREEN 1: PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <form
          onSubmit={handlePinSubmit}
          className="max-w-sm w-full bg-slate-900 border-2 border-orange-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"></div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-2xl mb-4 text-orange-400 font-black">
            CE
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider mb-1">Staff Portal Login</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter your personal staff PIN code to access the hourly schedule.
          </p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center tracking-[0.5em] text-2xl bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 mb-3 text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          {pinError && (
            <p className="text-red-400 text-xs font-medium mb-3">Invalid PIN. Please check your code.</p>
          )}
          <button
            type="submit"
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-orange-500/20"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // SCREEN 2: CONFIRMATION SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-orange-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black border border-orange-500/30">
            ✓
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wide mb-2">Hourly Schedule Logged</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Thanks, <span className="text-white font-semibold">{authenticatedStaffName}</span>. Your 14-day hourly availability for{' '}
            <span className="text-orange-400 font-medium">{payPeriodLabel}</span> has been sent.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedHours({});
              setNotes('');
              setIsUnlocked(false);
              setPinInput('');
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            Log Out / Submit Another
          </button>
        </div>
      </div>
    );
  }

  const activeDay = days[activeDayIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900 border-2 border-orange-500/30 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-400 font-black text-lg">
                CE
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">CE23 Basketball Academy</h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Hourly Availability Matrix (8 AM – 11 PM)</p>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-left sm:text-right">
              <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">Pay Period</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-200">{payPeriodLabel}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Staff Info & Max Hours */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-lg items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Staff Member (Authenticated)
              </label>
              <div className="w-full bg-slate-950 border border-orange-500/40 rounded-xl px-3.5 py-3 text-orange-400 font-bold text-sm flex items-center justify-between">
                <span>{authenticatedStaffName}</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-mono">Verified PIN</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Max Hours Desired (2 Weeks)
              </label>
              <input
                type="number"
                min="0"
                max="80"
                placeholder="e.g. 30"
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {/* Hourly Calendar Matrix View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="mb-4 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-wide text-slate-200">Select Daily Hourly Blocks</h2>
                <p className="text-xs text-slate-400">
                  Select a day from the tabs below, then tap the hourly blocks you can work (8:00 AM – 11:00 PM).
                </p>
              </div>
              <div className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 self-start">
                Viewing: {activeDay.label}
              </div>
            </div>

            {/* Day Selector Tabs (14 Days Scroller) */}
            <div className="flex gap-1.5 overflow-x-auto pb-4 mb-4 scrollbar-thin">
              {days.map((day, idx) => {
                // Check if this day has any hours selected
                const hasSelections = HOURLY_BLOCKS.some(
                  (h) => selectedHours[`${day.key}_${h.id}`]
                );
                const isActive = activeDayIndex === idx;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex flex-col items-center min-w-[80px] border ${
                      isActive
                        ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-md font-black'
                        : hasSelections
                        ? 'bg-slate-800 border-orange-500/50 text-orange-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-80">{day.dayName}</span>
                    <span className="text-xs mt-0.5">{day.dateNum}</span>
                    {hasSelections && !isActive && (
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hourly Grid for Active Day */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Hours for {activeDay.label}</span>
                <span className="text-[11px] text-orange-400">Tap blocks to toggle on/off</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {HOURLY_BLOCKS.map((hour) => {
                  const comboKey = `${activeDay.key}_${hour.id}`;
                  const isSelected = selectedHours[comboKey];

                  return (
                    <button
                      key={hour.id}
                      type="button"
                      onClick={() => toggleHour(activeDay.key, hour.id)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-md font-black scale-[1.02]'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-orange-500/40 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="text-[10px] opacity-75">{hour.id < '12:00' ? 'Morning' : hour.id < '17:00' ? 'Afternoon' : 'Evening'}</span>
                      <span className="text-xs font-semibold mt-0.5">{hour.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Additional Notes / Conflicts
            </label>
            <textarea
              rows={3}
              placeholder="Any specific time-off requests or league scheduling conflicts..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xl shadow-orange-500/20 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Transmitting Schedule...' : 'Submit 14-Day Hourly Availability'}
          </button>
        </form>
      </div>
    </div>
  );
}