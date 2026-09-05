import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import Logo from './components/Logo';
import { User, Camera, ArrowLeft, CheckCircle, Save, Loader2, BookOpen, MapPin, Calendar, Award } from 'lucide-react';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetExam: 'SSC CGL',
    photoUrl: '',
    fatherName: '',
    motherName: '',
    dob: '',
    qualification: 'Graduate',
    preparationFor: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setFormData(res.data.user);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Convert uploaded image to Base64 for instant preview & storage
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      const res = await API.put('/auth/profile', formData);
      if (res.data?.success) {
        setMessage('Candidate profile updated successfully!');
      }
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center text-indigo-400 font-bold">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-[#080c1e] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg text-white">Student Candidate Dossier</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {message && (
          <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#080c1e] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          
          {/* Photo & Basic Identity Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center shadow-lg">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl cursor-pointer shadow-lg transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-xl font-black text-white">{formData.name || 'Candidate Aspirant'}</h2>
              <p className="text-xs text-slate-400 font-mono">{formData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold rounded-full">
                Target: {formData.targetExam}
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Email Address (Locked)</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full mt-1.5 bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Father's Name</label>
              <input
                type="text"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Mother's Name</label>
              <input
                type="text"
                placeholder="Enter mother's name"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Date of Birth (DOB)</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Highest Education Qualification</label>
              <select
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Graduate">Graduate (B.A/B.Sc/B.Com/B.Tech)</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Professional Degree">Professional Degree (CA/LLB/MBBS)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Primary Target Exam</label>
              <select
                value={formData.targetExam}
                onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="SSC CGL">SSC CGL</option>
                <option value="SSC CHSL">SSC CHSL</option>
                <option value="RRB NTPC">RRB NTPC (Railways)</option>
                <option value="IBPS PO">IBPS PO / Banking</option>
                <option value="UPSC Civil Services">UPSC Civil Services</option>
                <option value="State PSC">State PSC</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Preparation Focus / Streams</label>
              <input
                type="text"
                placeholder="e.g. Quantitative Aptitude & Reasoning"
                value={formData.preparationFor}
                onChange={(e) => setFormData({ ...formData, preparationFor: e.target.value })}
                className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300">Permanent Residential Address</label>
            <textarea
              rows={2}
              placeholder="Enter your address (City, State, Pincode)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full mt-1.5 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Candidate Profile
          </button>

        </form>
      </main>
    </div>
  );
}