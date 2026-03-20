import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Profile, type Booking, type AvailabilitySlot } from '../api';
import { formatImageUrl } from '../utils/image';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, LayoutDashboard, Calendar, CheckCircle2, Star, MapPin,
    Search, Sparkles, X, Activity, MessageSquare, Flag, ArrowLeft, Shield
} from 'lucide-react';
import { ReportModal } from '../components/ReportModal';

export function MarketplacePage() {
    const [practitioners, setPractitioners] = useState<Profile[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingPractitioner, setBookingPractitioner] = useState<Profile | null>(null);
    const [bookingDescription, setBookingDescription] = useState('');
    const [sessionDate, setSessionDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [practitionerBookings, setPractitionerBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [reportConfig, setReportConfig] = useState<{ entityType: string; entityId: number } | null>(null);

    // Read-only logic for Admin Reports
    const queryParams = new URLSearchParams(window.location.search)
    const isReadOnly = queryParams.get('readOnly') === 'true'
    const fromReports = queryParams.get('fromReports') === 'true'

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setFetchLoading(true);
        try {
            // Only show APPROVED practitioners in marketplace
            const parts = await api.getApprovedPractitioners();
            setPractitioners(parts);
            try {
                const me = await api.getProfile();
                setProfile(me);
            } catch {
                // User might not be logged in, marketplace still shows
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchPractitionerBookings = async (practitionerId: number) => {
        try {
            const [existing, availability] = await Promise.all([
                api.getPractitionerBookings(practitionerId),
                api.getProviderAvailability(practitionerId)
            ]);
            setPractitionerBookings(existing);
            setAvailabilitySlots(availability);
        } catch (err) {
            console.error(err);
            setPractitionerBookings([]);
            setAvailabilitySlots([]);
        }
    };

    const generateTimeSlots = () => {
        const slots: { start: string; end: string }[] = [];
        let hour = 9;
        let minute = 0;

        while (hour < 18) {
            const start = `${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : '30'}`;
            minute += 30;
            if (minute === 60) {
                minute = 0;
                hour++;
            }
            const endHour = minute === 0 ? hour : hour;
            const endMinute = minute === 0 ? '00' : '30';
            const end = `${endHour.toString().padStart(2, '0')}:${endMinute}`;
            slots.push({ start, end });
        }

        return slots;
    };

    const slots = generateTimeSlots();

    const handleBook = async () => {
        if (!bookingPractitioner || !profile) return;
        if (!sessionDate || !selectedSlot) {
            setMessage('Please select a date and time slot.');
            setTimeout(() => setMessage(''), 4000);
            return;
        }
        setLoading(true);
        try {
            // Calculate duration in minutes from selected slot
            const [startH, startM] = selectedSlot.start.split(':').map(Number);
            const [endH, endM] = selectedSlot.end.split(':').map(Number);
            const duration = (endH * 60 + endM) - (startH * 60 + startM);

            await api.bookSession({
                providerId: bookingPractitioner.id,
                sessionDate: sessionDate,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                duration,
                description: bookingDescription || 'Session booking request'
            });
            setMessage(`Booking request sent to ${bookingPractitioner.name}. They will confirm shortly.`);
            setBookingPractitioner(null);
            setBookingDescription('');
            setSessionDate('');
            setSelectedSlot(null);
            setTimeout(() => setMessage(''), 5000);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 409) {
                setMessage('This time slot is already booked. Please select another time.');
            } else if (err.response?.data?.message) {
                setMessage(err.response.data.message);
            } else {
                setMessage('Failed to book session. Please try again.');
            }
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleReportClick = (practitionerId: number) => {
        setReportConfig({ entityType: 'PRACTITIONER', entityId: practitionerId });
    };

    const handleReportSubmit = async (reason: string, comment: string) => {
        if (!profile || !reportConfig) return;
        try {
            await api.reportContent({
                reportedEntityId: reportConfig.entityId,
                reporterId: profile.id,
                reason,
                comment,
                entityType: 'PRACTITIONER'
            });
            setMessage('Report submitted. Thank you.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to submit report.');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setReportConfig(null);
        }
    };

    const filteredPractitioners = practitioners.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.specialization && p.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout sidebarItems={[
        { label: 'Find my Practitioner', active: true, path: '/marketplace', icon: <Compass size={20} /> },
        { label: 'My Dashboard', path: profile?.role === 'PROVIDER' ? '/practitioner' : '/user', icon: <LayoutDashboard size={20} /> },
        { label: 'Community Forum', path: '/forum', icon: <MessageSquare size={20} /> },
        ]}>
            <div className="space-y-10 min-h-screen">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-brand-600 via-violet-600 to-indigo-600 p-10 rounded-[2.5rem] shadow-xl text-white text-center"
                >
                    {fromReports && (
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="bg-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/40 mb-6 hover:bg-white/30 transition-all flex items-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={14} /> Back to Flagged Content
                        </button>
                    )}
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 mb-4 inline-block">
                        Verified Practitioners Only
                    </span>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        Discover <span className="text-white/80">Alternative Therapies</span>
                    </h1>
                    <p className="text-white/70 text-lg font-medium">Connect with verified practitioners for a holistic life.</p>

                    <div className="max-w-2xl mx-auto relative group mt-8">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or specialization (e.g., Ayurveda, Acupuncture)"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-[2rem] py-4 pl-14 pr-6 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all text-base backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </motion.header>

                {/* Practitioners Grid */}
                {fetchLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                            <Activity size={32} className="text-brand-600" />
                        </motion.div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading practitioners...</p>
                    </div>
                ) : filteredPractitioners.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <Compass size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                            {searchTerm ? 'No practitioners match your search' : 'No verified practitioners available yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPractitioners.map((p, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={p.id}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="relative h-40 bg-gradient-to-br from-brand-50 to-violet-50 flex items-center justify-center">
                                    <div className="h-20 w-20 rounded-3xl bg-white shadow-lg flex items-center justify-center text-brand-600 text-3xl font-black group-hover:scale-110 transition-transform overflow-hidden">
                                        {p.profileImage ? (
                                            <img src={formatImageUrl(p.profileImage)} alt={p.name} className="w-full h-full object-cover" />
                                        ) : (
                                            p.name[0]
                                        )}
                                    </div>
                                    {/* Verified badge */}
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                                        <CheckCircle2 size={10} /> Verified
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{p.name}</h3>
                                        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                                            <Star size={14} fill="currentColor" /> 4.9
                                        </div>
                                    </div>

                                    <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-3">
                                        {p.specialization || 'General Wellness'}
                                    </p>

                                    <div className="space-y-1.5 mb-6 text-slate-500 text-sm">
                                        {p.city && (
                                            <p className="flex items-center gap-2">
                                                <MapPin size={13} className="text-slate-400" /> {p.city}{p.country ? `, ${p.country}` : ''}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-2">
                                            <Calendar size={13} className="text-slate-400" /> Next available: Tomorrow
                                        </p>
                                        <p className="flex items-center gap-2 font-black text-brand-700 bg-brand-50/50 px-3 py-1 rounded-xl w-fit">
                                            <Sparkles size={12} /> ₹{p.sessionFee || 500} / Session
                                        </p>
                                    </div>

                                    {!isReadOnly ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setBookingPractitioner(p);
                                                    setSessionDate('');
                                                    setSelectedSlot(null);
                                                    fetchPractitionerBookings(p.id);
                                                }}
                                                className="flex-1 bg-brand-600 text-white font-black py-3.5 rounded-2xl hover:bg-brand-700 transition-all transform active:scale-95 shadow-lg shadow-brand-600/20"
                                            >
                                                Book Session
                                            </button>
                                            <button
                                                onClick={() => handleReportClick(p.id)}
                                                className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100 active:scale-95"
                                                title="Report Practitioner"
                                            >
                                                <Flag size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 font-black text-center text-xs flex items-center justify-center gap-2">
                                            <Shield size={14} /> READ ONLY MODE
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Booking Modal */}
                <AnimatePresence>
                    {bookingPractitioner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setBookingPractitioner(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100"
                            >
                                <button
                                    onClick={() => setBookingPractitioner(null)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-100"
                                >
                                    <X size={20} />
                                </button>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 text-2xl font-black overflow-hidden">
                                        {bookingPractitioner.profileImage ? (
                                            <img src={formatImageUrl(bookingPractitioner.profileImage)} alt={bookingPractitioner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            bookingPractitioner.name[0]
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-slate-900">Book Session</h2>
                                        <p className="text-slate-500 font-medium italic">with <span className="text-brand-600 font-black">{bookingPractitioner.name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fee</p>
                                        <p className="text-xl font-black text-slate-900">₹{bookingPractitioner.sessionFee || 500}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:outline-none focus:border-brand-400 font-medium"
                                                value={sessionDate}
                                                onChange={(e) => {
                                                    setSessionDate(e.target.value);
                                                    setSelectedSlot(null);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select Time Slot</label>
                                            {sessionDate ? (
                                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                    {slots.map((slot) => {
                                                        const isSelected =
                                                            selectedSlot?.start === slot.start && selectedSlot.end === slot.end;

                                                        const slotDateTime = new Date(`${sessionDate}T${slot.start}`);
                                                        const now = new Date();
                                                        const isPast = slotDateTime <= now;

                                                        const isBooked = practitionerBookings.some((b) => {
                                                            if (!b.sessionDate) return false;
                                                            // b.sessionDate is already YYYY-MM-DD from API
                                                            const isSameDate = b.sessionDate === sessionDate;
                                                            const isSameTime = b.startTime === slot.start;
                                                            const isActiveStatus = b.status !== 'CANCELLED' && b.status !== 'REJECTED';
                                                            return isSameDate && isSameTime && isActiveStatus;
                                                        });

                                                        // Check against availability slots for this date only
                                                        const slotsForDate = availabilitySlots.filter(av => String(av.availableDate) === sessionDate);
                                                        // If no availability defined for this date, all slots are open
                                                        const isAvailable = slotsForDate.length === 0 || slotsForDate.some(av =>
                                                            slot.start >= av.startTime && slot.end <= av.endTime
                                                        );

                                                        const disabled = isPast || isBooked || !isAvailable;

                                                        return (
                                                            <button
                                                                key={`${slot.start}-${slot.end}`}
                                                                type="button"
                                                                onClick={() => !disabled && setSelectedSlot(slot)}
                                                                disabled={disabled}
                                                                className={`text-xs font-bold rounded-xl border px-3 py-2 text-left transition-all ${disabled
                                                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                                                    : isSelected
                                                                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {slot.start} – {slot.end}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 font-medium">
                                                    Select a date to see available time slots.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Session Goals / Description</label>
                                            <textarea
                                                placeholder="Describe your issue or what you hope to achieve in this session..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:outline-none focus:border-brand-400 min-h-[120px] resize-none font-medium"
                                                value={bookingDescription}
                                                onChange={(e) => setBookingDescription(e.target.value)}
                                            />
                                    </div>

                                    {!profile && (
                                        <p className="text-amber-600 text-sm font-bold bg-amber-50 border border-amber-100 rounded-2xl p-4">
                                            Please log in to book a session.
                                        </p>
                                    )}

                                    <button
                                        onClick={handleBook}
                                        disabled={loading || !profile}
                                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-600/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Confirm Request'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                {message && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl z-50 font-bold flex items-center gap-3"
                    >
                        <Sparkles size={16} className="text-brand-400" />
                        {message}
                    </motion.div>
                )}
            </div>

            <ReportModal
                isOpen={!!reportConfig}
                onClose={() => setReportConfig(null)}
                onConfirm={handleReportSubmit}
                title="Report Practitioner"
            />
        </DashboardLayout>
    );
}
