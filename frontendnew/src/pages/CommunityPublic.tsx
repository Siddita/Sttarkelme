import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar-menu";
import Footer from "@/components/Footer";
import {
  Users,
  Trophy,
  Calendar,
  MessageCircle,
  TrendingUp,
  BookOpen,
  Target,
  Bell,
  Search,
  Filter,
  Clock,
  MapPin,
  Video,
  Award,
  Zap,
  Code,
  Briefcase,
  Building2,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  Star,
  ThumbsUp,
  Share2,
  Bookmark,
  PlayCircle,
  ExternalLink,
  CheckCircle2,
  Flame,
  Rocket,
  Brain,
  UserCheck,
  BarChart3,
  FileText,
  Sparkles,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  X
} from "lucide-react";

// Mock data for Skill Circles
const skillCircles = [
  {
    id: 1,
    name: "Python Developers",
    members: 12500,
    description: "Connect with Python developers, share projects, and learn together",
    level: "Level 2",
    tags: ["Python", "Django", "Flask", "Data Science"],
    recentActivity: "2 hours ago",
    discussions: 234,
    challenges: 12
  },
  {
    id: 2,
    name: "Cloud Engineers",
    members: 8900,
    description: "AWS, Azure, GCP discussions and best practices",
    level: "Level 3",
    tags: ["AWS", "Azure", "GCP", "DevOps"],
    recentActivity: "4 hours ago",
    discussions: 189,
    challenges: 8
  },
  {
    id: 3,
    name: "UI/UX Designers",
    members: 15600,
    description: "Design systems, user research, and creative collaboration",
    level: "Level 1",
    tags: ["Figma", "Design", "UX", "Prototyping"],
    recentActivity: "1 hour ago",
    discussions: 312,
    challenges: 15
  },
  {
    id: 4,
    name: "React Developers",
    members: 18900,
    description: "React ecosystem, hooks, performance optimization",
    level: "Level 2",
    tags: ["React", "Next.js", "TypeScript", "Hooks"],
    recentActivity: "30 mins ago",
    discussions: 456,
    challenges: 20
  },
  {
    id: 5,
    name: "Machine Learning Engineers",
    members: 11200,
    description: "ML models, algorithms, and industry applications",
    level: "Level 3",
    tags: ["ML", "TensorFlow", "PyTorch", "NLP"],
    recentActivity: "3 hours ago",
    discussions: 267,
    challenges: 14
  },
  {
    id: 6,
    name: "Full Stack Developers",
    members: 22300,
    description: "End-to-end development discussions and projects",
    level: "Level 2",
    tags: ["MERN", "MEAN", "Full Stack", "APIs"],
    recentActivity: "5 hours ago",
    discussions: 523,
    challenges: 25
  },
  {
    id: 7,
    name: "Node.js Developers",
    members: 14500,
    description: "Server-side JavaScript, APIs, and backend architecture",
    level: "Level 2",
    tags: ["Node.js", "Express", "REST", "GraphQL"],
    recentActivity: "1 hour ago",
    discussions: 298,
    challenges: 18
  },
  {
    id: 8,
    name: "DevOps Engineers",
    members: 9800,
    description: "CI/CD, infrastructure, and automation best practices",
    level: "Level 3",
    tags: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
    recentActivity: "2 hours ago",
    discussions: 201,
    challenges: 11
  },
  {
    id: 9,
    name: "Mobile Developers",
    members: 16700,
    description: "iOS, Android, and cross-platform mobile development",
    level: "Level 2",
    tags: ["React Native", "Flutter", "iOS", "Android"],
    recentActivity: "45 mins ago",
    discussions: 387,
    challenges: 22
  },
  {
    id: 10,
    name: "Data Scientists",
    members: 13400,
    description: "Data analysis, visualization, and statistical modeling",
    level: "Level 3",
    tags: ["Python", "R", "Pandas", "Data Analysis"],
    recentActivity: "3 hours ago",
    discussions: 245,
    challenges: 16
  },
  {
    id: 11,
    name: "Cybersecurity Experts",
    members: 7600,
    description: "Security practices, ethical hacking, and threat analysis",
    level: "Level 3",
    tags: ["Security", "Penetration Testing", "OWASP", "Encryption"],
    recentActivity: "6 hours ago",
    discussions: 156,
    challenges: 9
  },
  {
    id: 12,
    name: "Blockchain Developers",
    members: 5200,
    description: "Smart contracts, DeFi, and blockchain technologies",
    level: "Level 3",
    tags: ["Solidity", "Ethereum", "Web3", "Smart Contracts"],
    recentActivity: "4 hours ago",
    discussions: 134,
    challenges: 7
  },
  {
    id: 13,
    name: "Game Developers",
    members: 11200,
    description: "Game design, engines, and interactive development",
    level: "Level 2",
    tags: ["Unity", "Unreal", "Game Design", "C#"],
    recentActivity: "1.5 hours ago",
    discussions: 278,
    challenges: 19
  },
  {
    id: 14,
    name: "Vue.js Developers",
    members: 8900,
    description: "Vue.js ecosystem, Nuxt.js, and progressive frameworks",
    level: "Level 2",
    tags: ["Vue.js", "Nuxt.js", "Composition API", "Pinia"],
    recentActivity: "2.5 hours ago",
    discussions: 189,
    challenges: 13
  },
  {
    id: 15,
    name: "Angular Developers",
    members: 10100,
    description: "Angular framework, TypeScript, and enterprise applications",
    level: "Level 2",
    tags: ["Angular", "TypeScript", "RxJS", "NgRx"],
    recentActivity: "1 hour ago",
    discussions: 223,
    challenges: 15
  }
];

