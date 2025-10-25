import React, { useRef, forwardRef } from 'react';
import { Button } from './ui/button';
import { Download, Award } from 'lucide-react';
import { useGetSettingsQuery } from '@/features/api/settingsApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const RobowunderCertificate = forwardRef(({ userName, completionDate, isPreview = false }, ref) => {
  const { data: settingsData } = useGetSettingsQuery();
  const certificateRef = useRef(null);
  
  const settings = settingsData?.settings;
  const logoUrl = settings?.logoUrl || '';
  const year = new Date(completionDate).getFullYear();
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      toast.loading('Generating certificate...');
      
      // Create canvas from the certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // A4 dimensions in mm
      const imgWidth = 297; // A4 width in mm (landscape)
      const imgHeight = 210; // A4 height in mm (landscape)

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${userName.replace(/\s+/g, '_')}_Robowunder_Certificate_${year}.pdf`);
      
      toast.dismiss();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download certificate');
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="w-full shadow-2xl border-8 border-double"
        style={{ 
          aspectRatio: '297/210',
          borderColor: '#d97706', // amber-600
          backgroundColor: '#ffffff'
        }}
      >
        <div 
          className="relative h-full p-8 md:p-12"
          style={{
            background: 'linear-gradient(to bottom right, #fffbeb, #ffffff, #eff6ff)'
          }}
        >
          {/* Decorative Corners */}
          <div className="absolute top-4 left-4 w-16 h-16" style={{ borderTop: '4px solid #d97706', borderLeft: '4px solid #d97706' }}></div>
          <div className="absolute top-4 right-4 w-16 h-16" style={{ borderTop: '4px solid #d97706', borderRight: '4px solid #d97706' }}></div>
          <div className="absolute bottom-4 left-4 w-16 h-16" style={{ borderBottom: '4px solid #d97706', borderLeft: '4px solid #d97706' }}></div>
          <div className="absolute bottom-4 right-4 w-16 h-16" style={{ borderBottom: '4px solid #d97706', borderRight: '4px solid #d97706' }}></div>

          {/* Content Container */}
          <div className="relative h-full flex flex-col items-center justify-between">
            {/* Header Section */}
            <div className="text-center space-y-4">
              {/* Logo */}
              {logoUrl ? (
                <div className="flex justify-center mb-4">
                  <img 
                    src={logoUrl} 
                    alt="Robowunder Logo" 
                    className="h-16 w-16 md:h-20 md:w-20 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 md:h-20 md:w-20" style={{ color: '#d97706' }} />
                </div>
              )}

              {/* Company Name */}
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ color: '#1f2937' }}>
                ROBOWUNDER
              </h1>
              
              {/* Certificate Title */}
              <div className="space-y-2">
                <div className="w-32 h-1 mx-auto" style={{ background: 'linear-gradient(to right, transparent, #d97706, transparent)' }}></div>
                <h2 className="text-xl md:text-2xl font-serif italic" style={{ color: '#b45309' }}>
                  Certificate of Participation
                </h2>
                <div className="w-32 h-1 mx-auto" style={{ background: 'linear-gradient(to right, transparent, #d97706, transparent)' }}></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-6 max-w-3xl px-4">
              <p className="text-base md:text-lg leading-relaxed" style={{ color: '#374151' }}>
                This is to certify that
              </p>

              {/* Student Name */}
              <div className="my-4">
                <h3 className="text-3xl md:text-4xl font-bold mb-2 font-serif" style={{ color: '#1e3a8a' }}>
                  {userName}
                </h3>
                <div className="w-64 h-0.5 mx-auto" style={{ backgroundColor: '#1f2937' }}></div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base leading-relaxed px-4" style={{ color: '#374151' }}>
                has successfully participated in the
                <br />
                <span className="font-bold" style={{ color: '#1e3a8a' }}>Robowunder International Robotics Championship 2026</span>,
                <br />
                demonstrating exceptional creativity, teamwork, and innovation
                <br />
                in the field of Robotics and STEM Education.
              </p>

              <p className="text-sm md:text-base italic pt-4" style={{ color: '#4b5563' }}>
                We appreciate your active participation and wish you continued success
                <br />
                in your future endeavors.
              </p>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-end w-full pt-8 px-4 md:px-8">
              {/* Date */}
              <div className="text-center">
                <div className="w-32 h-0.5 mb-2" style={{ backgroundColor: '#1f2937' }}></div>
                <p className="text-xs md:text-sm" style={{ color: '#4b5563' }}>Date</p>
                <p className="text-xs md:text-sm font-semibold" style={{ color: '#1f2937' }}>{formattedDate}</p>
              </div>

              {/* Award Icon */}
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #fbbf24, #d97706)' }}>
                  <Award className="h-10 w-10" style={{ color: '#ffffff' }} />
                </div>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="w-32 h-0.5 mb-2" style={{ backgroundColor: '#1f2937' }}></div>
                <p className="text-xs md:text-sm" style={{ color: '#4b5563' }}>Authorized Signature</p>
                <p className="text-xs md:text-sm font-semibold" style={{ color: '#1f2937' }}>Robowunder Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {!isPreview && (
        <Button
          onClick={downloadCertificate}
          className="font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ 
            background: 'linear-gradient(to right, #d97706, #b45309)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #b45309, #92400e)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #d97706, #b45309)'}
        >
          <Download className="h-5 w-5 mr-2" />
          Download Certificate
        </Button>
      )}
    </div>
  );
});

RobowunderCertificate.displayName = 'RobowunderCertificate';

export default RobowunderCertificate;

