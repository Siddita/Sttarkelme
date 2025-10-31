// Comprehensive Data Model based on requirements

export interface UserProfile {
  // General User Profile Data
  user_id: string
  name: string
  email: string
  phone: string
  profile_picture: string
  account_status: 'Active' | 'Inactive' | 'Suspended'

  // Academic Background
  education: Education[]
  specialization: string
  graduation_year: number

  // Career Preferences
  preferred_job_roles: string[]
  preferred_location: string[]
  job_type_preference: 'Full-time' | 'Part-time' | 'Internship' | 'Remote'
  career_goal: string

  // Achievements & Experience
  work_experience: WorkExperience[]
  certifications: Certification[]
  projects: Project[]
  awards: Award[]

  // Engagement & Activity
  last_login: string
  quiz_scores_summary: QuizScore[]
  job_matches_summary: JobMatch[]
  mentor_connections: number

  // Settings & Preferences
  language_preference: string
  notification_preferences: NotificationSettings
  privacy_settings: PrivacySettings
  // AInode additions
  aspiring_companies?: string[]
}

export interface Education {
  degree: string
  institution: string
  year_completion: number
  cgpa: number
}

export interface WorkExperience {
  company: string
  role: string
  duration: string
  description: string
}

export interface Certification {
  name: string
  issuer: string
  date_earned: string
  expiry_date?: string
}

export interface Project {
  name: string
  description: string
  skills_used: string[]
  github_link?: string
}

export interface Award {
  title: string
  issuer: string
  date: string
  description: string
}

export interface QuizScore {
  quiz_id: string
  topic: string
  score: number
  date_taken: string
  difficulty: 'Easy' | 'Intermediate' | 'Advanced'
}

export interface JobMatch {
  job_id: string
  match_percentage: number
  category: '100%' | '80%' | '70%'
}

export interface NotificationSettings {
  job_alerts: boolean
  quiz_reminders: boolean
  mentoring_updates: boolean
}

export interface PrivacySettings {
  resume_visibility: boolean
  skill_visibility: boolean
}

// Skill Service Data
export interface SkillService {
  resume_id: string
  status: 'Uploaded' | 'Analyzing' | 'Complete'
  skills: Skill[]
  date_uploaded: string
}

export interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  proficiency: number // 0-100
  source: 'resume' | 'manual'
}

// Job Matching Service Data
export interface JobMatchingService {
  job_id: string
  job_title: string
  company: string
  match_score: number
  match_category: '100%' | '80%' | '70%'
  required_skills: string[]
  skill_gap: string[]
  location: string
  job_type: 'Full-time' | 'Internship' | 'Remote'
  description: string
  salary_range?: string
  posted_date: string
}

// Quiz Service Data
export interface QuizService {
  quiz_id: string
  topic: string
  difficulty: 'Easy' | 'Intermediate' | 'Advanced'
  questions: Question[]
  time_limit: number // in minutes
}