// Mock data for Hackathons
const hackathons = [
  {
    id: 1,
    title: "AI Innovation Challenge",
    description: "Build AI-powered solutions for real-world problems",
    date: "2024-02-15",
    duration: "48 hours",
    participants: 500,
    prize: "$10,000",
    status: "upcoming",
    tags: ["AI", "ML", "Innovation"],
    organizer: "SkillHub Official",
    location: "Online",
    level: "Intermediate"
  },
  {
    id: 2,
    title: "Web Dev Sprint",
    description: "Create modern web applications using latest technologies",
    date: "2024-02-20",
    duration: "24 hours",
    participants: 320,
    prize: "$5,000",
    status: "upcoming",
    tags: ["Web Dev", "React", "Next.js"],
    organizer: "Tech Partners",
    location: "Hybrid",
    level: "Beginner"
  },
  {
    id: 3,
    title: "Cloud Architecture Contest",
    description: "Design scalable cloud solutions",
    date: "2024-01-28",
    duration: "72 hours",
    participants: 180,
    prize: "$7,500",
    status: "completed",
    tags: ["Cloud", "AWS", "Architecture"],
    organizer: "Cloud Experts",
    location: "Online",
    level: "Advanced"
  },
  {
    id: 4,
    title: "Mobile App Development Marathon",
    description: "Build innovative mobile applications for iOS and Android",
    date: "2024-03-01",
    duration: "36 hours",
    participants: 420,
    prize: "$8,000",
    status: "upcoming",
    tags: ["Mobile", "React Native", "Flutter"],
    organizer: "Mobile Dev Community",
    location: "Hybrid",
    level: "Intermediate"
  },
  {
    id: 5,
    title: "Blockchain Innovation Hack",
    description: "Create decentralized applications and smart contracts",
    date: "2024-03-10",
    duration: "48 hours",
    participants: 280,
    prize: "$12,000",
    status: "upcoming",
    tags: ["Blockchain", "Web3", "Solidity"],
    organizer: "Crypto Labs",
    location: "Online",
    level: "Advanced"
  },
  {
    id: 6,
    title: "Data Science Challenge",
    description: "Solve real-world problems using data analytics and ML",
    date: "2024-03-15",
    duration: "72 hours",
    participants: 350,
    prize: "$9,500",
    status: "upcoming",
    tags: ["Data Science", "Python", "ML"],
    organizer: "Data Analytics Hub",
    location: "Online",
    level: "Intermediate"
  },
  {
    id: 7,
    title: "Cybersecurity Defense Challenge",
    description: "Test your security skills in ethical hacking and defense",
    date: "2024-02-25",
    duration: "24 hours",
    participants: 195,
    prize: "$6,000",
    status: "upcoming",
    tags: ["Security", "Ethical Hacking", "CTF"],
    organizer: "Security Experts",
    location: "Online",
    level: "Advanced"
  },
  {
    id: 8,
    title: "Full Stack Developer Sprint",
    description: "Build end-to-end applications with modern tech stack",
    date: "2024-03-05",
    duration: "48 hours",
    participants: 510,
    prize: "$10,500",
    status: "upcoming",
    tags: ["Full Stack", "MERN", "TypeScript"],
    organizer: "Full Stack Academy",
    location: "Hybrid",
    level: "Beginner"
  },
  {
    id: 9,
    title: "Game Development Jam",
    description: "Create engaging games using Unity or Unreal Engine",
    date: "2024-02-18",
    duration: "48 hours",
    participants: 240,
    prize: "$7,000",
    status: "completed",
    tags: ["Game Dev", "Unity", "C#"],
    organizer: "Game Dev Studio",
    location: "Online",
    level: "Intermediate"
  },
  {
    id: 10,
    title: "DevOps Automation Challenge",
    description: "Automate infrastructure and deployment pipelines",
    date: "2024-03-20",
    duration: "36 hours",
    participants: 180,
    prize: "$8,500",
    status: "upcoming",
    tags: ["DevOps", "Docker", "Kubernetes"],
    organizer: "DevOps Masters",
    location: "Online",
    level: "Advanced"
  }
];

// Mock data for Leader Talks
const leaderTalks = [
  {
    id: 1,
    speaker: "Dr. Sarah Chen",
    role: "Senior ML Engineer",
    company: "Google",
    title: "Breaking into AI/ML: Career Paths and Opportunities",
    date: "2024-02-10",
    time: "6:00 PM IST",
    type: "AMA",
    attendees: 1200,
    status: "upcoming",
    topics: ["Career", "ML", "Interview Prep"]
  },
  {
    id: 2,
    speaker: "Michael Rodriguez",
    role: "VP of Engineering",
    company: "Meta",
    title: "Building Scalable Systems: Lessons from Meta",
    date: "2024-02-12",
    time: "7:00 PM IST",
    type: "Workshop",
    attendees: 890,
    status: "upcoming",
    topics: ["System Design", "Scalability", "Architecture"]
  },
  {
    id: 3,
    speaker: "Jennifer Park",
    role: "Principal Engineer",
    company: "Amazon",
    title: "Cloud Best Practices for Startups",
    date: "2024-01-25",
    time: "5:00 PM IST",
    type: "Talk",
    attendees: 650,
    status: "completed",
    topics: ["Cloud", "AWS", "Startups"]
  },
  {
    id: 4,
    speaker: "David Kim",
    role: "Senior Software Architect",
    company: "Microsoft",
    title: "Microservices Architecture: Design Patterns and Best Practices",
    date: "2024-02-15",
    time: "6:30 PM IST",
    type: "Workshop",
    attendees: 950,
    status: "upcoming",
    topics: ["Microservices", "Architecture", "Design Patterns"]
  },
  {
    id: 5,
    speaker: "Priya Sharma",
    role: "Data Science Lead",
    company: "Netflix",
    title: "Building Recommendation Systems at Scale",
    date: "2024-02-18",
    time: "7:00 PM IST",
    type: "AMA",
    attendees: 1100,
    status: "upcoming",
    topics: ["Data Science", "ML", "Recommendation Systems"]
  },
  {
    id: 6,
    speaker: "Alex Thompson",
    role: "Engineering Manager",
    company: "Stripe",
    title: "Scaling Engineering Teams: Hiring and Culture",
    date: "2024-01-20",
    time: "5:30 PM IST",
    type: "Talk",
    attendees: 720,
    status: "completed",
    topics: ["Leadership", "Hiring", "Team Culture"]
  },
  {
    id: 7,
    speaker: "Maria Garcia",
    role: "Security Engineer",
    company: "Cloudflare",
    title: "Modern Web Security: Threats and Defenses",
    date: "2024-02-22",
    time: "6:00 PM IST",
    type: "Workshop",
    attendees: 680,
    status: "upcoming",
    topics: ["Security", "Web Security", "Cybersecurity"]
  },
  {
    id: 8,
    speaker: "James Wilson",
    role: "Product Engineering Lead",
    company: "Airbnb",
    title: "Building Products That Users Love",
    date: "2024-02-25",
    time: "7:30 PM IST",
    type: "AMA",
    attendees: 850,
    status: "upcoming",
    topics: ["Product", "UX", "User Research"]
  }
];

