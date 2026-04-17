"use client";

import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Loader2, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteSubject, updateSubject, addSubject } from '@/app/actions';

interface SubjectRowProps {
  subject: any;
  programId: string;
  isOption?: boolean;
}

export default function SubjectRow({ subject, programId, isOption }: SubjectRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [optionLoading, setOptionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: subject.name,
    code: subject.code || "",
    credits: subject.credits,
    isGroup: subject.isGroup || false,
    category: subject.category || ""
  });

  const [optionData, setOptionData] = useState({
    name: "",
    code: "",
    credits: subject.credits
  });

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${subject.name}?`)) return;
    setIsDeleting(true);
    await deleteSubject(subject.id, programId);
    setIsDeleting(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateSubject(subject.id, programId, {
      name: formData.name,
      code: formData.code,
      credits: parseFloat(formData.credits.toString()),
      isGroup: formData.isGroup,
      category: formData.category
    });
    setIsUpdating(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error || "Failed to update subject");
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setOptionLoading(true);
    const res = await addSubject(subject.semesterId, programId, {
      ...optionData,
      credits: parseFloat(optionData.credits.toString()),
      parentId: subject.id
    });
    setOptionLoading(false);
    if (res.success) {
      setIsAddingOption(false);
      setOptionData({ name: "", code: "", credits: subject.credits });
    } else {
      alert(res.error || "Failed to add option");
    }
  };

  if (isAddingOption) {
    return (
      <tr className="border-b border-emerald-500/10 bg-emerald-500/[0.02]">
        <td colSpan={4} className="p-4 pl-12">
          <form onSubmit={handleAddOption} className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest mr-2">
                <ChevronRight className="h-3 w-3" /> Add Option to Group
             </div>
             <input value={optionData.code} onChange={e => setOptionData({...optionData, code: e.target.value})} placeholder="Code" className="w-24 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500/30" required />
             <input value={optionData.name} onChange={e => setOptionData({...optionData, name: e.target.value})} placeholder="Option Name" className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500/30" required />
             <input type="number" step="0.5" value={optionData.credits} onChange={e => setOptionData({...optionData, credits: e.target.value as any})} placeholder="CR" className="w-16 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500/30 text-center" required />
             <button type="submit" disabled={optionLoading} className="h-8 px-4 rounded-lg bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50">
               {optionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Option"}
             </button>
             <button type="button" onClick={() => setIsAddingOption(false)} className="p-2 text-muted-foreground hover:text-foreground">
               <X className="h-4 w-4" />
             </button>
          </form>
        </td>
      </tr>
    );
  }

  if (isEditing) {
    return (
      <tr className={cn("border-b border-emerald-500/20 bg-emerald-500/5", isOption && "bg-emerald-500/[0.01]")}>
        <td className={cn("px-4 py-4", isOption && "pl-12")}>
          <input 
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-emerald-500/50 outline-none font-mono"
            placeholder="Code"
          />
        </td>
        <td className="px-4 py-4 space-y-2">
          <input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-emerald-500/50 outline-none"
            placeholder="Name"
          />
          <input 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider focus:border-emerald-500/30 outline-none font-bold"
            placeholder="Category (e.g. Core, Elective)"
          />
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <input 
              type="number"
              step="0.5"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value as any })}
              className="w-20 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-emerald-500/50 outline-none text-center font-bold"
              placeholder="CR"
            />
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input 
                type="checkbox"
                checked={formData.isGroup}
                onChange={(e) => setFormData({ ...formData, isGroup: e.target.checked })}
                className="hidden"
              />
              <div 
                onClick={() => setFormData(p => ({ ...p, isGroup: !p.isGroup }))}
                className={`w-8 h-4 rounded-full transition-all relative ${formData.isGroup ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all transform ${formData.isGroup ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground group-hover:text-emerald-500 transition-colors">Group</span>
            </label>
          </div>
        </td>
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setFormData({ name: subject.name, code: subject.code || "", credits: subject.credits, isGroup: subject.isGroup || false, category: subject.category || "" });
              }}
              disabled={isUpdating}
              className="p-2 text-muted-foreground hover:bg-muted/10 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={cn(
      "border-b border-border/30 group/row hover:bg-card/20 transition-colors", 
      isOption && "bg-card/10 opacity-80"
    )}>
      <td className={cn("px-4 py-4 font-mono text-sm font-bold flex items-center gap-2", isOption ? "pl-12 text-muted-foreground" : "text-emerald-500 uppercase")}>
        {isOption && <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />}
        {subject.code}
      </td>
      <td className={cn("px-4 py-4 font-bold", isOption ? "text-muted-foreground italic" : "text-foreground")}>
        {subject.name}
        {subject.category && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-muted-foreground/10 text-[8px] uppercase tracking-widest font-black inline-block align-middle">
            {subject.category}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-center font-black text-muted-foreground">{subject.credits}</td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {subject.isGroup && (
            <button 
              onClick={() => setIsAddingOption(true)}
              className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 transition-all font-black text-[9px] uppercase tracking-widest mr-2 border border-emerald-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Option</span>
            </button>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
