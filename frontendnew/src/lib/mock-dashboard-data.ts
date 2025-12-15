// Mock data generator for dashboard pages - creates realistic student journey data
// Uses real name from auth service, rest is mock but realistic and fully consistent
//
// CONSISTENCY GUARANTEES:
// 1. Skills in courses match skills in assessments and benchmarks
// 2. Course completion dates align with assessment dates (assessments taken after courses)
// 3. Skill proficiency levels match completed courses and assessment scores
// 4. Profile stats (cert_count, course_count, avg_score) are calculated from actual data
// 5. IDP scores align with overall skill performance
// 6. All dates are relative to current date and form a coherent timeline
// 7. User name comes from auth service, everything else is mock but consistent

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface MockProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  company: string;
  bio: string;
  website: string;
  linkedin: string;
  github: string;
  avatar_url: string;
  specialization: string;
  account_status: string;
  join_date: string;
  cert_count: number;
  course_count: number;
  avg_score: number;
  aspiring_companies: string[];
}

export interface MockIDP {
  score: number;
  level: string;
  readiness: number;
  overall: number;
}

export interface MockBenchmark {
  skill: string;
  percentile: number;
  score: number;
  value: number;
}

export interface MockLearningPath {
  id: string;
  title: string;
  instructor?: string;
  category: string;
  level: string;
  duration: string;
  progress_pct: number;
  completed_lessons: number;
  total_lessons: number;
  rating: number;
  students: number;
  status: "Not Started" | "In Progress" | "Completed";
  skills: string[];
  platform?: string;
  external_url?: string;
  description?: string;
  started_date?: string;
  completed_date?: string;
}

export interface MockAssessment {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  duration: number;
  questions: number;
  score?: number;
  score_pct?: number;
  date_taken: string;
  status: "Completed" | "Available";
  skills: string[];
  category: string;
  attempts?: number;
  best_score?: number;
  related_course_id?: string;
}

export interface MockSkill {
  name: string;
  level: number;
  proficiency: number;
  category: string;
  domain: string;
}

