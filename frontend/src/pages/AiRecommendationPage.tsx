import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { getAiRecommendation } from '../api';

type SymptomEntry = {
    symptom: string;
    severity: string;
};

export function AiRecommendationPage() {
    const [entries, setEntries] = useState<SymptomEntry[]>([
        { symptom: '', severity: '' }
    ]);
    const [duration, setDuration] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔹 Dropdown Data
    const symptomsList = [
        'Stress', 'Anxiety', 'Depression', 'Headache',
        'Body Pain', 'Back Pain', 'Fatigue', 'Insomnia',
        'Digestive Issues', 'Weight Gain', 'Low Energy'
    ];

    const severityLevels = ['Mild', 'Moderate', 'Severe'];

    const durationOptions = [
        '1 day', '2 days', '3 days', '4 days', '5 days',
        '1 week', 'More than 1 week'
    ];

    // 🔹 Add new symptom row
    const addEntry = () => {
        setEntries([...entries, { symptom: '', severity: '' }]);
    };

    // 🔹 Remove symptom row
    const removeEntry = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    // 🔹 Handle change
    const updateEntry = (index: number, field: string, value: string) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        setEntries(updated);
    };

    // 🔹 Submit (Mock AI)
   // 🔹 Submit (Real AI)
const handleSubmit = async () => {
    if (entries.some(e => !e.symptom || !e.severity)) return;

    setLoading(true);

    try {
        const payload = {
            symptoms: entries.map(e => ({
                name: e.symptom.toLowerCase(),
                severity: e.severity.toLowerCase()
            })),
            duration: duration || null
        };

        const res = await getAiRecommendation(payload);

        const formatted = `
Remedies:
${res.remedies}

Therapy:
${res.therapy}

Lifestyle:
${res.lifestyle}

Medicine:
${res.medicine}

Warning:
${res.warning}
        `;

        setResult(formatted);

    } catch (err) {
        console.error(err);
        setResult('Failed to get recommendation. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <DashboardLayout
            sidebarItems={[
                { label: 'AI Recommendation', active: true, path: '/ai-recommendation', icon: <Sparkles size={20} /> },
            ]}
        >
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl">
                    <h1 className="text-3xl font-black mb-2">AI Wellness Recommendation</h1>
                    <p className="text-white/80">
                        Select your symptoms and get personalized therapy suggestions
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">

                    <h2 className="text-lg font-black text-slate-700 text-center">
                        Select Symptoms & Severity
                    </h2>

                    {/* Dynamic Symptom Rows */}
                    {entries.map((entry, index) => (
                        <div key={index} className="flex gap-3 items-center">

                            {/* Symptom Dropdown */}
                            <select
                                className="flex-1 p-4 border border-slate-200 rounded-2xl"
                                value={entry.symptom}
                                onChange={(e) => updateEntry(index, 'symptom', e.target.value)}
                            >
                                <option value="">Select Symptom</option>
                                {symptomsList.map(sym => (
                                    <option key={sym}>{sym}</option>
                                ))}
                            </select>

                            {/* Severity Dropdown */}
                            <select
                                className="w-40 p-4 border border-slate-200 rounded-2xl"
                                value={entry.severity}
                                onChange={(e) => updateEntry(index, 'severity', e.target.value)}
                            >
                                <option value="">Severity</option>
                                {severityLevels.map(level => (
                                    <option key={level}>{level}</option>
                                ))}
                            </select>

                            {/* Remove Button */}
                            {entries.length > 1 && (
                                <button
                                    onClick={() => removeEntry(index)}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Button */}
                    <button
                        onClick={addEntry}
                        className="flex items-center gap-2 text-sm font-bold text-brand-600"
                    >
                        <Plus size={16} /> Add Another Symptom
                    </button>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            Duration
                        </label>
                        <select
                            className="w-full p-4 border border-slate-200 rounded-2xl"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <option value="">Select Duration</option>
                            {durationOptions.map(d => (
                                <option key={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-black shadow-lg"
                    >
                        {loading ? 'Generating...' : 'Get Recommendations'}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                            <Sparkles size={18} /> AI Suggestion
                        </h3>
                        <p className="text-slate-600 whitespace-pre-line">{result}</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}