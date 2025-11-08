// Comprehensive example of all job endpoints usage
import React from 'react';
import { 
  // Company endpoints
  listCompaniesApiV1CompaniesGet,
  createCompanyApiV1CompaniesPost,
  getCompanyApiV1Companies_CompanyId_Get,
  updateCompanyApiV1Companies_CompanyId_Put,
  deleteCompanyApiV1Companies_CompanyId_Delete,
  
  // Job endpoints
  listJobsApiV1JobsGet,
  createJobApiV1JobsPost,
  getJobApiV1Jobs_JobId_Get,
  updateJobApiV1Jobs_JobId_Put,
  deleteJobApiV1Jobs_JobId_Delete,
  restoreJobApiV1Jobs_JobId_RestorePost,
  listJobAuditsApiV1Jobs_JobId_AuditsGet,
  hardDeleteJobApiV1Jobs_JobId_HardDeleteDelete,
  jobsStatsApiV1JobsStatsGet,
  
  // Health endpoints
  jobsRoot_Get,
  jobsHealthCheckHealthGet,
  jobsHealthzHealthzGet
} from '../hooks/useApis';

const JobManagementExample = () => {
  // ===== COMPANY ENDPOINTS =====
  
  // List all companies
  const { data: companies, isLoading: companiesLoading } = listCompaniesApiV1CompaniesGet();
  
  // Get specific company
  const { data: company, isLoading: companyLoading } = getCompanyApiV1Companies_CompanyId_Get({
    company_id: "123",
    enabled: true
  });
  
  // Company mutations
  const createCompany = createCompanyApiV1CompaniesPost();
  const updateCompany = updateCompanyApiV1Companies_CompanyId_Put();
  const deleteCompany = deleteCompanyApiV1Companies_CompanyId_Delete();
  
  // ===== JOB ENDPOINTS =====
  
  // List all jobs
  const { data: jobs, isLoading: jobsLoading } = listJobsApiV1JobsGet();
  
  // Get specific job
  const { data: job, isLoading: jobLoading } = getJobApiV1Jobs_JobId_Get({
    job_id: "456",
    enabled: true
  });
  
  // Get job audits
  const { data: jobAudits, isLoading: auditsLoading } = listJobAuditsApiV1Jobs_JobId_AuditsGet({
    job_id: "456",
    enabled: true
  });
  
  // Get job stats
  const { data: jobStats, isLoading: statsLoading } = jobsStatsApiV1JobsStatsGet();
  
  // Job mutations
  const createJob = createJobApiV1JobsPost();
  const updateJob = updateJobApiV1Jobs_JobId_Put();
  const deleteJob = deleteJobApiV1Jobs_JobId_Delete();
  const restoreJob = restoreJobApiV1Jobs_JobId_RestorePost();
  const hardDeleteJob = hardDeleteJobApiV1Jobs_JobId_HardDeleteDelete();
  
  // ===== HEALTH ENDPOINTS =====
  const { data: rootInfo } = jobsRoot_Get();
  const { data: healthInfo } = jobsHealthCheckHealthGet();
  const { data: healthzInfo } = jobsHealthzHealthzGet();
  
  // ===== EVENT HANDLERS =====
  
  const handleCreateCompany = () => {
    const companyData = {
      name: "Tech Corp",
      website: "https://techcorp.com",
      industry: "Technology",
      size_range: "100-500",
      hq_country: "USA",
      hq_city: "San Francisco"
    };
    createCompany.mutate(companyData);
  };
  
  const handleUpdateCompany = (companyId: string) => {
    const updateData = {
      company_id: companyId,
      name: "Updated Tech Corp",
      website: "https://updated-techcorp.com"
    };
    updateCompany.mutate(updateData);
  };
  
  const handleDeleteCompany = (companyId: string) => {
    deleteCompany.mutate({ company_id: companyId });
  };
  
  const handleCreateJob = () => {
    const jobData = {
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
    };
    createJob.mutate(jobData);
  };
  
  const handleUpdateJob = (jobId: string) => {
    const updateData = {
      job_id: jobId,
      title: "Lead Developer",
      description: "Updated description"
    };
    updateJob.mutate(updateData);
  };
  
  const handleDeleteJob = (jobId: string) => {
    deleteJob.mutate({ job_id: jobId });
  };
  
  const handleRestoreJob = (jobId: string) => {
    restoreJob.mutate({ job_id: jobId });
  };
  
  const handleHardDeleteJob = (jobId: string) => {
    hardDeleteJob.mutate({ job_id: jobId });
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Job Management System</h1>
      
      {/* Company Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Companies</h2>
        
        {companiesLoading && <p>Loading companies...</p>}
        {companies && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company: any) => (
              <div key={company.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{company.name}</h3>
                <p>{company.industry}</p>
                <p>{company.hq_city}, {company.hq_country}</p>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => handleUpdateCompany(company.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDeleteCompany(company.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleCreateCompany}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          disabled={createCompany.isPending}
        >
          {createCompany.isPending ? 'Creating...' : 'Create Company'}
        </button>
      </section>
      
      {/* Jobs Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Jobs</h2>
        
        {jobsLoading && <p>Loading jobs...</p>}
        {jobs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job: any) => (
              <div key={job.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company_name}</p>
                <p className="text-sm">{job.location}</p>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => handleUpdateJob(job.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleRestoreJob(job.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Restore
                  </button>
                  <button 
                    onClick={() => handleHardDeleteJob(job.id)}
                    className="bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Hard Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleCreateJob}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          disabled={createJob.isPending}
        >
          {createJob.isPending ? 'Creating...' : 'Create Job'}
        </button>
      </section>
      
      {/* Job Stats */}
      {jobStats && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Job Statistics</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(jobStats, null, 2)}</pre>
        </section>
      )}
      
      {/* Health Status */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Root Info</h3>
            <pre className="text-sm">{JSON.stringify(rootInfo, null, 2)}</pre>
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Health Check</h3>
            <pre className="text-sm">{JSON.stringify(healthInfo, null, 2)}</pre>
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Healthz</h3>
            <pre className="text-sm">{JSON.stringify(healthzInfo, null, 2)}</pre>
          </div>
        </div>
      </section>
      
      {/* Error Handling */}
      {(createCompany.isError || updateCompany.isError || deleteCompany.isError || 
        createJob.isError || updateJob.isError || deleteJob.isError) && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-semibold text-red-800">Errors:</h3>
          {createCompany.isError && <p>Create Company Error: {createCompany.error?.message}</p>}
          {updateCompany.isError && <p>Update Company Error: {updateCompany.error?.message}</p>}
          {deleteCompany.isError && <p>Delete Company Error: {deleteCompany.error?.message}</p>}
          {createJob.isError && <p>Create Job Error: {createJob.error?.message}</p>}
          {updateJob.isError && <p>Update Job Error: {updateJob.error?.message}</p>}
          {deleteJob.isError && <p>Delete Job Error: {deleteJob.error?.message}</p>}
        </div>
      )}
    </div>
  );
};

export default JobManagementExample;
