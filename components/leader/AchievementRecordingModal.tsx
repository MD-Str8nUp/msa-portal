"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Scout } from "@/types";

interface AchievementRecordingModalProps {
  scout: Scout;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (achievement: any) => void;
}

const MSA_BADGES = [
  { id: 'salah', name: 'Salah Excellence', category: 'Islamic', description: 'Perfect attendance at daily prayers' },
  { id: 'quran', name: 'Quran Memorization', category: 'Islamic', description: 'Memorized Quran chapters' },
  { id: 'hadith', name: 'Hadith Scholar', category: 'Islamic', description: 'Memorized and explained hadith' },
  { id: 'charity', name: 'Charity Champion', category: 'Islamic', description: 'Organized charity drives' },
  { id: 'leadership', name: 'Leadership', category: 'Character', description: 'Demonstrated leadership skills' },
  { id: 'teamwork', name: 'Teamwork', category: 'Character', description: 'Excellent collaboration with peers' },
  { id: 'honesty', name: 'Honesty', category: 'Character', description: 'Demonstrated truthfulness' },
  { id: 'respect', name: 'Respect', category: 'Character', description: 'Showed respect to all' },
  { id: 'camping', name: 'Camping Expert', category: 'Outdoor', description: 'Camping skills mastery' },
  { id: 'hiking', name: 'Hiking Champion', category: 'Outdoor', description: 'Completed challenging hikes' },
  { id: 'firstaid', name: 'First Aid', category: 'Skills', description: 'First aid certification' },
  { id: 'cooking', name: 'Cooking Skills', category: 'Skills', description: 'Outdoor cooking expertise' },
];

export default function AchievementRecordingModal({ scout, isOpen, onClose, onSubmit }: AchievementRecordingModalProps) {
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [customAchievement, setCustomAchievement] = useState({
    title: '',
    description: '',
    category: 'Other'
  });
  const [achievementType, setAchievementType] = useState<'badge' | 'custom'>('badge');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (achievementType === 'badge' && !selectedBadge) {
      alert('Please select a badge');
      return;
    }
    
    if (achievementType === 'custom' && !customAchievement.title) {
      alert('Please enter achievement title');
      return;
    }

    const achievement = {
      id: `achievement-${Date.now()}`,
      scoutId: scout.id,
      scoutName: scout.name,
      type: achievementType,
      ...(achievementType === 'badge' 
        ? { badge: MSA_BADGES.find(b => b.id === selectedBadge) }
        : { custom: customAchievement }
      ),
      notes,
      awardedBy: 'current-leader', // Would be from auth context
      awardedDate: new Date().toISOString(),
      status: 'awarded'
    };

    onSubmit(achievement);
    
    // Reset form
    setSelectedBadge('');
    setCustomAchievement({ title: '', description: '', category: 'Other' });
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-msa-charcoal">
            Record Achievement for {scout.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Achievement Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Achievement Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="achievementType"
                value="badge"
                checked={achievementType === 'badge'}
                onChange={(e) => setAchievementType(e.target.value as 'badge' | 'custom')}
                className="mr-2"
              />
              MSA Badge
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="achievementType"
                value="custom"
                checked={achievementType === 'custom'}
                onChange={(e) => setAchievementType(e.target.value as 'badge' | 'custom')}
                className="mr-2"
              />
              Custom Achievement
            </label>
          </div>
        </div>

        {/* Badge Selection */}
        {achievementType === 'badge' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Badge
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {MSA_BADGES.map(badge => (
                <Card 
                  key={badge.id}
                  className={`cursor-pointer transition-all ${
                    selectedBadge === badge.id 
                      ? 'ring-2 ring-msa-sage bg-msa-sage/10' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBadge(badge.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{badge.name}</h4>
                        <p className="text-xs text-gray-500">{badge.category}</p>
                        <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      </div>
                      <div className="ml-2">
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          selectedBadge === badge.id 
                            ? 'bg-msa-sage border-msa-sage' 
                            : 'border-gray-300'
                        }`}>
                          {selectedBadge === badge.id && (
                            <svg className="w-4 h-4 text-white mt-0.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Custom Achievement */}
        {achievementType === 'custom' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievement Title
              </label>
              <Input
                value={customAchievement.title}
                onChange={(e) => setCustomAchievement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter achievement title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={customAchievement.description}
                onChange={(e) => setCustomAchievement(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
                rows={3}
                placeholder="Describe the achievement"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={customAchievement.category}
                onChange={(e) => setCustomAchievement(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
              >
                <option value="Islamic">Islamic</option>
                <option value="Character">Character</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Skills">Skills</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-msa-sage focus:border-transparent"
            rows={3}
            placeholder="Add any notes about this achievement..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-msa-sage hover:bg-msa-sage/90 text-white"
          >
            Record Achievement
          </Button>
        </div>
      </div>
    </div>
  );
}