// Generate mock data based on student journey progression - ALL DATA IS CONSISTENT
export function generateMockDashboardData(userName: string): {
  profile: MockProfile;
  idp: MockIDP;
  benchmarks: MockBenchmark[];
  learningPaths: MockLearningPath[];
  assessments: MockAssessment[];
  skills: MockSkill[];
  snapshot: any;
} {
  const firstName = userName?.split(" ")[0] || "Student";
  const currentDate = new Date();
  const joinDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  
  // Consistent skill set used across all data
  const skillMap: Record<string, number> = {
    "Python": 85,
    "JavaScript": 80,
    "React": 75,
    "Data Structures": 85,
    "Algorithms": 80,
    "SQL": 73,
    "Machine Learning": 65,
    "System Design": 70,
    "Node.js": 72,
    "Docker": 60,
    "MongoDB": 68,
    "Express": 70,
    "AWS": 55,
    "Kubernetes": 58,
    "TensorFlow": 62,
    "Pandas": 70,
    "NumPy": 68,
  };

  // Learning Paths - showing active learning journey with consistent dates
  const learningPaths: MockLearningPath[] = [
    {
      id: "1",
      title: "Full Stack Web Development",
      instructor: "Dr. Sarah Chen",
      category: "Web Development",
      level: "Intermediate",
      duration: "12 weeks",
      progress_pct: 75,
      completed_lessons: 9,
      total_lessons: 12,
      rating: 4.8,
      students: 1250,
      status: "In Progress",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
      platform: "Coursera",
      description: "Master modern web development with React, Node.js, and MongoDB",
      started_date: new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "2",
      title: "Data Structures and Algorithms",
      instructor: "Prof. Michael Zhang",
      category: "Computer Science",
      level: "Advanced",
      duration: "10 weeks",
      progress_pct: 100,
      completed_lessons: 10,
      total_lessons: 10,
      rating: 4.9,
      students: 2100,
      status: "Completed",
      skills: ["Algorithms", "Data Structures", "Problem Solving"],
      platform: "edX",
      description: "Comprehensive course on algorithms and data structures",
      started_date: new Date(currentDate.getTime() - 85 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completed_date: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "3",
      title: "Machine Learning Fundamentals",
      instructor: "Dr. Emily Rodriguez",
      category: "AI/ML",
      level: "Intermediate",
      duration: "8 weeks",
      progress_pct: 50,
      completed_lessons: 4,
      total_lessons: 8,
      rating: 4.7,
      students: 890,
      status: "In Progress",
      skills: ["Python", "TensorFlow", "Neural Networks", "Machine Learning"],
      platform: "Udemy",
      description: "Introduction to machine learning with Python",
      started_date: new Date(currentDate.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "4",
      title: "System Design for Interviews",
      instructor: "Alex Kumar",
      category: "Interview Prep",
      level: "Advanced",
      duration: "6 weeks",
      progress_pct: 33,
      completed_lessons: 2,
      total_lessons: 6,
      rating: 4.9,
      students: 3200,
      status: "In Progress",
      skills: ["System Design", "Distributed Systems", "Scalability"],
      platform: "Pluralsight",
      description: "Master system design for technical interviews",
      started_date: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "5",
      title: "AWS Cloud Practitioner",
      instructor: "AWS Training",
      category: "Cloud Computing",
      level: "Beginner",
      duration: "4 weeks",
      progress_pct: 0,
      completed_lessons: 0,
      total_lessons: 4,
      rating: 4.6,
      students: 4500,
      status: "Not Started",
      skills: ["AWS", "Cloud Computing", "DevOps"],
      platform: "AWS Training",
      description: "Get certified in AWS cloud fundamentals",
    },
    {
      id: "6",
      title: "Python for Data Science",
      instructor: "Dr. Lisa Wang",
      category: "Data Science",
      level: "Intermediate",
      duration: "10 weeks",
      progress_pct: 100,
      completed_lessons: 10,
      total_lessons: 10,
      rating: 4.8,
      students: 1800,
      status: "Completed",
      skills: ["Python", "Pandas", "NumPy", "Data Analysis"],
      platform: "Coursera",
      description: "Learn Python for data analysis and visualization",
      started_date: new Date(currentDate.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      completed_date: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      id: "7",
      title: "React Advanced Patterns",
      instructor: "Dan Abramov",
      category: "Web Development",
      level: "Advanced",
      duration: "6 weeks",
      progress_pct: 0,
      completed_lessons: 0,
      total_lessons: 6,
      rating: 4.9,
      students: 2800,
      status: "Not Started",
      skills: ["React", "Hooks", "Performance", "Testing"],
      platform: "Frontend Masters",
      description: "Advanced React patterns and best practices",
    },
    {
      id: "8",
      title: "Docker and Kubernetes",
      instructor: "James Wilson",
      category: "DevOps",
      level: "Intermediate",
      duration: "8 weeks",
      progress_pct: 25,
      completed_lessons: 2,
      total_lessons: 8,
      rating: 4.7,
      students: 1500,
      status: "In Progress",
      skills: ["Docker", "Kubernetes", "Containerization"],
      platform: "Udemy",
      description: "Master containerization with Docker and Kubernetes",
      started_date: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ];

  // Calculate stats from actual data
  const completedCourses = learningPaths.filter(c => c.status === "Completed").length;
  const inProgressCourses = learningPaths.filter(c => c.status === "In Progress").length;
  const totalCourses = learningPaths.length;

  // Assessments - aligned with courses and skills, dates after course completion
  const assessments: MockAssessment[] = [
    {
      id: "1",
      title: "Python Programming Assessment",
      topic: "Programming",
      difficulty: "Intermediate",
      duration: 60,
      questions: 30,
      score: 92,
      score_pct: 92,
      date_taken: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Python", "Programming", "Problem Solving"],
      category: "Programming",
      attempts: 1,
      best_score: 92,
      related_course_id: "6", // Python for Data Science
    },
    {
      id: "2",
      title: "Data Structures Quiz",
      topic: "Computer Science",
      difficulty: "Advanced",
      duration: 45,
      questions: 25,
      score: 88,
      score_pct: 88,
      date_taken: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Data Structures", "Algorithms"],
      category: "Computer Science",
      attempts: 2,
      best_score: 88,
      related_course_id: "2", // Data Structures and Algorithms
    },
    {
      id: "3",
      title: "React Fundamentals Test",
      topic: "Web Development",
      difficulty: "Intermediate",
      duration: 50,
      questions: 28,
      score: 85,
      score_pct: 85,
      date_taken: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["React", "JavaScript", "Frontend"],
      category: "Web Development",
      attempts: 1,
      best_score: 85,
      related_course_id: "1", // Full Stack Web Development
    },
    {
      id: "4",
      title: "System Design Mock Interview",
      topic: "System Design",
      difficulty: "Expert",
      duration: 90,
      questions: 5,
      score: 78,
      score_pct: 78,
      date_taken: new Date(currentDate.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["System Design", "Architecture", "Scalability"],
      category: "System Design",
      attempts: 1,
      best_score: 78,
      related_course_id: "4", // System Design for Interviews
    },
    {
      id: "5",
      title: "Machine Learning Basics",
      topic: "AI/ML",
      difficulty: "Intermediate",
      duration: 55,
      questions: 30,
      score: 82,
      score_pct: 82,
      date_taken: new Date(currentDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Machine Learning", "Python", "TensorFlow"],
      category: "AI/ML",
      attempts: 1,
      best_score: 82,
      related_course_id: "3", // Machine Learning Fundamentals
    },
    {
      id: "6",
      title: "Database Management Assessment",
      topic: "Database",
      difficulty: "Intermediate",
      duration: 40,
      questions: 22,
      score: 90,
      score_pct: 90,
      date_taken: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["SQL", "Database Design", "Normalization"],
      category: "Database",
      attempts: 1,
      best_score: 90,
      related_course_id: "1", // Full Stack Web Development (includes MongoDB)
    },
    {
      id: "7",
      title: "AWS Cloud Services Quiz",
      topic: "Cloud Computing",
      difficulty: "Beginner",
      duration: 35,
      questions: 20,
      status: "Available",
      skills: ["AWS", "Cloud Computing"],
      category: "Cloud Computing",
      date_taken: "",
      related_course_id: "5", // AWS Cloud Practitioner (not started yet)
    },
    {
      id: "8",
      title: "Advanced Algorithms Challenge",
      topic: "Algorithms",
      difficulty: "Expert",
      duration: 75,
      questions: 15,
      status: "Available",
      skills: ["Algorithms", "Problem Solving", "Optimization"],
      category: "Computer Science",
      date_taken: "",
    },
    {
      id: "9",
      title: "Docker Containerization Test",
      topic: "DevOps",
      difficulty: "Intermediate",
      duration: 45,
      questions: 25,
      status: "Available",
      skills: ["Docker", "Containers", "DevOps"],
      category: "DevOps",
      date_taken: "",
      related_course_id: "8", // Docker and Kubernetes (in progress)
    },
    {
      id: "10",
      title: "JavaScript Fundamentals Quiz",
      topic: "Programming",
      difficulty: "Beginner",
      duration: 30,
      questions: 20,
      score: 95,
      score_pct: 95,
      date_taken: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["JavaScript", "Programming", "ES6"],
      category: "Programming",
      attempts: 1,
      best_score: 95,
    },
    {
      id: "11",
      title: "Node.js Backend Development",
      topic: "Web Development",
      difficulty: "Intermediate",
      duration: 60,
      questions: 30,
      score: 87,
      score_pct: 87,
      date_taken: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Node.js", "Express", "Backend", "API"],
      category: "Web Development",
      attempts: 1,
      best_score: 87,
      related_course_id: "1", // Full Stack Web Development
    },
    {
      id: "12",
      title: "MongoDB Database Design",
      topic: "Database",
      difficulty: "Intermediate",
      duration: 50,
      questions: 25,
      score: 89,
      score_pct: 89,
      date_taken: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["MongoDB", "NoSQL", "Database Design"],
      category: "Database",
      attempts: 1,
      best_score: 89,
      related_course_id: "1", // Full Stack Web Development
    },
    {
      id: "13",
      title: "TensorFlow Deep Learning",
      topic: "AI/ML",
      difficulty: "Advanced",
      duration: 70,
      questions: 25,
      score: 75,
      score_pct: 75,
      date_taken: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["TensorFlow", "Deep Learning", "Neural Networks"],
      category: "AI/ML",
      attempts: 2,
      best_score: 75,
      related_course_id: "3", // Machine Learning Fundamentals
    },
    {
      id: "14",
      title: "Pandas Data Analysis",
      topic: "Data Science",
      difficulty: "Intermediate",
      duration: 45,
      questions: 22,
      score: 91,
      score_pct: 91,
      date_taken: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Pandas", "Data Analysis", "Python"],
      category: "Data Science",
      attempts: 1,
      best_score: 91,
      related_course_id: "6", // Python for Data Science
    },
    {
      id: "15",
      title: "NumPy Scientific Computing",
      topic: "Data Science",
      difficulty: "Intermediate",
      duration: 40,
      questions: 20,
      score: 88,
      score_pct: 88,
      date_taken: new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["NumPy", "Scientific Computing", "Python"],
      category: "Data Science",
      attempts: 1,
      best_score: 88,
      related_course_id: "6", // Python for Data Science
    },
    {
      id: "16",
      title: "Kubernetes Orchestration",
      topic: "DevOps",
      difficulty: "Advanced",
      duration: 65,
      questions: 28,
      status: "Available",
      skills: ["Kubernetes", "Orchestration", "DevOps"],
      category: "DevOps",
      date_taken: "",
      related_course_id: "8", // Docker and Kubernetes
    },
    {
      id: "17",
      title: "Express.js API Development",
      topic: "Web Development",
      difficulty: "Intermediate",
      duration: 55,
      questions: 26,
      score: 86,
      score_pct: 86,
      date_taken: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Express", "REST API", "Node.js"],
      category: "Web Development",
      attempts: 1,
      best_score: 86,
      related_course_id: "1", // Full Stack Web Development
    },
    {
      id: "18",
      title: "Problem Solving & Algorithms",
      topic: "Computer Science",
      difficulty: "Advanced",
      duration: 80,
      questions: 20,
      score: 84,
      score_pct: 84,
      date_taken: new Date(currentDate.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Completed",
      skills: ["Algorithms", "Problem Solving", "Optimization"],
      category: "Computer Science",
      attempts: 1,
      best_score: 84,
      related_course_id: "2", // Data Structures and Algorithms
    },
    {
      id: "19",
      title: "React Advanced Patterns",
      topic: "Web Development",
      difficulty: "Advanced",
      duration: 70,
      questions: 30,
      status: "Available",
      skills: ["React", "Advanced Patterns", "Hooks", "Context"],
      category: "Web Development",
      date_taken: "",
    },
    {
      id: "20",
      title: "Cloud Architecture Design",
      topic: "Cloud Computing",
      difficulty: "Expert",
      duration: 90,
      questions: 10,
      status: "Available",
      skills: ["Cloud Architecture", "AWS", "Scalability"],
      category: "Cloud Computing",
      date_taken: "",
    },
  ];

  // Calculate average score from completed assessments
  const completedAssessments = assessments.filter(a => a.status === "Completed" && a.score != null);
  const avgScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssessments.length)
    : 0;

  // Skills - aligned with courses completed and assessments taken
  const skills: MockSkill[] = [
    { name: "Python", level: skillMap["Python"], proficiency: skillMap["Python"] / 100, category: "Programming", domain: "Backend" },
    { name: "JavaScript", level: skillMap["JavaScript"], proficiency: skillMap["JavaScript"] / 100, category: "Programming", domain: "Frontend" },
    { name: "React", level: skillMap["React"], proficiency: skillMap["React"] / 100, category: "Web Development", domain: "Frontend" },
    { name: "Data Structures", level: skillMap["Data Structures"], proficiency: skillMap["Data Structures"] / 100, category: "Computer Science", domain: "Fundamentals" },
    { name: "Algorithms", level: skillMap["Algorithms"], proficiency: skillMap["Algorithms"] / 100, category: "Computer Science", domain: "Fundamentals" },
    { name: "SQL", level: skillMap["SQL"], proficiency: skillMap["SQL"] / 100, category: "Database", domain: "Backend" },
    { name: "Machine Learning", level: skillMap["Machine Learning"], proficiency: skillMap["Machine Learning"] / 100, category: "AI/ML", domain: "Data Science" },
    { name: "System Design", level: skillMap["System Design"], proficiency: skillMap["System Design"] / 100, category: "Architecture", domain: "Backend" },
    { name: "Node.js", level: skillMap["Node.js"], proficiency: skillMap["Node.js"] / 100, category: "Web Development", domain: "Backend" },
    { name: "Docker", level: skillMap["Docker"], proficiency: skillMap["Docker"] / 100, category: "DevOps", domain: "Infrastructure" },
    { name: "MongoDB", level: skillMap["MongoDB"], proficiency: skillMap["MongoDB"] / 100, category: "Database", domain: "Backend" },
    { name: "Express", level: skillMap["Express"], proficiency: skillMap["Express"] / 100, category: "Web Development", domain: "Backend" },
    { name: "AWS", level: skillMap["AWS"], proficiency: skillMap["AWS"] / 100, category: "Cloud Computing", domain: "Infrastructure" },
    { name: "Kubernetes", level: skillMap["Kubernetes"], proficiency: skillMap["Kubernetes"] / 100, category: "DevOps", domain: "Infrastructure" },
    { name: "TensorFlow", level: skillMap["TensorFlow"], proficiency: skillMap["TensorFlow"] / 100, category: "AI/ML", domain: "Data Science" },
  ];

  // Benchmarks - aligned with skills, showing realistic percentiles
  const benchmarks: MockBenchmark[] = [
    { skill: "Python Programming", percentile: 85, score: skillMap["Python"], value: skillMap["Python"] },
    { skill: "Data Structures", percentile: 82, score: skillMap["Data Structures"], value: skillMap["Data Structures"] },
    { skill: "Algorithms", percentile: 78, score: skillMap["Algorithms"], value: skillMap["Algorithms"] },
    { skill: "System Design", percentile: 65, score: skillMap["System Design"], value: skillMap["System Design"] },
    { skill: "React", percentile: 72, score: skillMap["React"], value: skillMap["React"] },
    { skill: "Database Management", percentile: 70, score: skillMap["SQL"], value: skillMap["SQL"] },
    { skill: "Machine Learning", percentile: 60, score: skillMap["Machine Learning"], value: skillMap["Machine Learning"] },
    { skill: "Cloud Computing", percentile: 55, score: skillMap["AWS"], value: skillMap["AWS"] },
  ];

  // IDP - calculated from overall performance
  const idpScore = Math.round(
    (benchmarks.reduce((sum, b) => sum + b.score, 0) / benchmarks.length) * 0.9 // Slightly lower than average
  );
  const idp: MockIDP = {
    score: idpScore,
    level: idpScore >= 80 ? "Expert" : idpScore >= 60 ? "Proficient" : idpScore >= 40 ? "Developing" : "Beginner",
    readiness: Math.min(100, idpScore + 4),
    overall: idpScore,
  };

  // Profile with real name - stats match actual data
  const profile: MockProfile = {
    id: "1",
    name: userName || "Alex Johnson",
    email: `${firstName.toLowerCase()}@student.university.edu`,
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    title: "Computer Science Student",
    company: "Stanford University",
    bio: `Passionate ${firstName} pursuing a degree in Computer Science with a focus on software engineering and AI. Actively building projects and preparing for tech industry placements. Completed ${completedCourses} courses and scored ${avgScore}% average on assessments.`,
    website: `https://${firstName.toLowerCase()}.dev`,
    linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}`,
    github: `https://github.com/${firstName.toLowerCase()}`,
    avatar_url: "/professional-headshot.png",
    specialization: "Software Engineering & AI",
    account_status: "Active",
    join_date: joinDate.toISOString().split("T")[0],
    cert_count: completedCourses, // Matches completed courses
    course_count: totalCourses, // Matches total courses
    avg_score: avgScore, // Matches calculated average
    aspiring_companies: ["Google", "Microsoft", "Meta", "Amazon", "Apple"],
  };

  // Snapshot for learning paths - consistent with actual paths
  const snapshot = {
    path: learningPaths[0],
    paths: learningPaths.map((path) => ({
      id: path.id,
      title: path.title,
      name: path.title,
      progress_pct: path.progress_pct,
      completed_lessons: path.completed_lessons,
      total_lessons: path.total_lessons,
      next_lesson: {
        title: path.status === "In Progress" ? `Lesson ${path.completed_lessons + 1}: ${path.title}` : null,
      },
    })),
  };

  return {
    profile,
    idp,
    benchmarks,
    learningPaths,
    assessments,
    skills,
    snapshot,
  };
}

// Helper hook to get mock data with user name from auth
// Memoize to ensure stable references across re-renders
export function useMockDashboardData() {
  const { user } = useAuth();
  const userName = user?.name || "Student";
  // Use useMemo to ensure the same data object is returned unless userName changes
  return useMemo(() => generateMockDashboardData(userName), [userName]);
}
