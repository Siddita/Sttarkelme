# Community API Endpoints Documentation

Based on the analysis of `CommunityPublic.tsx`, here are all the endpoints you need to develop for the Community feature.

## Base URL
All endpoints should use: `https://talentcueai.com/community` (or your configured API base URL)

---

## 1. Search Endpoints

### 1.1 Search Community Content
**Endpoint:** `GET /community/search`
**Description:** Search across all community content (posts, circles, hackathons, talks, internships)

**Query Parameters:**
- `q` (string, required): Search query1
- `type` (string, optional): Filter by type - `posts`, `circles`, `hackathons`, `talks`, `internships`, `all`
- `limit` (integer, optional): Number of results (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "results": {
    "posts": [...],
    "circles": [...],
    "hackathons": [...],
    "talks": [...],
    "internships": [...]
  },
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

## 2. Posts/Feed Endpoints (Reddit-like Discussions)

### 2.1 Get Posts Feed
**Endpoint:** `GET /community/posts`
**Description:** Get paginated feed of community posts

**Query Parameters:**
- `limit` (integer, optional): Number of posts (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)
- `sort` (string, optional): Sort by - `hot`, `new`, `top`, `trending` (default: `hot`)
- `circle_id` (integer, optional): Filter by skill circle
- `author_id` (integer, optional): Filter by author

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "title": "Just completed the Advanced React Course!",
      "content": "I spent the last month diving deep...",
      "author": {
        "id": 123,
        "username": "jessica_dev",
        "avatar": "https://...",
        "name": "Jessica Dev"
      },
      "community": {
        "id": 4,
        "name": "React",
        "slug": "react"
      },
      "upvotes": 2800,
      "downvotes": 45,
      "comments_count": 234,
      "flairs": [
        {"label": "Learning", "color": "blue"}
      ],
      "post_type": "text", // text, video, code, image
      "media_urls": [],
      "created_at": "2024-02-10T14:30:00Z",
      "updated_at": "2024-02-10T14:30:00Z",
      "user_vote": null // null, "upvote", "downvote"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### 2.2 Create Post
**Endpoint:** `POST /community/posts`
**Description:** Create a new community post

**Request Body:**
```json
{
  "title": "Post title",
  "content": "Post content",
  "community_id": 4, // Skill circle ID
  "post_type": "text", // text, video, code, image
  "media_urls": ["https://..."], // Optional: for images/videos
  "flairs": ["Learning"] // Optional: array of flair labels
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 123,
    "title": "Post title",
    "content": "Post content",
    "author": {...},
    "community": {...},
    "created_at": "2024-02-10T14:30:00Z"
  }
}
```

### 2.3 Get Single Post
**Endpoint:** `GET /community/posts/{post_id}`
**Description:** Get detailed view of a single post with comments

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "...",
    "content": "...",
    "author": {...},
    "community": {...},
    "upvotes": 2800,
    "downvotes": 45,
    "comments": [
      {
        "id": 1,
        "content": "Great post!",
        "author": {...},
        "upvotes": 120,
        "replies": [...],
        "created_at": "..."
      }
    ],
    "created_at": "..."
  }
}
```

### 2.4 Vote on Post
**Endpoint:** `POST /community/posts/{post_id}/vote`
**Description:** Upvote or downvote a post

**Request Body:**
```json
{
  "vote_type": "upvote" // "upvote", "downvote", or "remove" to remove vote
}
```

**Response:**
```json
{
  "success": true,
  "upvotes": 2801,
  "downvotes": 45,
  "user_vote": "upvote"
}
```

### 2.5 Comment on Post
**Endpoint:** `POST /community/posts/{post_id}/comments`
**Description:** Add a comment to a post

**Request Body:**
```json
{
  "content": "This is a great post!",
  "parent_comment_id": null // Optional: for nested replies
}
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": 456,
    "content": "This is a great post!",
    "author": {...},
    "upvotes": 0,
    "created_at": "..."
  }
}
```

### 2.6 Vote on Comment
**Endpoint:** `POST /community/comments/{comment_id}/vote`
**Description:** Upvote or downvote a comment

**Request Body:**
```json
{
  "vote_type": "upvote" // "upvote", "downvote", or "remove"
}
```

---

## 3. Skill Circles Endpoints

### 3.1 Get All Skill Circles
**Endpoint:** `GET /community/circles`
**Description:** Get list of all skill circles (communities)

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 20)
- `offset` (integer, optional): Pagination offset
- `level` (string, optional): Filter by level - `Level 1`, `Level 2`, `Level 3`
- `search` (string, optional): Search by name or tags

**Response:**
```json
{
  "success": true,
  "circles": [
    {
      "id": 1,
      "name": "Python Developers",
      "description": "Connect with Python developers...",
      "level": "Level 2",
      "tags": ["Python", "Django", "Flask", "Data Science"],
      "member_count": 12500,
      "discussion_count": 234,
      "challenge_count": 12,
      "recent_activity": "2 hours ago",
      "is_member": false, // Whether current user is a member
      "avatar_url": "https://..."
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

### 3.2 Get Recommended Skill Circles
**Endpoint:** `GET /community/circles/recommended`
**Description:** Get skill circles recommended for the current user based on their skills

**Response:**
```json
{
  "success": true,
  "circles": [
    {
      "id": 1,
      "name": "Python Developers",
      "match_reason": "Based on your Python skills",
      "match_score": 0.95,
      ...
    }
  ]
}
```

### 3.3 Get Single Skill Circle
**Endpoint:** `GET /community/circles/{circle_id}`
**Description:** Get detailed information about a skill circle

**Response:**
```json
{
  "success": true,
  "circle": {
    "id": 1,
    "name": "Python Developers",
    "description": "Full description...",
    "level": "Level 2",
    "tags": [...],
    "member_count": 12500,
    "discussion_count": 234,
    "challenge_count": 12,
    "rules": ["Be respectful", "No spam"],
    "moderators": [...],
    "is_member": false,
    "join_request_pending": false
  }
}
```

### 3.4 Join Skill Circle
**Endpoint:** `POST /community/circles/{circle_id}/join`
**Description:** Join a skill circle

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined Python Developers",
  "circle": {
    "id": 1,
    "is_member": true,
    "member_count": 12501
  }
}
```

### 3.5 Leave Skill Circle
**Endpoint:** `POST /community/circles/{circle_id}/leave`
**Description:** Leave a skill circle

**Response:**
```json
{
  "success": true,
  "message": "Successfully left Python Developers"
}
```

---

## 4. Hackathons Endpoints

### 4.1 Get All Hackathons
**Endpoint:** `GET /community/hackathons`
**Description:** Get list of all hackathons

**Query Parameters:**
- `status` (string, optional): Filter by status - `upcoming`, `ongoing`, `completed`
- `limit` (integer, optional): Number of results
- `offset` (integer, optional): Pagination offset
- `search` (string, optional): Search by title or description

**Response:**
```json
{
  "success": true,
  "hackathons": [
    {
      "id": 1,
      "title": "AI Innovation Challenge",
      "description": "Build AI-powered solutions...",
      "date": "2024-02-15",
      "duration": "48 hours",
      "participants": 500,
      "prize": "$10,000",
      "status": "upcoming", // upcoming, ongoing, completed
      "tags": ["AI", "ML", "Innovation"],
      "organizer": "SkillHub Official",
      "location": "Online",
      "level": "Intermediate",
      "registration_deadline": "2024-02-14",
      "is_registered": false,
      "rules": [...],
      "requirements": [...]
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### 4.2 Get Single Hackathon
**Endpoint:** `GET /community/hackathons/{hackathon_id}`
**Description:** Get detailed information about a hackathon

**Response:**
```json
{
  "success": true,
  "hackathon": {
    "id": 1,
    "title": "AI Innovation Challenge",
    "description": "Full description...",
    "date": "2024-02-15",
    "start_time": "09:00:00",
    "end_time": "2024-02-17T09:00:00Z",
    "duration": "48 hours",
    "participants": 500,
    "prize": "$10,000",
    "prize_breakdown": {
      "first": "$5,000",
      "second": "$3,000",
      "third": "$2,000"
    },
    "status": "upcoming",
    "tags": [...],
    "organizer": {...},
    "location": "Online",
    "level": "Intermediate",
    "rules": [...],
    "requirements": [...],
    "judges": [...],
    "is_registered": false,
    "team_id": null // If user is registered, their team ID
  }
}
```

### 4.3 Register for Hackathon
**Endpoint:** `POST /community/hackathons/{hackathon_id}/register`
**Description:** Register for a hackathon (as individual or team)

**Request Body:**
```json
{
  "team_name": "Team Awesome", // Optional: if registering as team
  "team_members": [123, 456], // Optional: user IDs of team members
  "registration_type": "individual" // "individual" or "team"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for AI Innovation Challenge",
  "registration": {
    "id": 789,
    "hackathon_id": 1,
    "team_id": 123,
    "status": "confirmed"
  }
}
```

### 4.4 Get Hackathon Results
**Endpoint:** `GET /community/hackathons/{hackathon_id}/results`
**Description:** Get results/winners of a completed hackathon

**Response:**
```json
{
  "success": true,
  "results": {
    "winners": [
      {
        "rank": 1,
        "team_name": "Team Awesome",
        "project_name": "AI Assistant",
        "prize": "$5,000",
        "members": [...]
      }
    ],
    "submissions": [...]
  }
}
```

---

## 5. Leader Talks Endpoints

### 5.1 Get All Leader Talks
**Endpoint:** `GET /community/talks`
**Description:** Get list of all leader talks/AMAs/workshops

**Query Parameters:**
- `status` (string, optional): Filter by status - `upcoming`, `ongoing`, `completed`
- `type` (string, optional): Filter by type - `AMA`, `Workshop`, `Talk`
- `limit` (integer, optional): Number of results
- `offset` (integer, optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "talks": [
    {
      "id": 1,
      "speaker": {
        "id": 100,
        "name": "Dr. Sarah Chen",
        "role": "Senior ML Engineer",
        "company": "Google",
        "avatar": "https://...",
        "bio": "Dr. Sarah Chen is a..."
      },
      "title": "Breaking into AI/ML: Career Paths and Opportunities",
      "date": "2024-02-10",
      "time": "18:00:00",
      "timezone": "IST",
      "type": "AMA", // AMA, Workshop, Talk
      "attendees": 1200,
      "status": "upcoming",
      "topics": ["Career", "ML", "Interview Prep"],
      "description": "Full description...",
      "is_registered": false,
      "recording_url": null // Available if status is "completed"
    }
  ],
  "total": 8,
  "limit": 20,
  "offset": 0
}
```

### 5.2 Get Single Leader Talk
**Endpoint:** `GET /community/talks/{talk_id}`
**Description:** Get detailed information about a leader talk

**Response:**
```json
{
  "success": true,
  "talk": {
    "id": 1,
    "speaker": {...},
    "title": "...",
    "description": "Full description...",
    "date": "2024-02-10",
    "time": "18:00:00",
    "duration": "60 minutes",
    "type": "AMA",
    "attendees": 1200,
    "status": "upcoming",
    "topics": [...],
    "agenda": [...],
    "is_registered": false,
    "recording_url": null,
    "questions": [...] // If AMA type, list of submitted questions
  }
}
```

### 5.3 Register for Leader Talk
**Endpoint:** `POST /community/talks/{talk_id}/register`
**Description:** Register to attend a leader talk

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the talk",
  "registration": {
    "id": 456,
    "talk_id": 1,
    "user_id": 123,
    "status": "confirmed",
    "calendar_link": "https://..." // For adding to calendar
  }
}
```

### 5.4 Submit Question for AMA
**Endpoint:** `POST /community/talks/{talk_id}/questions`
**Description:** Submit a question for an AMA session

**Request Body:**
```json
{
  "question": "What skills are most important for breaking into ML?"
}
```

**Response:**
```json
{
  "success": true,
  "question": {
    "id": 789,
    "question": "What skills are most important...",
    "author": {...},
    "upvotes": 0,
    "answered": false,
    "created_at": "..."
  }
}
```

### 5.5 Get Talk Recording
**Endpoint:** `GET /community/talks/{talk_id}/recording`
**Description:** Get recording URL for completed talks

**Response:**
```json
{
  "success": true,
  "recording": {
    "video_url": "https://...",
    "transcript_url": "https://...",
    "duration": "3600",
    "available": true
  }
}
```

---

## 6. Internships Endpoints

### 6.1 Get All Internships
**Endpoint:** `GET /community/internships`
**Description:** Get list of all internships

**Query Parameters:**
- `location` (string, optional): Filter by location - `Remote`, `Hybrid`, `On-site`
- `type` (string, optional): Filter by type - `Paid`, `Unpaid`
- `limit` (integer, optional): Number of results
- `offset` (integer, optional): Pagination offset
- `search` (string, optional): Search by role, company, or skills

**Response:**
```json
{
  "success": true,
  "internships": [
    {
      "id": 1,
      "company": {
        "id": 50,
        "name": "TechCorp",
        "logo": "https://...",
        "website": "https://..."
      },
      "role": "Software Engineering Intern",
      "description": "Full job description...",
      "duration": "6 months",
      "location": "Remote",
      "stipend": "₹30,000/month",
      "skills": ["React", "Node.js", "MongoDB"],
      "requirements": [...],
      "responsibilities": [...],
      "applicants": 234,
      "deadline": "2024-02-20",
      "type": "Paid",
      "application_status": null // null, "applied", "shortlisted", "rejected"
    }
  ],
  "total": 8,
  "limit": 20,
  "offset": 0
}
```

### 6.2 Get Single Internship
**Endpoint:** `GET /community/internships/{internship_id}`
**Description:** Get detailed information about an internship

**Response:**
```json
{
  "success": true,
  "internship": {
    "id": 1,
    "company": {...},
    "role": "Software Engineering Intern",
    "description": "Full description...",
    "duration": "6 months",
    "location": "Remote",
    "stipend": "₹30,000/month",
    "skills": [...],
    "requirements": [...],
    "responsibilities": [...],
    "benefits": [...],
    "application_process": [...],
    "applicants": 234,
    "deadline": "2024-02-20",
    "type": "Paid",
    "application_status": null
  }
}
```

### 6.3 Apply for Internship
**Endpoint:** `POST /community/internships/{internship_id}/apply`
**Description:** Apply for an internship

**Request Body:**
```json
{
  "resume_url": "https://...", // URL to uploaded resume
  "cover_letter": "I am interested in...", // Optional
  "portfolio_url": "https://...", // Optional
  "additional_info": "..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": 999,
    "internship_id": 1,
    "user_id": 123,
    "status": "submitted",
    "submitted_at": "2024-02-10T14:30:00Z"
  }
}
```

### 6.4 Get User's Applications
**Endpoint:** `GET /community/internships/applications`
**Description:** Get all internships the current user has applied to

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": 999,
      "internship": {...},
      "status": "submitted", // submitted, shortlisted, rejected, accepted
      "submitted_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

## 7. Incubation Programs Endpoints

### 7.1 Get All Incubation Programs
**Endpoint:** `GET /community/incubation`
**Description:** Get list of all incubation programs

**Query Parameters:**
- `focus` (string, optional): Filter by focus area
- `limit` (integer, optional): Number of results
- `offset` (integer, optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "programs": [
    {
      "id": 1,
      "name": "Startup Accelerator Program",
      "description": "6-month intensive program...",
      "duration": "6 months",
      "benefits": ["Funding", "Mentorship", "Office Space", "Networking"],
      "spots": 10,
      "available": 3,
      "deadline": "2024-03-01",
      "focus": "Tech Startups",
      "eligibility": [...],
      "application_status": null // null, "applied", "under_review", "accepted", "rejected"
    }
  ],
  "total": 9,
  "limit": 20,
  "offset": 0
}
```

### 7.2 Get Single Incubation Program
**Endpoint:** `GET /community/incubation/{program_id}`
**Description:** Get detailed information about an incubation program

**Response:**
```json
{
  "success": true,
  "program": {
    "id": 1,
    "name": "Startup Accelerator Program",
    "description": "Full description...",
    "duration": "6 months",
    "benefits": [...],
    "spots": 10,
    "available": 3,
    "deadline": "2024-03-01",
    "focus": "Tech Startups",
    "eligibility": [...],
    "application_process": [...],
    "success_stories": [...],
    "application_status": null
  }
}
```

### 7.3 Apply for Incubation Program
**Endpoint:** `POST /community/incubation/{program_id}/apply`
**Description:** Submit application for incubation program

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "startup_name": "My Startup",
  "startup_description": "We solve...",
  "team_size": 5,
  "funding_stage": "Pre-seed",
  "why_join": "We want to...",
  "pitch_deck_url": "https://...", // Optional
  "website": "https://...", // Optional
  "additional_info": "..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": 888,
    "program_id": 1,
    "user_id": 123,
    "status": "submitted",
    "submitted_at": "2024-02-10T14:30:00Z"
  }
}
```

### 7.4 Get User's Incubation Applications
**Endpoint:** `GET /community/incubation/applications`
**Description:** Get all incubation applications by current user

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": 888,
      "program": {...},
      "status": "submitted",
      "submitted_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

## 8. Notifications Endpoints

### 8.1 Get Notifications
**Endpoint:** `GET /community/notifications`
**Description:** Get user's community notifications

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 20)
- `offset` (integer, optional): Pagination offset
- `unread_only` (boolean, optional): Only return unread notifications

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "hackathon_reminder", // hackathon_reminder, talk_reminder, new_opportunity, post_reply, etc.
      "title": "Upcoming Hackathons",
      "message": "2 hackathons starting this week",
      "read": false,
      "created_at": "2024-02-10T14:30:00Z",
      "action_url": "/community/hackathons"
    }
  ],
  "unread_count": 5
}
```

### 8.2 Mark Notification as Read
**Endpoint:** `PUT /community/notifications/{notification_id}/read`
**Description:** Mark a notification as read

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": 1,
    "read": true
  }
}
```

### 8.3 Mark All Notifications as Read
**Endpoint:** `PUT /community/notifications/read-all`
**Description:** Mark all notifications as read

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 9. Hot Skills Leaderboard

### 9.1 Get Hot Skills
**Endpoint:** `GET /community/skills/hot`
**Description:** Get trending skills leaderboard

**Query Parameters:**
- `limit` (integer, optional): Number of skills (default: 10)
- `period` (string, optional): Time period - `day`, `week`, `month` (default: `week`)

**Response:**
```json
{
  "success": true,
  "skills": [
    {
      "skill": "React",
      "growth": "+45%",
      "posts_count": 1234,
      "level": "Level 2",
      "trend": "up" // up, down, stable
    }
  ]
}
```

---

## Implementation Notes

### Authentication
- All endpoints (except public GET endpoints) require authentication
- Use Bearer token in Authorization header: `Authorization: Bearer <token>`

### Error Responses
All endpoints should return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional error details
}
```

### Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Pagination
All list endpoints should support pagination with `limit` and `offset` parameters.

### Rate Limiting
Consider implementing rate limiting for:
- Post creation (e.g., 10 posts per hour)
- Voting (e.g., 100 votes per hour)
- Registration endpoints

### File Uploads
For endpoints that require file uploads (resumes, pitch decks, images):
- Use multipart/form-data
- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG, MP4, etc.

---

## Database Schema Suggestions

### Tables Needed:
1. **skill_circles** - Skill circles/communities
2. **circle_members** - User memberships in circles
3. **posts** - Community posts
4. **post_votes** - Post upvotes/downvotes
5. **comments** - Post comments
6. **comment_votes** - Comment votes
7. **hackathons** - Hackathon events
8. **hackathon_registrations** - User registrations
9. **leader_talks** - AMA/workshop sessions
10. **talk_registrations** - User registrations
11. **talk_questions** - Questions for AMA sessions
12. **internships** - Internship listings
13. **internship_applications** - User applications
14. **incubation_programs** - Incubation programs
15. **incubation_applications** - User applications
16. **notifications** - User notifications

---

## Priority Implementation Order

1. **High Priority:**
   - Search endpoint
   - Posts CRUD (Create, Read, Update, Delete)
   - Skill Circles (List, Join, Leave)
   - Hackathons (List, Register)
   - Leader Talks (List, Register)

2. **Medium Priority:**
   - Voting system (posts, comments)
   - Comments system
   - Internships (List, Apply)
   - Incubation Programs (List, Apply)

3. **Low Priority:**
   - Notifications
   - Hot Skills Leaderboard
   - Advanced filtering and sorting


