import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  fetchCurrentYear,
  subscribeToMembersByYear,
  createMember,
  updateMember,
  deleteMember,
  fetchAllYears,
  publishNewExeCom,
  parseExcelFile,
  exportExcelFile,
  fetchMembersByYear
} from '../../services/execom';
import type { ExeComMember } from '../../types/execom';
import { PREDEFINED_POSITIONS } from '../../types/execom';
import {
  Users,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  BookOpen,
  Copy,
  Loader2
} from 'lucide-react';

export const ExeComManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'initiate' | 'archive'>('current');

  // Common State
  const [currentYear, setCurrentYear] = useState<string>('');
  const [currentMembers, setCurrentMembers] = useState<ExeComMember[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState<boolean>(true);
  const [allYears, setAllYears] = useState<string[]>([]);

  // Search & Filter State (Current ExeCom)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Archive State
  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>('');
  const [archiveMembers, setArchiveMembers] = useState<ExeComMember[]>([]);
  const [loadingArchive, setLoadingArchive] = useState<boolean>(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');
  const [archivePositionFilter, setArchivePositionFilter] = useState<string>('all');
  const [isEditArchiveEnabled, setIsEditArchiveEnabled] = useState<boolean>(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formModalMode, setFormModalMode] = useState<'add' | 'edit' | 'staged-edit' | 'archive-edit'>('add');
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [stagedEditIndex, setStagedEditIndex] = useState<number | null>(null);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    mulearnId: '',
    position: 'Lead',
    branch: '',
    year: '',
    email: '',
    phone: '',
    dob: '',
    imageUrl: '',
    bio: '',
    linkedin: '',
    github: '',
    instagram: '',
    twitter: '',
    website: ''
  });

  // Initiate New ExeCom State
  const [newYearId, setNewYearId] = useState<string>('');
  const [initiateMethod, setInitiateMethod] = useState<'manual' | 'excel' | null>(null);
  const [stagedMembers, setStagedMembers] = useState<Omit<ExeComMember, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [excelPreview, setExcelPreview] = useState<{
    summary: { totalFound: number; validCount: number; errorCount: number; success: boolean };
    errors: { row: number; field: string; error: string; value: string }[];
    members: Omit<ExeComMember, 'id' | 'createdAt' | 'updatedAt'>[];
  } | null>(null);
  const [parsingExcel, setParsingExcel] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);

  // Alert/Status States
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);

  // Load active years and active ExeCom year pointer
  useEffect(() => {
    const initData = async () => {
      try {
        const year = await fetchCurrentYear();
        if (year) {
          setCurrentYear(year);
        }
        const yearsList = await fetchAllYears();
        setAllYears(yearsList);
        if (yearsList.length > 0 && !selectedArchiveYear) {
          setSelectedArchiveYear(yearsList[0]);
        }
      } catch (err) {
        console.error('Failed to load initial ExeCom metadata:', err);
      }
    };
    initData();
  }, [activeSubTab]);

  // Real-time subscription to current members
  useEffect(() => {
    if (!currentYear) {
      setLoadingCurrent(false);
      return;
    }
    setLoadingCurrent(true);
    const unsubscribe = subscribeToMembersByYear(currentYear, (members) => {
      setCurrentMembers(members);
      setLoadingCurrent(false);
    });
    return () => unsubscribe();
  }, [currentYear]);

  // Fetch archive year members when year changes
  useEffect(() => {
    if (!selectedArchiveYear) return;
    const fetchArchive = async () => {
      setLoadingArchive(true);
      try {
        const members = await fetchMembersByYear(selectedArchiveYear);
        setArchiveMembers(members);
      } catch (err) {
        console.error('Failed to fetch archive members:', err);
      } finally {
        setLoadingArchive(false);
      }
    };
    fetchArchive();
  }, [selectedArchiveYear]);

  // Social Links mapping helper
  const mapSocials = (member: any) => ({
    linkedin: member.socials?.linkedin || '',
    github: member.socials?.github || '',
    instagram: member.socials?.instagram || '',
    twitter: member.socials?.twitter || '',
    website: member.socials?.website || ''
  });

  const openAddModal = (mode: 'add' | 'staged-edit' | 'edit' | 'archive-edit', data?: any, index?: number) => {
    setFormModalMode(mode);
    if (data) {
      setFormData({
        name: data.name || '',
        mulearnId: data.mulearnId || '',
        position: data.position || 'Lead',
        branch: data.branch || '',
        year: data.year || '',
        email: data.email || '',
        phone: data.phone || '',
        dob: data.dob || '',
        imageUrl: data.imageUrl || '',
        bio: data.bio || '',
        ...mapSocials(data)
      });
      if (mode === 'edit' || mode === 'archive-edit') {
        setTargetMemberId(data.id);
      } else if (mode === 'staged-edit' && index !== undefined) {
        setStagedEditIndex(index);
      }
    } else {
      setFormData({
        name: '',
        mulearnId: '',
        position: 'Lead',
        branch: '',
        year: '',
        email: '',
        phone: '',
        dob: '',
        imageUrl: '',
        bio: '',
        linkedin: '',
        github: '',
        instagram: '',
        twitter: '',
        website: ''
      });
    }
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationError(null);
    setOperationSuccess(null);
    setSaving(true);

    let originalMember: any = null;
    if (formModalMode === 'edit') {
      originalMember = currentMembers.find(m => m.id === targetMemberId);
    } else if (formModalMode === 'archive-edit') {
      originalMember = archiveMembers.find(m => m.id === targetMemberId);
    } else if (formModalMode === 'staged-edit' && stagedEditIndex !== null) {
      originalMember = stagedMembers[stagedEditIndex];
    }

    const resolvedRoleTitle = originalMember && originalMember.position === formData.position
      ? originalMember.roleTitle || originalMember.position
      : formData.position;

    const memberPayload = {
      name: formData.name.trim(),
      mulearnId: formData.mulearnId.trim(),
      position: formData.position,
      roleTitle: resolvedRoleTitle,
      branch: formData.branch.trim(),
      year: formData.year.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dob: formData.dob.trim(),
      imageUrl: formData.imageUrl.trim(),
      bio: formData.bio.trim(),
      socials: {
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
        instagram: formData.instagram.trim(),
        twitter: formData.twitter.trim(),
        website: formData.website.trim()
      },
      isActive: true,
      displayOrder: 9999
    };

    try {
      if (formModalMode === 'add') {
        // Direct Add to Current ExeCom
        const nextOrder = currentMembers.length > 0 ? Math.max(...currentMembers.map(m => m.displayOrder)) + 1 : 0;
        await createMember(currentYear, { ...memberPayload, displayOrder: nextOrder });
        setOperationSuccess('Member added successfully.');
      } else if (formModalMode === 'edit') {
        // Direct Edit of Current ExeCom
        const existing = currentMembers.find(m => m.id === targetMemberId);
        const order = existing ? existing.displayOrder : 0;
        await updateMember(currentYear, targetMemberId, { ...memberPayload, displayOrder: order });
        setOperationSuccess('Member details updated successfully.');
      } else if (formModalMode === 'archive-edit') {
        // Direct Edit of Archive ExeCom (if enabled)
        const existing = archiveMembers.find(m => m.id === targetMemberId);
        const order = existing ? existing.displayOrder : 0;
        await updateMember(selectedArchiveYear, targetMemberId, { ...memberPayload, displayOrder: order });
        // Refresh archive members
        const updated = await fetchMembersByYear(selectedArchiveYear);
        setArchiveMembers(updated);
        setOperationSuccess('Archive member details updated successfully.');
      } else if (formModalMode === 'staged-edit' && stagedEditIndex !== null) {
        // Edit staged list (Initiate New ExeCom workflow)
        const updatedStaged = [...stagedMembers];
        updatedStaged[stagedEditIndex] = { ...memberPayload, displayOrder: stagedEditIndex };
        setStagedMembers(updatedStaged);
        setOperationSuccess('Staged member updated.');
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Error saving member:', err);
      setOperationError(err.message || 'Failed to save member details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from ExeCom?`)) return;
    try {
      await deleteMember(currentYear, id);
      setOperationSuccess('Member deleted successfully.');
    } catch (err: any) {
      setOperationError(err.message || 'Failed to delete member.');
    }
  };

  const handleArchiveDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from this archived ExeCom?`)) return;
    try {
      await deleteMember(selectedArchiveYear, id);
      const updated = await fetchMembersByYear(selectedArchiveYear);
      setArchiveMembers(updated);
      setOperationSuccess('Archived member deleted.');
    } catch (err: any) {
      setOperationError(err.message || 'Failed to delete archived member.');
    }
  };

  // Up/Down reordering logic for current year members in Firestore
  const handleMoveMember = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMembers.length) return;

    const m1 = currentMembers[index];
    const m2 = currentMembers[targetIndex];

    try {
      const tempOrder = m1.displayOrder;
      await updateMember(currentYear, m1.id, { displayOrder: m2.displayOrder });
      await updateMember(currentYear, m2.id, { displayOrder: tempOrder });
    } catch (err: any) {
      console.error('Reorder failed:', err);
      setOperationError('Failed to swap display orders.');
    }
  };

  // Up/Down reordering logic for staged members (in-memory)
  const handleMoveStaged = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stagedMembers.length) return;

    const updated = [...stagedMembers];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate displayOrder based on array position
    const reordered = updated.map((m, idx) => ({ ...m, displayOrder: idx }));
    setStagedMembers(reordered);
  };

  // Excel file upload parser trigger
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingExcel(true);
    setInitiateError(null);
    setExcelPreview(null);

    try {
      const result = await parseExcelFile(file);
      setExcelPreview(result);
      if (result.members && result.members.length > 0) {
        setStagedMembers(result.members);
      }
    } catch (err: any) {
      console.error('Excel parse failed:', err);
      setInitiateError(err.message || 'Excel upload validation failed. Ensure headers match the template.');
    } finally {
      setParsingExcel(false);
      e.target.value = ''; // Reset input element
    }
  };

  // Publish New ExeCom to Firestore
  const handlePublishNewExeCom = async () => {
    if (!newYearId.trim()) {
      setInitiateError('Please enter a valid Academic Year (e.g. 2027-28).');
      return;
    }
    const yearPattern = /^\d{4}-\d{2}$/;
    if (!yearPattern.test(newYearId.trim())) {
      setInitiateError('Academic Year format must be YYYY-YY (e.g. 2027-28).');
      return;
    }
    if (stagedMembers.length === 0) {
      setInitiateError('Cannot publish an empty committee. Add some members.');
      return;
    }

    if (!window.confirm(`Are you sure you want to publish the new ExeCom for academic year ${newYearId}? The older ExeCom will be archived.`)) {
      return;
    }

    setPublishing(true);
    setInitiateError(null);

    try {
      await publishNewExeCom(newYearId.trim(), stagedMembers);
      setOperationSuccess(`Successfully published ExeCom for Academic Year ${newYearId}!`);
      
      // Reset staging state
      setNewYearId('');
      setInitiateMethod(null);
      setStagedMembers([]);
      setExcelPreview(null);

      // Return to current tab
      setActiveSubTab('current');
    } catch (err: any) {
      console.error('Publish failed:', err);
      setInitiateError(err.message || 'Failed to publish new ExeCom. Check console logs.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDuplicateArchive = (archiveYear: string, membersList: ExeComMember[]) => {
    if (window.confirm(`Copy all ${membersList.length} members of ExeCom ${archiveYear} into the new ExeCom creator?`)) {
      setNewYearId('');
      setInitiateMethod('manual');
      // Strip IDs and database specific tags, reset orders
      const copied = membersList.map((m, index) => ({
        name: m.name,
        mulearnId: m.mulearnId,
        position: m.position,
        roleTitle: m.roleTitle || m.position,
        branch: m.branch,
        year: m.year,
        email: m.email,
        phone: m.phone,
        dob: m.dob,
        imageUrl: m.imageUrl,
        socials: {
          linkedin: m.socials?.linkedin || '',
          github: m.socials?.github || '',
          instagram: m.socials?.instagram || '',
          twitter: m.socials?.twitter || '',
          website: m.socials?.website || ''
        },
        bio: m.bio,
        displayOrder: index,
        isActive: true
      }));
      setStagedMembers(copied);
      setActiveSubTab('initiate');
    }
  };

  // Client search/filtering for lists
  const filteredCurrentMembers = currentMembers.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mulearnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = positionFilter === 'all' || m.position === positionFilter;
    return matchQuery && matchFilter;
  });

  const filteredArchiveMembers = archiveMembers.filter((m) => {
    const matchQuery =
      m.name.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      m.mulearnId.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      m.position.toLowerCase().includes(archiveSearchQuery.toLowerCase());
    const matchFilter = archivePositionFilter === 'all' || m.position === archivePositionFilter;
    return matchQuery && matchFilter;
  });

  return (
    <div className="space-y-6 text-xs text-slate-800 animate-fade-in">
      
      {/* Loading Overlay */}
      {(saving || publishing || parsingExcel) && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-[#eef0f6] shadow-xl max-w-xs text-center space-y-4">
            <Loader2 className="h-8 w-8 text-[#6b2ff2] animate-spin" />
            <h3 className="font-bold text-slate-800 text-sm">
              {saving && 'Saving Member Data'}
              {publishing && 'Publishing New ExeCom'}
              {parsingExcel && 'Parsing Spreadsheet'}
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              {saving && 'Writing member configurations to Firestore...'}
              {publishing && 'Creating the new academic year collection and updating pointer...'}
              {parsingExcel && 'Decoding, parsing sheet, and running backend validations...'}
            </p>
          </div>
        </div>,
        document.body
      )}
      
      {/* Dynamic Success / Error Toasts */}
      {operationSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 font-bold justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5" />
            <span>{operationSuccess}</span>
          </div>
          <button onClick={() => setOperationSuccess(null)} className="hover:text-emerald-800 font-normal">Dismiss</button>
        </div>
      )}
      {operationError && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>{operationError}</span>
          </div>
          <button onClick={() => setOperationError(null)} className="hover:text-rose-800 font-normal">Dismiss</button>
        </div>
      )}

      {/* ExeCom Module Navigation Sub-Tabs */}
      <div className="flex border-b border-[#ece3fa] gap-6 text-sm font-semibold mb-6">
        <button
          onClick={() => setActiveSubTab('current')}
          className={`pb-3.5 border-b-2 px-1 transition-colors cursor-pointer ${
            activeSubTab === 'current'
              ? 'border-[#6b2ff2] text-[#6b2ff2]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Current ExeCom
        </button>
        <button
          onClick={() => setActiveSubTab('initiate')}
          className={`pb-3.5 border-b-2 px-1 transition-colors cursor-pointer ${
            activeSubTab === 'initiate'
              ? 'border-[#6b2ff2] text-[#6b2ff2]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Initiate New ExeCom
        </button>
        <button
          onClick={() => setActiveSubTab('archive')}
          className={`pb-3.5 border-b-2 px-1 transition-colors cursor-pointer ${
            activeSubTab === 'archive'
              ? 'border-[#6b2ff2] text-[#6b2ff2]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Archive
        </button>
      </div>

      {/* TAB CONTENT: 1. Current ExeCom */}
      {activeSubTab === 'current' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-[#eef0f6] shadow-sm">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search current members by name, ID, position..."
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] pl-10 pr-4 py-3 text-slate-800 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
            </div>

            {/* Filter & Actions */}
            <div className="flex items-center gap-3">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#fcfbfe] px-3 py-2.5 text-slate-600 focus:border-[#6320ee] focus:outline-none"
              >
                <option value="all">All Positions</option>
                {PREDEFINED_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>

              <button
                onClick={() => openAddModal('add')}
                className="inline-flex items-center gap-1.5 bg-[#6b2ff2] hover:bg-[#5a24d1] text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl border border-[#eef0f6] bg-white overflow-hidden shadow-sm">
            {loadingCurrent ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                Loading ExeCom members data from Firestore...
              </div>
            ) : filteredCurrentMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#eef0f6] text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-[#fcfbfe]">
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Avatar</th>
                      <th className="px-6 py-4">Member Info</th>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f7f5fd]/80">
                    {filteredCurrentMembers.map((member, idx) => (
                      <tr key={member.id} className="group hover:bg-[#fcfbfe] transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-semibold w-16">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveMember(idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-[#6b2ff2] disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveMember(idx, 'down')}
                              disabled={idx === filteredCurrentMembers.length - 1}
                              className="text-slate-400 hover:text-[#6b2ff2] disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-16">
                          <img
                            src={member.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                            alt={member.name}
                            className="h-10 w-10 rounded-full border border-[#d4baff] object-cover bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-[12px]">{member.name}</span>
                            <span className="text-[10px] font-semibold text-slate-450 tracking-wider uppercase">
                              ID: {member.mulearnId} • {member.branch} {member.year}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-[#f1e9ff] text-[#6b2ff2] px-3 py-1 font-bold">
                            {member.roleTitle || member.position}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5 text-slate-500">
                            <span>{member.email || '-'}</span>
                            <span>{member.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openAddModal('edit', member)}
                              className="p-2 text-slate-400 hover:text-[#6b2ff2] hover:bg-[#f1e9ff]/50 rounded-lg cursor-pointer transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                No current ExeCom members found matching selection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. Initiate New ExeCom */}
      {activeSubTab === 'initiate' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#eef0f6] shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-800 border-b border-[#eef0f6] pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#6b2ff2]" />
              <span>Step 1: Set New Year & Choose Method</span>
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Academic Year ID *
                </label>
                <input
                  type="text"
                  value={newYearId}
                  onChange={(e) => setNewYearId(e.target.value)}
                  placeholder="e.g. 2027-28"
                  className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1">Must be in form YYYY-YY (e.g. 2027-28)</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Choose Setup Method
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setInitiateMethod('manual');
                      setStagedMembers([]);
                      setExcelPreview(null);
                    }}
                    className={`flex-1 border p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${
                      initiateMethod === 'manual'
                        ? 'border-[#6b2ff2] bg-[#f8f5ff] text-[#6b2ff2]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Manual Entry
                  </button>

                  <button
                    onClick={() => {
                      setInitiateMethod('excel');
                      setStagedMembers([]);
                      setExcelPreview(null);
                    }}
                    className={`flex-1 border p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${
                      initiateMethod === 'excel'
                        ? 'border-[#6b2ff2] bg-[#f8f5ff] text-[#6b2ff2]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Import from Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* METHOD 1: MANUAL SETUP */}
          {initiateMethod === 'manual' && (
            <div className="bg-white p-6 rounded-2xl border border-[#eef0f6] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#eef0f6] pb-3">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-[#6b2ff2]" />
                  <span>Staged Members List ({stagedMembers.length})</span>
                </h2>
                <button
                  onClick={() => openAddModal('staged-edit')}
                  disabled={!newYearId.trim()}
                  className="inline-flex items-center gap-1 bg-[#6b2ff2] hover:bg-[#5a24d1] disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Member Manually
                </button>
              </div>

              {stagedMembers.length > 0 ? (
                <div className="border border-[#eef0f6] rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#fcfbfe] border-b border-[#eef0f6] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 w-16">Reorder</th>
                        <th className="px-4 py-3">Member Details</th>
                        <th className="px-4 py-3">Position</th>
                        <th className="px-4 py-3">Email & Phone</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f7f5fd]/80">
                      {stagedMembers.map((member, index) => (
                        <tr key={index} className="hover:bg-[#fcfbfe] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleMoveStaged(index, 'up')}
                                disabled={index === 0}
                                className="text-slate-400 hover:text-[#6b2ff2] disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveStaged(index, 'down')}
                                disabled={index === stagedMembers.length - 1}
                                className="text-slate-400 hover:text-[#6b2ff2] disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800">{member.name}</div>
                            <div className="text-[10px] text-slate-450 uppercase font-semibold">
                              ID: {member.mulearnId} • {member.branch} {member.year}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-[#f1e9ff] text-[#6b2ff2] px-2 py-0.5 font-bold">
                              {member.roleTitle || member.position}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div>{member.email}</div>
                            <div>{member.phone || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openAddModal('staged-edit', member, index)}
                                className="p-1.5 text-slate-400 hover:text-[#6b2ff2] hover:bg-[#f1e9ff]/50 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${member.name} from staging list?`)) {
                                    setStagedMembers(stagedMembers.filter((_, i) => i !== index));
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  {newYearId ? 'No members added yet. Click "Add Member Manually" above to begin staging.' : 'Please enter an Academic Year ID in Step 1 first.'}
                </div>
              )}
            </div>
          )}

          {/* METHOD 2: EXCEL IMPORT */}
          {initiateMethod === 'excel' && (
            <div className="bg-white p-6 rounded-2xl border border-[#eef0f6] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#eef0f6] pb-3">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="h-4.5 w-4.5 text-[#6b2ff2]" />
                  <span>Upload Spreadsheet</span>
                </h2>
              </div>

              {!excelPreview ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#d4baff] bg-[#fdfcff] rounded-2xl text-center space-y-3">
                  <FileSpreadsheet className="h-10 w-10 text-[#6b2ff2]" />
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">Upload Excel Spreadsheet</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports format .xlsx, .xls</p>
                  </div>
                  <label className="bg-[#6b2ff2] hover:bg-[#5a24d1] text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-sm">
                    {parsingExcel ? 'Parsing Spreadsheet...' : 'Select File'}
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelUpload}
                      disabled={parsingExcel || !newYearId.trim()}
                      className="hidden"
                    />
                  </label>
                  {!newYearId.trim() && (
                    <p className="text-[10px] text-rose-500 font-semibold">Please fill the Academic Year in Step 1 before uploading.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50 font-bold">
                    <div className="text-center">
                      <div className="text-slate-400 text-[10px] uppercase">Members Found</div>
                      <div className="text-xl text-slate-850">{excelPreview.summary.totalFound}</div>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <div className="text-emerald-500 text-[10px] uppercase">Valid Records</div>
                      <div className="text-xl text-emerald-600">{excelPreview.summary.validCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-rose-500 text-[10px] uppercase">Rows with Errors</div>
                      <div className="text-xl text-rose-600">{excelPreview.summary.errorCount}</div>
                    </div>
                  </div>

                  {/* Errors block */}
                  {excelPreview.errors.length > 0 && (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 space-y-2">
                      <div className="font-bold text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5" />
                        <span>Validation Errors Detected ({excelPreview.errors.length}):</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-[10px] max-h-36 overflow-y-auto">
                        {excelPreview.errors.map((err, idx) => (
                          <li key={idx}>
                            <strong>Row {err.row}</strong>: {err.field} — {err.error} (Provided: <em>"{err.value || 'None'}"</em>)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm">Spreadsheet Records Preview</h3>
                      <button
                        onClick={() => setExcelPreview(null)}
                        className="text-[10px] font-semibold text-slate-450 hover:text-slate-700 border border-slate-200 bg-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset Upload
                      </button>
                    </div>

                    <div className="border border-[#eef0f6] rounded-xl overflow-hidden">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-[#fcfbfe] border-b border-[#eef0f6] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3">Member Details</th>
                            <th className="px-4 py-3">Position</th>
                            <th className="px-4 py-3">Email & Contact</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f7f5fd]/80">
                          {stagedMembers.map((member, index) => (
                            <tr key={index} className="hover:bg-[#fcfbfe] transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800">{member.name}</div>
                                <div className="text-[10px] text-slate-450 uppercase font-semibold">
                                  ID: {member.mulearnId} • {member.branch} {member.year}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded-full bg-[#f1e9ff] text-[#6b2ff2] px-2 py-0.5 font-bold">
                                  {member.roleTitle || member.position}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                <div>{member.email}</div>
                                <div>{member.phone || '-'}</div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => openAddModal('staged-edit', member, index)}
                                  className="p-1.5 text-slate-400 hover:text-[#6b2ff2] hover:bg-[#f1e9ff]/50 rounded-lg cursor-pointer"
                                  title="Edit Row"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PUBLISH TRIGGER PANEL */}
          {initiateMethod && stagedMembers.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#eef0f6] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Ready to Publish?</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Publishing creates the collection `execom/{newYearId}` and switches the active pointer to it.
                </p>
                {excelPreview && excelPreview.summary.errorCount > 0 && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">
                    ⚠️ Validation errors must be resolved by editing rows or re-uploading before publishing.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInitiateMethod(null);
                    setStagedMembers([]);
                    setExcelPreview(null);
                    setNewYearId('');
                  }}
                  className="border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishNewExeCom}
                  disabled={publishing || (excelPreview !== null && excelPreview.summary.errorCount > 0)}
                  className="bg-[#6b2ff2] hover:bg-[#5a24d1] disabled:opacity-45 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {publishing ? 'Publishing...' : 'Publish New ExeCom'}
                </button>
              </div>
            </div>
          )}
          {initiateError && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span>{initiateError}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. Archive */}
      {activeSubTab === 'archive' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-[#eef0f6] shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <span className="font-bold text-slate-700 text-sm">Select ExeCom Year:</span>
              <select
                value={selectedArchiveYear}
                onChange={(e) => setSelectedArchiveYear(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2.5 text-slate-700 focus:border-[#6320ee] focus:outline-none font-bold"
              >
                {allYears.length > 0 ? (
                  allYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr === currentYear ? '(Active)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No archives available</option>
                )}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDuplicateArchive(selectedArchiveYear, archiveMembers)}
                disabled={archiveMembers.length === 0}
                className="inline-flex items-center gap-1 border border-[#cdb6f8] hover:bg-[#f8f5ff] text-[#6b2ff2] px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-40"
                title="Duplicate into new committee staging"
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => exportExcelFile(selectedArchiveYear, archiveMembers)}
                disabled={archiveMembers.length === 0}
                className="inline-flex items-center gap-1 border border-[#cdb6f8] hover:bg-[#f8f5ff] text-[#6b2ff2] px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                <span>Export to Excel</span>
              </button>

              <button
                onClick={() => setIsEditArchiveEnabled(!isEditArchiveEnabled)}
                className={`px-3 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                  isEditArchiveEnabled
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isEditArchiveEnabled ? 'Disable Editing' : 'Enable Editing'}
              </button>
            </div>
          </div>

          {/* Search Toolbar for Archive */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-[#eef0f6] shadow-sm">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                placeholder="Search archive members by name, ID, position..."
                className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] pl-10 pr-4 py-3 text-slate-800 focus:border-[#6320ee] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={archivePositionFilter}
                onChange={(e) => setArchivePositionFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#fcfbfe] px-3 py-2.5 text-slate-600 focus:border-[#6320ee] focus:outline-none"
              >
                <option value="all">All Positions</option>
                {PREDEFINED_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Archive Table */}
          <div className="rounded-2xl border border-[#eef0f6] bg-white overflow-hidden shadow-sm">
            {loadingArchive ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                Loading archived ExeCom members from Firestore...
              </div>
            ) : filteredArchiveMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#eef0f6] text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-[#fcfbfe]">
                      <th className="px-6 py-4">Display Order</th>
                      <th className="px-6 py-4">Avatar</th>
                      <th className="px-6 py-4">Member Info</th>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Email & Phone</th>
                      {isEditArchiveEnabled && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f7f5fd]/80">
                    {filteredArchiveMembers.map((member) => (
                      <tr key={member.id} className="group hover:bg-[#fcfbfe] transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-semibold w-24">
                          # {member.displayOrder}
                        </td>
                        <td className="px-6 py-4 w-16">
                          <img
                            src={member.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                            alt={member.name}
                            className="h-10 w-10 rounded-full border border-[#d4baff] object-cover bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-[12px]">{member.name}</span>
                            <span className="text-[10px] font-semibold text-slate-450 tracking-wider uppercase">
                              ID: {member.mulearnId} • {member.branch} {member.year}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-[#f1e9ff] text-[#6b2ff2] px-3 py-1 font-bold">
                            {member.roleTitle || member.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <div>{member.email || '-'}</div>
                          <div>{member.phone || '-'}</div>
                        </td>
                        {isEditArchiveEnabled && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openAddModal('archive-edit', member)}
                                className="p-2 text-slate-400 hover:text-[#6b2ff2] hover:bg-[#f1e9ff]/50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleArchiveDeleteMember(member.id, member.name)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                No archived members found for selected year.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DYNAMIC FORM MODAL (Add / Edit / Staged Edit) */}
      {isFormModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#eef0f6] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eef0f6] p-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-[#6b2ff2]" />
                <span>
                  {formModalMode === 'add' && 'Add New ExeCom Member'}
                  {formModalMode === 'edit' && `Edit Member: ${formData.name}`}
                  {formModalMode === 'archive-edit' && `Edit Archived Member: ${formData.name}`}
                  {formModalMode === 'staged-edit' && 'Edit Staged Member Details'}
                </span>
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-[#f4edff] hover:text-[#6b2ff2] border border-[#ece3fa] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    MuLearn ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mulearnId}
                    onChange={(e) => setFormData({ ...formData, mulearnId: e.target.value })}
                    placeholder="e.g. john@mulearn"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                  >
                    {PREDEFINED_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="e.g. CSE"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Academic Year / Semester
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g. 3rd Year"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    placeholder="e.g. DD-MM-YYYY"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Bio / About Member
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief bio describing interests or campus role..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-[#fcfbfe] px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:border-[#6320ee] focus:outline-none resize-none"
                  />
                </div>

                {/* Socials Block */}
                <div className="sm:col-span-2 border-t border-[#eef0f6] pt-3">
                  <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-3">
                    Social Media Handles
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold mb-0.5 block">LinkedIn URL</label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-[#fcfbfe] px-3 py-1.5 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold mb-0.5 block">GitHub URL</label>
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-[#fcfbfe] px-3 py-1.5 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold mb-0.5 block">Instagram URL</label>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-[#fcfbfe] px-3 py-1.5 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold mb-0.5 block">Twitter / X URL</label>
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-[#fcfbfe] px-3 py-1.5 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-slate-500 font-semibold mb-0.5 block">Personal Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-[#fcfbfe] px-3 py-1.5 text-slate-800 focus:border-[#6320ee] focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-[#eef0f6] pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6b2ff2] hover:bg-[#5a24d1] text-white font-bold px-5 py-2 rounded-xl shadow-sm cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ExeComManager;
