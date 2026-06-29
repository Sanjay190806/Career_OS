import React, { useMemo, useState } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { SKILL_TREE_DATA } from '../data/skillTree';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { 
  GitFork, 
  Lock, 
  Unlock, 
  Award, 
  CheckSquare,
  Square,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';

interface SkillNodeExtended {
  id: string;
  title: string;
  group: string;
  goal: string;
  why: string;
  whatToDo: string[];
  practiceTarget: string;
  miniBoss: string;
  status: 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready';
}

export const SkillTreePage: React.FC = () => {
  const skillTree = useCareerStore((s) => s.skillTree || {});
  const updateSkillNode = useCareerStore((s) => s.updateSkillNode);

  const [activeGroup, setActiveGroup] = useState<string>('Java DSA');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Parse all nodes from SKILL_TREE_DATA
  const nodes = useMemo<SkillNodeExtended[]>(() => {
    return Object.entries(SKILL_TREE_DATA).map(([key, data]) => {
      const [group] = key.split('::');
      const status = skillTree[key] || (key === 'Java DSA::Arrays' ? 'unlocked' : 'locked');
      return {
        id: key,
        group,
        ...data,
        status
      };
    });
  }, [skillTree]);

  // Group headers
  const groups = useMemo(() => {
    return Array.from(new Set(nodes.map((n) => n.group)));
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => n.group === activeGroup);
  }, [nodes, activeGroup]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const handleStatusChange = (id: string, newStatus: SkillNodeExtended['status']) => {
    updateSkillNode(id, newStatus);

    // Auto unlock next nodes in the group if we complete or set interview ready!
    if (newStatus === 'completed' || newStatus === 'interview-ready') {
      const groupNodes = nodes.filter((n) => n.group === activeGroup);
      const currentIndex = groupNodes.findIndex((n) => n.id === id);
      if (currentIndex !== -1 && currentIndex + 1 < groupNodes.length) {
        const nextNode = groupNodes[currentIndex + 1];
        if (nextNode.status === 'locked') {
          updateSkillNode(nextNode.id, 'unlocked');
        }
      }
    }
  };

  const getStatusColor = (status: SkillNodeExtended['status']) => {
    switch (status) {
      case 'interview-ready':
        return 'text-accentGold bg-accentGold/10 border-accentGold/20 shadow-glow-yellow/5';
      case 'completed':
        return 'text-accentEmerald bg-accentEmerald/10 border-accentEmerald/20';
      case 'learning':
        return 'text-accentBlue bg-accentBlue/10 border-accentBlue/20 animate-pulse';
      case 'unlocked':
        return 'text-textSecondary bg-white/5 border-white/10';
      case 'locked':
      default:
        return 'text-textMuted bg-white/[0.02] border-white/5 opacity-55';
    }
  };

  const getStatusIcon = (status: SkillNodeExtended['status']) => {
    switch (status) {
      case 'interview-ready':
        return <Star className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'learning':
        return <Flame className="h-4 w-4 animate-bounce" />;
      case 'unlocked':
        return <Unlock className="h-4 w-4" />;
      case 'locked':
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const handleToggleChecklistItem = (nodeId: string, idx: number) => {
    const key = `${nodeId}_${idx}`;
    setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 select-none">
      <SectionHeader 
        title="Syllabus Skill Tree 2.0"
        subtitle="Progressive placement roadmap unlocking milestones from basic DSA up to mock interview readiness."
      />

      {/* Group Navigation Bar */}
      <div className="flex gap-2 pb-2 overflow-x-auto border-b border-white/5">
        {groups.map((group) => {
          const groupNodes = nodes.filter((n) => n.group === group);
          const completed = groupNodes.filter((n) => n.status === 'completed' || n.status === 'interview-ready').length;
          const percent = Math.round((completed / groupNodes.length) * 100);

          return (
            <button
              key={group}
              onClick={() => {
                setActiveGroup(group);
                setSelectedNodeId(null);
              }}
              className={`h-12 px-5 rounded-2xl text-xs font-bold transition flex flex-col justify-center items-start whitespace-nowrap border ${
                activeGroup === group
                  ? 'bg-accentBlue/10 border-accentBlue text-accentBlue'
                  : 'bg-white/5 border-white/5 text-textSecondary hover:bg-white/10'
              }`}
            >
              <span>{group}</span>
              <span className="text-[9px] opacity-75 mt-0.5">{percent}% Mastered ({completed}/{groupNodes.length})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-6 items-start">
        {/* Left: Interactive Visual Flow Nodes */}
        <div className="flex flex-col gap-3.5">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1">Syllabus Milestones</h3>
          
          <div className="flex flex-col gap-4 relative pl-3 border-l border-white/5">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              
              return (
                <div key={node.id} className="relative group">
                  {/* Tree connector bullet */}
                  <div className={`absolute -left-[17px] top-[14px] h-2 w-2 rounded-full border transition ${
                    node.status === 'interview-ready' || node.status === 'completed'
                      ? 'bg-accentEmerald border-accentEmerald'
                      : node.status === 'learning'
                      ? 'bg-accentBlue border-accentBlue animate-ping'
                      : 'bg-bgSurface border-white/20'
                  }`} />

                  <Card 
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 border transition cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'border-accentBlue bg-accentBlue/5 ring-1 ring-accentBlue/20 shadow-glow-blue/5'
                        : 'border-white/5 bg-bgCard/40 hover:bg-white/[0.04]'
                    } ${node.status === 'locked' ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${getStatusColor(node.status)}`}>
                        {getStatusIcon(node.status)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-textPrimary text-xs">{node.title}</h4>
                        <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider mt-0.5 block">{node.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-textMuted group-hover:text-textPrimary transition">
                      <span className="text-[9px] font-bold">Details</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detail Drawer Panel */}
        <div className="lg:sticky lg:top-4">
          {selectedNode ? (
            <Card className="p-5 border border-border-accent/30 bg-bgCard/35 flex flex-col gap-4 shadow-glow-blue/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">{selectedNode.group}</span>
                  <h3 className="font-black text-textPrimary text-lg mt-0.5">{selectedNode.title}</h3>
                </div>
                <Badge variant={
                  selectedNode.status === 'interview-ready' ? 'warning' : 
                  selectedNode.status === 'completed' ? 'success' : 
                  selectedNode.status === 'learning' ? 'primary' : 'neutral'
                }>
                  {selectedNode.status.toUpperCase()}
                </Badge>
              </div>

              {/* Status Controls */}
              <div className="flex flex-wrap gap-2 bg-white/5 border border-white/5 p-2 rounded-2xl">
                <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider block w-full pl-1.5 mb-1.5">Update Prep Status:</span>
                
                <button
                  onClick={() => handleStatusChange(selectedNode.id, 'unlocked')}
                  className={`h-7 px-3 rounded-lg text-[10px] font-bold transition ${
                    selectedNode.status === 'unlocked' ? 'bg-white/10 text-textPrimary' : 'text-textSecondary hover:bg-white/5'
                  }`}
                >
                  Unlocked
                </button>
                <button
                  onClick={() => handleStatusChange(selectedNode.id, 'learning')}
                  className={`h-7 px-3 rounded-lg text-[10px] font-bold transition ${
                    selectedNode.status === 'learning' ? 'bg-accentBlue/20 text-accentBlue border border-accentBlue/30' : 'text-textSecondary hover:bg-white/5'
                  }`}
                >
                  Learning
                </button>
                <button
                  onClick={() => handleStatusChange(selectedNode.id, 'completed')}
                  className={`h-7 px-3 rounded-lg text-[10px] font-bold transition ${
                    selectedNode.status === 'completed' ? 'bg-accentEmerald/20 text-accentEmerald border border-accentEmerald/30' : 'text-textSecondary hover:bg-white/5'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusChange(selectedNode.id, 'interview-ready')}
                  className={`h-7 px-3 rounded-lg text-[10px] font-bold transition ${
                    selectedNode.status === 'interview-ready' ? 'bg-accentGold/20 text-accentGold border border-accentGold/30' : 'text-textSecondary hover:bg-white/5'
                  }`}
                >
                  Interview Ready
                </button>
              </div>

              {/* Goal & Why */}
              <div className="flex flex-col gap-3 text-xs leading-relaxed">
                <div>
                  <span className="font-bold text-textMuted uppercase tracking-wider text-[9px]">Syllabus Goal</span>
                  <p className="text-textPrimary mt-1 font-medium">{selectedNode.goal}</p>
                </div>
                <div>
                  <span className="font-bold text-textMuted uppercase tracking-wider text-[9px]">Why this matters</span>
                  <p className="text-textSecondary mt-1 italic">"{selectedNode.why}"</p>
                </div>
              </div>

              {/* What to do Checklist */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5">
                <span className="font-bold text-textMuted uppercase tracking-wider text-[9px] block">Required Tasks Checklist:</span>
                <div className="flex flex-col gap-2 text-xs">
                  {selectedNode.whatToDo.map((task, idx) => {
                    const isChecked = checklistState[`${selectedNode.id}_${idx}`] || false;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleToggleChecklistItem(selectedNode.id, idx)}
                        className="flex items-start gap-2.5 cursor-pointer bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 transition"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4.5 w-4.5 text-accentEmerald shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-textMuted shrink-0 mt-0.5" />
                        )}
                        <span className={`leading-normal ${isChecked ? 'text-textSecondary line-through opacity-65' : 'text-textPrimary'}`}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Practice Target & Mini Boss */}
              <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-textMuted uppercase tracking-wider text-[9px] block">Practice Target</span>
                  <p className="text-textPrimary mt-1.5 font-bold">{selectedNode.practiceTarget}</p>
                </div>
                <div>
                  <span className="font-bold text-textMuted uppercase tracking-wider text-[9px] block">Mini Boss Challenge</span>
                  <p className="text-accentBlue mt-1.5 font-bold">{selectedNode.miniBoss}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border border-white/5 bg-bgCard/20 text-textSecondary text-xs">
              <GitFork className="h-8 w-8 text-textMuted mx-auto mb-3" />
              <span>Select any unlocked milestone node from the left tree map to view goals, why it matters, timed mini boss objectives, and practice checklist details.</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
