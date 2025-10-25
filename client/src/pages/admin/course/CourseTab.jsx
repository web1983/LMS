import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@radix-ui/react-dropdown-menu';
import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditCourseMutation, useGetCourseByIdQuery, useDeleteCourseMutation, useTogglePublishCourseMutation } from '@/features/api/CourseApi';
import { toast } from 'sonner';

const CourseTab = () => {
    const [input, setInput] = useState({
        courseTitle:"",
        subTitle:"",
        description:"",
        category:"",
        courseLevel:"",
        courseThumbnail:"",
        videoDuration:"",
        projectName:"",
        kit:"",
        videoStatus:"",
        videoUrl:"",
        
    });
    const [learningOutcomes, setLearningOutcomes] = useState([""]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [testTimeLimit, setTestTimeLimit] = useState(20);
    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const navigate = useNavigate();
    const params = useParams(); 
    const courseId = params.courseId; 

    const { data: courseData, isLoading: courseLoading, refetch } = useGetCourseByIdQuery(courseId);
    const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();
    const [deleteCourse, { data: deleteData, isLoading: deleteLoading, isSuccess: deleteSuccess }] = useDeleteCourseMutation();
    const [togglePublish, { data: publishData, isLoading: publishLoading, isSuccess: publishSuccess }] = useTogglePublishCourseMutation();



    // Populate form when course data loads
    useEffect(() => {
        if (courseData?.course) {
            const course = courseData.course;
            setInput({
                courseTitle: course.courseTitle || "",
                subTitle: course.subTitle || "",
                description: course.description || "",
                category: course.category || "",
                courseLevel: course.courseLevel || "",
                courseThumbnail: "",
                videoDuration: course.videoDuration || "",
                projectName: course.projectName || "",
                kit: course.kit || "",
                videoStatus: course.videoStatus || "",
                videoUrl: course.videoUrl || "",
            });
            if (course.courseThumbnail) {
                setPreviewThumbnail(course.courseThumbnail);
            }
            if (course.learningOutcomes && course.learningOutcomes.length > 0) {
                setLearningOutcomes(course.learningOutcomes);
            }
            if (course.testQuestions && course.testQuestions.length > 0) {
                setTestQuestions(course.testQuestions);
            }
            if (course.testTimeLimit) {
                setTestTimeLimit(course.testTimeLimit);
            }
        }
    }, [courseData]);

    const changeEventHandler = (e) => {
        const{name,value} = e.target;
        setInput ({...input, [name]:value});
    };


    const selectCategory = (value) => {
        setInput({...input, category:value});
    }

    const selectCourseLevel = (value) => {
        setInput({...input, courseLevel:value});
    }

    const selectKit = (value) => {
        setInput({...input, kit:value});
    }

    const handleLearningOutcomeChange = (index, value) => {
        const newOutcomes = [...learningOutcomes];
        newOutcomes[index] = value;
        setLearningOutcomes(newOutcomes);
    };

    const addLearningOutcome = () => {
        setLearningOutcomes([...learningOutcomes, ""]);
    };

    const removeLearningOutcome = (index) => {
        if (learningOutcomes.length > 1) {
            const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
            setLearningOutcomes(newOutcomes);
        }
    };


    //get file




     const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        setInput({ ...input, courseThumbnail: file });
        const fileReader = new FileReader();
        fileReader.onload = () => setPreviewThumbnail(fileReader.result);
        fileReader.readAsDataURL(file);
    }
};

    const updateCourseHandler = async () => {
        const formData =  new FormData();
        formData.append("courseTitle", input.courseTitle);
        formData.append("subTitle", input.subTitle);
        formData.append("description", input.description);
        formData.append("category", input.category);
        formData.append("courseLevel", input.courseLevel);
        formData.append("courseThumbnail", input.courseThumbnail);
        formData.append("videoDuration", input.videoDuration);
        formData.append("projectName", input.projectName);
        formData.append("kit", input.kit);
        formData.append("videoStatus", input.videoStatus);
        formData.append("videoUrl", input.videoUrl);
        formData.append("learningOutcomes", JSON.stringify(learningOutcomes.filter(outcome => outcome.trim() !== "")));
        formData.append("testQuestions", JSON.stringify(testQuestions));
        formData.append("testTimeLimit", testTimeLimit);
        await editCourse({formData, courseId});
    }

    const deleteCourseHandler = async () => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            await deleteCourse(courseId);
        }
    }

    const togglePublishHandler = async () => {
        const publish = !courseData?.course?.isPublished;
        await togglePublish({ courseId, publish: publish.toString() });
    }

    // Handle update success/error
    useEffect(() => {
        if(isSuccess){
            toast.success(data.message || "Course updated.");
            // Redirect to courses page after successful update
            setTimeout(() => {
                navigate("/admin/course");
            }, 1000);
        }
        if(error){
            toast.error(error.data.message || "Failed to update course");
        }
    }, [isSuccess, error, navigate]);

    // Handle delete success
    useEffect(() => {
        if(deleteSuccess){
            toast.success(deleteData.message || "Course deleted successfully.");
            navigate("/admin/course");
        }
    }, [deleteSuccess, navigate]);

    // Handle publish/unpublish success
    useEffect(() => {
        if(publishSuccess){
            toast.success(publishData.message || "Course status updated.");
            // Redirect to courses page after successful publish/unpublish
            setTimeout(() => {
                navigate("/admin/course");
            }, 1000);
        }
    }, [publishSuccess, navigate]);

    if (courseLoading) {
        return <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    const isPublished = courseData?.course?.isPublished;
  return (
    <Card>
        <CardHeader className="flex flex-row justify-between">
            <div>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>
                    Make changes to your courses here. Click save when you're done.
                </CardDescription>
            </div>
            <div className='space-x-2'>
                <Button 
                    variant='outline' 
                    onClick={togglePublishHandler}
                    disabled={publishLoading}
                >
                    {publishLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                        </>
                    ) : isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button 
                    variant="destructive"
                    onClick={deleteCourseHandler}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                        </>
                    ) : "Remove Course"}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className='space-y-5 text-sm mt-5 text-black'>
                <div className='space-y-1'>
                    <Label>Title</Label>
                    <Input
                    type="text"
                    name="courseTitle"
                    value={input.courseTitle}
                    onChange={changeEventHandler}
                    placeholder="Ex. Microbit Kits Tutorial"
                    />
                </div>
                <div className='space-y-1'>
                    <Label>Subtitle</Label>
                    <Input
                    type="text"
                    name="subTitle"
                      value={input.subTitle}
                    onChange={changeEventHandler}
                    placeholder="Ex. This Microbit Kit is designed to introduce young minds."
                    />
                </div>
                <div className='space-y-1'>
                    <Label>Description</Label>
                    <RichTextEditor  input={input} setInput={setInput} />
                </div>

                {/* New Fields Section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='space-y-1'>
                        <Label>Video Duration</Label>
                        <Input
                            type="text"
                            name="videoDuration"
                            value={input.videoDuration}
                            onChange={changeEventHandler}
                            placeholder="Ex. 45 minutes"
                        />
                    </div>
                    <div className='space-y-1'>
                        <Label>Project Name</Label>
                        <Input
                            type="text"
                            name="projectName"
                            value={input.projectName}
                            onChange={changeEventHandler}
                            placeholder="Ex. Smart Home Automation"
                        />
                    </div>
                </div>

                    <div className='flex items-center gap-5'>
                        <div className='space-y-1'>
                    <Label>Category</Label>
                     <Select onValueChange={selectCategory} value={input.category}>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectGroup>
                                    <SelectLabel>Basic Level</SelectLabel>
                                    <SelectItem value="grade_3_5_basic">Grade 3-5 (Basic)</SelectItem>
                                    <SelectItem value="grade_6_8_basic">Grade 6-8 (Basic)</SelectItem>
                                    <SelectItem value="grade_9_12_basic">Grade 9-12 (Basic)</SelectItem>
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Advance Level</SelectLabel>
                                    <SelectItem value="grade_3_5_advance">Grade 3-5 (Advance)</SelectItem>
                                    <SelectItem value="grade_6_8_advance">Grade 6-8 (Advance)</SelectItem>
                                    <SelectItem value="grade_9_12_advance">Grade 9-12 (Advance)</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                        </div>
                        <div className='space-y-1'>
                            <Label>Course Level</Label>
                             <Select onValueChange={selectCourseLevel} value={input.courseLevel}>
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Select a Level" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                          <SelectGroup>
                                            <SelectLabel>Level</SelectLabel>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Advance">Advance</SelectItem>
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                        </div>
                        <div className='space-y-1'>
                            <Label>Kit Type</Label>
                             <Select onValueChange={selectKit} value={input.kit}>
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Select a Kit" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                          <SelectGroup>
                                            <SelectLabel>Kit</SelectLabel>
                                            <SelectItem value="Starter Kits">Starter Kits</SelectItem>
                                            <SelectItem value="Intermediate Kit">Intermediate Kit</SelectItem>
                                            <SelectItem value="Advanced Kit">Advanced Kit</SelectItem>
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                        </div>
                    </div>

                        <div className='space-y-1'>
                            <Label>Course Thumbnail</Label>
                            <Input 
                            type="file"
                            onChange={selectThumbnail}
                            accept= "image/*"
                            className="w-fit cursor-pointer"
                            />
                            {
                                previewThumbnail && (
                                    <img src={previewThumbnail} className='h-64 my-2' alt="Course Thumbnail"/>
                                )
                            }
                        </div>

                        {/* Learning Outcomes */}
                        <div className='space-y-1'>
                            <Label>What You'll Learn (Learning Outcomes)</Label>
                            <div className="space-y-2 mt-2">
                                {learningOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={outcome}
                                            onChange={(e) => handleLearningOutcomeChange(index, e.target.value)}
                                            placeholder={`Learning outcome ${index + 1}`}
                                            className="flex-1"
                                        />
                                        {learningOutcomes.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => removeLearningOutcome(index)}
                                                className="px-3"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addLearningOutcome}
                                    className="mt-2"
                                >
                                    + Add Learning Outcome
                                </Button>
                            </div>
                        </div>

                        {/* Video Status */}
                        <div className='space-y-1'>
                            <Label>Video Status</Label>
                            <textarea
                                name="videoStatus"
                                value={input.videoStatus}
                                onChange={changeEventHandler}
                                placeholder="Describe the video content or current status..."
                                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button onClick={() => navigate("/admin/course")} variant="outline">Cancel</Button>
                            <Button className="bg-black text-white hover:bg-white hover:text-black" disabled={isLoading}  onClick={updateCourseHandler} >
                                {
                                    isLoading ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please Wait
                                        </>
                                    ): (
                                        "save"
                                    )
                                }
                            </Button>
                        </div>
            </div>
        </CardContent>
    </Card>
  )
}

export default CourseTab;