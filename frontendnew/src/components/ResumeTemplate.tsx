import React from 'react';
import '../styles/resume-templates.css';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements?: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  gpa?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  personal_info: PersonalInfo;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
  hobbies?: string[];
}

interface ResumeTemplateProps {
  data: ResumeData;
  template: 'professional' | 'creative' | 'minimal' | 'executive';
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, template }) => {
  const formatDate = (date: string) => {
    if (date === 'Present') return 'Present';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isNonEmpty = (value?: string) => !!(value && String(value).trim());
  const hasExperienceContent = (exp: Experience) =>
    isNonEmpty(exp.company) || isNonEmpty(exp.position) || isNonEmpty(exp.description) ||
    isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date) || (exp.achievements && exp.achievements.length > 0);
  const hasEducationContent = (edu: Education) =>
    isNonEmpty(edu.institution) || isNonEmpty(edu.degree) || isNonEmpty(edu.field) ||
    isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date) || isNonEmpty(edu.gpa);
  const hasProjectContent = (proj: Project) =>
    isNonEmpty(proj.name) || isNonEmpty(proj.description) || (proj.technologies && proj.technologies.length > 0) || isNonEmpty(proj.url);
  const hasCertificationContent = (cert: Certification) =>
    isNonEmpty(cert.name) || isNonEmpty(cert.issuer) || isNonEmpty(cert.date);

  const nonEmptySkills = (data.skills || []).filter(s => isNonEmpty(s));
  const nonEmptyExperience = (data.experience || []).filter(hasExperienceContent);
  const nonEmptyEducation = (data.education || []).filter(hasEducationContent);
  const nonEmptyProjects = (data.projects || []).filter(hasProjectContent);
  const nonEmptyCerts = (data.certifications || []).filter(hasCertificationContent);

  const renderProfessional = () => (
    <div className="resume-container resume-professional">
      <div className="header">
        <div className="name">{data.personal_info.name}</div>
        <div className="contact">
          {isNonEmpty(data.personal_info.email) && <span>{data.personal_info.email}</span>}
          {isNonEmpty(data.personal_info.phone) && <span>{data.personal_info.phone}</span>}
          {isNonEmpty(data.personal_info.location) && <span>{data.personal_info.location}</span>}
          {isNonEmpty(data.personal_info.linkedin) && <span>{data.personal_info.linkedin}</span>}
          {isNonEmpty(data.personal_info.github) && <span>{data.personal_info.github}</span>}
          {isNonEmpty(data.personal_info.website) && <span>{data.personal_info.website}</span>}
        </div>
      </div>

      {isNonEmpty(data.summary) && (
        <div className="section">
          <div className="section-title">Professional Summary</div>
          <div className="description">{data.summary}</div>
        </div>
      )}

      {nonEmptySkills.length > 0 && (
        <div className="section">
          <div className="section-title">Skills</div>
          <div className="skills">
            {nonEmptySkills.map((skill, index) => (
              <span key={index} className="skill">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {nonEmptyExperience.length > 0 && (
        <div className="section">
          <div className="section-title">Professional Experience</div>
          {nonEmptyExperience.map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="item-header">
              <div>
                {isNonEmpty(exp.position) && <div className="position">{exp.position}</div>}
                {isNonEmpty(exp.company) && <div className="company">{exp.company}</div>}
              </div>
              <div className="date">
                {isNonEmpty(exp.start_date) && formatDate(exp.start_date)}{isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date) ? ' ' : ''}{(isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date)) && '-'}{isNonEmpty(exp.end_date) ? ` ${formatDate(exp.end_date)}` : ''}
              </div>
            </div>
            {isNonEmpty(exp.description) && <div className="description">{exp.description}</div>}
            {exp.achievements && exp.achievements.length > 0 && (
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {exp.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
          ))}
        </div>
      )}

      {nonEmptyEducation.length > 0 && (
        <div className="section">
          <div className="section-title">Education</div>
          {nonEmptyEducation.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="item-header">
              <div>
                {(isNonEmpty(edu.degree) || isNonEmpty(edu.field)) && (
                  <div className="degree">{isNonEmpty(edu.degree) ? edu.degree : ''}{isNonEmpty(edu.degree) && isNonEmpty(edu.field) ? ' in ' : ''}{isNonEmpty(edu.field) ? edu.field : ''}</div>
                )}
                {isNonEmpty(edu.institution) && <div className="institution">{edu.institution}</div>}
              </div>
              <div className="date">
                {isNonEmpty(edu.start_date) && formatDate(edu.start_date)}{isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date) ? ' ' : ''}{(isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date)) && '-'}{isNonEmpty(edu.end_date) ? ` ${formatDate(edu.end_date)}` : ''}
                {isNonEmpty(edu.gpa) && ` • GPA: ${edu.gpa}`}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {nonEmptyProjects.length > 0 && (
        <div className="section">
          <div className="section-title">Projects</div>
          {nonEmptyProjects.map((project, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                {isNonEmpty(project.name) && <div className="position">{project.name}</div>}
                {isNonEmpty(project.url) && <div className="date">{project.url}</div>}
              </div>
              {isNonEmpty(project.description) && <div className="description">{project.description}</div>}
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#7f8c8d' }}>
                {project.technologies && project.technologies.length > 0 && (
                  <strong>Technologies:</strong>
                )} {project.technologies && project.technologies.length > 0 && project.technologies.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {nonEmptyCerts.length > 0 && (
        <div className="section">
          <div className="section-title">Certifications</div>
          {nonEmptyCerts.map((cert, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                {isNonEmpty(cert.name) && <div className="position">{cert.name}</div>}
                {isNonEmpty(cert.date) && <div className="date">{formatDate(cert.date)}</div>}
              </div>
              {isNonEmpty(cert.issuer) && <div className="company">{cert.issuer}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreative = () => (
    <div className="resume-container resume-creative">
      <div className="content">
        <div className="header">
          <div className="avatar">{getInitials(data.personal_info.name)}</div>
          <div>
            <div className="name">{data.personal_info.name}</div>
            <div className="title">Creative Professional</div>
            <div className="contact">
              {isNonEmpty(data.personal_info.email) && <div>{data.personal_info.email}</div>}
              {isNonEmpty(data.personal_info.phone) && <div>{data.personal_info.phone}</div>}
              {isNonEmpty(data.personal_info.location) && <div>{data.personal_info.location}</div>}
              {isNonEmpty(data.personal_info.linkedin) && <div>{data.personal_info.linkedin}</div>}
              {isNonEmpty(data.personal_info.github) && <div>{data.personal_info.github}</div>}
              {isNonEmpty(data.personal_info.website) && <div>{data.personal_info.website}</div>}
            </div>
          </div>
        </div>

        {isNonEmpty(data.summary) && (
          <div className="section">
            <div className="section-title">About Me</div>
            <div className="description">{data.summary}</div>
          </div>
        )}

        {nonEmptySkills.length > 0 && (
          <div className="section">
            <div className="section-title">Skills & Expertise</div>
            <div className="skills">
              {nonEmptySkills.map((skill, index) => (
                <span key={index} className="skill">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {nonEmptyExperience.length > 0 && (
          <div className="section">
            <div className="section-title">Experience</div>
            {nonEmptyExperience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  {isNonEmpty(exp.position) && <div className="position">{exp.position}</div>}
                  {isNonEmpty(exp.company) && <div className="company">{exp.company}</div>}
                </div>
                <div className="date">
                  {isNonEmpty(exp.start_date) && formatDate(exp.start_date)}{isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date) ? ' ' : ''}{(isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date)) && '-'}{isNonEmpty(exp.end_date) ? ` ${formatDate(exp.end_date)}` : ''}
                </div>
              </div>
              {isNonEmpty(exp.description) && <div className="description">{exp.description}</div>}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {exp.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
            ))}
          </div>
        )}

        {nonEmptyEducation.length > 0 && (
          <div className="section">
            <div className="section-title">Education</div>
            {nonEmptyEducation.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  {(isNonEmpty(edu.degree) || isNonEmpty(edu.field)) && (
                    <div className="position">{isNonEmpty(edu.degree) ? edu.degree : ''}{isNonEmpty(edu.degree) && isNonEmpty(edu.field) ? ' in ' : ''}{isNonEmpty(edu.field) ? edu.field : ''}</div>
                  )}
                  {isNonEmpty(edu.institution) && <div className="company">{edu.institution}</div>}
                </div>
                <div className="date">
                  {isNonEmpty(edu.start_date) && formatDate(edu.start_date)}{isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date) ? ' ' : ''}{(isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date)) && '-'}{isNonEmpty(edu.end_date) ? ` ${formatDate(edu.end_date)}` : ''}
                  {isNonEmpty(edu.gpa) && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {nonEmptyProjects.length > 0 && (
          <div className="section">
            <div className="section-title">Featured Projects</div>
            {nonEmptyProjects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  {isNonEmpty(project.name) && <div className="position">{project.name}</div>}
                  {isNonEmpty(project.url) && <div className="date">{project.url}</div>}
                </div>
                {isNonEmpty(project.description) && <div className="description">{project.description}</div>}
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#667eea' }}>
                  {project.technologies && project.technologies.length > 0 && (
                    <strong>Technologies:</strong>
                  )} {project.technologies && project.technologies.length > 0 && project.technologies.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <div className="section">
            <div className="section-title">Certifications</div>
            {data.certifications.map((cert, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  <div className="position">{cert.name}</div>
                  <div className="date">{formatDate(cert.date)}</div>
                </div>
                <div className="company">{cert.issuer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="resume-container resume-minimal">
      <div className="content">
        <div className="header">
          <div className="name">{data.personal_info.name}</div>
          <div className="title">Software Developer</div>
          <div className="contact">
            {isNonEmpty(data.personal_info.email) && <span>{data.personal_info.email}</span>}
            {isNonEmpty(data.personal_info.phone) && <span>{data.personal_info.phone}</span>}
            {isNonEmpty(data.personal_info.location) && <span>{data.personal_info.location}</span>}
            {isNonEmpty(data.personal_info.linkedin) && <span>{data.personal_info.linkedin}</span>}
            {isNonEmpty(data.personal_info.github) && <span>{data.personal_info.github}</span>}
            {isNonEmpty(data.personal_info.website) && <span>{data.personal_info.website}</span>}
          </div>
        </div>

        {isNonEmpty(data.summary) && (
          <div className="section">
            <div className="section-title">Summary</div>
            <div className="description">{data.summary}</div>
          </div>
        )}

        {nonEmptySkills.length > 0 && (
          <div className="section">
            <div className="section-title">Skills</div>
            <div className="skills">
              {nonEmptySkills.map((skill, index) => (
                <div key={index} className="skill">{skill}</div>
              ))}
            </div>
          </div>
        )}

        {nonEmptyExperience.length > 0 && (
          <div className="section">
            <div className="section-title">Experience</div>
            {nonEmptyExperience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="date-column">
                {isNonEmpty(exp.start_date) && formatDate(exp.start_date)}{isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date) ? ' ' : ''}{(isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date)) && '-'}{isNonEmpty(exp.end_date) ? ` ${formatDate(exp.end_date)}` : ''}
              </div>
              <div className="content-column">
                {isNonEmpty(exp.position) && <div className="position">{exp.position}</div>}
                {isNonEmpty(exp.company) && <div className="company">{exp.company}</div>}
                {isNonEmpty(exp.description) && <div className="description">{exp.description}</div>}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            ))}
          </div>
        )}

        {nonEmptyEducation.length > 0 && (
          <div className="section">
            <div className="section-title">Education</div>
            {nonEmptyEducation.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="date-column">
                {isNonEmpty(edu.start_date) && formatDate(edu.start_date)}{isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date) ? ' ' : ''}{(isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date)) && '-'}{isNonEmpty(edu.end_date) ? ` ${formatDate(edu.end_date)}` : ''}
              </div>
              <div className="content-column">
                {(isNonEmpty(edu.degree) || isNonEmpty(edu.field)) && (
                  <div className="position">{isNonEmpty(edu.degree) ? edu.degree : ''}{isNonEmpty(edu.degree) && isNonEmpty(edu.field) ? ' in ' : ''}{isNonEmpty(edu.field) ? edu.field : ''}</div>
                )}
                {isNonEmpty(edu.institution) && <div className="company">{edu.institution}</div>}
                {isNonEmpty(edu.gpa) && <div className="description">GPA: {edu.gpa}</div>}
              </div>
            </div>
            ))}
          </div>
        )}

        {nonEmptyProjects.length > 0 && (
          <div className="section">
            <div className="section-title">Projects</div>
            {nonEmptyProjects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="date-column">
                  {isNonEmpty(project.url) ? 'Live' : 'Project'}
                </div>
                <div className="content-column">
                  {isNonEmpty(project.name) && <div className="position">{project.name}</div>}
                  {isNonEmpty(project.description) && <div className="description">{project.description}</div>}
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#7f8c8d' }}>
                    {project.technologies && project.technologies.length > 0 && project.technologies.join(' • ')}
                  </div>
                  {isNonEmpty(project.url) && <div style={{ marginTop: '4px', fontSize: '14px', color: '#3498db' }}>{project.url}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <div className="section">
            <div className="section-title">Certifications</div>
            {data.certifications.map((cert, index) => (
              <div key={index} className="experience-item">
                <div className="date-column">{formatDate(cert.date)}</div>
                <div className="content-column">
                  <div className="position">{cert.name}</div>
                  <div className="company">{cert.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderExecutive = () => (
    <div className="resume-container resume-executive">
      <div className="content">
        <div className="header">
          <div className="name-section">
            <div className="name">{data.personal_info.name}</div>
            <div className="title">Executive Leader</div>
            <div className="summary">{data.summary}</div>
          </div>
          <div className="contact">
            {isNonEmpty(data.personal_info.email) && <div>{data.personal_info.email}</div>}
            {isNonEmpty(data.personal_info.phone) && <div>{data.personal_info.phone}</div>}
            {isNonEmpty(data.personal_info.location) && <div>{data.personal_info.location}</div>}
            {isNonEmpty(data.personal_info.linkedin) && <div>{data.personal_info.linkedin}</div>}
            {isNonEmpty(data.personal_info.website) && <div>{data.personal_info.website}</div>}
          </div>
        </div>

        {nonEmptySkills.length > 0 && (
          <div className="section">
            <div className="section-title">Core Competencies</div>
            <div className="skills">
              {nonEmptySkills.map((skill, index) => (
                <div key={index} className="skill-category">
                  <div className="skill">{skill}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nonEmptyExperience.length > 0 && (
          <div className="section">
            <div className="section-title">Executive Experience</div>
            {nonEmptyExperience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  {isNonEmpty(exp.position) && <div className="position">{exp.position}</div>}
                  {isNonEmpty(exp.company) && <div className="company">{exp.company}</div>}
                </div>
                <div className="date">
                  {isNonEmpty(exp.start_date) && formatDate(exp.start_date)}{isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date) ? ' ' : ''}{(isNonEmpty(exp.start_date) || isNonEmpty(exp.end_date)) && '-'}{isNonEmpty(exp.end_date) ? ` ${formatDate(exp.end_date)}` : ''}
                </div>
              </div>
              {isNonEmpty(exp.description) && <div className="description">{exp.description}</div>}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="achievements">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="achievement">• {achievement}</div>
                  ))}
                </div>
              )}
            </div>
            ))}
          </div>
        )}

        {nonEmptyEducation.length > 0 && (
          <div className="section">
            <div className="section-title">Education</div>
            {nonEmptyEducation.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  {(isNonEmpty(edu.degree) || isNonEmpty(edu.field)) && (
                    <div className="position">{isNonEmpty(edu.degree) ? edu.degree : ''}{isNonEmpty(edu.degree) && isNonEmpty(edu.field) ? ' in ' : ''}{isNonEmpty(edu.field) ? edu.field : ''}</div>
                  )}
                  {isNonEmpty(edu.institution) && <div className="company">{edu.institution}</div>}
                </div>
                <div className="date">
                  {isNonEmpty(edu.start_date) && formatDate(edu.start_date)}{isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date) ? ' ' : ''}{(isNonEmpty(edu.start_date) || isNonEmpty(edu.end_date)) && '-'}{isNonEmpty(edu.end_date) ? ` ${formatDate(edu.end_date)}` : ''}
                  {isNonEmpty(edu.gpa) && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {nonEmptyCerts.length > 0 && (
          <div className="section">
            <div className="section-title">Professional Certifications</div>
            {nonEmptyCerts.map((cert, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  {isNonEmpty(cert.name) && <div className="position">{cert.name}</div>}
                  {isNonEmpty(cert.date) && <div className="date">{formatDate(cert.date)}</div>}
                </div>
                {isNonEmpty(cert.issuer) && <div className="company">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {nonEmptyProjects.length > 0 && (
          <div className="section">
            <div className="section-title">Key Initiatives</div>
            {nonEmptyProjects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  {isNonEmpty(project.name) && <div className="position">{project.name}</div>}
                </div>
                {isNonEmpty(project.description) && <div className="description">{project.description}</div>}
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#7f8c8d' }}>
                  {project.technologies && project.technologies.length > 0 && (
                    <strong>Technologies:</strong>
                  )} {project.technologies && project.technologies.length > 0 && project.technologies.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  switch (template) {
    case 'professional':
      return renderProfessional();
    case 'creative':
      return renderCreative();
    case 'minimal':
      return renderMinimal();
    case 'executive':
      return renderExecutive();
    default:
      return renderProfessional();
  }
};

export default ResumeTemplate;