// Mock data for Learning Tracks
const learningTracks = [
  {
    id: 1,
    title: "Full Stack Web Development",
    progress: 65,
    milestones: 8,
    completed: 5,
    members: 4500,
    mentor: "Alex Johnson",
    skills: ["React", "Node.js", "MongoDB", "Express"],
    lastActivity: "2 days ago"
  },
  {
    id: 2,
    title: "Data Science Mastery",
    progress: 40,
    milestones: 10,
    completed: 4,
    members: 3200,
    mentor: "Dr. Priya Sharma",
    skills: ["Python", "Pandas", "ML", "Statistics"],
    lastActivity: "1 day ago"
  },
  {
    id: 3,
    title: "Cloud Architecture",
    progress: 80,
    milestones: 6,
    completed: 5,
    members: 2800,
    mentor: "Raj Kumar",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    lastActivity: "3 hours ago"
  }
];

// Mock data for Internships
const internships = [
  {
    id: 1,
    company: "TechCorp",
    role: "Software Engineering Intern",
    duration: "6 months",
    location: "Remote",
    stipend: "₹30,000/month",
    skills: ["React", "Node.js", "MongoDB"],
    applicants: 234,
    deadline: "2024-02-20",
    type: "Paid"
  },
  {
    id: 2,
    company: "DataViz",
    role: "Data Science Intern",
    duration: "3 months",
    location: "Hybrid",
    stipend: "₹25,000/month",
    skills: ["Python", "ML", "Data Analysis"],
    applicants: 189,
    deadline: "2024-02-18",
    type: "Paid"
  },
  {
    id: 3,
    company: "CloudStart",
    role: "DevOps Intern",
    duration: "4 months",
    location: "On-site",
    stipend: "₹28,000/month",
    skills: ["AWS", "Docker", "CI/CD"],
    applicants: 156,
    deadline: "2024-02-22",
    type: "Paid"
  },
  {
    id: 4,
    company: "AI Innovations",
    role: "Machine Learning Intern",
    duration: "6 months",
    location: "Remote",
    stipend: "₹35,000/month",
    skills: ["Python", "TensorFlow", "Deep Learning"],
    applicants: 298,
    deadline: "2024-02-25",
    type: "Paid"
  },
  {
    id: 5,
    company: "WebFlow",
    role: "Frontend Developer Intern",
    duration: "3 months",
    location: "Hybrid",
    stipend: "₹22,000/month",
    skills: ["React", "TypeScript", "Next.js"],
    applicants: 412,
    deadline: "2024-02-19",
    type: "Paid"
  },
  {
    id: 6,
    company: "SecureNet",
    role: "Cybersecurity Intern",
    duration: "4 months",
    location: "On-site",
    stipend: "₹32,000/month",
    skills: ["Security", "Penetration Testing", "Ethical Hacking"],
    applicants: 187,
    deadline: "2024-02-28",
    type: "Paid"
  },
  {
    id: 7,
    company: "MobileFirst",
    role: "Mobile App Developer Intern",
    duration: "5 months",
    location: "Remote",
    stipend: "₹27,000/month",
    skills: ["React Native", "Flutter", "iOS"],
    applicants: 245,
    deadline: "2024-02-24",
    type: "Paid"
  },
  {
    id: 8,
    company: "BlockChain Labs",
    role: "Blockchain Developer Intern",
    duration: "6 months",
    location: "Hybrid",
    stipend: "₹40,000/month",
    skills: ["Solidity", "Web3", "Smart Contracts"],
    applicants: 134,
    deadline: "2024-03-01",
    type: "Paid"
  }
];

