import { useEffect } from 'react';
import { useGetSettingsQuery } from '@/features/api/settingsApi';

const SEOHead = () => {
  const { data: settingsData } = useGetSettingsQuery();
  const settings = settingsData?.settings;

  useEffect(() => {
    if (!settings) return;

    // Get base URL (for absolute image URLs)
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const siteUrl = `${baseUrl}${currentPath}`;
    
    // Set default values
    const siteTitle = settings.siteTitle || settings.companyName || 'Robowunder LMS';
    const siteDescription = settings.siteDescription || 'Learn robotics and STEM skills with Robowunder';
    let siteThumbnail = settings.siteThumbnail || settings.logoUrl || '';
    
    // Ensure absolute URL for thumbnail (required for WhatsApp, Facebook, etc.)
    if (siteThumbnail) {
      // If it's already a full URL (starts with http/https), use it as is
      // Otherwise, check if it's a Cloudinary URL or needs baseUrl
      if (!siteThumbnail.startsWith('http://') && !siteThumbnail.startsWith('https://')) {
        // If it's a relative path, make it absolute
        siteThumbnail = siteThumbnail.startsWith('/') 
          ? `${baseUrl}${siteThumbnail}` 
          : `${baseUrl}/${siteThumbnail}`;
      }
    }

    // Update document title
    document.title = siteTitle;

    // Function to update or create meta tag by property (for Open Graph)
    const updateMetaTag = (property, content) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Function to update or create meta tag by name
    const updateMetaTagByName = (name, content) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update standard meta tags
    updateMetaTagByName('description', siteDescription);
    updateMetaTagByName('keywords', 'robotics, STEM, education, LMS, Robowunder');

    // Update Open Graph meta tags (for Facebook, WhatsApp, LinkedIn, etc.)
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:title', siteTitle);
    updateMetaTag('og:description', siteDescription);
    updateMetaTag('og:url', siteUrl);
    updateMetaTag('og:site_name', settings.companyName || 'Robowunder LMS');
    updateMetaTag('og:locale', 'en_US');
    
    if (siteThumbnail) {
      updateMetaTag('og:image', siteThumbnail);
      updateMetaTag('og:image:secure_url', siteThumbnail);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:type', 'image/png');
      updateMetaTag('og:image:alt', siteTitle);
    }

    // Update Twitter Card meta tags
    updateMetaTagByName('twitter:card', 'summary_large_image');
    updateMetaTagByName('twitter:title', siteTitle);
    updateMetaTagByName('twitter:description', siteDescription);
    if (siteThumbnail) {
      updateMetaTagByName('twitter:image', siteThumbnail);
      updateMetaTagByName('twitter:image:alt', siteTitle);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', siteUrl);

  }, [settings]);

  // This component doesn't render anything
  return null;
};

export default SEOHead;

