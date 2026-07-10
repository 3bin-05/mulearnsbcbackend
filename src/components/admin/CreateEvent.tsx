import React, { useState, useEffect } from 'react';
import { createEvent, updateEvent } from '../../services/firestore';
import { Sparkles, Calendar, Link, Image as ImageIcon, Save, Loader2, Clock } from 'lucide-react';
import type { Event } from '../../types/event';
import { getDirectImageLink } from '../../utils/driveHelper';

interface CreateEventProps {
  editingEvent?: Event | null;
  onCancel?: () => void;
}

export const CreateEvent: React.FC<CreateEventProps> = ({ editingEvent, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    isComingSoon: false,
    title: '',
    shortDescription: '',
    description: '',
    speaker: '',
    category: '',
    venue: '',
    mode: 'online' as 'online' | 'offline',
    registrationOpenDate: '',
    registrationCloseDate: '',
    startDate: '',
    endDate: '',
    registrationLink: '',
    maxParticipants: '',
    certificateAvailable: false,
    cardImage: '',
    wideImage: '',
  });

  useEffect(() => {
    if (editingEvent) {
      const inferredComingSoon =
        editingEvent.status === 'coming-soon' ||
        (!editingEvent.startDate && !editingEvent.registrationOpenDate);

      setFormData({
        isComingSoon: inferredComingSoon,
        title: editingEvent.title || '',
        shortDescription: editingEvent.shortDescription || '',
        description: editingEvent.description || '',
        speaker: editingEvent.speaker || '',
        category: editingEvent.category || '',
        venue: editingEvent.venue || '',
        mode: editingEvent.mode || 'online',
        registrationOpenDate: editingEvent.registrationOpenDate || '',
        registrationCloseDate: editingEvent.registrationCloseDate || '',
        startDate: editingEvent.startDate || '',
        endDate: editingEvent.endDate || '',
        registrationLink: editingEvent.registrationLink || '',
        maxParticipants: editingEvent.maxParticipants?.toString() || '',
        certificateAvailable: !!editingEvent.certificateAvailable,
        cardImage: editingEvent.cardImage || '',
        wideImage: editingEvent.wideImage || '',
      });
    } else {
      resetForm();
    }
  }, [editingEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      isComingSoon: false,
      title: '',
      shortDescription: '',
      description: '',
      speaker: '',
      category: '',
      venue: '',
      mode: 'online',
      registrationOpenDate: '',
      registrationCloseDate: '',
      startDate: '',
      endDate: '',
      registrationLink: '',
      maxParticipants: '',
      certificateAvailable: false,
      cardImage: '',
      wideImage: '',
    });
  };

  const stripUndefined = (obj: Record<string, any>): Record<string, any> =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const cardImageUrl = formData.cardImage.trim();
      const wideImageUrl = formData.wideImage.trim();

      const rawPayload = formData.isComingSoon
        ? {
            title: formData.title,
            shortDescription: formData.shortDescription,
            description: formData.description || '',
            speaker: formData.speaker,
            category: formData.category,
            venue: formData.venue,
            mode: formData.mode,
            registrationOpenDate: null,
            registrationCloseDate: null,
            startDate: null,
            endDate: null,
            registrationLink: null,
            maxParticipants: null,
            certificateAvailable: false,
            cardImage: null,
            wideImage: null,
          }
        : {
            title: formData.title,
            shortDescription: formData.shortDescription,
            description: formData.description || '',
            speaker: formData.speaker,
            category: formData.category,
            venue: formData.venue,
            mode: formData.mode,
            registrationOpenDate: formData.registrationOpenDate || null,
            registrationCloseDate: formData.registrationCloseDate || null,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            registrationLink: formData.registrationLink || null,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
            certificateAvailable: formData.certificateAvailable,
            cardImage: cardImageUrl || null,
            wideImage: wideImageUrl || null,
          };

      const eventPayload = stripUndefined(rawPayload);

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventPayload);
        setSuccess('Event updated successfully!');
        if (onCancel) {
          setTimeout(() => { onCancel(); }, 1000);
        }
      } else {
        const newEvent = { ...eventPayload, participantsCount: 0 } as Omit<Event, 'id' | 'status'>;
        await createEvent(newEvent);
        setSuccess('Event created successfully!');
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in text-xs max-w-4xl relative text-slate-800">

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-[#eef0f6] shadow-xl max-w-xs text-center space-y-4">
            <Loader2 className="h-8 w-8 text-[#6320ee] animate-spin" />
            <h3 className="font-bold text-slate-800">Saving Event Data</h3>
            <p className="text-[10px] text-slate-450">Writing event configurations to Firestore collections...</p>
          </div>
        </div>
      )}

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 font-bold">
          {error || 'Event successfully saved!'}
        </div>
      )}

      {/* Basic Information Section */}
      <div className="rounded-2xl border border-[#eef0f6] bg-white p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 border-b border-[#eef0f6] pb-3 flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-[#6320ee]" />
          <span>{editingEvent ? `Edit Event Details: ${editingEvent.title}` : 'Basic Information'}</span>
        </h2>

        {/* Coming Soon Toggle */}
        <div
          className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
            formData.isComingSoon
              ? 'border-[#6320ee]/30 bg-[#f1e9ff]/20'
              : 'border-slate-200 bg-[#fcfbfe] hover:border-[#dedcf3]'
          }`}
          onClick={() => setFormData((prev) => ({ ...prev, isComingSoon: !prev.isComingSoon }))}
        >
          <div className="mt-0.5 flex-shrink-0">
            <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              formData.isComingSoon ? 'border-[#6320ee] bg-[#6320ee]' : 'border-slate-300 bg-white'
            }`}>
              {formData.isComingSoon && (
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className={`font-bold text-[11px] uppercase tracking-wide ${formData.isComingSoon ? 'text-[#6320ee]' : 'text-slate-700'}`}>
              <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5 text-[#6320ee]" />
              Mark as Coming Soon
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              {formData.isComingSoon
                ? 'Event will appear as "Coming Soon" — dates, registration forms, and image inputs are hidden. Edit this event later to add the schedule details and make it live.'
                : 'Uncheck to set a full schedule with dates, links, and banners.'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Next-Gen Web Development Workshop"
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Short Description *</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Brief summary shown on listings"
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Full Description
              <span className="ml-2 text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed explanation, prerequisites, and goals..."
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Speaker Name *</label>
            <input
              type="text"
              name="speaker"
              value={formData.speaker}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 focus:border-[#6320ee] focus:outline-none transition-colors"
              required
            >
              <option value="">Select Category</option>
              <option value="Backend Development">Backend Development</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Venue *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Seminar Hall A, Zoom"
              className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mode *</label>
            <div className="flex gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-650 font-semibold">
                <input
                  type="radio"
                  name="mode"
                  value="online"
                  checked={formData.mode === 'online'}
                  onChange={handleChange}
                  className="accent-[#6320ee] h-4 w-4"
                />
                <span>Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-655 font-semibold">
                <input
                  type="radio"
                  name="mode"
                  value="offline"
                  checked={formData.mode === 'offline'}
                  onChange={handleChange}
                  className="accent-[#6320ee] h-4 w-4"
                />
                <span>Offline</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Section — only shown when NOT coming soon */}
      {!formData.isComingSoon && (
        <div className="rounded-2xl border border-[#eef0f6] bg-white p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-[#eef0f6] pb-3 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-[#6320ee]" />
            <span>Timeline Dates</span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reg Opens</label>
                  <input
                    type="date"
                    name="registrationOpenDate"
                    value={formData.registrationOpenDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-850 focus:border-[#6320ee] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reg Closes</label>
                  <input
                    type="date"
                    name="registrationCloseDate"
                    value={formData.registrationCloseDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-855 focus:border-[#6320ee] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Start Date & Time *</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-850 focus:border-[#6320ee] focus:outline-none transition-colors"
                required={!formData.isComingSoon}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event End Date & Time *</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-850 focus:border-[#6320ee] focus:outline-none transition-colors"
                required={!formData.isComingSoon}
              />
            </div>
          </div>
        </div>
      )}

      {/* Registration Section — only shown when NOT coming soon */}
      {!formData.isComingSoon && (
        <div className="rounded-2xl border border-[#eef0f6] bg-white p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-[#eef0f6] pb-3 flex items-center gap-2">
            <Link className="h-4.5 w-4.5 text-[#6320ee]" />
            <span>Registration & Attendance</span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registration Link</label>
              <input
                type="url"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="e.g. https://forms.gle/..."
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 py-4">
              <input
                type="checkbox"
                id="certificateAvailable"
                name="certificateAvailable"
                checked={formData.certificateAvailable}
                onChange={handleCheckboxChange}
                className="h-4 w-4 accent-[#6320ee] rounded border-slate-300 bg-white text-[#6320ee] focus:ring-0"
              />
              <label htmlFor="certificateAvailable" className="text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                Is Certificate Available for Attendance?
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Image Links Section — only shown when NOT coming soon */}
      {!formData.isComingSoon && <div className="rounded-2xl border border-[#eef0f6] bg-white p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 border-b border-[#eef0f6] pb-3 flex items-center gap-2">
          <ImageIcon className="h-4.5 w-4.5 text-[#6320ee]" />
          <span>Event Image Links</span>
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">

          {/* Card Image Link (4:3) */}
          <div className="space-y-4 rounded-xl border border-[#f0ecfc] bg-[#fcfbfe] p-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Image URL (4:3)</label>
              <input
                type="url"
                name="cardImage"
                value={formData.cardImage}
                onChange={handleChange}
                placeholder="Paste ImgBB direct link here... e.g. https://i.ibb.co/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                🖼️ Upload your photo to <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-[#6320ee] hover:text-[#5219de] underline font-semibold">imgbb.com</a> → click <span className="text-slate-700">"Display page"</span> → right-click the image → <span className="text-slate-700">"Copy image address"</span>.
              </p>
            </div>
            {formData.cardImage.trim() && (
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#f0ecfc] bg-white">
                <img src={getDirectImageLink(formData.cardImage)} alt="Card preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cardImage: '' }))}
                  className="absolute top-2 right-2 rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-rose-400 hover:bg-slate-950"
                >
                  Clear Link
                </button>
              </div>
            )}
          </div>

          {/* Wide Image Link (16:9) */}
          <div className="space-y-4 rounded-xl border border-[#f0ecfc] bg-[#fcfbfe] p-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Wide Banner Image URL (16:9)</label>
              <input
                type="url"
                name="wideImage"
                value={formData.wideImage}
                onChange={handleChange}
                placeholder="Paste ImgBB direct link here... e.g. https://i.ibb.co/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                🖼️ Upload your photo to <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-[#6320ee] hover:text-[#5219de] underline font-semibold">imgbb.com</a> → click <span className="text-slate-700">"Display page"</span> → right-click the image → <span className="text-slate-700">"Copy image address"</span>.
              </p>
            </div>
            {formData.wideImage.trim() && (
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#f0ecfc] bg-white">
                <img src={getDirectImageLink(formData.wideImage)} alt="Wide preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, wideImage: '' }))}
                  className="absolute top-2 right-2 rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-rose-400 hover:bg-slate-950"
                >
                  Clear Link
                </button>
              </div>
            )}
          </div>

         </div>
      </div>}

      {/* Form Submission Buttons */}
      <div className="flex justify-end gap-3.5">
        {editingEvent ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Reset Form
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#6320ee] px-5 py-2.5 font-bold text-white hover:bg-[#5219de] shadow-md shadow-[#6320ee]/15 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{editingEvent ? 'Update Event' : 'Save Event'}</span>
        </button>
      </div>
    </form>
  );
};

export default CreateEvent;
