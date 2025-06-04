import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const AccountPage = () => {
  const { currentUser, updateProfilePic, logout, updateUserInfo } = useAuthContext();
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateProfilePic(event.target.result.toString());
        toast.success("Photo de profil mise à jour");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    toast.success('Vous avez été déconnecté');
  };

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (updateUserInfo) {
      updateUserInfo({ [field]: value });
      toast.success(`${field} mis à jour avec succès`);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Profile</h1>
        
        {/* Profile Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {currentUser?.profilePic ? (
                    <AvatarImage src={currentUser.profilePic} alt={currentUser?.username || ''} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label 
                  htmlFor="profile-pic" 
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-300 cursor-pointer hover:bg-gray-100"
                >
                  <Pencil className="h-3 w-3" />
                  <span className="sr-only">Change profile picture</span>
                </label>
                <input 
                  type="file" 
                  id="profile-pic" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-gray-800">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-500 text-sm">{profile.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Personal Information */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm font-normal text-gray-500 mb-1">First Name</p>
                <EditableField 
                  value={profile.firstName}
                  onSave={(value) => handleProfileUpdate('firstName', String(value))}
                  showEditIcon={true}
                />
              </div>
              <div>
                <p className="text-sm font-normal text-gray-500 mb-1">Last Name</p>
                <EditableField 
                  value={profile.lastName}
                  onSave={(value) => handleProfileUpdate('lastName', String(value))}
                  showEditIcon={true}
                />
              </div>
              <div>
                <p className="text-sm font-normal text-gray-500 mb-1">Email address</p>
                <EditableField 
                  value={profile.email}
                  onSave={(value) => handleProfileUpdate('email', String(value))}
                  showEditIcon={true}
                />
              </div>
              <div>
                <p className="text-sm font-normal text-gray-500 mb-1">Phone</p>
                <EditableField 
                  value={profile.phone}
                  onSave={(value) => handleProfileUpdate('phone', String(value))}
                  showEditIcon={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Address Information */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm font-normal text-gray-500 mb-1">Address</p>
                <EditableField 
                  value={profile.address}
                  onSave={(value) => handleProfileUpdate('address', String(value))}
                  showEditIcon={true}
                />
              </div>
              <div>
                
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Logout Button */}
        <div className="mt-8">
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
            log Out
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountPage;