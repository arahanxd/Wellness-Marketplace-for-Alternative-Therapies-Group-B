import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Profile } from '../api';
import { DashboardLayout } from '../components/DashboardLayout';

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const sidebarItems = [
    { label: 'Dashboard', path: '/practitioner' },
    { label: 'Profile', path: '/practitioner/profile' },
    { label: 'Upload Degree', path: '/practitioner/degree' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const saveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await api.updateProfile(profile);
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDegreeFile(e.target.files[0]);
    }
  };

  const uploadDegree = async () => {
    if (!degreeFile || !profile) return;
    setLoading(true);
    try {
      await api.uploadDegree(degreeFile, profile.id);
      setMessage('Degree uploaded successfully');
      fetchProfile();
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload degree');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Practitioner Dashboard</h2>

        <div className="mb-4">
          <label className="block">Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block">City:</label>
          <input
            type="text"
            name="city"
            value={profile.city || ''}
            onChange={handleProfileChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block">Country:</label>
          <input
            type="text"
            name="country"
            value={profile.country || ''}
            onChange={handleProfileChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block">Specialization:</label>
          <input
            type="text"
            name="specialization"
            value={profile.specialization || ''}
            onChange={handleProfileChange}
            className="border p-2 w-full"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>

        <hr className="my-6" />

        <div className="mb-4">
          <label className="block">Upload Degree (PDF):</label>
          <input type="file" accept="application/pdf" onChange={handleDegreeChange} />
        </div>

        <button
          onClick={uploadDegree}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Upload Degree'}
        </button>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </DashboardLayout>
  );
}
