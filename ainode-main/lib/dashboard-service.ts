"use client"

import { useState, useEffect } from 'react'
import { 
  UserProfile, 
  Skill, 
  JobMatchingService, 
  MentoringService, 
  Course, 
  QuizService,
  QuizAttempt,
  sampleUserProfile,
  sampleSkills,
  sampleJobs,
  sampleMentors,
  sampleCourses,
  sampleQuizzes
} from './data-model'

export interface DashboardState {
  userProfile: UserProfile
  skills: Skill[]
  jobMatches: JobMatchingService[]
  mentors: MentoringService[]
  courses: Course[]
  quizzes: QuizService[]
  quizAttempts: QuizAttempt[]
  selectedJob: JobMatchingService | null
  selectedMentor: MentoringService | null
  selectedCourse: Course | null
  isUploadingResume: boolean
  resumeUploadProgress: number
  savedJobs: string[]
  appliedJobs: string[]
}

export function useDashboardService() {
  const [state, setState] = useState<DashboardState>({
    userProfile: sampleUserProfile,
    skills: sampleSkills,
    jobMatches: sampleJobs,
    mentors: sampleMentors,
    courses: sampleCourses,
    quizzes: sampleQuizzes,
    quizAttempts: [],
    selectedJob: null,
    selectedMentor: null,
    selectedCourse: null,
    isUploadingResume: false,
    resumeUploadProgress: 0,
    savedJobs: [],
    appliedJobs: []
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('dashboard-state')
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        setState(prevState => ({ ...prevState, ...parsedState }))
      } catch (error) {
        console.error('Error loading dashboard state:', error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboard-state', JSON.stringify(state))
  }, [state])

  const actions = {
    // Resume Upload Actions
    uploadResume: async (file: File) => {
      setState(prev => ({ ...prev, isUploadingResume: true, resumeUploadProgress: 0 }))
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setState(prev => ({ ...prev, resumeUploadProgress: progress }))
      }
      
      // Simulate skill extraction
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isUploadingResume: false,
          resumeUploadProgress: 0,
          skills: [...prev.skills, 
            { name: "System Design", level: "Beginner", proficiency: 30, source: "resume" },
            { name: "TypeScript", level: "Intermediate", proficiency: 60, source: "resume" }
          ]
        }))
      }, 1000)
    },

    // Job Matching Actions
    selectJob: (job: JobMatchingService) => {
      setState(prev => ({ ...prev, selectedJob: job }))
    },

    applyToJob: async (jobId: string) => {
      // Check if resume is uploaded
      if (state.userProfile.profile_picture === "/professional-headshot.png") {
        const shouldUpload = confirm("You need to upload your resume before applying. Would you like to upload it now?")
        if (shouldUpload) {
          // Trigger file input
          const fileInput = document.createElement('input')
          fileInput.type = 'file'
          fileInput.accept = '.pdf,.doc,.docx'
          fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              actions.uploadResume(file)
            }
          }
          fileInput.click()
          return
        }
      }
      
      // Add to applied jobs
      setState(prev => ({
        ...prev,
        appliedJobs: [...prev.appliedJobs, jobId]
      }))
      
      // Simulate job application
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Application submitted successfully for ${state.jobMatches.find(j => j.job_id === jobId)?.job_title}!`)
    },

    saveJob: (jobId: string) => {
      setState(prev => ({
        ...prev,
        savedJobs: prev.savedJobs.includes(jobId) 
          ? prev.savedJobs.filter(id => id !== jobId)
          : [...prev.savedJobs, jobId]
      }))
      
      const job = state.jobMatches.find(j => j.job_id === jobId)
      const isSaved = state.savedJobs.includes(jobId)
      if (job) {
        alert(isSaved ? `Job unsaved: ${job.job_title} at ${job.company}` : `Job saved: ${job.job_title} at ${job.company}`)
      }
    },

    // Mentoring Actions
    selectMentor: (mentor: MentoringService) => {
      setState(prev => ({ ...prev, selectedMentor: mentor }))
    },

    requestMentorship: async (mentorId: string) => {
      const mentor = state.mentors.find(m => m.mentor_id === mentorId)
      if (mentor) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert(`Mentorship request sent to ${mentor.name}!`)
        
        setState(prev => ({
          ...prev,
          userProfile: {
            ...prev.userProfile,
            mentor_connections: prev.userProfile.mentor_connections + 1
          }
        }))
      }
    },

    // Course Actions
    selectCourse: (course: Course) => {
      setState(prev => ({ ...prev, selectedCourse: course }))
    },

    enrollInCourse: async (courseId: string) => {
      const course = state.courses.find(c => c.course_id === courseId)
      if (course) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert(`Enrolled in ${course.course_name}!`)
      }
    },

    // Quiz Actions
    startQuiz: (quizId: string) => {
      const quiz = state.quizzes.find(q => q.quiz_id === quizId)
      if (quiz) {
        // Navigate to quiz page or open quiz modal
        alert(`Starting ${quiz.topic} quiz...`)
      }
    },

    submitQuiz: async (quizId: string, answers: number[]) => {
      const quiz = state.quizzes.find(q => q.quiz_id === quizId)
      if (quiz) {
        // Calculate score
        let correctAnswers = 0
        quiz.questions.forEach((question, index) => {
          if (answers[index] === question.correct_answer) {
            correctAnswers++
          }
        })
        
        const score = Math.round((correctAnswers / quiz.questions.length) * 100)
        
        const attempt: QuizAttempt = {
          quiz_id: quizId,
          user_answers: answers,
          score,
          time_taken: 25, // Simulated time
          feedback: score >= 80 ? "Excellent work!" : "Keep practicing to improve!",
          date_taken: new Date().toISOString()
        }
        
        setState(prev => ({
          ...prev,
          quizAttempts: [...prev.quizAttempts, attempt],
          userProfile: {
            ...prev.userProfile,
            quiz_scores_summary: [
              ...prev.userProfile.quiz_scores_summary,
              {
                quiz_id,
                topic: quiz.topic,
                score,
                date_taken: attempt.date_taken,
                difficulty: quiz.difficulty
              }
            ]
          }
        }))
        
        alert(`Quiz completed! Score: ${score}%`)
      }
    },

    // Skill Actions
    updateSkillLevel: (skillName: string, newLevel: number) => {
      setState(prev => ({
        ...prev,
        skills: prev.skills.map(skill => 
          skill.name === skillName 
            ? { ...skill, proficiency: newLevel }
            : skill
        )
      }))
    },

    addManualSkill: (skillName: string, level: 'Beginner' | 'Intermediate' | 'Advanced') => {
      const newSkill: Skill = {
        name: skillName,
        level,
        proficiency: level === 'Beginner' ? 25 : level === 'Intermediate' ? 50 : 75,
        source: 'manual'
      }
      
      setState(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }))
    },

    // Profile Actions
    updateProfile: (updates: Partial<UserProfile>) => {
      setState(prev => ({
        ...prev,
        userProfile: { ...prev.userProfile, ...updates }
      }))
    },

    // Notification Actions
    toggleNotification: (type: keyof UserProfile['notification_preferences']) => {
      setState(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          notification_preferences: {
            ...prev.userProfile.notification_preferences,
            [type]: !prev.userProfile.notification_preferences[type]
          }
        }
      }))
    },

    // Utility Actions
    clearSelection: () => {
      setState(prev => ({
        ...prev,
        selectedJob: null,
        selectedMentor: null,
        selectedCourse: null
      }))
    },

    resetDashboard: () => {
      setState({
        userProfile: sampleUserProfile,
        skills: sampleSkills,
        jobMatches: sampleJobs,
        mentors: sampleMentors,
        courses: sampleCourses,
        quizzes: sampleQuizzes,
        quizAttempts: [],
        selectedJob: null,
        selectedMentor: null,
        selectedCourse: null,
        isUploadingResume: false,
        resumeUploadProgress: 0
      })
      localStorage.removeItem('dashboard-state')
    }
  }

  return {
    state,
    actions
  }
}
