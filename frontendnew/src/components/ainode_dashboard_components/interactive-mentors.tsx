// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { MentoringService } from "@/lib/data-model"
// import { Users, Star, Clock, Building, MessageCircle, Calendar, Award } from "lucide-react"

// interface InteractiveMentorsProps {
//   mentors: MentoringService[]
//   selectedMentor: MentoringService | null
//   onSelectMentor: (mentor: MentoringService) => void
//   onRequestMentorship: (mentorId: string) => void
// }

// export function InteractiveMentors({ 
//   mentors, 
//   selectedMentor, 
//   onSelectMentor, 
//   onRequestMentorship 
// }: InteractiveMentorsProps) {
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
//           <Users className="h-5 w-5 text-blue-600" />
//           Available Mentors
//           <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//             {mentors.filter(m => m.availability === 'Open').length} available
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {mentors.map((mentor) => (
//           <Card key={mentor.mentor_id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
//             <CardContent className="p-6">
//               <div className="flex items-start gap-4">
//                 <Avatar className="h-16 w-16 ring-2 ring-blue-200">
//                   <AvatarImage src={mentor.profile_picture} alt={mentor.name} />
//                   <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
//                     {mentor.name.split(' ').map(n => n[0]).join('')}
//                   </AvatarFallback>
//                 </Avatar>
                
//                 <div className="flex-1">
//                   <div className="flex items-start justify-between mb-2">
//                     <div>
//                       <h3 className="font-bold text-lg text-gray-900">{mentor.name}</h3>
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <Building className="h-4 w-4" />
//                         {mentor.company}
//                       </p>
//                     </div>
//                     <Badge 
//                       variant={mentor.availability === 'Open' ? 'default' : 'secondary'}
//                       className={mentor.availability === 'Open' 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-gray-100 text-gray-600'
//                       }
//                     >
//                       {mentor.availability}
//                     </Badge>
//                   </div>

//                   <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
//                     <div className="flex items-center gap-1">
//                       <Star className="h-4 w-4 text-yellow-400" />
//                       <span className="font-medium">{mentor.rating}</span>
//                       <span className="text-xs">({mentor.connections} mentees)</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Award className="h-4 w-4" />
//                       <span>{mentor.experience_years} years exp.</span>
//                     </div>
//                   </div>

//                   <p className="text-gray-700 mb-4 text-sm">{mentor.bio}</p>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {mentor.expertise.slice(0, 3).map((skill, index) => (
//                       <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
//                         {skill}
//                       </Badge>
//                     ))}
//                     {mentor.expertise.length > 3 && (
//                       <Badge variant="secondary" className="bg-gray-100 text-gray-600">
//                         +{mentor.expertise.length - 3} more
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button 
//                           variant="outline" 
//                           size="sm"
//                           onClick={() => onSelectMentor(mentor)}
//                         >
//                           <MessageCircle className="h-4 w-4 mr-2" />
//                           View Profile
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent className="max-w-2xl">
//                         <DialogHeader>
//                           <DialogTitle className="flex items-center gap-2">
//                             <Users className="h-5 w-5" />
//                             {mentor.name} - Mentor Profile
//                           </DialogTitle>
//                         </DialogHeader>
//                         <div className="space-y-6">
//                           <div className="flex items-center gap-4">
//                             <Avatar className="h-20 w-20 ring-2 ring-blue-200">
//                               <AvatarImage src={mentor.profile_picture} alt={mentor.name} />
//                               <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg">
//                                 {mentor.name.split(' ').map(n => n[0]).join('')}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <h3 className="text-2xl font-bold text-gray-900">{mentor.name}</h3>
//                               <p className="text-gray-600 flex items-center gap-1">
//                                 <Building className="h-4 w-4" />
//                                 {mentor.company}
//                               </p>
//                               <div className="flex items-center gap-2 mt-2">
//                                 {renderStars(mentor.rating)}
//                                 <span className="text-sm text-gray-600">({mentor.connections} mentees)</span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-2 gap-4">
//                             <div className="bg-blue-50 p-4 rounded-xl">
//                               <p className="text-sm font-medium text-blue-700">Experience</p>
//                               <p className="text-lg font-bold text-blue-900">{mentor.experience_years} years</p>
//                             </div>
//                             <div className="bg-green-50 p-4 rounded-xl">
//                               <p className="text-sm font-medium text-green-700">Active Mentees</p>
//                               <p className="text-lg font-bold text-green-900">{mentor.connections}</p>
//                             </div>
//                           </div>

//                           <div>
//                             <p className="text-sm font-medium text-gray-700 mb-2">Bio</p>
//                             <p className="text-gray-900">{mentor.bio}</p>
//                           </div>

//                           <div>
//                             <p className="text-sm font-medium text-gray-700 mb-2">Areas of Expertise</p>
//                             <div className="flex flex-wrap gap-2">
//                               {mentor.expertise.map((skill, index) => (
//                                 <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
//                                   {skill}
//                                 </Badge>
//                               ))}
//                             </div>
//                           </div>

//                           <div className="flex gap-3 pt-4">
//                             <Button 
//                               className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
//                               onClick={() => {
//                                 onRequestMentorship(mentor.mentor_id)
//                                 onSelectMentor(mentor)
//                               }}
//                               disabled={mentor.availability === 'Closed'}
//                             >
//                               <Calendar className="h-4 w-4 mr-2" />
//                               {mentor.availability === 'Open' ? 'Request Mentorship' : 'Currently Unavailable'}
//                             </Button>
//                             <Button variant="outline">
//                               <MessageCircle className="h-4 w-4 mr-2" />
//                               Send Message
//                             </Button>
//                           </div>
//                         </div>
//                       </DialogContent>
//                     </Dialog>

//                     <Button 
//                       size="sm"
//                       onClick={() => onRequestMentorship(mentor.mentor_id)}
//                       disabled={mentor.availability === 'Closed'}
//                       className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
//                     >
//                       <Calendar className="h-4 w-4 mr-2" />
//                       {mentor.availability === 'Open' ? 'Connect' : 'Unavailable'}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
        
//         {mentors.length === 0 && (
//           <div className="text-center py-8">
//             <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-600">No mentors available at the moment.</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }
