import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Clock, Users, Star, Search, Play, CheckCircle, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Hooks you already have
import {
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
  benchmarksV1IdpBenchmarksGet,
  listSkillsV1SkillsGet,
  generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost,
} from "@/hooks/useApis";
import {
  browseCatalogV1LearningPathsCatalogGet,
  getRecommendationsV1LearningPathsRecommendationsGet,
  enrollInPathV1LearningPaths_PathId_EnrollPost,
  startPathV1LearningPaths_PathId_StartPost,
} from "@/hooks/useApisCompat";
import { useQueryClient } from "@tanstack/react-query";

type CourseCard = {
  id: string | number;
  title: string;
  instructor?: string;
  category?: string;
  level?: string;
  duration?: string;
  progress: number;
  rating?: number;
  students?: number;
  status: "Not Started" | "In Progress" | "Completed";
  image?: string;
  nextLesson?: string;
  completedLessons?: number;
  totalLessons?: number;
  description?: string;
  skills: string[];
  price?: number;
  platform?: string;
  externalUrl?: string;
};

function pct(n: any) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

export default function CoursesPage() {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseCard | null>(null);
  const [browseCoursesOpen, setBrowseCoursesOpen] = useState(false);
  const [browseSearchQuery, setBrowseSearchQuery] = useState("");
  const [browseCategory, setBrowseCategory] = useState("all");
  const [startCourseDialogOpen, setStartCourseDialogOpen] = useState(false);
  const [courseToStart, setCourseToStart] = useState<CourseCard | null>(null);
  
  // Track enrolled courses from browse catalog
  const [enrolledBrowseCourses, setEnrolledBrowseCourses] = useState<Set<string>>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("enrolledBrowseCourses");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Track course progress (courseId -> progress percentage)
  const [courseProgress, setCourseProgress] = useState<Record<string | number, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseProgress");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });

  const { isAuthenticated } = useAuth();

  // Load skill-based recommendations from localStorage
  const [skillBasedRecommendations, setSkillBasedRecommendations] = useState<any>(null);

  // Mutation hook for generating skill-based recommendations
  const generateRecommendationsMutation = generateSkillBasedRecommendationsV1GenerateSkillBasedRecommendationsPost({
    onSuccess: (data) => {
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('skill_based_recommendations', JSON.stringify(data));
        setSkillBasedRecommendations(data);
      }
    },
    onError: (error) => {
      console.error('Error generating skill-based recommendations:', error);
    },
  });

  // Fetch skill-based recommendations on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return;

    // First, try to load from localStorage
    const stored = localStorage.getItem('skill_based_recommendations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSkillBasedRecommendations(parsed);
      } catch (e) {
        console.warn('Error parsing stored skill-based recommendations:', e);
      }
    }

    // Collect skills and scores from localStorage
    try {
      const skills: string[] = [];
      const scores: Record<string, number> = {};

      // Load skills from user_manual_skills
      const manualSkillsStr = localStorage.getItem('user_manual_skills');
      if (manualSkillsStr) {
        try {
          const manualSkills = JSON.parse(manualSkillsStr);
          if (Array.isArray(manualSkills)) {
            manualSkills.forEach((skill: any) => {
              const name = skill?.name ?? skill?.skill ?? String(skill);
              const score = skill?.level ?? skill?.score ?? skill?.proficiency ?? 50;
              if (name && !skills.includes(name)) {
                skills.push(name);
                scores[name] = pct(score);
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing user_manual_skills:', e);
        }
      }

      // Load skills from parsedResumeData
      const parsedResumeStr = localStorage.getItem('parsedResumeData');
      if (parsedResumeStr) {
        try {
          const resumeData = JSON.parse(parsedResumeStr);
          if (resumeData?.skills && Array.isArray(resumeData.skills)) {
            resumeData.skills.forEach((skill: any) => {
              const name = skill?.name ?? skill?.skill ?? String(skill);
              const score = skill?.level ?? skill?.score ?? skill?.proficiency ?? 50;
              if (name && !skills.includes(name)) {
                skills.push(name);
                scores[name] = pct(score);
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing parsedResumeData:', e);
        }
      }

      // Load skills from resumeAnalysis
      const resumeAnalysisStr = localStorage.getItem('resumeAnalysis');
      if (resumeAnalysisStr) {
        try {
          const analysis = JSON.parse(resumeAnalysisStr);
          if (analysis?.skills && Array.isArray(analysis.skills)) {
            analysis.skills.forEach((skill: any) => {
              const name = typeof skill === 'string' ? skill : (skill?.skill ?? skill?.name ?? String(skill));
              if (name && !skills.includes(name)) {
                skills.push(name);
                scores[name] = scores[name] ?? 50; // Default score if not found
              }
            });
          }
        } catch (e) {
          console.warn('Error parsing resumeAnalysis:', e);
        }
      }

      // If we have skills, generate recommendations
      if (skills.length > 0 && Object.keys(scores).length > 0) {
        // Only generate if not already stored or if stored data is old (older than 24 hours)
        const storedTimestamp = localStorage.getItem('skill_based_recommendations_timestamp');
        const shouldRegenerate = !storedTimestamp || 
          (Date.now() - parseInt(storedTimestamp)) > 24 * 60 * 60 * 1000;

        if (shouldRegenerate) {
          generateRecommendationsMutation.mutate({
            skills: skills.join(', '),
            scores: scores,
          });
          localStorage.setItem('skill_based_recommendations_timestamp', Date.now().toString());
        }
      }
    } catch (e) {
      console.warn('Error preparing skill-based recommendations:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch data - only when authenticated
  const pathsQ = listPathsV1LearningPathsGet({ 
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);
  const snapshotQ = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ 
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);
  const benchmarksQ = benchmarksV1IdpBenchmarksGet({ 
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);
  const skillsQ = listSkillsV1SkillsGet({ 
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const catalogQ = browseCatalogV1LearningPathsCatalogGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  const recommendationsQ = getRecommendationsV1LearningPathsRecommendationsGet({
    refetchOnWindowFocus: false,
    enabled: Boolean(isAuthenticated),
  } as any);

  // Mutations
  const { mutate: enrollInPath, isPending: enrolling } = enrollInPathV1LearningPaths_PathId_EnrollPost({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list_paths_v1_learning_paths_get"] });
      qc.invalidateQueries({ queryKey: ["browse_catalog_v1_learning_paths_catalog_get"] });
    },
  });

  const { mutate: startPath, isPending: starting } = startPathV1LearningPaths_PathId_StartPost({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list_paths_v1_learning_paths_get"] });
      qc.invalidateQueries({ queryKey: ["my_default_snapshot_v1_learning_paths_me_default_snapshot_get"] });
    },
  });

  // Use real API data
  const pathsData = pathsQ.data ?? [];
  const snapshotData = snapshotQ.data;
  const benchmarksData = benchmarksQ.data ?? [];
  const skillsData = skillsQ.data ?? [];
  const catalogData = catalogQ.data ?? [];
  const recommendationsData = recommendationsQ.data ?? [];

  // Map catalog data to CourseCard format
  const catalogCourses: CourseCard[] = useMemo(() => {
    if (Array.isArray(catalogData) && catalogData.length > 0) {
      return catalogData.map((p: any): CourseCard => ({
        id: p?.id ?? crypto.randomUUID(),
        title: p?.title ?? p?.name ?? "Learning Path",
        instructor: p?.instructor ?? p?.owner?.name ?? p?.creator?.name ?? undefined,
        category: p?.category ?? p?.domain ?? undefined,
        level: p?.level ?? p?.difficulty ?? undefined,
        duration: p?.duration_weeks ? `${p.duration_weeks} weeks` : p?.duration ?? undefined,
        progress: 0,
        rating: p?.rating ?? undefined,
        students: p?.students ?? p?.enrolled_count ?? undefined,
        status: "Not Started",
        image: p?.image_url ?? undefined,
        description: p?.summary ?? p?.description ?? undefined,
        skills: Array.isArray(p?.skills) ? p.skills.map((s: any) => s?.name ?? s).filter(Boolean) : [],
        price: p?.price ?? undefined,
        platform: p?.platform ?? p?.provider ?? undefined,
        externalUrl: p?.url ?? p?.external_url ?? undefined,
      }));
    }
    
    // Fallback to static list if API returns empty
    return [
    {
      id: "browse-1",
      title: "Advanced React Patterns",
      instructor: "Dan Abramov",
      category: "Web Development",
      level: "Advanced",
      duration: "8 weeks",
      progress: 0,
      rating: 4.9,
      students: 3500,
      status: "Not Started",
      description: "Master advanced React patterns including hooks, context, and performance optimization.",
      skills: ["React", "JavaScript", "Frontend", "Performance"],
      platform: "Frontend Masters",
      externalUrl: "https://frontendmasters.com/react-advanced",
    },
    {
      id: "browse-2",
      title: "Kubernetes for Developers",
      instructor: "Bret Fisher",
      category: "DevOps",
      level: "Intermediate",
      duration: "6 weeks",
      progress: 0,
      rating: 4.8,
      students: 2200,
      status: "Not Started",
      description: "Learn to deploy and manage containerized applications with Kubernetes.",
      skills: ["Kubernetes", "Docker", "DevOps", "Containers"],
      platform: "Udemy",
      externalUrl: "https://www.udemy.com/kubernetes",
    },
    {
      id: "browse-3",
      title: "GraphQL API Development",
      instructor: "Eve Porcello",
      category: "Web Development",
      level: "Intermediate",
      duration: "7 weeks",
      progress: 0,
      rating: 4.7,
      students: 1800,
      status: "Not Started",
      description: "Build efficient APIs with GraphQL, Apollo Server, and React.",
      skills: ["GraphQL", "API", "Node.js", "React"],
      platform: "Pluralsight",
      externalUrl: "https://www.pluralsight.com/graphql",
    },
    {
      id: "browse-4",
      title: "Deep Learning Specialization",
      instructor: "Andrew Ng",
      category: "AI/ML",
      level: "Advanced",
      duration: "16 weeks",
      progress: 0,
      rating: 4.9,
      students: 5000,
      status: "Not Started",
      description: "Comprehensive deep learning course covering neural networks, CNNs, RNNs, and more.",
      skills: ["Deep Learning", "Neural Networks", "TensorFlow", "Python"],
      platform: "Coursera",
      externalUrl: "https://www.coursera.org/deep-learning",
    },
    {
      id: "browse-5",
      title: "Microservices Architecture",
      instructor: "Sam Newman",
      category: "Architecture",
      level: "Advanced",
      duration: "10 weeks",
      progress: 0,
      rating: 4.8,
      students: 2800,
      status: "Not Started",
      description: "Design and implement scalable microservices architectures.",
      skills: ["Microservices", "Architecture", "System Design", "Distributed Systems"],
      platform: "O'Reilly",
      externalUrl: "https://www.oreilly.com/microservices",
    },
    {
      id: "browse-6",
      title: "TypeScript Mastery",
      instructor: "Mike North",
      category: "Programming",
      level: "Intermediate",
      duration: "6 weeks",
      progress: 0,
      rating: 4.9,
      students: 3200,
      status: "Not Started",
      description: "Master TypeScript from basics to advanced patterns and best practices.",
      skills: ["TypeScript", "JavaScript", "Programming", "Type Safety"],
      platform: "Frontend Masters",
      externalUrl: "https://frontendmasters.com/typescript",
    },
    {
      id: "browse-7",
      title: "Google Cloud Professional Architect",
      instructor: "Google Cloud Training",
      category: "Cloud Computing",
      level: "Advanced",
      duration: "12 weeks",
      progress: 0,
      rating: 4.7,
      students: 4100,
      status: "Not Started",
      description: "Prepare for the Google Cloud Professional Cloud Architect certification.",
      skills: ["GCP", "Cloud Computing", "Architecture", "DevOps"],
      platform: "Google Cloud",
      externalUrl: "https://cloud.google.com/training",
    },
    {
      id: "browse-8",
      title: "Ethical Hacking & Security",
      instructor: "Zaid Sabih",
      category: "Security",
      level: "Intermediate",
      duration: "14 weeks",
      progress: 0,
      rating: 4.8,
      students: 1900,
      status: "Not Started",
      description: "Learn ethical hacking, penetration testing, and cybersecurity fundamentals.",
      skills: ["Security", "Ethical Hacking", "Penetration Testing", "Cybersecurity"],
      platform: "Udemy",
      externalUrl: "https://www.udemy.com/ethical-hacking",
    },
    ];
  }, [catalogData]);

  // Map Learning Paths -> Course cards
  const courses: CourseCard[] = useMemo(() => {
    const paths = Array.isArray(pathsData) ? pathsData : [];
    // try to extract progress/lessons info from snapshot if present
    const snap = snapshotData as any;
    const byPathId: Record<string | number, any> = {};
    if (snap?.paths && Array.isArray(snap.paths)) {
      for (const p of snap.paths) {
        if (p?.id != null) byPathId[p.id] = p;
      }
    }
    // fallback if snapshot has a single path
    if (snap?.path?.id != null) {
      byPathId[snap.path.id] = snap.path;
    }

    const mappedCourses = paths
      .filter((p: any) => {
        // Filter out courses with "Default" title or empty titles
        const title = p?.title ?? p?.name ?? "";
        return title && title.toLowerCase() !== "default" && title.trim() !== "";
      })
      .map((p: any): CourseCard => {
      const ps = byPathId[p?.id] ?? {};
        // Check if there's saved progress for this course
        const savedProgress = courseProgress[p?.id] ?? undefined;
        const progress = savedProgress !== undefined 
          ? savedProgress 
          : pct(ps?.progress_pct ?? p?.progress_pct ?? 0);
      const completedLessons = Number(ps?.completed_lessons ?? p?.completed_lessons ?? 0);
      const totalLessons = Number(ps?.total_lessons ?? p?.total_lessons ?? 0);

      let status: CourseCard["status"] = "Not Started";
      if (progress >= 100 || completedLessons > 0 && completedLessons === totalLessons && totalLessons > 0) {
        status = "Completed";
        } else if (progress > 0 || completedLessons > 0 || savedProgress !== undefined) {
        status = "In Progress";
      }

      return {
        id: p?.id ?? crypto.randomUUID(),
        title: p?.title ?? p?.name ?? "Learning Path",
          instructor: p?.instructor ?? p?.owner?.name ?? p?.creator?.name ?? undefined,
        category: p?.category ?? p?.domain ?? undefined,
        level: p?.level ?? p?.difficulty ?? undefined,
        duration: p?.duration_weeks ? `${p.duration_weeks} weeks` : p?.duration ?? undefined,
        progress,
        rating: p?.rating ?? undefined,
          students: p?.students ?? p?.enrolled_count ?? undefined,
        status,
        image: p?.image_url ?? undefined,
        nextLesson: ps?.next_lesson?.title ?? undefined,
        completedLessons: Number.isFinite(completedLessons) ? completedLessons : undefined,
        totalLessons: Number.isFinite(totalLessons) && totalLessons > 0 ? totalLessons : undefined,
        description: p?.summary ?? p?.description ?? undefined,
        skills: Array.isArray(p?.skills) ? p.skills.map((s: any) => s?.name ?? s).filter(Boolean) : [],
        price: p?.price ?? undefined,
        platform: p?.platform ?? p?.provider ?? undefined,
        externalUrl: p?.url ?? p?.external_url ?? undefined,
      };
    });

    // Add enrolled courses from browse catalog with their progress
    const enrolledCourses = catalogCourses
      .filter(c => enrolledBrowseCourses.has(c.id))
      .map(c => {
        const savedProgress = courseProgress[c.id] ?? 0;
        let status: CourseCard["status"] = "Not Started";
        if (savedProgress >= 100) {
          status = "Completed";
        } else if (savedProgress > 0) {
          status = "In Progress";
        }
        return {
          ...c,
          status,
          progress: savedProgress,
        };
      });

    return [...mappedCourses, ...enrolledCourses];
  }, [pathsData, snapshotData, enrolledBrowseCourses, catalogCourses, courseProgress]);

  // Build "Recommended" from skill-based recommendations, API recommendations, or IDP benchmarks
  const recommended: CourseCard[] = useMemo(() => {
    const allRecommended: CourseCard[] = [];

    // First priority: Skill-based recommendations from API
    if (skillBasedRecommendations) {
      // Add learning paths
      if (Array.isArray(skillBasedRecommendations.learning_paths)) {
        skillBasedRecommendations.learning_paths.forEach((path: any) => {
          allRecommended.push({
            id: path?.id ?? crypto.randomUUID(),
            title: path?.title ?? path?.name ?? "Learning Path",
            instructor: path?.instructor ?? path?.owner?.name ?? path?.creator?.name ?? undefined,
            category: path?.category ?? path?.domain ?? undefined,
            level: path?.level ?? path?.difficulty ?? undefined,
            duration: path?.duration_weeks ? `${path.duration_weeks} weeks` : path?.duration ?? undefined,
            progress: 0,
            rating: path?.rating ?? undefined,
            students: path?.students ?? path?.enrolled_count ?? undefined,
            status: "Not Started",
            image: path?.image_url ?? undefined,
            description: path?.summary ?? path?.description ?? path?.description ?? undefined,
            skills: Array.isArray(path?.skills) ? path.skills.map((s: any) => s?.name ?? s ?? String(s)).filter(Boolean) : [],
            price: path?.price ?? undefined,
            platform: path?.platform ?? path?.provider ?? undefined,
            externalUrl: path?.url ?? path?.external_url ?? undefined,
          });
        });
      }

      // Add online courses from courses_resources
      if (skillBasedRecommendations.courses_resources?.online_courses && 
          Array.isArray(skillBasedRecommendations.courses_resources.online_courses)) {
        skillBasedRecommendations.courses_resources.online_courses.forEach((course: any) => {
          allRecommended.push({
            id: course?.id ?? course?.url ?? crypto.randomUUID(),
            title: course?.title ?? course?.name ?? course?.course_name ?? "Course",
            instructor: course?.instructor ?? course?.provider ?? course?.platform ?? undefined,
            category: course?.category ?? course?.domain ?? undefined,
            level: course?.level ?? course?.difficulty ?? undefined,
            duration: course?.duration ?? course?.duration_weeks ? `${course.duration_weeks} weeks` : undefined,
            progress: 0,
            rating: course?.rating ?? undefined,
            students: course?.students ?? course?.enrolled_count ?? undefined,
            status: "Not Started",
            image: course?.image_url ?? course?.thumbnail ?? undefined,
            description: course?.description ?? course?.summary ?? undefined,
            skills: Array.isArray(course?.skills) ? course.skills.map((s: any) => s?.name ?? s ?? String(s)).filter(Boolean) : [],
            price: course?.price ?? undefined,
            platform: course?.platform ?? course?.provider ?? undefined,
            externalUrl: course?.url ?? course?.link ?? course?.external_url ?? undefined,
          });
        });
      }
    }

    // Second priority: API recommendations
    if (Array.isArray(recommendationsData) && recommendationsData.length > 0) {
      recommendationsData.forEach((p: any) => {
        // Avoid duplicates
        if (!allRecommended.find(c => c.title === (p?.title ?? p?.name))) {
          allRecommended.push({
            id: p?.id ?? crypto.randomUUID(),
            title: p?.title ?? p?.name ?? "Learning Path",
            instructor: p?.instructor ?? p?.owner?.name ?? p?.creator?.name ?? undefined,
            category: p?.category ?? p?.domain ?? undefined,
            level: p?.level ?? p?.difficulty ?? undefined,
            duration: p?.duration_weeks ? `${p.duration_weeks} weeks` : p?.duration ?? undefined,
            progress: 0,
            rating: p?.rating ?? undefined,
            students: p?.students ?? p?.enrolled_count ?? undefined,
            status: "Not Started",
            image: p?.image_url ?? undefined,
            description: p?.summary ?? p?.description ?? undefined,
            skills: Array.isArray(p?.skills) ? p.skills.map((s: any) => s?.name ?? s).filter(Boolean) : [],
            price: p?.price ?? undefined,
            platform: p?.platform ?? p?.provider ?? undefined,
            externalUrl: p?.url ?? p?.external_url ?? undefined,
          });
        }
      });
    }

    // If we have skill-based recommendations or API recommendations, return them (up to 6)
    if (allRecommended.length > 0) {
      return allRecommended.slice(0, 6);
    }
    
    // Fallback to skill gap-based recommendations
    const bench = Array.isArray(benchmarksData) ? benchmarksData : [];
    const mySkills = Array.isArray(skillsData) ? skillsData : [];
    
    // Get skill gaps (lowest scores)
    const gaps = bench
      .map((r: any) => ({
        name: (r?.skill ?? r?.name ?? r?.category ?? "").toString(),
        score: pct(r?.percentile ?? r?.score ?? r?.value ?? 0),
      }))
      .filter((g) => g.name)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);

    // Map skill gaps to actual recommended courses
    const skillToCourseMap: Record<string, CourseCard> = {
      "Cloud Computing": {
        id: "rec-cloud",
        title: "AWS Cloud Practitioner Certification",
        instructor: "AWS Training",
        category: "Cloud Computing",
        level: "Beginner",
        duration: "4 weeks",
        progress: 0,
        rating: 4.6,
        students: 4500,
        status: "Not Started",
        description: "Get certified in AWS cloud fundamentals and boost your cloud computing skills.",
        skills: ["AWS", "Cloud Computing", "Infrastructure"],
        platform: "AWS Training",
        externalUrl: "https://aws.amazon.com/training/certified-cloud-practitioner/",
      },
      "Machine Learning": {
        id: "rec-ml",
        title: "Machine Learning Specialization",
        instructor: "Andrew Ng",
        category: "AI/ML",
        level: "Intermediate",
        duration: "10 weeks",
        progress: 0,
        rating: 4.9,
        students: 3200,
        status: "Not Started",
        description: "Comprehensive machine learning course covering algorithms, neural networks, and practical applications.",
        skills: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
        platform: "Coursera",
        externalUrl: "https://www.coursera.org/machine-learning",
      },
      "System Design": {
        id: "rec-system-design",
        title: "System Design Interview Prep",
        instructor: "Alex Xu",
        category: "Architecture",
        level: "Advanced",
        duration: "8 weeks",
        progress: 0,
        rating: 4.8,
        students: 2800,
        status: "Not Started",
        description: "Master system design concepts for technical interviews at top tech companies.",
        skills: ["System Design", "Architecture", "Scalability", "Distributed Systems"],
        platform: "Educative",
        externalUrl: "https://www.educative.io/system-design",
      },
      "React": {
        id: "rec-react",
        title: "React - The Complete Guide",
        instructor: "Maximilian Schwarzmüller",
        category: "Web Development",
        level: "Intermediate",
        duration: "12 weeks",
        progress: 0,
        rating: 4.8,
        students: 15000,
        status: "Not Started",
        description: "Learn React from scratch. Build real-world applications with hooks, context, and modern patterns.",
        skills: ["React", "JavaScript", "Frontend", "Hooks"],
        platform: "Udemy",
        externalUrl: "https://www.udemy.com/react-the-complete-guide",
      },
      "Docker": {
        id: "rec-docker",
        title: "Docker & Kubernetes: The Complete Guide",
        instructor: "Stephen Grider",
        category: "DevOps",
        level: "Intermediate",
        duration: "10 weeks",
        progress: 0,
        rating: 4.7,
        students: 4200,
        status: "Not Started",
        description: "Master containerization with Docker and orchestration with Kubernetes.",
        skills: ["Docker", "Kubernetes", "DevOps", "Containers"],
        platform: "Udemy",
        externalUrl: "https://www.udemy.com/docker-kubernetes",
      },
      "Database Management": {
        id: "rec-db",
        title: "Complete SQL Bootcamp",
        instructor: "Jose Portilla",
        category: "Database",
        level: "Intermediate",
        duration: "6 weeks",
        progress: 0,
        rating: 4.8,
        students: 6800,
        status: "Not Started",
        description: "Master SQL and database management with PostgreSQL, MySQL, and more.",
        skills: ["SQL", "Database", "PostgreSQL", "MySQL"],
        platform: "Udemy",
        externalUrl: "https://www.udemy.com/sql-bootcamp",
      },
    };

    // Get recommended courses based on skill gaps
    const gapBasedCourses = gaps
      .map((g) => {
        // Try to find a matching course for this skill gap
        const skillKey = Object.keys(skillToCourseMap).find(
          (key) => g.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(g.name.toLowerCase())
        );
        return skillKey ? skillToCourseMap[skillKey] : null;
      })
      .filter((c): c is CourseCard => c !== null);

    // Add popular/trending courses that complement user's learning path
    const popularCourses: CourseCard[] = [
      {
        id: "rec-popular-1",
        title: "JavaScript Algorithms and Data Structures",
        instructor: "FreeCodeCamp",
        category: "Programming",
        level: "Intermediate",
        duration: "8 weeks",
        progress: 0,
        rating: 4.9,
        students: 12000,
        status: "Not Started",
        description: "Master JavaScript fundamentals and algorithms to ace coding interviews.",
        skills: ["JavaScript", "Algorithms", "Data Structures", "Problem Solving"],
        platform: "FreeCodeCamp",
        externalUrl: "https://www.freecodecamp.org/javascript-algorithms",
      },
      {
        id: "rec-popular-2",
        title: "Python for Everybody",
        instructor: "Dr. Charles Severance",
        category: "Programming",
        level: "Beginner",
        duration: "10 weeks",
        progress: 0,
        rating: 4.8,
        students: 25000,
        status: "Not Started",
        description: "Learn Python programming from scratch. Perfect for beginners.",
        skills: ["Python", "Programming", "Data Structures"],
        platform: "Coursera",
        externalUrl: "https://www.coursera.org/python",
      },
    ];

    // Combine gap-based and popular courses, remove duplicates
    const fallbackRecommended = [...gapBasedCourses, ...popularCourses];
    const uniqueRecommended = fallbackRecommended.filter(
      (course, index, self) => index === self.findIndex((c) => c.id === course.id)
    );

    // Limit to 6 recommendations (fallback)
    return uniqueRecommended.slice(0, 6);
  }, [recommendationsData, benchmarksData, skillsData, skillBasedRecommendations]);

  // Derived stats
  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.status === "Completed").length;
    const inProgress = courses.filter((c) => c.status === "In Progress").length;
    // naive total hours: 10h per week if duration like "12 weeks"
    const hours = courses.reduce((sum, c) => {
      const m = /(\d+)\s*weeks?/i.exec(c.duration || "");
      const weeks = m ? parseInt(m[1], 10) : 0;
      return sum + weeks * 10;
    }, 0);

    return [
      { label: "Courses Enrolled", value: String(total), icon: BookOpen },
      { label: "Completed", value: String(completed), icon: CheckCircle },
      { label: "In Progress", value: String(inProgress), icon: Clock },
      { label: "Total Hours", value: String(hours), icon: Users },
    ];
  }, [courses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => c.category && set.add(c.category.toLowerCase()));
    // include a couple of common categories if none exist
    if (set.size === 0) ["programming", "ai/ml", "web development", "cloud computing", "devops", "computer science"].forEach((x) => set.add(x));
    return Array.from(set);
  }, [courses]);

  // Filters (search, category, status)
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.instructor || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || (course.category || "").toLowerCase() === selectedCategory;

      const statusKey =
        course.status === "In Progress"
          ? "in-progress"
          : course.status === "Completed"
          ? "completed"
          : "not-started";
      const matchesStatus = selectedStatus === "all" || statusKey === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, selectedCategory, selectedStatus]);

  // Browse Courses Catalog - Additional courses not yet enrolled
  const browseCoursesCatalog: CourseCard[] = useMemo(() => {
    // Get IDs of courses from learning paths
    const paths = Array.isArray(pathsData) ? pathsData : [];
    const pathIds = new Set(paths.map((p: any) => p?.id).filter(Boolean));
    
    // Filter out courses that are already enrolled (from learning paths or browse catalog enrollment)
    const enrolledIds = new Set([
      ...Array.from(pathIds),
      ...Array.from(enrolledBrowseCourses)
    ]);
    
    return catalogCourses.filter(c => !enrolledIds.has(c.id));
  }, [pathsData, enrolledBrowseCourses, catalogCourses]);

  const filteredBrowseCourses = useMemo(() => {
    return browseCoursesCatalog.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
        (course.instructor || "").toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
        course.skills.some((s) => s.toLowerCase().includes(browseSearchQuery.toLowerCase()));

      const matchesCategory =
        browseCategory === "all" || (course.category || "").toLowerCase() === browseCategory;

      return matchesSearch && matchesCategory;
    });
  }, [browseCoursesCatalog, browseSearchQuery, browseCategory]);

  const handleBrowseCourses = () => {
    setBrowseCoursesOpen(true);
  };

  const handleStartCourse = (course: CourseCard) => {
    // If course is already in progress and has an external URL, navigate directly
    if (course.status === "In Progress" && course.externalUrl) {
      window.open(course.externalUrl, "_blank");
      return;
    }
    
    // If course is not started, call API to start it
    if (course.status === "Not Started" && course.id) {
      startPath(
        { path_id: String(course.id) },
        {
          onSuccess: () => {
            // Update progress to 1% when starting (to mark as "In Progress")
            const newProgress = { ...courseProgress };
            newProgress[course.id] = 1;
            setCourseProgress(newProgress);
            
            // Save to localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("courseProgress", JSON.stringify(newProgress));
            }
            
            // If course has external URL, open it
            if (course.externalUrl) {
              window.open(course.externalUrl, "_blank");
            }
          },
          onError: (error: any) => {
            alert(`Failed to start course: ${error?.message || "Unknown error"}`);
          },
        }
      );
      return;
    }
    
    // Otherwise, open the dialog for new courses
    setCourseToStart(course);
    setStartCourseDialogOpen(true);
  };

  const confirmStartCourse = () => {
    if (!courseToStart) return;
    
    // Update progress to 1% when starting (to mark as "In Progress")
    const newProgress = { ...courseProgress };
    newProgress[courseToStart.id] = 1;
    setCourseProgress(newProgress);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("courseProgress", JSON.stringify(newProgress));
    }
    
    setStartCourseDialogOpen(false);
    setCourseToStart(null);
    
    // If course has external URL, open it
    if (courseToStart.externalUrl) {
      window.open(courseToStart.externalUrl, "_blank");
    }
  };

  const updateCourseProgress = (courseId: string | number, newProgress: number) => {
    const updated = { ...courseProgress };
    updated[courseId] = Math.max(0, Math.min(100, newProgress));
    setCourseProgress(updated);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("courseProgress", JSON.stringify(updated));
    }
  };

  const handleEnrollCourse = (course: CourseCard) => {
    if (!course.id) {
      alert("Course ID is missing");
      return;
    }
    
    // Call API to enroll
    enrollInPath(
      { path_id: String(course.id) },
      {
        onSuccess: () => {
          // Add to enrolled courses locally
          const newEnrolled = new Set(enrolledBrowseCourses);
          newEnrolled.add(course.id);
          setEnrolledBrowseCourses(newEnrolled);
          
          // Save to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("enrolledBrowseCourses", JSON.stringify(Array.from(newEnrolled)));
          }
          
          // Close dialog after a short delay to show feedback
          setTimeout(() => {
            setBrowseCoursesOpen(false);
          }, 500);
        },
        onError: (error: any) => {
          alert(`Failed to enroll: ${error?.message || "Unknown error"}`);
        },
      }
    );
  };

  const loading = pathsQ.isLoading || snapshotQ.isLoading;
  const loadError = pathsQ.isError;

  return (
    <div className="space-y-4 sm:space-y-6 lg:pt-0 pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track your learning progress and continue your journey</p>
        </div>
        <Button
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full px-4 sm:px-6 py-2 shadow-lg text-sm sm:text-base"
          onClick={handleBrowseCourses}
        >
          Browse Courses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-white/50 border-gray-200 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-gray-200 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recommended (from IDP gaps) */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Courses</h2>
              <p className="text-gray-600">
                Based on your IDP benchmarks
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All Recommendations
            </Button>
          </div>

          {recommended.length === 0 ? (
            <div className="text-sm text-gray-500">No recommendations right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.slice(0, 6).map((course) => (
                <Card key={course.id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        {course.instructor ? (
                          <p className="text-sm text-gray-600">by {course.instructor}</p>
                        ) : (
                          <p className="text-sm text-gray-600">{course.platform ?? "Suggested"}</p>
                        )}
                      </div>

                      {course.rating && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{course.rating}</span>
                            {course.students ? <span className="text-gray-500">({course.students})</span> : null}
                          </div>
                          {course.price ? (
                            <span className="font-bold text-blue-600">${course.price}</span>
                          ) : (
                            <span className="text-xs text-gray-500">—</span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 2).map((skill, idx) => (
                          <Badge key={`${skill}-${idx}`} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                        {course.skills.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{course.skills.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                          onClick={() => {
                            // Enroll first, then start
                            handleEnrollCourse(course);
                            setTimeout(() => {
                              handleStartCourse(course);
                            }, 100);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Enroll & Start
                        </Button>
                        {course.externalUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={course.externalUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Courses */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">My Courses</h2>

        {loading ? (
          <div className="text-sm text-gray-500">Loading your courses…</div>
        ) : loadError ? (
          <div className="text-sm text-red-600">Failed to load your courses.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                      {course.instructor ? (
                        <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                      ) : null}
                      <div className="flex items-center gap-2 mb-3">
                        {course.category && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {course.category}
                          </Badge>
                        )}
                        {course.level && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {course.level}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {course.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {course.instructor && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Instructor</p>
                                <p className="text-gray-900">{course.instructor}</p>
                              </div>
                            )}
                            {course.platform && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Platform</p>
                                <p className="text-gray-900">{course.platform}</p>
                              </div>
                            )}
                            {course.duration && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Duration</p>
                                <p className="text-gray-900">{course.duration}</p>
                              </div>
                            )}
                            {course.level && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Level</p>
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  {course.level}
                                </Badge>
                              </div>
                            )}
                            {course.rating && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Rating</p>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-gray-900">{course.rating}</span>
                                  {course.students ? (
                                    <span className="text-sm text-gray-600">({course.students} students)</span>
                                  ) : null}
                                </div>
                              </div>
                            )}
                            {course.price && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Price</p>
                                <p className="text-gray-900">${course.price}</p>
                              </div>
                            )}
                          </div>

                          {course.description && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                              <p className="text-gray-900">{course.description}</p>
                            </div>
                          )}

                          {course.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Skills You'll Learn</p>
                              <div className="flex flex-wrap gap-2">
                                {course.skills.map((skill, index) => (
                                  <Badge key={`${skill}-${index}`} variant="secondary" className="bg-green-100 text-green-800">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3 pt-4">
                            <Button
                              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                              onClick={() => handleStartCourse(course)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {course.status === "Not Started" ? "Start Course" : "Continue"}
                            </Button>
                            <Button variant="outline" asChild>
                              <a href={course.externalUrl || "#"} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Platform
                              </a>
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      {course.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-gray-900">{course.rating}</span>
                        </div>
                      ) : (
                        <span />
                      )}
                      {course.students ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{course.students}</span>
                        </div>
                      ) : (
                        <span />
                      )}
                      {course.duration ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{course.duration}</span>
                        </div>
                      ) : (
                        <span />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          course.status === "Completed"
                            ? "default"
                            : course.status === "In Progress"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          course.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : course.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {course.status}
                      </Badge>

                      {course.status !== "Not Started" && course.completedLessons != null && course.totalLessons != null && (
                        <div className="text-sm text-gray-600">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </div>
                      )}
                    </div>

                    {course.status === "In Progress" && course.nextLesson && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Next Lesson:</p>
                        <p className="text-sm font-medium text-gray-900">{course.nextLesson}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Browse Courses Dialog */}
      <Dialog open={browseCoursesOpen} onOpenChange={setBrowseCoursesOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Browse Courses</DialogTitle>
            <DialogDescription>
              Discover new courses to enhance your skills and advance your career
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-white border-gray-200 rounded-xl"
                value={browseSearchQuery}
                onChange={(e) => setBrowseSearchQuery(e.target.value)}
              />
            </div>
            <Select value={browseCategory} onValueChange={setBrowseCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white border-gray-200 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web development">Web Development</SelectItem>
                <SelectItem value="ai/ml">AI/ML</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="cloud computing">Cloud Computing</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Courses Grid */}
          {filteredBrowseCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrowseCourses.map((course) => (
                <Card key={course.id} className="border border-gray-200 hover:border-blue-300 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        {course.instructor ? (
                          <p className="text-sm text-gray-600">by {course.instructor}</p>
                        ) : (
                          <p className="text-sm text-gray-600">{course.platform ?? "Suggested"}</p>
                        )}
                      </div>

                      {course.rating && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{course.rating}</span>
                            {course.students ? <span className="text-gray-500">({course.students})</span> : null}
                          </div>
                          {course.level && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              {course.level}
                            </Badge>
                          )}
                        </div>
                      )}

                      {course.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {course.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={`${skill}-${idx}`} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                        {course.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{course.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                          onClick={() => handleEnrollCourse(course)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Enroll
                        </Button>
                        {course.externalUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={course.externalUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Start Course Dialog */}
      <Dialog open={startCourseDialogOpen} onOpenChange={setStartCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Play className="h-6 w-6 text-blue-600" />
              Start Course
            </DialogTitle>
            <DialogDescription>
              Ready to begin your learning journey?
            </DialogDescription>
          </DialogHeader>

          {courseToStart && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{courseToStart.title}</h3>
                    {courseToStart.instructor && (
                      <p className="text-gray-600 mb-2">by {courseToStart.instructor}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {courseToStart.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {courseToStart.category}
                        </Badge>
                      )}
                      {courseToStart.level && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          {courseToStart.level}
                        </Badge>
                      )}
                      {courseToStart.duration && (
                        <Badge variant="outline" className="text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {courseToStart.duration}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              {courseToStart.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About this course</h4>
                  <p className="text-gray-600">{courseToStart.description}</p>
                </div>
              )}

              {/* Skills */}
              {courseToStart.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills you'll learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {courseToStart.skills.map((skill, index) => (
                      <Badge key={`${skill}-${index}`} variant="secondary" className="bg-green-100 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Tracking */}
              {courseToStart.status === "In Progress" && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Progress</span>
                    <span className="text-sm font-bold text-blue-600">{courseToStart.progress}%</span>
                  </div>
                  <Progress value={courseToStart.progress} className="h-3 mb-3" />
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600 flex-1">
                      Update Progress:
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={courseToStart.progress}
                      onChange={(e) => {
                        const newProgress = parseInt(e.target.value) || 0;
                        updateCourseProgress(courseToStart.id, newProgress);
                        setCourseToStart({ ...courseToStart, progress: newProgress });
                      }}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartCourseDialogOpen(false);
                    setCourseToStart(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={confirmStartCourse}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {courseToStart.status === "Not Started" ? "Start Course" : "Continue Learning"}
                </Button>
                {courseToStart.externalUrl && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <a href={courseToStart.externalUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Platform
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