export interface Question {
  question_id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface QuizAttempt {
  quiz_id: string
  user_answers: number[]
  score: number
  time_taken: number
  feedback: string
  date_taken: string
}

// Mentoring Service Data
export interface MentoringService {
  mentor_id: string
  name: string
  expertise: string[]
  availability: 'Open' | 'Closed'
  bio: string
  connections: number
  rating: number
  experience_years: number
  company: string
  profile_picture: string
}

export interface MentorConnection {
  connection_id: string
  mentor_id: string
  mentee_id: string
  status: 'Pending' | 'Active' | 'Completed'
  start_date: string
  session_count: number
  last_session: string
}

// Courses & Resources Data
export interface Course {
  course_id: string
  course_name: string
  skill_targeted: string[]
  platform: string
  link: string
  mentor_reference?: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  completion_rate: number
  price?: number
  free: boolean
}

export interface LearningProgress {
  course_id: string
  user_id: string
  progress_percentage: number
  current_module: string
  time_spent: number
  completion_date?: string
}

// Sample Data
export const sampleUserProfile: UserProfile = {
  user_id: "user_001",
  name: "Alex Chen",
  email: "alex.chen@email.com",
  phone: "+1 (555) 123-4567",
  profile_picture: "/professional-headshot.png",
  account_status: "Active",

  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "Stanford University",
      year_completion: 2022,
      cgpa: 3.8
    }
  ],
  specialization: "Software Engineering",
  graduation_year: 2022,

  preferred_job_roles: ["Software Engineer", "Full Stack Developer", "ML Engineer"],
  preferred_location: ["San Francisco", "Remote"],
  job_type_preference: "Full-time",
  career_goal: "Become a Senior Software Engineer at a top tech company",

  work_experience: [
    {
      company: "Tech Corp",
      role: "Junior Software Engineer",
      duration: "2022-2024",
      description: "Developed web applications using React and Node.js"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date_earned: "2023-06-15"
    },
    {
      name: "Azure Fundamentals",
      issuer: "Microsoft",
      date_earned: "2023-03-20"
    }
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Full-stack e-commerce application with React and Node.js",
      skills_used: ["React", "Node.js", "MongoDB", "AWS"],
      github_link: "https://github.com/alexchen/ecommerce"
    }
  ],
  awards: [
    {
      title: "Best Project Award",
      issuer: "University Hackathon",
      date: "2022-05-15",
      description: "Won first place in university hackathon"
    }
  ],

  last_login: "2024-01-15T10:30:00Z",
  quiz_scores_summary: [
    {
      quiz_id: "quiz_001",
      topic: "Python Programming",
      score: 92,
      date_taken: "2024-01-10",
      difficulty: "Advanced"
    },
    {
      quiz_id: "quiz_002",
      topic: "Machine Learning",
      score: 88,
      date_taken: "2024-01-12",
      difficulty: "Advanced"
    },
    {
      quiz_id: "quiz_003",
      topic: "Data Structures & Algorithms",
      score: 95,
      date_taken: "2024-01-08",
      difficulty: "Advanced"
    },
    {
      quiz_id: "quiz_004",
      topic: "System Design",
      score: 78,
      date_taken: "2024-01-15",
      difficulty: "Advanced"
    },
    {
      quiz_id: "quiz_005",
      topic: "Cloud Computing",
      score: 85,
      date_taken: "2024-01-14",
      difficulty: "Intermediate"
    },
    {
      quiz_id: "quiz_006",
      topic: "React Development",
      score: 90,
      date_taken: "2024-01-11",
      difficulty: "Intermediate"
    },
    {
      quiz_id: "quiz_007",
      topic: "Node.js Backend",
      score: 82,
      date_taken: "2024-01-13",
      difficulty: "Intermediate"
    },
    {
      quiz_id: "quiz_008",
      topic: "SQL Database",
      score: 87,
      date_taken: "2024-01-09",
      difficulty: "Intermediate"
    },
    {
      quiz_id: "quiz_009",
      topic: "Docker & Kubernetes",
      score: 75,
      date_taken: "2024-01-16",
      difficulty: "Advanced"
    },
    {
      quiz_id: "quiz_010",
      topic: "DevOps Practices",
      score: 80,
      date_taken: "2024-01-17",
      difficulty: "Advanced"
    }
  ],
  job_matches_summary: [
    {
      job_id: "job_001",
      match_percentage: 95,
      category: "100%"
    }
  ],
  mentor_connections: 3,

  language_preference: "English",
  notification_preferences: {
    job_alerts: true,
    quiz_reminders: true,
    mentoring_updates: true
  },
  privacy_settings: {
    resume_visibility: true,
    skill_visibility: true
  },
  aspiring_companies: ["OpenAI", "Google DeepMind", "Microsoft"]
}

export const sampleSkills: Skill[] = [
  { name: "Python", level: "Advanced", proficiency: 95, source: "resume" },
  { name: "Machine Learning", level: "Intermediate", proficiency: 75, source: "resume" },
  { name: "Data Structures & Algorithms", level: "Advanced", proficiency: 82, source: "manual" },
  { name: "Cloud Computing", level: "Intermediate", proficiency: 65, source: "resume" },
  { name: "React", level: "Advanced", proficiency: 88, source: "manual" },
  { name: "Node.js", level: "Intermediate", proficiency: 70, source: "resume" },
  { name: "SQL", level: "Intermediate", proficiency: 78, source: "manual" },
  { name: "Docker", level: "Beginner", proficiency: 45, source: "manual" }
]

