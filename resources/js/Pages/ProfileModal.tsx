import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Eye, EyeOff, User } from 'lucide-react';
import { PageProps } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: PageProps['auth'];
  onProfileUpdate: (updatedUser: any) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  auth,
  onProfileUpdate
}) => {
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen && auth.user) {
      setFormData({
        name: auth.user.name || '',
        email: auth.user.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      setAvatarPreview(auth.user.avatar || null);
      setAvatarFile(null);
      setErrors({});
      setMessage('');
    }
  }, [isOpen, auth.user]);

  // Handle clicking outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setErrors((prev: any) => ({
          ...prev,
          avatar: ['Please select a valid image file.']
        }));
        return;
      }

      if (file.size > 2048 * 1024) { // 2MB
        setErrors((prev: any) => ({
          ...prev,
          avatar: ['Image file size should be less than 2MB.']
        }));
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear avatar error
      if (errors.avatar) {
        setErrors((prev: any) => ({
          ...prev,
          avatar: null
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);

      if (formData.current_password) {
        formDataToSend.append('current_password', formData.current_password);
      }

      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch('/profile/update-modal', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        onProfileUpdate(data.user);

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          password: '',
          password_confirmation: '',
        }));

        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setMessage(data.message || 'An error occurred while updating your profile.');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 transition-opacity bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sora">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 border border-[#E3E2FF] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-8 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-[#2B235A] dark:text-gray-300">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 bg-[#F5F5FA] hover:text-[#2B235A] dark:hover:text-gray-300 focus:outline-none focus:ring-0 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes('successfully')
                ? 'bg-[#F5F5FA] text-green-700 border border-[#E3E2FF]'
                : 'bg-[#F5F5FA] text-red-700 border border-[#E3E2FF]'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Section Header */}
          <div className="flex items-center mb-8">
            <div className="relative mr-6">
              <div className="w-20 h-20 bg-[#F5F5FA] dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#2B235A]" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2B235A] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#2B235A] dark:text-white mb-2">
                Your Profile
              </h3>
              <p className="text-[#474750] dark:text-gray-400 mb-4">
                Update your profile information
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 border border-[#E3E2FF] dark:border-gray-600 rounded-lg text-sm font-medium text-[#2B235A] dark:text-gray-300 bg-[#FAFAFC] focus:outline-none focus:ring-0 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 transition-colors duration-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Profile
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {errors.avatar && (
                <p className="text-red-600 text-sm mt-2">{errors.avatar[0]}</p>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-[#2B235A] dark:text-gray-300 mb-6">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-[#2B235A] dark:text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-[#E3E2FF] dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-[#E3E2FF] bg-[#FAFAFC] dark:bg-gray-700 text-[#2B235A] dark:text-white"
                  required
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#2B235A] dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-[#E3E2FF] dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-[#E3E2FF] bg-[#FAFAFC] dark:bg-gray-700 text-[#2B235A] dark:text-white"
                  required
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email[0]}</p>
                )}
              </div>

              {/* <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <input
                  type="text"
                  value="UI UX Designer"
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                />
              </div> */}
            </div>
          </div>

          {/* Change Password */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-[#2B235A] dark:text-gray-300 mb-6">
              Change Password
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="current_password" className="block text-sm font-medium text-[#2B235A] dark:text-gray-300">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current_password"
                    name="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.current_password}
                    onChange={handleInputChange}
                    placeholder="write password"
                    className="w-full px-4 py-3 pr-12 border border-[#E3E2FF] dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-[#E3E2FF] bg-[#FAFAFC] dark:bg-gray-700 text-[#2B235A] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-red-600 text-sm">{errors.current_password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#2B235A] dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="write password"
                    className="w-full px-4 py-3 pr-12 border border-[#E3E2FF] dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-[#E3E2FF] bg-[#FAFAFC] dark:bg-gray-700 text-[#2B235A] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-[#2B235A] dark:text-gray-300">
                  Renter New Password
                </label>
                <div className="relative">
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="write password"
                    className="w-full px-4 py-3 pr-12 border border-[#E3E2FF] dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-[#E3E2FF] bg-[#FAFAFC] dark:bg-gray-700 text-[#2B235A] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                  >
                    {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-600 text-sm">{errors.password_confirmation[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Management */}
          {/* <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">
              Account Management
            </h4>
            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h5 className="text-base font-medium text-gray-900 dark:text-white">
                  Permanently Delete Account
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 ">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-[#2B235A] dark:text-gray-300 bg-[#FAFAFC] dark:bg-gray-700 border border-[#E3E2FF] dark:border-gray-600 rounded-lg hover:opacity-95 dark:hover:bg-gray-600 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-white holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] border border-transparent rounded-lg hover:opacity-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-500"
            >
                <span className='z-10'>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
