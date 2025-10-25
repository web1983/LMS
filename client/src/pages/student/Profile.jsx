import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Award } from 'lucide-react';
import { useLoadUserQuery, useUpdateUserMutation } from '@/features/api/authApi.js';
import { useGetCertificateStatusQuery } from '@/features/api/enrollmentApi';
import RobowunderCertificate from '@/components/RobowunderCertificate';
import { toast } from 'sonner';

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [updateUser, { data: updateUserData, isLoading: updateUserIsLoading, isError, error, isSuccess }] = useUpdateUserMutation();
  
  const user = data?.user;
  const { data: certificateData } = useGetCertificateStatusQuery(undefined, {
    skip: !user || user?.role !== 'student'
  });

  // Set initial name
  useEffect(() => {
    if (data?.user?.name) setName(data.user.name);
  }, [data]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    await updateUser(formData);
  };


  useEffect(() => {
    refetch();
  },[])

  // Toast notifications
useEffect(() => {
  if (isSuccess) {
    refetch();
    toast.success(updateUserData?.message || "Profile updated!");
  }

  if (isError) {
    toast.error(error?.message || "Profile update failed!");
  }
}, [isSuccess, isError, updateUserData, error, refetch]);


  if (isLoading) return <h1>Profile Loading...</h1>;

  return (
    <div className="max-w-4xl mx-auto px-4 my-24 bg-white rounded-lg shadow-sm p-8">
      <h1 className="font-bold text-2xl text-center md:text-left">Profile</h1>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:w-32 md:h-32 mb-4">
            <AvatarImage 
              src={user?.photoUrl || "https://github.com/shadcn.png"} 
              alt={user?.name || "User"}
              key={user?.photoUrl} // Force re-render when photo changes
            />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </div>

        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900">
              Name: <span className="font-normal text-gray-700 ml-2">{user.name}</span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900">
              Email: <span className="font-normal text-gray-700 ml-2">{user.email}</span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900">
              Role: <span className="font-normal text-gray-700 ml-2">{user.role?.toUpperCase()}</span>
            </h1>
          </div>
          {user.role === 'student' && user.category && (
            <div className="mb-2">
              <h1 className="font-semibold text-gray-900">
                Category: <span className="font-normal text-gray-700 ml-2">
                  {user.category === 'grade_3_5_basic' && 'Grade 3 to 5 (Basic)'}
                  {user.category === 'grade_6_8_basic' && 'Grade 6 to 8 (Basic)'}
                  {user.category === 'grade_9_12_basic' && 'Grade 9 to 12 (Basic)'}
                  {user.category === 'grade_3_5_advance' && 'Grade 3 to 5 (Advance)'}
                  {user.category === 'grade_6_8_advance' && 'Grade 6 to 8 (Advance)'}
                  {user.category === 'grade_9_12_advance' && 'Grade 9 to 12 (Advance)'}
                </span>
              </h1>
            </div>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-black mt-2 text-white">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 my-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Image</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button disabled={updateUserIsLoading} onClick={updateUserHandler}>
  {updateUserIsLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
    </>
  ) : 'Save Changes'}
</Button>

              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Certificate Section */}
      {certificateData?.eligible && certificateData?.certificateData && (
        <Card className="mt-8 p-6 bg-gradient-to-br from-amber-50 via-white to-blue-50 border-2 border-amber-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                Your Certificate
              </h2>
              <p className="text-sm text-gray-600">You've earned your championship certificate!</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto">
            <RobowunderCertificate 
              userName={certificateData.certificateData.userName}
              completionDate={certificateData.certificateData.completionDate}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;