export const sampleJobs: JobMatchingService[] = [
  {
    job_id: "job_001",
    job_title: "Senior Software Engineer",
    company: "Google",
    match_score: 95,
    match_category: "100%",
    required_skills: ["Python", "Machine Learning", "Data Structures & Algorithms", "Cloud Computing"],
    skill_gap: ["System Design", "Kubernetes"],
    location: "San Francisco, CA",
    job_type: "Full-time",
    description: "Join our team to build scalable machine learning systems",
    salary_range: "$150k - $200k",
    posted_date: "2024-01-10"
  },
  {
    job_id: "job_002",
    job_title: "Full Stack Developer",
    company: "Microsoft",
    match_score: 85,
    match_category: "80%",
    required_skills: ["React", "Node.js", "Python", "SQL"],
    skill_gap: ["Azure", "TypeScript"],
    location: "Seattle, WA",
    job_type: "Full-time",
    description: "Build modern web applications with cutting-edge technologies",
    salary_range: "$120k - $160k",
    posted_date: "2024-01-12"
  }
]

export const sampleMentors: MentoringService[] = [
  {
    mentor_id: "mentor_001",
    name: "Sarah Johnson",
    expertise: ["Machine Learning", "Python", "Data Science"],
    availability: "Open",
    bio: "Senior ML Engineer with 8 years experience at top tech companies",
    connections: 45,
    rating: 4.9,
    experience_years: 8,
    company: "Google",
    profile_picture: "/professional-mentor-1.jpg"
  },
  {
    mentor_id: "mentor_002",
    name: "Michael Chen",
    expertise: ["System Design", "Cloud Architecture", "DevOps"],
    availability: "Open",
    bio: "Principal Engineer specializing in scalable systems",
    connections: 32,
    rating: 4.8,
    experience_years: 12,
    company: "Amazon",
    profile_picture: "/professional-mentor-2.jpg"
  },
  {
    mentor_id: "mentor_003",
    name: "Emily Rodriguez",
    expertise: ["Frontend Development", "React", "UI/UX"],
    availability: "Closed",
    bio: "Lead Frontend Engineer with passion for user experience",
    connections: 28,
    rating: 4.7,
    experience_years: 6,
    company: "Meta",
    profile_picture: "/professional-mentor-3.jpg"
  }
]

export const sampleCourses: Course[] = [
  {
    course_id: "course_001",
    course_name: "Advanced System Design",
    skill_targeted: ["System Design", "Architecture"],
    platform: "Coursera",
    link: "https://coursera.org/learn/system-design",
    mentor_reference: "mentor_002",
    duration: "8 weeks",
    difficulty: "Advanced",
    rating: 4.8,
    completion_rate: 75,
    price: 79,
    free: false
  },
  {
    course_id: "course_002",
    course_name: "Kubernetes Fundamentals",
    skill_targeted: ["Kubernetes", "Container Orchestration"],
    platform: "Udemy",
    link: "https://udemy.com/kubernetes-fundamentals",
    duration: "6 weeks",
    difficulty: "Intermediate",
    rating: 4.6,
    completion_rate: 82,
    price: 49,
    free: false
  },
  {
    course_id: "course_003",
    course_name: "Python Programming Masterclass",
    skill_targeted: ["Python", "Programming", "Data Structures"],
    platform: "Udemy",
    link: "https://udemy.com/python-masterclass",
    mentor_reference: "mentor_001",
    duration: "12 weeks",
    difficulty: "Intermediate",
    rating: 4.7,
    completion_rate: 45,
    price: 89,
    free: false
  },
  {
    course_id: "course_004",
    course_name: "Machine Learning Fundamentals",
    skill_targeted: ["Machine Learning", "Python", "Statistics"],
    platform: "Coursera",
    link: "https://coursera.org/learn/machine-learning",
    mentor_reference: "mentor_001",
    duration: "10 weeks",
    difficulty: "Advanced",
    rating: 4.9,
    completion_rate: 30,
    price: 99,
    free: false
  }
]

export const sampleQuizzes: QuizService[] = [
  {
    quiz_id: "quiz_001",
    topic: "Python Programming",
    difficulty: "Advanced",
    time_limit: 30,
    questions: [
      {
        question_id: "q1",
        question_text: "What is the time complexity of quicksort in the average case?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct_answer: 1,
        explanation: "Quicksort has O(n log n) average case time complexity due to the balanced partitioning."
      }
    ]
  }
]
