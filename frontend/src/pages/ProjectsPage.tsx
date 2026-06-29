import React, { useState } from 'react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectDrawer } from '../components/projects/ProjectDrawer';
import { useCareerStore } from '../app/store/useCareerStore';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const projects = useCareerStore((s) => s.projects);
  const updateProject = useCareerStore((s) => s.updateProject);

  const [activeProjKey, setActiveProjKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleProjClick = (key: string) => {
    setActiveProjKey(key);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    // Generate unique project key
    const newKey = `custom_${Date.now()}`;
    const newProj: Project = {
      name: 'New Custom Project',
      description: 'Describe your custom SWE project workspace here...',
      status: 'ideation',
      stack: ['React', 'Node'],
      github: '',
      demo: '',
      progress: { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 },
      bullets: []
    };

    updateProject(newKey, newProj);
    setActiveProjKey(newKey);
    setDrawerOpen(true);
  };

  // Compute workspace metrics
  const projectList = Object.keys(projects).map(key => ({ key, ...projects[key] }));
  const deployedCount = projectList.filter(p => p.status === 'deployed').length;
  
  const avgCompleteness = projectList.length > 0
    ? Math.round(
        projectList.reduce((sum, p) => {
          const progress = p.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
          const avg = (progress.backend + progress.frontend + progress.ai + progress.testing + progress.docs + progress.deploy) / 6;
          return sum + avg;
        }, 0) / projectList.length
      )
    : 0;

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Project Portfolio Workspace"
        subtitle="Manage and build your core showcase projects for placements"
        actions={
          <Button onClick={handleAddNew} variant="primary" className="text-xs py-2 rounded-xl">
            + New Project Workspace
          </Button>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-accentPurple/20 bg-accentPurple/10 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
          <h3 className="mt-1 text-base font-semibold text-textPrimary">Project explanation coach</h3>
        </div>
        <ShaylaPromptButton prompt="Improve my project explanation for placements using current project tracker context. Make it clear, technical, and recruiter-friendly.">
          Improve project explanation
        </ShaylaPromptButton>
      </Card>

      {/* Analytics stats banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Total Workspaces</span>
            <span className="text-xl font-bold text-textPrimary font-mono mt-0.5">{projectList.length}</span>
          </div>
          <span className="text-2xl">📂</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Deployed Live</span>
            <span className="text-xl font-bold text-accentEmerald font-mono mt-0.5">{deployedCount}</span>
          </div>
          <span className="text-2xl">🌐</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Average Progress</span>
            <span className="text-xl font-bold text-accentBlue font-mono mt-0.5">{avgCompleteness}%</span>
          </div>
          <span className="text-2xl">📈</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectList.map((item) => (
          <ProjectCard
            key={item.key}
            project={item}
            onClick={() => handleProjClick(item.key)}
          />
        ))}
      </div>

      {/* Drawer */}
      {activeProjKey && projects[activeProjKey] && (
        <ProjectDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          projectKey={activeProjKey}
          project={projects[activeProjKey]}
        />
      )}
    </div>
  );
};
