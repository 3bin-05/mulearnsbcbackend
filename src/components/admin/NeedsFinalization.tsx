import React, { useState } from 'react';
import {
  CheckSquare,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Plus,
  X,
} from 'lucide-react';
import { updateEvent } from '../../services/firestore';
import type { Event } from '../../types/event';
import { getDirectImageLink } from '../../utils/driveHelper';

interface NeedsFinalizationProps {
  events: Event[];
}

export const NeedsFinalization: React.FC<NeedsFinalizationProps> = ({ events }) => {
  const finalizationEvents = events.filter((event) => {
    const end = event.endDate ? new Date(event.endDate) : null;
    const now = new Date();
    const isConcluded = end && now >= end;
    const hasDetails =
      (event.highlights && event.highlights.length > 0) ||
      event.recordingLink ||
      event.driveLink ||
      (event.gallery && event.gallery.length > 0);

    return isConcluded && !hasDetails;
  });

  const [formData, setFormData] = useState<Record<string, {
    driveLink: string;
    recordingLink: string;
    highlights: string;
    participantsCount: string;
  }>>({});
  const [galleryUrls, setGalleryUrls] = useState<Record<string, string[]>>({});
  const [currentUrlInput, setCurrentUrlInput] = useState<Record<string, string>>({});
  const [submittingStates, setSubmittingStates] = useState<Record<string, {
    active: boolean;
    statusText: string;
  }>>({});

  const handleInputChange = (eventId: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || { driveLink: '', recordingLink: '', highlights: '', participantsCount: '' }),
        [field]: value,
      },
    }));
  };

  const handleUrlInputChange = (eventId: string, value: string) => {
    setCurrentUrlInput((prev) => ({
      ...prev,
      [eventId]: value,
    }));
  };

  const handleAddUrl = (eventId: string) => {
    const url = (currentUrlInput[eventId] || '').trim();
    if (!url) return;

    setGalleryUrls((prev) => {
      const existing = prev[eventId] || [];
      if (existing.length >= 5) {
        alert('You can only add up to 5 gallery images.');
        return prev;
      }

      return {
        ...prev,
        [eventId]: [...existing, url],
      };
    });

    setCurrentUrlInput((prev) => ({
      ...prev,
      [eventId]: '',
    }));
  };

  const handleRemoveUrl = (eventId: string, indexToRemove: number) => {
    setGalleryUrls((prev) => {
      const existing = prev[eventId] || [];
      return {
        ...prev,
        [eventId]: existing.filter((_, index) => index !== indexToRemove),
      };
    });
  };

  const handleFinalize = async (e: React.FormEvent, event: Event) => {
    e.preventDefault();

    const eventId = event.id;
    const formState = formData[eventId] || {
      driveLink: '',
      recordingLink: '',
      highlights: '',
      participantsCount: '',
    };
    const urls = galleryUrls[eventId] || [];

    if (!formState.participantsCount || !formState.highlights.trim()) {
      alert('Total Attendees and Highlights are required fields.');
      return;
    }

    setSubmittingStates((prev) => ({
      ...prev,
      [eventId]: { active: true, statusText: 'Publishing past event...' },
    }));

    try {
      const parsedHighlights = formState.highlights
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      await updateEvent(eventId, {
        participantsCount: Number(formState.participantsCount),
        recordingLink: formState.recordingLink.trim() || undefined,
        driveLink: formState.driveLink.trim() || undefined,
        highlights: parsedHighlights,
        gallery: urls.length > 0 ? urls : undefined,
      });

      alert(`Event "${event.title}" finalized successfully and moved to Archives.`);

      setFormData((prev) => {
        const copy = { ...prev };
        delete copy[eventId];
        return copy;
      });
      setGalleryUrls((prev) => {
        const copy = { ...prev };
        delete copy[eventId];
        return copy;
      });
      setCurrentUrlInput((prev) => {
        const copy = { ...prev };
        delete copy[eventId];
        return copy;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to finalize event: ${message}`);
    } finally {
      setSubmittingStates((prev) => ({
        ...prev,
        [eventId]: { active: false, statusText: '' },
      }));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-sm pb-80 lg:pb-0">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1f2433]">
          Pending <span className="font-script text-[#6b2ff2] text-4xl">Finalizations</span>
        </h2>
        <p className="text-base text-slate-500 mt-3 max-w-2xl">
          Review concluded events, add attendance figures, attach resources, and publish them to the archive.
        </p>
        <div className="sbc-title-mark" />
      </div>

      {finalizationEvents.length > 0 ? (
        <div className="space-y-6 max-w-4xl">
          {finalizationEvents.map((event) => {
            const formState = formData[event.id] || {
              driveLink: '',
              recordingLink: '',
              highlights: '',
              participantsCount: '',
            };
            const urls = galleryUrls[event.id] || [];
            const urlInput = currentUrlInput[event.id] || '';
            const submitState = submittingStates[event.id] || { active: false, statusText: '' };

            return (
              <div key={event.id} className="sbc-card p-7 space-y-7 relative overflow-hidden">
                {submitState.active && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-8 w-8 text-[#6b2ff2] animate-spin" />
                    <span className="font-bold text-[#1f2433]">{submitState.statusText}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#efe6fb] pb-5">
                  <div>
                    <span className="sbc-kicker">
                      Concluded: {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBD'}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#1f2433] mt-2">{event.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Led by {event.speaker} - {event.category}</p>
                  </div>
                  <span className="self-start md:self-center inline-flex items-center rounded-xl bg-[#e9fbff] text-cyan-700 border border-cyan-100 px-3 py-1.5 text-xs font-bold">
                    Needs Finalization
                  </span>
                </div>

                <form onSubmit={(e) => handleFinalize(e, event)} className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="sbc-label flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-[#6b2ff2]" />
                      <span>Total Attendees *</span>
                    </label>
                    <input
                      type="number"
                      value={formState.participantsCount}
                      onChange={(e) => handleInputChange(event.id, 'participantsCount', e.target.value)}
                      placeholder="e.g. 112"
                      className="sbc-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="sbc-label flex items-center gap-1.5">
                      <Film className="h-4 w-4 text-[#6b2ff2]" />
                      <span>Video Recording Link</span>
                    </label>
                    <input
                      type="url"
                      value={formState.recordingLink}
                      onChange={(e) => handleInputChange(event.id, 'recordingLink', e.target.value)}
                      placeholder="e.g. YouTube, Drive video, Zoom link"
                      className="sbc-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="sbc-label flex items-center gap-1.5">
                      <LinkIcon className="h-4 w-4 text-[#6b2ff2]" />
                      <span>Shared Resources Folder Link</span>
                    </label>
                    <input
                      type="url"
                      value={formState.driveLink}
                      onChange={(e) => handleInputChange(event.id, 'driveLink', e.target.value)}
                      placeholder="e.g. Google Drive, GitHub folder link"
                      className="sbc-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="sbc-label flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-[#6b2ff2]" />
                      <span>Session Highlights *</span>
                    </label>
                    <textarea
                      value={formState.highlights}
                      onChange={(e) => handleInputChange(event.id, 'highlights', e.target.value)}
                      rows={4}
                      placeholder="Enter each highlight on a new line..."
                      className="sbc-input resize-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-4">
                    <span className="sbc-label flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#6b2ff2]" />
                      <span>Session Gallery (Max 5 image URLs)</span>
                    </span>

                    {urls.length > 0 && (
                      <div className="flex flex-wrap gap-3 rounded-xl border border-[#efe6fb] bg-[#fcfbff] p-3">
                        {urls.map((url, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-xl border border-[#e5d8f7] overflow-hidden bg-white group">
                            <img src={getDirectImageLink(url)} alt={`gallery-${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveUrl(event.id, index)}
                              className="absolute top-1 right-1 rounded-md p-0.5 bg-white/90 text-slate-500 hover:text-rose-500 shadow-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => handleUrlInputChange(event.id, e.target.value)}
                          placeholder="Paste image URL here..."
                          className="sbc-input flex-grow"
                          disabled={urls.length >= 5}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddUrl(event.id)}
                          disabled={urls.length >= 5 || !urlInput.trim()}
                          className="sbc-button-muted px-4 disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Link</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Upload to <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-[#6b2ff2] hover:underline font-semibold">imgbb.com</a>, open the display page, then copy the image address.
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className="sbc-button-primary">
                      <CheckSquare className="h-5 w-5" />
                      <span>Publish Past Event</span>
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sbc-panel border-dashed py-12 text-center text-slate-500">
          No events currently require administrative finalization.
        </div>
      )}
    </div>
  );
};

export default NeedsFinalization;
