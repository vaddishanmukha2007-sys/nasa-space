import React, { useState, useRef } from 'react';
import { ClassificationHistoryItem } from '../types';
import { CLASSIFICATION_DETAILS } from '../constants';
import { EditIcon } from './Icons';

interface ProfilePageProps {
  history: ClassificationHistoryItem[];
}

const HistoryItemCard: React.FC<{ item: ClassificationHistoryItem }> = ({ item }) => {
  const resultDetails = CLASSIFICATION_DETAILS[item.result];
  return (
    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50 transform transition-all duration-300 hover:scale-105 hover:border-amber-500/50 hover:bg-slate-700 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <p className="text-xs text-gray-400">{item.timestamp}</p>
          <div className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full border ${resultDetails.color}`}>
            {resultDetails.label}
          </div>
        </div>
        <div className="text-right text-xs text-gray-300 font-mono space-y-1">
          <p>Period: <span className="text-amber-400">{item.data.orbitalPeriod}d</span></p>
          <p>Radius: <span className="text-amber-400">{item.data.planetaryRadius} R⊕</span></p>
          <p>Temp: <span className="text-amber-400">{item.data.stellarTemperature} K</span></p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ history }) => {
  const [avatar, setAvatar] = useState('https://api.dicebear.com/8.x/bottts-neutral/svg?seed=exoclassifier');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [joinDate, setJoinDate] = useState('Jan 2024');

  // Temporary state for edits
  const [editUserName, setEditUserName] = useState(userName);
  const [editJoinDate, setEditJoinDate] = useState(joinDate);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditUserName(userName);
    setEditJoinDate(joinDate);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setUserName(editUserName);
    setJoinDate(editJoinDate);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };


  return (
    <main className="mt-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6 text-center">
             <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img 
                src={avatar} 
                alt="User Avatar" 
                className="w-full h-full rounded-full border-4 border-amber-500/50 bg-slate-700 object-cover" 
              />
              <div 
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={handleAvatarClick}
                role="button"
                aria-label="Change profile picture"
              >
                <EditIcon className="w-8 h-8 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                aria-hidden="true"
              />
            </div>
            
            {!isEditing ? (
                <>
                    <h2 className="text-2xl font-bold text-white">{userName}</h2>
                    <p className="text-gray-400">guest@exoplanet-detector.ai</p>
                    <p className="text-xs text-gray-500 mt-2">Member Since: {joinDate}</p>
                    <button 
                        onClick={handleEdit}
                        className="mt-6 w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-lg">
                        Edit Profile
                    </button>
                </>
            ) : (
                <div className="space-y-4 text-left">
                    <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input 
                            type="text" 
                            id="userName" 
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            className="shadow-inner appearance-none border rounded-lg w-full py-2 px-3 text-gray-200 bg-slate-900/60 border-slate-600 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <p className="text-gray-500 text-sm py-2 px-3">guest@exoplanet-detector.ai</p>
                    </div>
                    <div>
                        <label htmlFor="joinDate" className="block text-sm font-medium text-gray-300 mb-1">Member Since</label>
                        <input 
                            type="text" 
                            id="joinDate" 
                            value={editJoinDate}
                            onChange={(e) => setEditJoinDate(e.target.value)}
                            className="shadow-inner appearance-none border rounded-lg w-full py-2 px-3 text-gray-200 bg-slate-900/60 border-slate-600 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-amber-400">Classification History</h2>
            {history.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-gray-400">No classifications recorded yet.</p>
                <p className="text-sm text-gray-500 mt-2">Classify a candidate on the dashboard to see your history.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
                {history.map(item => <HistoryItemCard key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;