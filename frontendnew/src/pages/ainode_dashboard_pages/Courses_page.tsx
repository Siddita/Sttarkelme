import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Clock, Users, Star, Search, Play, CheckCircle, ExternalLink } from "lucide-react";

// Hooks you already have
import {
  listPathsV1LearningPathsGet,
  myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet,
  benchmarksV1IdpBenchmarksGet,
  profileListSkillsV1SkillsGet,
} from "@/hooks/useApis";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseCard | null>(null);

  // Fetch data
  const pathsQ = listPathsV1LearningPathsGet({ refetchOnWindowFocus: false });
  const snapshotQ = myDefaultSnapshotV1LearningPathsMeDefaultSnapshotGet({ refetchOnWindowFocus: false });
  const benchmarksQ = benchmarksV1IdpBenchmarksGet({ refetchOnWindowFocus: false });
  const skillsQ = profileListSkillsV1SkillsGet({ refetchOnWindowFocus: false });

  // Map Learning Paths -> Course cards
  const courses: CourseCard[] = useMemo(() => {
    const paths = Array.isArray(pathsQ.data) ? pathsQ.data : [];
    // try to extract progress/lessons info from snapshot if present
    const snap = snapshotQ.data as any;
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

    return paths.map((p: any): CourseCard => {
      const ps = byPathId[p?.id] ?? {};
      const progress = pct(ps?.progress_pct ?? p?.progress_pct ?? 0);
      const completedLessons = Number(ps?.completed_lessons ?? p?.completed_lessons ?? 0);
      const totalLessons = Number(ps?.total_lessons ?? p?.total_lessons ?? 0);

      let status: CourseCard["status"] = "Not Started";
      if (progress >= 100 || completedLessons > 0 && completedLessons === totalLessons && totalLessons > 0) {
        status = "Completed";
      } else if (progress > 0 || completedLessons > 0) {
        status = "In Progress";
      }

      return {
        id: p?.id ?? crypto.randomUUID(),
        title: p?.title ?? p?.name ?? "Learning Path",
        instructor: p?.owner?.name ?? p?.creator?.name ?? undefined,
        category: p?.category ?? p?.domain ?? undefined,
        level: p?.level ?? p?.difficulty ?? undefined,
        duration: p?.duration_weeks ? `${p.duration_weeks} weeks` : p?.duration ?? undefined,
        progress,
        rating: p?.rating ?? undefined,
        students: p?.enrolled_count ?? undefined,
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
  }, [pathsQ.data, snapshotQ.data]);

  // Build “Recommended” from IDP benchmarks + user skills (very light heuristic)
  const recommended: CourseCard[] = useMemo(() => {
    const bench = Array.isArray(benchmarksQ.data) ? benchmarksQ.data : [];
    const mySkills = Array.isArray(skillsQ.data) ? skillsQ.data : [];
    const have = new Set(
      mySkills
        .map((s: any) => (s?.name ?? s)?.toString().toLowerCase())
        .filter(Boolean)
    );

    // pick 6 skills with lowest percentile/score as gaps
    const gaps = bench
      .map((r: any) => ({
        name: (r?.skill ?? r?.name ?? r?.category ?? "").toString(),
        score: pct(r?.percentile ?? r?.score ?? r?.value ?? 0),
      }))
      .filter((g) => g.name)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);

    // fabricate simple rec cards keyed by gap skills
    return gaps.map((g, i): CourseCard => {
      const title = `${g.name} Fundamentals`;
      const platform = ["Coursera", "Udemy", "edX", "Pluralsight"][i % 4];
      return {
        id: `rec-${g.name}-${i}`,
        title,
        instructor: undefined,
        category: "Recommended",
        level: g.score < 30 ? "Beginner" : g.score < 60 ? "Intermediate" : "Advanced",
        duration: "Self-paced",
        progress: 0,
        rating: 4.7,
        students: undefined,
        status: "Not Started",
        image: undefined,
        description: `Recommended based on your IDP benchmark in ${g.name}.`,
        skills: [g.name],
        price: undefined,
        platform,
        externalUrl: undefined,
      };
    });
  }, [benchmarksQ.data, skillsQ.data]);

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

  const handleBrowseCourses = () => {
    // if you have a catalog route, navigate there
    alert("Opening course catalog…");
  };

  const handleStartCourse = (course: CourseCard) => {
    // TODO: replace with real navigation/deeplink
    alert(`Starting ${course.title}…`);
  };

  const loading =
    pathsQ.isLoading || snapshotQ.isLoading;
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
                Based on your IDP benchmarks{benchmarksQ.isLoading ? " (loading…)" : ""}
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All Recommendations
            </Button>
          </div>

          {benchmarksQ.isError ? (
            <div className="text-sm text-red-600">Failed to load recommendations.</div>
          ) : recommended.length === 0 ? (
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
                          onClick={() => handleStartCourse(course)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Enroll
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={course.externalUrl || "#"} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
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

                    <Button
                      className="w-full mt-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      onClick={() => handleStartCourse(course)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {course.status === "Not Started" ? "Start Course" : "Continue"}
                    </Button>
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
    </div>
  );
}
