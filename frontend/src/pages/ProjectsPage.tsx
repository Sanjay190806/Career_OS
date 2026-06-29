import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectDrawer } from '../components/projects/ProjectDrawer';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useCareerStore } from '../app/store/useCareerStore';
import { Project } from '../types';
import { FolderKanban, Rocket, Layers3, Sparkles, TrendingUp } from 'lucide-react';

type WorkspaceTab = 'workspaces' | 'planning' | 'ai' | 'deployment';

export const ProjectsPage: React.FC = () => {
  const projects = useCareerStore((s) => s.projects);
  const updateProject = useCareerStore((s) => s.updateProject);

  const [activeProjKey, setActiveProjKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('workspaces');

  const projectList = useMemo(() => Object.keys(projects).map((key) => ({ key, ...projects[key] })), [projects]);

  const deployedCount = projectList.filter((p) => p.status === 'deployed').length;
  const avgCompleteness = projectList.length > 0
    ? Math.round(
      projectList.reduce((sum, p) => {
        const progress = p.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
        return sum + ((progress.backend + progress.frontend + progress.ai + progress.testing + progress.docs + progress.deploy) / 6);
      }, 0) / projectList.length
    )
    : 0;
  const activeProject = activeProjKey ? projects[activeProjKey] : null;

  const handleProjClick = (key: string) => {
    setActiveProjKey(key);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    const newKey = `custom_${Date.now()}`;
    const newProj: Project = {
      name: 'New Custom Project',
      description: 'Describe your custom SWE project workspace here...',
      status: 'ideation',
      stack: ['React', 'Node'],
      github: '',
      demo: '',
      progress: { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 },
      bullets: [],
    };

    updateProject(newKey, newProj);
    setActiveProjKey(newKey);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-10 fade-in">
      <SectionHeader
        title="Project Workspace 2.0"
        subtitle="Plan, ship, and present your flagship projects with a cleaner workspace."
        actions={
          <Button onClick={handleAddNew} variant="primary" className="gap-2 text-xs py-2 rounded-xl">
            <FolderKanban className="h-4 w-4" />
            New workspace
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Total workspaces</p>
            <div className="mt-1 text-2xl font-semibold text-textPrimary">{projectList.length}</div>
          </div>
          <FolderKanban className="h-6 w-6 text-accentBlue" />
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Deployed live</p>
            <div className="mt-1 text-2xl font-semibold text-accentEmerald">{deployedCount}</div>
          </div>
          <Rocket className="h-6 w-6 text-accentEmerald" />
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Average progress</p>
            <div className="mt-1 text-2xl font-semibold text-accentBlue">{avgCompleteness}%</div>
          </div>
          <TrendingUp className="h-6 w-6 text-accentBlue" />
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Delivery style</p>
            <div className="mt-1 text-2xl font-semibold text-textPrimary">Portfolio-first</div>
          </div>
          <Layers3 className="h-6 w-6 text-accentPurple" />
        </Card>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-3">
        {[
          ['workspaces', 'Workspaces'],
          ['planning', 'Planning'],
          ['ai', 'AI Coach'],
          ['deployment', 'Deployment'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as WorkspaceTab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === id
                ? 'border border-accentBlue/25 bg-accentBlue/10 text-accentBlue'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'workspaces' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {projectList.map((item) => (
              <ProjectCard key={item.key} project={item} onClick={() => handleProjClick(item.key)} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 border-accentPurple/20 bg-accentPurple/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accentPurple" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
              </div>
              <h3 className="text-lg font-semibold text-textPrimary">Project explanation coach</h3>
              <p className="text-sm leading-6 text-textSecondary">
                Sharpen bullets, make the stack readable, and keep recruiter-facing explanations crisp.
              </p>
              <ShaylaPromptButton prompt="Improve my project explanation for placements using current project tracker context. Make it clear, technical, and recruiter-friendly.">
                Improve project explanation
              </ShaylaPromptButton>
            </Card>

            <Card className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Workspace checklist</p>
              <div className="grid gap-2 text-sm text-textSecondary">
                <div>1. Define the user problem and outcome.</div>
                <div>2. Keep backend, frontend, and AI tasks visible.</div>
                <div>3. Add at least one deployment or demo proof.</div>
                <div>4. Write one concise resume bullet per milestone.</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Build plan</p>
            <h3 className="text-lg font-semibold text-textPrimary">What to polish next</h3>
            <div className="grid gap-3 text-sm text-textSecondary">
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">Tighten one product story for each project.</div>
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">Add one measurable result or deployment metric.</div>
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">Make sure every workspace has a clean GitHub link.</div>
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Active workspace</p>
            <h3 className="text-lg font-semibold text-textPrimary">{activeProject?.name || 'Select a project'}</h3>
            <p className="text-sm leading-6 text-textSecondary">{activeProject?.description || 'Open a workspace to inspect details.'}</p>
            <div className="flex flex-wrap gap-2">
              {activeProject?.stack?.map((item) => <Badge key={item} variant="neutral">{item}</Badge>)}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'ai' && (
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">AI coach</p>
          <h3 className="text-lg font-semibold text-textPrimary">Ask Shayla to improve a project bullet or project pitch</h3>
          <ShaylaPromptButton prompt="Review my project tracker and suggest the strongest placement-focused project story I can tell in an interview.">
            Review project story
          </ShaylaPromptButton>
        </Card>
      )}

      {activeTab === 'deployment' && (
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Deployment view</p>
          <h3 className="text-lg font-semibold text-textPrimary">Ship readiness</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
              <p className="text-xs text-textMuted">Frontend</p>
              <p className="mt-1 text-lg font-semibold text-textPrimary">Clean UI</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
              <p className="text-xs text-textMuted">Backend</p>
              <p className="mt-1 text-lg font-semibold text-textPrimary">Stable APIs</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
              <p className="text-xs text-textMuted">Demo</p>
              <p className="mt-1 text-lg font-semibold text-textPrimary">Deploy proof</p>
            </div>
          </div>
        </Card>
      )}

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

