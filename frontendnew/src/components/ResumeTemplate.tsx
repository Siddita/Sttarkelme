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

  const renderProfessional = () => (
    <div className="resume-container resume-professional">
      <div className="header">
        <div className="name">{data.personal_info.name}</div>
        <div className="contact">
          <span>{data.personal_info.email}</span>
          <span>{data.personal_info.phone}</span>
          <span>{data.personal_info.location}</span>
          {data.personal_info.linkedin && <span>{data.personal_info.linkedin}</span>}
          {data.personal_info.github && <span>{data.personal_info.github}</span>}
          {data.personal_info.website && <span>{data.personal_info.website}</span>}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Professional Summary</div>
        <div className="description">{data.summary}</div>
      </div>

      <div className="section">
        <div className="section-title">Skills</div>
        <div className="skills">
          {data.skills.map((skill, index) => (
            <span key={index} className="skill">{skill}</span>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">Professional Experience</div>
        {data.experience.map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="item-header">
              <div>
                <div className="position">{exp.position}</div>
                <div className="company">{exp.company}</div>
              </div>
              <div className="date">
                {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
              </div>
            </div>
            <div className="description">{exp.description}</div>
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

      <div className="section">
        <div className="section-title">Education</div>
        {data.education.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="item-header">
              <div>
                <div className="degree">{edu.degree} in {edu.field}</div>
                <div className="institution">{edu.institution}</div>
              </div>
              <div className="date">
                {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.projects && data.projects.length > 0 && (
        <div className="section">
          <div className="section-title">Projects</div>
          {data.projects.map((project, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div className="position">{project.name}</div>
                {project.url && <div className="date">{project.url}</div>}
              </div>
              <div className="description">{project.description}</div>
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#7f8c8d' }}>
                <strong>Technologies:</strong> {project.technologies.join(', ')}
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
              <div>{data.personal_info.email}</div>
              <div>{data.personal_info.phone}</div>
              <div>{data.personal_info.location}</div>
              {data.personal_info.linkedin && <div>{data.personal_info.linkedin}</div>}
              {data.personal_info.github && <div>{data.personal_info.github}</div>}
              {data.personal_info.website && <div>{data.personal_info.website}</div>}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">About Me</div>
          <div className="description">{data.summary}</div>
        </div>

        <div className="section">
          <div className="section-title">Skills & Expertise</div>
          <div className="skills">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill">{skill}</span>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Experience</div>
          {data.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  <div className="position">{exp.position}</div>
                  <div className="company">{exp.company}</div>
                </div>
                <div className="date">
                  {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                </div>
              </div>
              <div className="description">{exp.description}</div>
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

        <div className="section">
          <div className="section-title">Education</div>
          {data.education.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  <div className="position">{edu.degree} in {edu.field}</div>
                  <div className="company">{edu.institution}</div>
                </div>
                <div className="date">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.projects && data.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Featured Projects</div>
            {data.projects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  <div className="position">{project.name}</div>
                  {project.url && <div className="date">{project.url}</div>}
                </div>
                <div className="description">{project.description}</div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#667eea' }}>
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </div>
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
            <span>{data.personal_info.email}</span>
            <span>{data.personal_info.phone}</span>
            <span>{data.personal_info.location}</span>
            {data.personal_info.linkedin && <span>{data.personal_info.linkedin}</span>}
            {data.personal_info.github && <span>{data.personal_info.github}</span>}
            {data.personal_info.website && <span>{data.personal_info.website}</span>}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Summary</div>
          <div className="description">{data.summary}</div>
        </div>

        <div className="section">
          <div className="section-title">Skills</div>
          <div className="skills">
            {data.skills.map((skill, index) => (
              <div key={index} className="skill">{skill}</div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Experience</div>
          {data.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="date-column">
                {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
              </div>
              <div className="content-column">
                <div className="position">{exp.position}</div>
                <div className="company">{exp.company}</div>
                <div className="description">{exp.description}</div>
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

        <div className="section">
          <div className="section-title">Education</div>
          {data.education.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="date-column">
                {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
              </div>
              <div className="content-column">
                <div className="position">{edu.degree} in {edu.field}</div>
                <div className="company">{edu.institution}</div>
                {edu.gpa && <div className="description">GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>

        {data.projects && data.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Projects</div>
            {data.projects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="date-column">
                  {project.url ? 'Live' : 'Project'}
                </div>
                <div className="content-column">
                  <div className="position">{project.name}</div>
                  <div className="description">{project.description}</div>
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#7f8c8d' }}>
                    {project.technologies.join(' • ')}
                  </div>
                  {project.url && <div style={{ marginTop: '4px', fontSize: '14px', color: '#3498db' }}>{project.url}</div>}
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
            <div>{data.personal_info.email}</div>
            <div>{data.personal_info.phone}</div>
            <div>{data.personal_info.location}</div>
            {data.personal_info.linkedin && <div>{data.personal_info.linkedin}</div>}
            {data.personal_info.website && <div>{data.personal_info.website}</div>}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Core Competencies</div>
          <div className="skills">
            {data.skills.map((skill, index) => (
              <div key={index} className="skill-category">
                <div className="skill">{skill}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Executive Experience</div>
          {data.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  <div className="position">{exp.position}</div>
                  <div className="company">{exp.company}</div>
                </div>
                <div className="date">
                  {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                </div>
              </div>
              <div className="description">{exp.description}</div>
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

        <div className="section">
          <div className="section-title">Education</div>
          {data.education.map((edu, index) => (
            <div key={index} className="experience-item">
              <div className="item-header">
                <div>
                  <div className="position">{edu.degree} in {edu.field}</div>
                  <div className="company">{edu.institution}</div>
                </div>
                <div className="date">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.certifications && data.certifications.length > 0 && (
          <div className="section">
            <div className="section-title">Professional Certifications</div>
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

        {data.projects && data.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Key Initiatives</div>
            {data.projects.map((project, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  <div className="position">{project.name}</div>
                </div>
                <div className="description">{project.description}</div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#7f8c8d' }}>
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
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