// Mock data for Incubation Center
const incubationPrograms = [
  {
    id: 1,
    name: "Startup Accelerator Program",
    description: "6-month intensive program for tech startups",
    duration: "6 months",
    benefits: ["Funding", "Mentorship", "Office Space", "Networking"],
    spots: 10,
    available: 3,
    deadline: "2024-03-01",
    focus: "Tech Startups"
  },
  {
    id: 2,
    name: "AI Innovation Lab",
    description: "Dedicated space for AI/ML startups",
    duration: "12 months",
    benefits: ["Lab Access", "GPU Resources", "Expert Mentors", "Investor Connect"],
    spots: 5,
    available: 1,
    deadline: "2024-02-25",
    focus: "AI/ML"
  },
  {
    id: 3,
    name: "Student Entrepreneurship Program",
    description: "Supporting student-led startups",
    duration: "4 months",
    benefits: ["Seed Funding", "Workshops", "Legal Support", "Market Access"],
    spots: 15,
    available: 7,
    deadline: "2024-02-28",
    focus: "Student Startups"
  },
  {
    id: 4,
    name: "FinTech Innovation Hub",
    description: "Accelerator for financial technology startups",
    duration: "8 months",
    benefits: ["Regulatory Support", "Banking Partnerships", "Compliance Guidance", "Investor Network"],
    spots: 8,
    available: 2,
    deadline: "2024-03-05",
    focus: "FinTech"
  },
  {
    id: 5,
    name: "Healthcare Tech Incubator",
    description: "Supporting healthtech and medtech innovations",
    duration: "10 months",
    benefits: ["Clinical Trials", "Regulatory Help", "Medical Experts", "Hospital Partnerships"],
    spots: 6,
    available: 1,
    deadline: "2024-02-29",
    focus: "HealthTech"
  },
  {
    id: 6,
    name: "GreenTech Accelerator",
    description: "Focused on sustainable technology solutions",
    duration: "9 months",
    benefits: ["Sustainability Grants", "Industry Connections", "ESG Support", "Impact Investors"],
    spots: 12,
    available: 4,
    deadline: "2024-03-10",
    focus: "GreenTech"
  },
  {
    id: 7,
    name: "EdTech Innovation Lab",
    description: "Supporting educational technology startups",
    duration: "6 months",
    benefits: ["School Partnerships", "Content Resources", "Pedagogy Experts", "Market Testing"],
    spots: 10,
    available: 3,
    deadline: "2024-03-08",
    focus: "EdTech"
  },
  {
    id: 8,
    name: "Blockchain Ventures",
    description: "Incubator for blockchain and Web3 startups",
    duration: "12 months",
    benefits: ["Crypto Funding", "Technical Mentors", "Exchange Listings", "Community Building"],
    spots: 7,
    available: 2,
    deadline: "2024-03-12",
    focus: "Web3"
  },
  {
    id: 9,
    name: "Social Impact Incubator",
    description: "Supporting startups with social missions",
    duration: "7 months",
    benefits: ["Impact Grants", "NGO Partnerships", "Social Mentors", "Community Outreach"],
    spots: 14,
    available: 6,
    deadline: "2024-03-15",
    focus: "Social Impact"
  }
];

// Mock data for Hot Skills Leaderboard
const hotSkills = [
  { skill: "React", growth: "+45%", posts: 1234, level: "Level 2" },
  { skill: "Python", growth: "+38%", posts: 2156, level: "Level 1" },
  { skill: "AWS", growth: "+52%", posts: 987, level: "Level 3" },
  { skill: "Machine Learning", growth: "+41%", posts: 1456, level: "Level 3" },
  { skill: "TypeScript", growth: "+35%", posts: 876, level: "Level 2" }
];

// News interface
interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
  author?: string;
}

