import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Upload, Loader2, Building2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/api/settingsApi';

const Settings = () => {
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');

  const { data: settingsData, isLoading: loadingSettings, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();

  const settings = settingsData?.settings;

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setPreviewLogo(settings.logoUrl || '');
    }
  }, [settings]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewLogo(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('companyName', companyName.trim());
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const result = await updateSettings(formData).unwrap();
      
      // Update localStorage cache immediately
      if (result.settings) {
        localStorage.setItem('app_settings', JSON.stringify(result.settings));
      }
      
      toast.success(result.message || 'Settings updated successfully');
      setLogoFile(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update settings');
    }
  };

  const handleReset = () => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setPreviewLogo(settings.logoUrl || '');
      setLogoFile(null);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex-1 mx-10 flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 mx-10">
      <div className="mb-6">
        <h1 className="font-bold text-black text-xl">Application Settings</h1>
        <p className="text-sm text-gray-600">Customize your LMS header logo and company name</p>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>Header Settings</CardTitle>
            </div>
            <CardDescription>Update the logo and company name shown in the header</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name (optional)"
                className="max-w-md"
              />
              <p className="text-xs text-gray-500">
                This name will appear in the header navbar. Leave empty to show only logo.
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Company Logo
              </Label>
              
              <div className="flex items-start gap-6">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {previewLogo ? (
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Image className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-xs">No logo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="max-w-md cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a logo image (PNG, JPG, SVG). Recommended size: 200x200px or similar square dimensions.
                  </p>
                  {logoFile && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ New logo selected: {logoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="pt-4 border-t">
              <Label className="mb-3 block">Preview</Label>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border">
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Logo"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                      <SettingsIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  {companyName && (
                    <span className="font-extrabold text-xl text-gray-900">
                      {companyName}
                    </span>
                  )}
                  {!companyName && !previewLogo && (
                    <span className="text-gray-400 text-sm italic">
                      No company name or logo set
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is how your header will look
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Changes will be reflected immediately across all pages of your LMS after saving. All users will see the updated logo and company name.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={updating}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

