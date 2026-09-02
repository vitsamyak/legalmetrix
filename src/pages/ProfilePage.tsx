import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useNotifications } from '../context/NotificationContext';
import {
  Camera,
  Trash2,
  Upload,
  Check,
  Shield,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  IdCard,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, updateAvatar, removeAvatar } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  // Local form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    organization: user.organization,
    designation: user.designation,
    region: user.region,
  });

  // Photo modal & preview state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Save button state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const prevUserIdRef = useRef(user.id);
  useEffect(() => {
    if (prevUserIdRef.current !== user.id) {
      prevUserIdRef.current = user.id;
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        designation: user.designation,
        region: user.region,
      });
    }
  }, [user]);

  // Check if form has unsaved changes
  const hasChanges =
    formData.name !== user.name ||
    formData.email !== user.email ||
    formData.phone !== user.phone ||
    formData.organization !== user.organization ||
    formData.designation !== user.designation ||
    formData.region !== user.region;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsSaving(true);
    setIsSaved(false);

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setIsSaved(true);
        showToast('Profile updated successfully.', 'success');
        addNotification('Profile Updated', 'Your inspector profile details have been successfully saved.', 'success');
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        showToast(res.error || 'Could not update profile.', 'error');
      }
    } catch {
      showToast('Could not update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Photo Selection with Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    // Size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPreviewImage(compressedUrl);
          } else {
            setPreviewImage(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!previewImage) return;

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 90) return prev;
        return prev + 25;
      });
    }, 120);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      clearInterval(interval);
      setUploadProgress(100);

      const res = await updateAvatar(previewImage);
      if (res.success) {
        showToast('Profile photo updated.', 'success');
        setTimeout(() => {
          setIsPhotoModalOpen(false);
          setPreviewImage(null);
          setUploadProgress(null);
        }, 300);
      } else {
        showToast(res.error || 'Unable to update profile photo. Please try again.', 'error');
        setUploadProgress(null);
      }
    } catch {
      clearInterval(interval);
      setUploadProgress(null);
      showToast('Unable to update profile photo. Please try again.', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeAvatar();
      showToast('Profile photo removed.', 'info');
      setIsPhotoModalOpen(false);
      setPreviewImage(null);
    } catch {
      showToast('Unable to remove photo.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Inspector Profile</h1>
        <p className="text-content-muted mt-1 text-sm">
          Manage your official metrology credentials, badge identity, and contact details.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Identity Header / Avatar Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-white/[0.02] border border-border">
            <div className="flex items-center space-x-5">
              {/* Avatar circle */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-heading font-bold text-3xl shadow-lg">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-white hover:bg-primary-dark shadow-md transition-transform hover:scale-105"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Identity text */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-content font-heading">{user.name}</h2>
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Active Inspector">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-sm text-secondary font-medium">{user.designation}</p>
                <p className="text-xs text-content-muted">{user.organization} • {user.region}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPhotoModalOpen(true)}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Change Profile Photo
              </Button>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Employee ID (read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Employee ID (Statutory)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={user.employeeId}
                    className="w-full pl-10 pr-4 py-2.5 bg-obsidian/60 border border-border/50 rounded-xl text-content-faint text-sm outline-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Official Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Contact Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Organization / Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Official Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Region / Zone */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Assigned Region / Zone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-faint">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons & UX */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <span className="text-xs text-content-muted">
                {hasChanges ? 'You have unsaved changes.' : 'Profile information is up to date.'}
              </span>

              <div className="flex items-center space-x-3">
                {isSaved && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Saved
                  </span>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!hasChanges || isSaving}
                  isLoading={isSaving}
                  className="min-w-[130px]"
                >
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Photo Modal / Dialog */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#121A2E] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-heading font-bold text-white">Change Profile Photo</h3>
                <button
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setPreviewImage(null);
                    setUploadError(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Current or Preview Image in Square Crop Container */}
              <div className="flex flex-col items-center justify-center py-2 space-y-4">
                <div className="w-36 h-36 rounded-2xl overflow-hidden bg-[#090D1A] border-2 border-dashed border-primary/40 flex items-center justify-center shadow-inner relative">
                  {previewImage ? (
                    <img src={previewImage} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-bold text-4xl text-primary">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}

                  {uploadProgress !== null && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="bg-primary h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-white font-mono">{uploadProgress}%</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400">Supported: JPG, JPEG, PNG, WEBP (Max 5MB)</span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />

              {/* Action Buttons in Modal */}
              <div className="space-y-3 pt-2">
                {previewImage ? (
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      className="flex-1 justify-center"
                      onClick={handleUploadPhoto}
                      disabled={uploadProgress !== null}
                    >
                      Apply & Save Photo
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPreviewImage(null)}
                      disabled={uploadProgress !== null}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Upload New Image
                    </Button>

                    {user.avatar && (
                      <Button
                        variant="danger"
                        className="w-full justify-center"
                        onClick={handleRemovePhoto}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Remove Current Photo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