// Fetch Hacker News
const fetchHackerNews = async (limit: number = 6): Promise<NewsItem[]> => {
  try {
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topStoriesResponse.ok) {
      throw new Error(`Hacker News API error: ${topStoriesResponse.status}`);
    }
    
    const topStories = await topStoriesResponse.json();
    const storyIds = topStories.slice(0, limit);
    
    const stories = await Promise.all(
      storyIds.map(async (id: number) => {
        try {
          const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching story ${id}:`, error);
          return null;
        }
      })
    );
    
    return stories
      .filter(Boolean)
      .map((story: any) => ({
        id: `hn-${story.id}`,
        title: story.title,
        description: story.text || story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        publishedAt: new Date(story.time * 1000).toISOString(),
        source: 'Hacker News',
        category: 'tech',
        author: story.by,
      }));
  } catch (error) {
    console.error('Hacker News fetch error:', error);
    return [];
  }
};

// Fetch Dev.to News
const fetchDevToNews = async (limit: number = 6): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`https://dev.to/api/articles?per_page=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status}`);
    }
    
    const articles = await response.json();
    
    return articles.map((article: any) => ({
      id: `devto-${article.id}`,
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.cover_image,
      publishedAt: article.published_at,
      source: 'Dev.to',
      category: 'programming',
      author: article.user?.name,
    }));
  } catch (error) {
    console.error('Dev.to fetch error:', error);
    return [];
  }
};

export default function CommunityPublic() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("home");
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedHackathon, setSelectedHackathon] = useState<number | null>(null);
  const [selectedTalk, setSelectedTalk] = useState<number | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<number | null>(null);
  const [isIncubationFormOpen, setIsIncubationFormOpen] = useState(false);
  const [selectedIncubationProgram, setSelectedIncubationProgram] = useState<number | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [incubationFormData, setIncubationFormData] = useState({
    name: "",
    email: "",
    phone: "",
    startupName: "",
    startupDescription: "",
    teamSize: "",
    fundingStage: "",
    whyJoin: ""
  });

  // Fetch latest news
  const fetchLatestNews = async () => {
    setIsLoadingNews(true);
    setNewsError('');
    setImageErrors(new Set()); // Clear image errors when fetching new news
    
    try {
      const [hnArticles, devtoArticles] = await Promise.all([
        fetchHackerNews(3),
        fetchDevToNews(3)
      ]);
      
      const allArticles = [...hnArticles, ...devtoArticles]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 6);
      
      setLatestNews(allArticles);
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Load news on mount
  useEffect(() => {
    fetchLatestNews();
    // Set default selections to first items
    if (hackathons.length > 0 && selectedHackathon === null) {
      setSelectedHackathon(hackathons[0].id);
    }
    if (leaderTalks.length > 0 && selectedTalk === null) {
      setSelectedTalk(leaderTalks[0].id);
    }
    if (internships.length > 0 && selectedInternship === null) {
      setSelectedInternship(internships[0].id);
    }
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Searching for:", searchQuery);
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 to-white">
      <Navbar />
      
      <div className="relative w-full pt-16">
        {/* Search Section */}
        <section className="relative z-40 max-w-screen-2xl mx-auto pt-8 pb-6">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-4 sm:mb-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    type="text"
                    placeholder="Search Community, Skills, Discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 pr-20 sm:pr-24 bg-white/90 border-2 border-gray-200 rounded-xl sm:rounded-2xl h-12 sm:h-14 text-sm sm:text-lg shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg sm:rounded-xl px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <Search className="sm:hidden h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="relative z-40 max-w-screen-2xl mx-auto pb-8">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* News Cards - Horizontal Scroll */}
            {isLoadingNews ? (
              <div className="overflow-x-auto pb-4 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 min-w-max">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="min-w-[240px] max-w-[240px] bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl animate-pulse">
                      <CardContent className="p-0">
                        <div className="h-28 bg-gray-200 rounded-t-xl" />
                        <div className="p-3">
                          <div className="h-3 bg-gray-200 rounded mb-2 w-16" />
                          <div className="h-4 bg-gray-200 rounded mb-2" />
                          <div className="h-3 bg-gray-200 rounded mb-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : newsError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{newsError}</p>
                <Button onClick={fetchLatestNews} variant="outline" className="rounded-xl">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 min-w-max">
                  {latestNews.map((news) => (
                    <Card 
                      key={news.id} 
                      className="min-w-[240px] max-w-[240px] bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => window.open(news.url, '_blank')}
                    >
                      <CardContent className="p-0">
                        <div className="relative h-28 rounded-t-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
                          {news.imageUrl && !imageErrors.has(news.id) ? (
                            <img 
                              src={news.imageUrl} 
                              alt={news.title}
                              className="w-full h-full object-cover"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(news.id));
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-blue-400" />
                            </div>
                          )}
                          <Badge className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5">
                            {news.category}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-xs font-semibold text-blue-600">{news.source}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{getTimeAgo(news.publishedAt)}</span>
                          </div>
                          <h3 className="font-bold text-sm mb-1.5 text-gray-900 line-clamp-2">{news.title}</h3>
                          <p 
                            className="text-xs text-gray-600 line-clamp-2 mb-2"
                            dangerouslySetInnerHTML={{ __html: news.description.substring(0, 80) + '...' }}
                          />
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs">
                            Read More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Category Tabs Section */}
        <section className="relative z-40 max-w-screen-2xl mx-auto pb-0">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max">
                {[
                  { id: "home", label: "Home", icon: Sparkles },
                  { id: "circles", label: "Skill Circles", icon: Users },
                  { id: "hackathons", label: "Hackathons", icon: Trophy },
                  { id: "talks", label: "Leader Talks", icon: Video },
                  { id: "internships", label: "Internships", icon: Briefcase },
                  { id: "incubation", label: "Incubation", icon: Building2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-700 text-white shadow-md' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-3 sm:pt-4 pb-6 sm:pb-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">

            {/* Home Tab - Reddit/Threads-like Tech Discussions */}
            <TabsContent value="home" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Posts Feed - Left Side */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
                  {/* Create Post Section */}
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback className="text-xs sm:text-sm">U</AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-start text-left text-gray-500 hover:bg-gray-50 rounded-lg sm:rounded-xl h-10 sm:h-12 border-gray-300 text-xs sm:text-sm"
                          onClick={() => {/* Open create post modal */}}
                        >
                          <span className="hidden sm:inline">What's on your mind? Share your tech thoughts...</span>
                          <span className="sm:hidden">Share your thoughts...</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-1 sm:px-2">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Text</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-1 sm:px-2">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Video</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-1 sm:px-2">
                          <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Code</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-1 sm:px-2">
                          <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Image</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                {[
                  {
                    id: 1,
                    community: "React",
                    author: "jessica_dev",
                    timeAgo: "2 hours ago",
                    title: "Just completed the Advanced React Course! Here's what I learned in 30 days",
                    content: "I spent the last month diving deep into React hooks, context API, and performance optimization. The journey was challenging but incredibly rewarding...",
                    upvotes: "2.8k",
                    comments: 234,
                    flairs: [{ label: "Learning", color: "bg-blue-100 text-blue-800" }]
                  },
                  {
                    id: 2,
                    community: "WebDev",
                    author: "tom_designs",
                    timeAgo: "4 hours ago",
                    title: "Got my first freelance client through SkillHub! Thank you all for the support",
                    content: "After 6 months of building my portfolio and networking here, I landed my first client. They found me through my project posts. This community is amazing!",
                    upvotes: "4.5k",
                    comments: 389,
                    flairs: [{ label: "Success Story", color: "bg-green-100 text-green-800" }]
                  },
                  {
                    id: 3,
                    community: "AI_ML",
                    author: "skillhub_official",
                    timeAgo: "5 hours ago",
                    title: "AI Hackathon Winners Announced - Congratulations to everyone who participated!",
                    content: "We're thrilled to announce the winners of our AI Innovation Challenge. Over 500 teams participated, and the results were outstanding...",
                    upvotes: "8.9k",
                    comments: 567,
                    flairs: [
                      { label: "Official", color: "bg-blue-100 text-blue-800" },
                      { label: "Hackathon", color: "bg-orange-100 text-orange-800" }
                    ]
                  },
                  {
                    id: 4,
                    community: "MachineLearning",
                    author: "dr_sarah_ml",
                    timeAgo: "7 hours ago",
                    title: "[AMA] I'm a Senior ML Engineer at Google, ask me anything about breaking into AI/ML",
                    content: "Hey everyone! I've been in ML for 8+ years. Happy to answer questions about career paths, learning resources, and what it takes to work in AI...",
                    upvotes: "12.5k",
                    comments: 892,
                    flairs: [
                      { label: "AMA", color: "bg-blue-100 text-blue-800" },
                      { label: "Expert", color: "bg-green-100 text-green-800" }
                    ]
                  }
                ].map((post) => (
                  <Card key={post.id} className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-4">
                        {/* Upvote/Downvote - Left Side */}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1 pt-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:text-orange-500">
                            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </Button>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{post.upvotes}</span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:text-blue-500">
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header with community, author, time, flairs */}
                          <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-900">r/{post.community}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                            <span className="text-[10px] sm:text-xs text-gray-600 hidden sm:inline">Posted by u/{post.author}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">•</span>
                            <span className="text-[10px] sm:text-xs text-gray-500">{post.timeAgo}</span>
                            <div className="flex gap-1 sm:gap-1.5 ml-auto">
                              {post.flairs.map((flair, idx) => (
                                <Badge key={idx} className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${flair.color} border-0`}>
                                  {flair.label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 leading-snug line-clamp-2">{post.title}</h3>
                          
                          {/* Content Snippet */}
                          <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-2">{post.content}</p>

                          {/* Footer Actions */}
                          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                              <span className="text-[10px] sm:text-xs">{post.comments}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline text-xs">Share</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                              <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline text-xs">Award</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>

                {/* Notification Hub - Right Sidebar */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <div className="lg:sticky lg:top-20">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl">
                      <CardHeader>
                        <CardTitle>
                          Notification Hub
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-sm">Upcoming Hackathons</h3>
                            </div>
                            <p className="text-xs text-gray-600">2 hackathons starting this week</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-sm">Leader Talks</h3>
                            </div>
                            <p className="text-xs text-gray-600">3 AMA sessions scheduled</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-sm">New Opportunities</h3>
                            </div>
                            <p className="text-xs text-gray-600">5 internships posted today</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Skill Circles Tab */}
            <TabsContent value="circles" id="circles-section" className="space-y-4">

              {/* Recommended Communities */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl">
                <CardHeader>
                  <CardTitle>
                    Recommended Community based on your skills for you
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillCircles.slice(0, 3).map((circle) => (
                      <Card key={circle.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-sm">{circle.name}</h3>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">{circle.level}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{circle.description.substring(0, 60)}...</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{circle.members.toLocaleString()} members</span>
                            <Button size="sm" className="h-6 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                              Join
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Circles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-0">
                {skillCircles.map((circle) => (
                  <Card key={circle.id} className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-200/50 rounded-xl hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold mb-1.5">{circle.name}</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">{circle.level}</Badge>
                        </div>
                        <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 mb-3 text-xs leading-relaxed line-clamp-2">{circle.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {circle.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{circle.members.toLocaleString()} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{circle.discussions} discussions</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Active {circle.recentActivity}</span>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg text-xs px-3 py-1.5 h-7">
                          Join Circle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Hackathons Tab */}
            <TabsContent value="hackathons" id="hackathons-section" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Hackathons List - Left Side */}
                <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-2 lg:order-1">
                  {hackathons.map((hackathon) => (
                    <Card 
                      key={hackathon.id} 
                      className={`bg-white/80 backdrop-blur-sm shadow-md border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        selectedHackathon === hackathon.id 
                          ? 'border-blue-500 border-2' 
                          : 'border-gray-200/50'
                      }`}
                      onClick={() => setSelectedHackathon(hackathon.id)}
                    >
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CardTitle className="text-sm font-semibold line-clamp-1">{hackathon.title}</CardTitle>
                              <Badge className={`text-xs px-1.5 py-0 ${hackathon.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {hackathon.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-xs line-clamp-1 mb-1.5">{hackathon.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(hackathon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{hackathon.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{hackathon.location}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">{hackathon.level}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{hackathon.participants}</span>
                            <span>•</span>
                            <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            <span className="truncate font-semibold">{hackathon.prize}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hackathon.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              {tag}
                            </Badge>
                          ))}
                          {hackathon.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              +{hackathon.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Hackathon Details - Right Side */}
                <div className="lg:col-span-3 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-1 lg:order-2">
                  {selectedHackathon ? (
                    (() => {
                      const hackathon = hackathons.find(h => h.id === selectedHackathon);
                      if (!hackathon) return null;
                      return (
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <CardTitle className="text-lg sm:text-2xl">{hackathon.title}</CardTitle>
                                  <Badge className={hackathon.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {hackathon.status}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-4">{hackathon.description}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            {/* Event Details */}
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                Event Details
                              </h3>
                              <div className="pl-0 sm:pl-7 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Date: {new Date(hackathon.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Duration: {hackathon.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Location: {hackathon.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-xs">{hackathon.level}</Badge>
                                  <span className="text-gray-500 text-xs">Difficulty Level</span>
                                </div>
                              </div>
                            </div>

                            {/* Participation Info */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Participation
                              </h3>
                              <div className="pl-7 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">{hackathon.participants} registered participants</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Award className="h-4 w-4 text-yellow-500" />
                                  <span className="text-gray-700 font-semibold">Prize Pool: {hackathon.prize}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-700">Organizer: <span className="font-semibold">{hackathon.organizer}</span></span>
                                </div>
                              </div>
                            </div>

                            {/* Tags & Categories */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Technologies & Tags
                              </h3>
                              <div className="pl-7">
                                <div className="flex flex-wrap gap-2">
                                  {hackathon.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs px-3 py-1">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                What to Expect
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>• Network with industry professionals and fellow developers</p>
                                <p>• Learn from expert mentors and judges</p>
                                <p>• Build real-world solutions and showcase your skills</p>
                                <p>• Compete for prizes and recognition</p>
                                <p>• Get feedback on your projects from experienced developers</p>
                              </div>
                            </div>

                            {/* Rules & Guidelines */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Rules & Guidelines
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>• Teams can have up to 4 members</p>
                                <p>• All code must be written during the hackathon</p>
                                <p>• Projects must be submitted before the deadline</p>
                                <p>• All participants must follow the code of conduct</p>
                                <p>• Winners will be announced at the end of the event</p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 border-t border-gray-200">
                              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl h-12 text-base">
                                {hackathon.status === "upcoming" ? "Register Now" : "View Results"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()
                  ) : (
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Select a hackathon to view details</p>
                        <p className="text-gray-400 text-sm mt-2">Click on any hackathon from the list to see full information</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Leader Talks Tab */}
            <TabsContent value="talks" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Leader Talks List - Left Side */}
                <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-2 lg:order-1">
                  {leaderTalks.map((talk) => (
                    <Card 
                      key={talk.id} 
                      className={`bg-white/80 backdrop-blur-sm shadow-md border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        selectedTalk === talk.id 
                          ? 'border-blue-500 border-2' 
                          : 'border-gray-200/50'
                      }`}
                      onClick={() => setSelectedTalk(talk.id)}
                    >
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">{talk.speaker.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <CardTitle className="text-xs font-semibold line-clamp-1">{talk.speaker}</CardTitle>
                                <Badge className={`text-xs px-1.5 py-0 h-4 ${talk.type === "AMA" ? "bg-purple-100 text-purple-800" : talk.type === "Workshop" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                  {talk.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1">{talk.role}</p>
                              <p className="text-xs text-blue-600 font-semibold line-clamp-1">{talk.company}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <h3 className="font-semibold text-xs mb-2 line-clamp-2">{talk.title}</h3>
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(talk.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{talk.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{talk.attendees} registered</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {talk.topics.slice(0, 2).map((topic, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              {topic}
                            </Badge>
                          ))}
                          {talk.topics.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              +{talk.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Leader Talk Details - Right Side */}
                <div className="lg:col-span-3 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-1 lg:order-2">
                  {selectedTalk ? (
                    (() => {
                      const talk = leaderTalks.find(t => t.id === selectedTalk);
                      if (!talk) return null;
                      return (
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                                <AvatarFallback className="text-sm sm:text-lg">{talk.speaker.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <CardTitle className="text-lg sm:text-2xl">{talk.speaker}</CardTitle>
                                  <Badge className={talk.type === "AMA" ? "bg-purple-100 text-purple-800" : talk.type === "Workshop" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                                    {talk.type}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-1">{talk.role}</p>
                                <p className="text-blue-600 font-semibold">{talk.company}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            {/* Session Details */}
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                Session Details
                              </h3>
                              <div className="pl-0 sm:pl-7 space-y-2">
                                <h2 className="font-bold text-base sm:text-xl text-gray-900 mb-2">{talk.title}</h2>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Date: {new Date(talk.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Time: {talk.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">{talk.attendees} registered attendees</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge className={talk.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {talk.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Topics & Themes */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Topics & Themes
                              </h3>
                              <div className="pl-7">
                                <div className="flex flex-wrap gap-2">
                                  {talk.topics.map((topic, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs px-3 py-1">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* What You'll Learn */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                What You'll Learn
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>• Insights from industry leaders at top tech companies</p>
                                <p>• Practical knowledge and real-world experiences</p>
                                <p>• Career guidance and professional development tips</p>
                                <p>• Networking opportunities with peers and mentors</p>
                                <p>• Q&A session to get your questions answered</p>
                              </div>
                            </div>

                            {/* Speaker Bio */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                About the Speaker
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p><span className="font-semibold">{talk.speaker}</span> is a {talk.role} at <span className="font-semibold text-blue-600">{talk.company}</span> with extensive experience in the industry. They bring valuable insights and practical knowledge from working at one of the world's leading technology companies.</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex gap-3">
                                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl h-12 text-base">
                                  {talk.status === "upcoming" ? "Register Now" : "Watch Recording"}
                                  {talk.status === "upcoming" ? null : <PlayCircle className="ml-2 h-5 w-5" />}
                                </Button>
                                {talk.status === "upcoming" && (
                                  <Button variant="outline" className="rounded-xl h-12 px-4">
                                    <Bell className="h-5 w-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()
                  ) : (
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Select a leader talk to view details</p>
                        <p className="text-gray-400 text-sm mt-2">Click on any talk from the list to see full information</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Internships Tab */}
            <TabsContent value="internships" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* Internships List - Left Side */}
                <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-2 lg:order-1">
                  {internships.map((internship) => (
                    <Card 
                      key={internship.id} 
                      className={`bg-white/80 backdrop-blur-sm shadow-md border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        selectedInternship === internship.id 
                          ? 'border-blue-500 border-2' 
                          : 'border-gray-200/50'
                      }`}
                      onClick={() => setSelectedInternship(internship.id)}
                    >
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <CardTitle className="text-xs font-semibold line-clamp-1">{internship.role}</CardTitle>
                              <Badge className="text-xs px-1.5 py-0 h-4 bg-green-100 text-green-800">
                                {internship.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-blue-600 font-semibold line-clamp-1">{internship.company}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{internship.duration}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{internship.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Briefcase className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate font-semibold">{internship.stipend}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(internship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{internship.applicants}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {internship.skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              {skill}
                            </Badge>
                          ))}
                          {internship.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                              +{internship.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Internship Details - Right Side */}
                <div className="lg:col-span-3 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden order-1 lg:order-2">
                  {selectedInternship ? (
                    (() => {
                      const internship = internships.find(i => i.id === selectedInternship);
                      if (!internship) return null;
                      return (
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <CardTitle className="text-lg sm:text-2xl">{internship.role}</CardTitle>
                                  <Badge className="bg-green-100 text-green-800">
                                    {internship.type}
                                  </Badge>
                                </div>
                                <p className="text-xl font-semibold text-blue-600 mb-4">{internship.company}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            {/* Job Details */}
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                Job Details
                              </h3>
                              <div className="pl-0 sm:pl-7 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Duration: {internship.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Location: {internship.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Briefcase className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700 font-semibold">Stipend: {internship.stipend}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Application Deadline: {new Date(internship.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">{internship.applicants} applicants</span>
                                </div>
                              </div>
                            </div>

                            {/* Required Skills */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Required Skills
                              </h3>
                              <div className="pl-7">
                                <div className="flex flex-wrap gap-2">
                                  {internship.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs px-3 py-1">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* About the Role */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                About the Role
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>• Gain hands-on experience working on real-world projects</p>
                                <p>• Learn from experienced mentors and industry professionals</p>
                                <p>• Build your portfolio with meaningful contributions</p>
                                <p>• Network with team members and expand your professional connections</p>
                                <p>• Opportunity for full-time conversion based on performance</p>
                              </div>
                            </div>

                            {/* What You'll Do */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                What You'll Do
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>• Collaborate with the development team on exciting projects</p>
                                <p>• Write clean, maintainable code following best practices</p>
                                <p>• Participate in code reviews and team meetings</p>
                                <p>• Contribute to technical documentation and knowledge sharing</p>
                                <p>• Take ownership of features and see them through to completion</p>
                              </div>
                            </div>

                            {/* Application Process */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900">
                                Application Process
                              </h3>
                              <div className="pl-7 space-y-2 text-sm text-gray-700">
                                <p>1. Submit your application with resume and portfolio</p>
                                <p>2. Technical assessment or coding challenge</p>
                                <p>3. Interview with the team</p>
                                <p>4. Final decision and offer</p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 border-t border-gray-200">
                              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl h-12 text-base">
                                Apply Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()
                  ) : (
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-2xl">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">Select an internship to view details</p>
                        <p className="text-gray-400 text-sm mt-2">Click on any internship from the list to see full information</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Incubation Tab */}
            <TabsContent value="incubation" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {incubationPrograms.map((program) => (
                  <Card key={program.id} className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-shrink-0 p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-xl mb-2 line-clamp-2">{program.name}</CardTitle>
                          <Badge className="bg-purple-100 text-purple-800">{program.focus}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-4 sm:p-6 pt-0">
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{program.description}</p>
                      
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">Duration: {program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">{program.available} of {program.spots} spots available</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700">Deadline: {new Date(program.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4 flex-shrink-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Benefits:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                          {program.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="text-gray-600 line-clamp-1">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <Dialog open={isIncubationFormOpen && selectedIncubationProgram === program.id} onOpenChange={(open) => {
                          setIsIncubationFormOpen(open);
                          if (!open) setSelectedIncubationProgram(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base h-10 sm:h-11"
                              onClick={() => {
                                setSelectedIncubationProgram(program.id);
                                setIsIncubationFormOpen(true);
                              }}
                            >
                              Apply for Incubation
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 sm:p-6">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-2xl">Apply for {program.name}</DialogTitle>
                              <DialogDescription>
                                Fill out the form below to apply for our incubation program. We'll review your application and get back to you soon.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              console.log("Application submitted:", { programId: program.id, ...incubationFormData });
                              // Close form first
                              setIsIncubationFormOpen(false);
                              setSelectedIncubationProgram(null);
                              // Reset form data
                              setIncubationFormData({
                                name: "",
                                email: "",
                                phone: "",
                                startupName: "",
                                startupDescription: "",
                                teamSize: "",
                                fundingStage: "",
                                whyJoin: ""
                              });
                              // Show success dialog
                              setTimeout(() => {
                                setShowSuccessDialog(true);
                              }, 300);
                            }} className="space-y-4 mt-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                                  <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={incubationFormData.name}
                                    onChange={(e) => setIncubationFormData({ ...incubationFormData, name: e.target.value })}
                                    required
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={incubationFormData.email}
                                    onChange={(e) => setIncubationFormData({ ...incubationFormData, email: e.target.value })}
                                    required
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="+1 234 567 8900"
                                  value={incubationFormData.phone}
                                  onChange={(e) => setIncubationFormData({ ...incubationFormData, phone: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="startupName">Startup Name *</Label>
                                <Input
                                  id="startupName"
                                  placeholder="Your Startup Name"
                                  value={incubationFormData.startupName}
                                  onChange={(e) => setIncubationFormData({ ...incubationFormData, startupName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="startupDescription">Startup Description *</Label>
                                <Textarea
                                  id="startupDescription"
                                  placeholder="Describe your startup, what problem it solves, and your vision..."
                                  value={incubationFormData.startupDescription}
                                  onChange={(e) => setIncubationFormData({ ...incubationFormData, startupDescription: e.target.value })}
                                  rows={4}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="teamSize" className="text-sm sm:text-base">Team Size *</Label>
                                  <Input
                                    id="teamSize"
                                    type="number"
                                    placeholder="e.g., 5"
                                    min="1"
                                    value={incubationFormData.teamSize}
                                    onChange={(e) => setIncubationFormData({ ...incubationFormData, teamSize: e.target.value })}
                                    required
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="fundingStage" className="text-sm sm:text-base">Current Funding Stage *</Label>
                                  <Input
                                    id="fundingStage"
                                    placeholder="e.g., Pre-seed, Seed, Series A"
                                    value={incubationFormData.fundingStage}
                                    onChange={(e) => setIncubationFormData({ ...incubationFormData, fundingStage: e.target.value })}
                                    required
                                    className="text-sm sm:text-base"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="whyJoin">Why do you want to join this program? *</Label>
                                <Textarea
                                  id="whyJoin"
                                  placeholder="Tell us why you're interested in this incubation program and what you hope to achieve..."
                                  value={incubationFormData.whyJoin}
                                  onChange={(e) => setIncubationFormData({ ...incubationFormData, whyJoin: e.target.value })}
                                  rows={4}
                                  required
                                />
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    setIsIncubationFormOpen(false);
                                    setSelectedIncubationProgram(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                  Submit Application
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Application Submitted!</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Application submitted successfully! We'll review your application and contact you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

