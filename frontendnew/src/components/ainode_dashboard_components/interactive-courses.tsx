// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Course } from "@/lib/data-model"
// import { BookOpen, Clock, Star, ExternalLink, Play, Users, DollarSign } from "lucide-react"

// interface InteractiveCoursesProps {
//   courses: Course[]
//   selectedCourse: Course | null
//   onSelectCourse: (course: Course) => void
//   onEnrollInCourse: (courseId: string) => void
// }

// export function InteractiveCourses({ 
//   courses, 
//   selectedCourse, 
//   onSelectCourse, 
//   onEnrollInCourse 
// }: InteractiveCoursesProps) {
//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case 'Beginner': return 'bg-green-100 text-green-800'
//       case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
//       case 'Advanced': return 'bg-red-100 text-red-800'
//       default: return 'bg-gray-100 text-gray-800'
//     }
//   }

//   const renderStars = (rating: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`h-4 w-4 ${
//           i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
//         }`}
//       />
//     ))
//   }

//   return (
//     <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
//       <CardHeader className="pb-4">
//         <CardTitle className="flex items-center gap-2 text-gray-900">
//           <BookOpen className="h-5 w-5 text-blue-600" />
//           Recommended Courses
//           <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//             {courses.length} courses
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {courses.map((course) => (
//           <Card key={course.course_id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
//             <CardContent className="p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <h3 className="font-bold text-lg text-gray-900">{course.course_name}</h3>
//                     <Badge className={getDifficultyColor(course.difficulty)}>
//                       {course.difficulty}
//                     </Badge>
//                     {course.free && (
//                       <Badge variant="secondary" className="bg-green-100 text-green-800">
//                         Free
//                       </Badge>
//                     )}
//                   </div>
                  
//                   <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                     <div className="flex items-center gap-1">
//                       <BookOpen className="h-4 w-4" />
//                       {course.platform}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Clock className="h-4 w-4" />
//                       {course.duration}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Star className="h-4 w-4 text-yellow-400" />
//                       {course.rating}
//                     </div>
//                     {course.price && (
//                       <div className="flex items-center gap-1">
//                         <DollarSign className="h-4 w-4" />
//                         ${course.price}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-medium text-gray-700">Your Progress</span>
//                       <span className="text-sm font-bold text-blue-600">{course.completion_rate}%</span>
//                     </div>
//                     <Progress value={course.completion_rate} className="h-2" />
//                   </div>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {course.skill_targeted.slice(0, 3).map((skill, index) => (
//                       <Badge key={index} variant="secondary" className="bg-purple-100 text-blue-800">
//                         {skill}
//                       </Badge>
//                     ))}
//                     {course.skill_targeted.length > 3 && (
//                       <Badge variant="secondary" className="bg-gray-100 text-gray-600">
//                         +{course.skill_targeted.length - 3} more
//                       </Badge>
//                     )}
//                   </div>

//                   {course.mentor_reference && (
//                     <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
//                       <div className="flex items-center justify-between mb-2">
//                         <p className="text-sm font-medium text-blue-800">Recommended Mentor</p>
//                         <div className="flex items-center gap-1">
//                           <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                           <span className="text-sm font-bold text-blue-800">4.8</span>
//                         </div>
//                       </div>
//                       <p className="text-blue-700">Get personalized guidance from {course.mentor_reference}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => onSelectCourse(course)}
//                       >
//                         <ExternalLink className="h-4 w-4 mr-2" />
//                         View Details
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-2xl">
//                       <DialogHeader>
//                         <DialogTitle className="flex items-center gap-2">
//                           <BookOpen className="h-5 w-5" />
//                           {course.course_name}
//                         </DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Platform</p>
//                             <p className="text-gray-900">{course.platform}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Duration</p>
//                             <p className="text-gray-900">{course.duration}</p>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Difficulty</p>
//                             <Badge className={getDifficultyColor(course.difficulty)}>
//                               {course.difficulty}
//                             </Badge>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Rating</p>
//                             <div className="flex items-center gap-1">
//                               {renderStars(course.rating)}
//                               <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
//                             </div>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Completion Rate</p>
//                             <p className="text-gray-900">{course.completion_rate}%</p>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-700">Price</p>
//                             <p className="text-gray-900">
//                               {course.free ? 'Free' : `$${course.price}`}
//                             </p>
//                           </div>
//                         </div>
                        
//                         <div>
//                           <p className="text-sm font-medium text-gray-700 mb-2">Skills You'll Learn</p>
//                           <div className="flex flex-wrap gap-2">
//                             {course.skill_targeted.map((skill, index) => (
//                               <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
//                                 {skill}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>

//                         {course.mentor_reference && (
//                           <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
//                             <div className="flex items-center justify-between mb-2">
//                               <p className="text-sm font-medium text-blue-800">Mentor Support Available</p>
//                               <div className="flex items-center gap-1">
//                                 <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                                 <span className="text-sm font-bold text-blue-800">4.8</span>
//                               </div>
//                             </div>
//                             <p className="text-blue-700">Get personalized guidance from {course.mentor_reference} throughout this course.</p>
//                           </div>
//                         )}

//                         <div className="flex gap-3 pt-4">
//                           <Button 
//                             className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
//                             onClick={() => {
//                               onEnrollInCourse(course.course_id)
//                               onSelectCourse(course)
//                             }}
//                           >
//                             <Play className="h-4 w-4 mr-2" />
//                             {course.free ? 'Start Free Course' : 'Enroll Now'}
//                           </Button>
//                           <Button 
//                             variant="outline"
//                             onClick={() => window.open(course.link, '_blank')}
//                           >
//                             <ExternalLink className="h-4 w-4 mr-2" />
//                             View on Platform
//                           </Button>
//                         </div>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
                
//                 <div className="flex gap-2">
//                   <Button 
//                     size="sm"
//                     onClick={() => onEnrollInCourse(course.course_id)}
//                     className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-400 text-white"
//                   >
//                     <Play className="h-4 w-4 mr-2" />
//                     {course.free ? 'Start' : 'Enroll'}
//                   </Button>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => window.open(course.link, '_blank')}
//                   >
//                     <ExternalLink className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
        
//         {courses.length === 0 && (
//           <div className="text-center py-8">
//             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-600">No courses available at the moment.</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }
