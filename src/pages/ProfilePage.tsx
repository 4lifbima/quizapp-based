import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../lib/supabase';
import { User, Mail, Calendar, Edit2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess(true);
      setIsEditing(false);
      await fetchProfile();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-[#571fff] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl mb-6">
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#571fff] to-[#8040ff] h-32"></div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
              <User size={64} className="text-[#571fff]" />
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#571fff] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4516cc] transition-colors flex items-center gap-2 shadow-lg shadow-[#571fff]/30"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile?.username || '');
                    setError('');
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#571fff] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4516cc] transition-colors flex items-center gap-2 shadow-lg shadow-[#571fff]/30 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#571fff] focus:outline-none transition-colors"
                  placeholder="Enter username"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <User size={20} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{profile?.username}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <Mail size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar size={20} className="text-gray-400" />
                <span className="font-medium text-gray-900">
                  {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
