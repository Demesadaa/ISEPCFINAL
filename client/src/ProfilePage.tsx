import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  avatar?: string;
  backgroundColor: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalCourses: number;
  totalAssignments: number;
  completedAssignments: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  taskCompletionRate: number;
}

const API = 'http://localhost:4000/api';

export default function ProfilePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const authFetch = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authFetch(`${API}/profile`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch(`${API}/profile/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await fetch(`${API}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        await fetchProfile();
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const updateTheme = async (backgroundColor: string, accentColor: string) => {
    try {
      const response = await authFetch(`${API}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ backgroundColor, accentColor }),
      });

      if (response.ok) {
        await fetchProfile();
        // Update CSS variables for immediate effect
        document.documentElement.style.setProperty('--background-color', backgroundColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <button onClick={() => navigate('/')} className="back-btn">← Back to Dashboard</button>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-section">
          <h3>Avatar</h3>
          <div className="avatar-section">
            <div className="avatar-preview">
              {profile?.avatar ? (
                <img 
                  src={`${API}/profile/avatar/${profile.avatar}`} 
                  alt="Avatar" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {user?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                id="avatar-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="avatar-input" className="file-input-label">
                Choose Image
              </label>
              
              {selectedFile && (
                <div className="upload-preview">
                  <img src={previewUrl!} alt="Preview" className="preview-image" />
                  <button 
                    onClick={uploadAvatar} 
                    disabled={uploading}
                    className="upload-btn"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="profile-section">
          <h3>Statistics</h3>
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalCourses}</div>
                <div className="stat-label">Courses</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalAssignments}</div>
                <div className="stat-label">Assignments</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completedAssignments}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalTasks}</div>
                <div className="stat-label">Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completedTasks}</div>
                <div className="stat-label">Tasks Done</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Customization */}
        <div className="profile-section">
          <h3>Theme Customization</h3>
          <div className="theme-controls">
            <div className="color-control">
              <label>Background Color:</label>
              <input
                type="color"
                value={profile?.backgroundColor || '#111111'}
                onChange={(e) => updateTheme(e.target.value, profile?.accentColor || '#A084E8')}
                className="color-picker"
              />
            </div>
            
            <div className="color-control">
              <label>Accent Color:</label>
              <input
                type="color"
                value={profile?.accentColor || '#A084E8'}
                onChange={(e) => updateTheme(profile?.backgroundColor || '#111111', e.target.value)}
                className="color-picker"
              />
            </div>
          </div>
          
          <div className="theme-preview">
            <h4>Preview:</h4>
            <div 
              className="preview-box"
              style={{
                backgroundColor: profile?.backgroundColor || '#111111',
                borderColor: profile?.accentColor || '#A084E8'
              }}
            >
              <div 
                className="preview-button"
                style={{ backgroundColor: profile?.accentColor || '#A084E8' }}
              >
                Sample Button
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="account-info">
            <div className="info-item">
              <label>Username:</label>
              <span>{user}</span>
            </div>
            <div className="info-item">
              <label>Member since:</label>
              <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Last updated:</label>
              <span>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 