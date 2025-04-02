import { useCVStore } from '@/features/store/CVStore';
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button'; // Import Button

interface ProfileCardProps {
  onProfileSave: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onProfileSave }) => {
    const personalData = useCVStore((state) => state.personalData);
    const setPersonalData = useCVStore((state) => state.setPersonalData);

  const handleSave = () => {
    console.log('Profile Saved');
    onProfileSave();
  };

  return (
    <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium w-28">Name:</span>
            <Input
              className="w-full"
              type="text"
              placeholder="Enter your full name"
              onChange={(e) => {
                setPersonalData({ ...personalData, name: e.target.value });
              }}
              value={personalData?.name || ''}
              onBlur={(e) => {
                setPersonalData({ ...personalData, name: e.target.value });
              }}
            />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium w-28">Email:</span>
            <Input
              type="email"
              placeholder="Enter your email address"
              onChange={(e) => {
                setPersonalData({ ...personalData, email: e.target.value });
              }
              }
              value={personalData?.email || ''}
              onBlur={(e) => {
                setPersonalData({ ...personalData, email: e.target.value });
              }}
            />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium w-28">Phone:</span>
            <Input
              className="w-full"
              type="tel"
              placeholder="Enter your phone number"
              value={personalData?.phone || ''}
              onChange={(e) => {
                setPersonalData({ ...personalData, phone: e.target.value });
              }
              }
              onBlur={(e) => {
                setPersonalData({ ...personalData, phone: e.target.value });
              }}
            />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-medium w-28">Location:</span>
            <Input
              className="w-full"
              type="text"
              placeholder="Enter your location/address"
              onChange={(e) => {
                setPersonalData({ ...personalData, address: e.target.value });
              }
              }
              value={personalData?.address || ''}
              onBlur={(e) => {
                setPersonalData({ ...personalData, address: e.target.value });
              }}
            />
        </div>
        <Button onClick={() => handleSave()}>Save</Button>
      </div>
    </div>
  );
};

export default ProfileCard;