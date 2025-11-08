# Job API Endpoints Documentation

This document lists all available job-related API endpoints and how to use them.

## Company Endpoints

### 1. List Companies
```javascript
const { data: companies, isLoading } = listCompaniesApiV1CompaniesGet();
```

### 2. Create Company
```javascript
const createCompany = createCompanyApiV1CompaniesPost();
createCompany.mutate({
  name: "Tech Corp",
  website: "https://techcorp.com",
  industry: "Technology",
  size_range: "100-500",
  hq_country: "USA",
  hq_city: "San Francisco"
});
```

### 3. Get Company by ID
```javascript
const { data: company } = getCompanyApiV1Companies_CompanyId_Get({
  company_id: "123",
  enabled: true
});
```

### 4. Update Company
```javascript
const updateCompany = updateCompanyApiV1Companies_CompanyId_Put();
updateCompany.mutate({
  company_id: "123",
  name: "Updated Company Name"
});
```

### 5. Delete Company
```javascript
const deleteCompany = deleteCompanyApiV1Companies_CompanyId_Delete();
deleteCompany.mutate({ company_id: "123" });
```

## Job Endpoints

### 1. List Jobs
```javascript
const { data: jobs, isLoading } = listJobsApiV1JobsGet();
```

### 2. Create Job
```javascript
const createJob = createJobApiV1JobsPost();
createJob.mutate({
  title: "Senior Developer",
  description: "Full-stack development role",
  company_name: "Tech Corp",
  employment_type: "FULL_TIME",
  work_type: "REMOTE",
  seniority_level: "SENIOR",
  country: "USA",
  skills: ["JavaScript", "React", "Node.js"],
  salary_currency: "USD",
  salary_min: 100000,
  salary_max: 150000
});
```

### 3. Get Job by ID
```javascript
const { data: job } = getJobApiV1Jobs_JobId_Get({
  job_id: "456",
  enabled: true
});
```

### 4. Update Job
```javascript
const updateJob = updateJobApiV1Jobs_JobId_Put();
updateJob.mutate({
  job_id: "456",
  title: "Lead Developer",
  description: "Updated description"
});
```

### 5. Delete Job (Soft Delete)
```javascript
const deleteJob = deleteJobApiV1Jobs_JobId_Delete();
deleteJob.mutate({ job_id: "456" });
```

### 6. Restore Job
```javascript
const restoreJob = restoreJobApiV1Jobs_JobId_RestorePost();
restoreJob.mutate({ job_id: "456" });
```

### 7. Get Job Audits
```javascript
const { data: audits } = listJobAuditsApiV1Jobs_JobId_AuditsGet({
  job_id: "456",
  enabled: true
});
```

### 8. Hard Delete Job
```javascript
const hardDeleteJob = hardDeleteJobApiV1Jobs_JobId_HardDeleteDelete();
hardDeleteJob.mutate({ job_id: "456" });
```

### 9. Get Job Statistics
```javascript
const { data: stats } = jobsStatsApiV1JobsStatsGet();
```

## Health Endpoints

### 1. Root Endpoint
```javascript
const { data: rootInfo } = jobsRoot_Get();
```

### 2. Health Check
```javascript
const { data: healthInfo } = jobsHealthCheckHealthGet();
```

### 3. Healthz
```javascript
const { data: healthzInfo } = jobsHealthzHealthzGet();
```

## URL Structure

All endpoints use the base URL: `https://zettanix.in`

### Company URLs:
- `GET /jobs/api/v1/companies` - List companies
- `POST /jobs/api/v1/companies` - Create company
- `GET /jobs/api/v1/companies/{company_id}` - Get company
- `PUT /jobs/api/v1/companies/{company_id}` - Update company
- `DELETE /jobs/api/v1/companies/{company_id}` - Delete company

### Job URLs:
- `GET /jobs/api/v1/jobs` - List jobs
- `POST /jobs/api/v1/jobs` - Create job
- `GET /jobs/api/v1/jobs/{job_id}` - Get job
- `PUT /jobs/api/v1/jobs/{job_id}` - Update job
- `DELETE /jobs/api/v1/jobs/{job_id}` - Delete job
- `POST /jobs/api/v1/jobs/{job_id}/restore` - Restore job
- `GET /jobs/api/v1/jobs/{job_id}/audits` - Get job audits
- `DELETE /jobs/api/v1/jobs/{job_id}/hard-delete` - Hard delete job
- `GET /jobs/api/v1/jobs/stats` - Get job statistics

### Health URLs:
- `GET /jobs/` - Root endpoint
- `GET /jobs/health` - Health check
- `GET /jobs/healthz` - Healthz endpoint

## Error Handling

All endpoints return proper error responses:
- 422: Validation Error
- 404: Not Found
- 500: Internal Server Error

## Parameter Substitution

The generator automatically handles parameter substitution:
- `{company_id}` → `${company_id}`
- `{job_id}` → `${job_id}`

This ensures proper URL construction for all endpoints.

## Persistence

These endpoints are now **permanently fixed** and will:
- ✅ Work correctly with `npm run dev`
- ✅ Work correctly with `npm run build`
- ✅ Use `zettanix.in` instead of localhost
- ✅ Handle parameter substitution properly
- ✅ Not revert to broken state on regeneration
