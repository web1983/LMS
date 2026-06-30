import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Loader2, Presentation, Save, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useEditCourseMutation, useGetCreatorCourseQuery } from '@/features/api/CourseApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  accentButton,
  glassCard,
  glassInput,
  mutedText,
  badgeAccent,
} from './theme';

const getCategoryLabel = (category) => {
  const categoryMap = {
    grade_3_5_basic: 'Grade 3-5 (Basic)',
    grade_6_8_basic: 'Grade 6-8 (Basic)',
    grade_9_12_basic: 'Grade 9-12 (Basic)',
    grade_3_5_advance: 'Grade 3-5 (Advance)',
    grade_6_8_advance: 'Grade 6-8 (Advance)',
    grade_9_12_advance: 'Grade 9-12 (Advance)',
  };
  return categoryMap[category] || category;
};

const PptLinks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pptLinks, setPptLinks] = useState({});
  const [savingCourseId, setSavingCourseId] = useState(null);

  const { data, isLoading, isError } = useGetCreatorCourseQuery();
  const [editCourse] = useEditCourseMutation();

  const courses = data?.courses || [];

  useEffect(() => {
    const initialLinks = {};
    courses.forEach((course) => {
      initialLinks[course._id] = course.pptDriveLink || '';
    });
    setPptLinks(initialLinks);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const titleMatch = course.courseTitle?.toLowerCase().includes(query);
      const categoryMatch = getCategoryLabel(course.category)?.toLowerCase().includes(query);
      return titleMatch || categoryMatch;
    });
  }, [courses, searchQuery]);

  const handleLinkChange = (courseId, value) => {
    setPptLinks((prev) => ({ ...prev, [courseId]: value }));
  };

  const handleSave = async (courseId) => {
    const link = (pptLinks[courseId] || '').trim();

    if (link) {
      try {
        new URL(link);
      } catch {
        toast.error('Please enter a valid Google Drive URL');
        return;
      }
    }

    try {
      setSavingCourseId(courseId);
      const formData = new FormData();
      formData.append('pptDriveLink', link);

      await editCourse({ formData, courseId }).unwrap();
      toast.success('PPT link saved successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save PPT link');
    } finally {
      setSavingCourseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 text-white">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Course Materials</p>
          <h1 className="text-4xl font-semibold">PPT Drive Links</h1>
          <p className={mutedText}>Add Google Drive links for course presentations</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 text-white">
        <h1 className="text-3xl font-semibold">PPT Drive Links</h1>
        <p className="text-red-400">Failed to load courses. Please refresh and try again.</p>
      </div>
    );
  }

  const linkedCount = courses.filter((course) => course.pptDriveLink?.trim()).length;

  return (
    <div className="space-y-8 text-white">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-white/50">Course Materials</p>
        <h1 className="text-4xl font-semibold flex items-center gap-3">
          <Presentation className="h-9 w-9 text-[#F58120]" />
          PPT Drive Links
        </h1>
        <p className={mutedText}>
          Paste a Google Drive link for each course. Students will see a View PPT button on the course page.
        </p>
      </div>

      <Card className={glassCard}>
        <CardHeader>
          <CardTitle className="text-white">
            {linkedCount} of {courses.length} courses have a PPT link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              type="text"
              placeholder="Search by course title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${glassInput}`}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Course</TableHead>
                  <TableHead className="text-white/70">Category</TableHead>
                  <TableHead className="text-white/70 min-w-[320px]">Google Drive PPT Link</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const currentLink = pptLinks[course._id] ?? course.pptDriveLink ?? '';
                    const isSaving = savingCourseId === course._id;

                    return (
                      <TableRow key={course._id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">{course.courseTitle}</TableCell>
                        <TableCell>
                          <Badge className={badgeAccent}>{getCategoryLabel(course.category)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="url"
                            value={currentLink}
                            onChange={(e) => handleLinkChange(course._id, e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className={glassInput}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {currentLink.trim() && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                onClick={() => window.open(currentLink.trim(), '_blank', 'noopener,noreferrer')}
                              >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Open
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              className={accentButton}
                              disabled={isSaving}
                              onClick={() => handleSave(course._id)}
                            >
                              {isSaving ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-1 h-4 w-4" />
                              )}
                              Save
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-white/60">
                      No courses found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PptLinks;
