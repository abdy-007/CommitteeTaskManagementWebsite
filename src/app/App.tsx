import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Plus,
  Search,
  Bell,
  MoreHorizontal,
  TrendingUp,
  Tag,
  Image,
  ImageOff,
  AlertCircle,
  Trash2,
  X,
  ChevronRight,
  Camera,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type TaskStatus = "completed" | "pending" | "overdue";
type TaskType = "regular" | "extra";

interface Category {
  id: string;
  name: string;
  color: string;
  allowPictures: boolean;
  pictureRequired: boolean;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  memberId: string;
  categoryId: string;
  type: TaskType;
  status: TaskStatus;
  submittedAt: string;
  dueDate: string;
  points: number;
  description: string;
  pictureUrl?: string;
}

// ─── Initial Data ──────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#1B2A3B", "#C9581A", "#4A7C59", "#6B4E8A", "#8B5A2B",
  "#2563EB", "#DC2626", "#0891B2", "#65A30D", "#D97706",
];

const initialCategories: Category[] = [
  { id: "c1", name: "Finance",       color: "#4A7C59", allowPictures: false, pictureRequired: false },
  { id: "c2", name: "Documentation", color: "#1B2A3B", allowPictures: false, pictureRequired: false },
  { id: "c3", name: "Events",        color: "#C9581A", allowPictures: true,  pictureRequired: true  },
  { id: "c4", name: "Outreach",      color: "#6B4E8A", allowPictures: true,  pictureRequired: false },
  { id: "c5", name: "Digital",       color: "#2563EB", allowPictures: true,  pictureRequired: false },
];

const members: Member[] = [
  { id: "m1", name: "Ayşe Kaya",    role: "Secretary",  avatar: "AK" },
  { id: "m2", name: "Burak Demir",  role: "Treasurer",  avatar: "BD" },
  { id: "m3", name: "Ceren Yıldız", role: "Vice Chair", avatar: "CY" },
  { id: "m4", name: "Deniz Arslan", role: "Member",     avatar: "DA" },
  { id: "m5", name: "Emre Şahin",   role: "Member",     avatar: "ES" },
  { id: "m6", name: "Fatma Çelik",  role: "Member",     avatar: "FC" },
];

const initialTasks: Task[] = [
  { id: "t1",  title: "Draft Q3 Budget Proposal",      memberId: "m2", categoryId: "c1", type: "regular", status: "completed", submittedAt: "2026-06-22", dueDate: "2026-06-23", points: 10, description: "Prepare the quarterly budget allocation report. This includes reviewing all department requests, cross-referencing with last year's actuals, and presenting a balanced projection for Q3." },
  { id: "t2",  title: "Meeting Minutes — June Session", memberId: "m1", categoryId: "c2", type: "regular", status: "completed", submittedAt: "2026-06-20", dueDate: "2026-06-21", points: 8,  description: "Transcribe and distribute the June committee meeting minutes. Must capture all motions, votes, and action items accurately and distribute within 24 hours of the meeting." },
  { id: "t3",  title: "Volunteer Coordination Report",  memberId: "m4", categoryId: "c3", type: "extra",   status: "completed", submittedAt: "2026-06-23", dueDate: "2026-06-25", points: 15, description: "Coordinated 12 volunteers for the annual fundraiser event. Includes shift scheduling, briefing materials, and a post-event debrief summary with photos from the event floor.", pictureUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=500&fit=crop&auto=format" },
  { id: "t4",  title: "Newsletter — Summer Edition",    memberId: "m3", categoryId: "c4", type: "regular", status: "pending",   submittedAt: "", dueDate: "2026-06-28", points: 12, description: "Write and design the summer newsletter for distribution to 400+ subscribers. Content includes: chair's letter, upcoming events, member spotlight, and community news roundup." },
  { id: "t5",  title: "Sponsor Outreach Deck",          memberId: "m5", categoryId: "c4", type: "extra",   status: "pending",   submittedAt: "", dueDate: "2026-06-30", points: 20, description: "Build a professional pitch deck targeting five potential sponsors identified at the spring gala. Deck should include mission statement, audience demographics, sponsorship tiers, and past event highlights." },
  { id: "t6",  title: "Annual Event Logistics Plan",    memberId: "m3", categoryId: "c3", type: "regular", status: "completed", submittedAt: "2026-06-18", dueDate: "2026-06-20", points: 10, description: "Full venue and schedule plan for the annual gala including catering coordination, AV setup requirements, parking logistics, and accessibility arrangements.", pictureUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&auto=format" },
  { id: "t7",  title: "Social Media Campaign",          memberId: "m6", categoryId: "c5", type: "extra",   status: "overdue",   submittedAt: "", dueDate: "2026-06-15", points: 12, description: "Launch a 2-week awareness campaign on Instagram and LinkedIn. Deliverables: 14 posts, 3 short-form videos, weekly analytics report, and a final performance summary." },
  { id: "t8",  title: "Member Onboarding Guide",        memberId: "m1", categoryId: "c2", type: "regular", status: "completed", submittedAt: "2026-06-21", dueDate: "2026-06-22", points: 8,  description: "Update and distribute the new-member onboarding handbook. Revisions include updated committee structure, communication channels, task submission procedures, and the point system explanation." },
  { id: "t9",  title: "Grant Application Review",       memberId: "m2", categoryId: "c1", type: "extra",   status: "completed", submittedAt: "2026-06-19", dueDate: "2026-06-20", points: 18, description: "Review and submit the municipal arts grant application. Includes budget narrative, organizational history section, letter of support coordination, and alignment with grant criteria." },
  { id: "t10", title: "Website Content Audit",          memberId: "m5", categoryId: "c5", type: "regular", status: "overdue",   submittedAt: "", dueDate: "2026-06-10", points: 6,  description: "Audit all existing website copy and flag pages with outdated information, broken links, or inconsistent branding. Submit a prioritized action list with recommended changes." },
  { id: "t11", title: "Partnership MOU Draft",          memberId: "m6", categoryId: "c2", type: "regular", status: "pending",   submittedAt: "", dueDate: "2026-07-05", points: 10, description: "Draft a memorandum of understanding with the city library for co-hosting quarterly cultural workshops. Requires legal review before submission." },
  { id: "t12", title: "Photography Archive",            memberId: "m4", categoryId: "c3", type: "extra",   status: "completed", submittedAt: "2026-06-24", dueDate: "2026-06-25", points: 10, description: "Organize and upload all event photos from the past 6 months to the shared Google Drive. Apply consistent folder naming and tag all photos with event name and date.", pictureUrl: "https://images.unsplash.com/photo-1452780212461-7df4b0b5e038?w=800&h=500&fit=crop&auto=format" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getMember   = (id: string, list: Member[])     => list.find((m) => m.id === id)!;
const getCategory = (id: string, cats: Category[])   => cats.find((c) => c.id === id);

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Completed", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "text-amber-700 bg-amber-50 border-amber-200",       icon: Clock },
  overdue:   { label: "Overdue",   color: "text-red-700 bg-red-50 border-red-200",             icon: XCircle },
};

const navItems = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "tasks",       label: "All Tasks",   icon: ClipboardList },
  { id: "members",     label: "Members",     icon: Users },
  { id: "extra",       label: "Extra Tasks", icon: Star },
  { id: "categories",  label: "Categories",  icon: Tag },
];

function uid() {
  return "c" + Math.random().toString(36).slice(2, 9);
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-card border border-border p-5 flex flex-col gap-2 ${accent ? "border-l-2 border-l-accent" : ""}`}>
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono font-medium shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border ${cfg.color}`} style={{ borderRadius: 2 }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: TaskType }) {
  return type === "extra" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-accent/10 text-accent border border-accent/30" style={{ borderRadius: 2 }}>
      <Star size={10} className="fill-accent" />
      Extra
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-secondary text-muted-foreground border border-border" style={{ borderRadius: 2 }}>
      Regular
    </span>
  );
}

function CategoryPill({ category }: { category: Category | undefined }) {
  if (!category) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border"
      style={{ borderRadius: 2, borderColor: category.color + "44", backgroundColor: category.color + "18", color: category.color }}
    >
      <Tag size={10} />
      {category.name}
    </span>
  );
}

// ─── Task Detail Modal ──────────────────────────────────────────────────────

function TaskDetailModal({ task, members, categories, onClose }: {
  task: Task;
  members: Member[];
  categories: Category[];
  onClose: () => void;
}) {
  const member   = getMember(task.memberId, members);
  const category = getCategory(task.categoryId, categories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border w-full max-w-xl mx-4 shadow-2xl overflow-hidden" style={{ borderRadius: 2 }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TypeBadge type={task.type} />
              <StatusBadge status={task.status} />
              {category && <CategoryPill category={category} />}
            </div>
            <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em" }}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Assigned To</p>
              <div className="flex items-center gap-2">
                <Avatar initials={member.avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Points</p>
              <p className="text-2xl font-bold text-accent" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{task.points}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Due Date</p>
              <p className="text-sm font-mono">{task.dueDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Submitted</p>
              <p className="text-sm font-mono">{task.submittedAt || <span className="text-muted-foreground/50">—</span>}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
          </div>

          {/* Picture section */}
          {category && category.allowPictures && (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Camera size={11} />
                Photo Attachment
                {category.pictureRequired && (
                  <span className="text-red-500 font-mono ml-1">(required)</span>
                )}
              </p>
              {task.pictureUrl ? (
                <div className="overflow-hidden border border-border" style={{ borderRadius: 2 }}>
                  <img
                    src={task.pictureUrl}
                    alt={`Photo for ${task.title}`}
                    className="w-full object-cover max-h-60"
                  />
                </div>
              ) : (
                <div className="border border-dashed border-border bg-secondary/40 rounded py-8 flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff size={22} className="opacity-50" />
                  <p className="text-xs font-mono">
                    {category.pictureRequired
                      ? "No photo submitted — required for this category"
                      : "No photo attached"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            style={{ borderRadius: 2 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Categories View ────────────────────────────────────────────────────────

function CategoriesView({ categories, setCategories, tasks }: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  tasks: Task[];
}) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const toggle = (id: string, field: "allowPictures" | "pictureRequired") => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (field === "allowPictures") {
          return { ...c, allowPictures: !c.allowPictures, pictureRequired: !c.allowPictures ? c.pictureRequired : false };
        }
        return { ...c, pictureRequired: !c.pictureRequired };
      })
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addCategory = () => {
    if (!newName.trim()) return;
    setCategories((prev) => [
      ...prev,
      { id: uid(), name: newName.trim(), color: newColor, allowPictures: false, pictureRequired: false },
    ]);
    setNewName("");
    setCreating(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Categories group tasks and control photo attachment requirements for members.
        </p>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          style={{ borderRadius: 2 }}
        >
          <Plus size={14} />
          New Category
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-card border border-border p-5 space-y-4" style={{ borderRadius: 2 }}>
          <h4 className="text-sm font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>NEW CATEGORY</h4>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Category name…"
              className="w-full bg-input-background border border-border px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              style={{ borderRadius: 2 }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Color</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 transition-transform hover:scale-110"
                  style={{
                    borderRadius: "50%",
                    backgroundColor: c,
                    outline: newColor === c ? `3px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 border border-border py-2 text-sm hover:bg-secondary transition-colors"
              style={{ borderRadius: 2 }}
            >
              Cancel
            </button>
            <button
              onClick={addCategory}
              disabled={!newName.trim()}
              className="flex-1 bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              style={{ borderRadius: 2 }}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const taskCount = tasks.filter((t) => t.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-card border border-border overflow-hidden" style={{ borderRadius: 2 }}>
              {/* Color bar */}
              <div className="h-1" style={{ backgroundColor: cat.color }} />

              <div className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div>
                      <p className="font-semibold text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{taskCount} task{taskCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors rounded"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Toggles */}
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {/* Allow pictures toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {cat.allowPictures ? (
                        <Image size={15} className="text-accent" />
                      ) : (
                        <ImageOff size={15} className="text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">Allow photo attachments</p>
                        <p className="text-xs text-muted-foreground">Members can upload a photo when submitting tasks</p>
                      </div>
                    </div>
                    <Toggle
                      value={cat.allowPictures}
                      onChange={() => toggle(cat.id, "allowPictures")}
                    />
                  </div>

                  {/* Picture required toggle — only when allowPictures is on */}
                  <div className={`flex items-center justify-between transition-opacity ${cat.allowPictures ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                    <div className="flex items-center gap-2.5">
                      <AlertCircle size={15} className={cat.pictureRequired ? "text-red-500" : "text-muted-foreground"} />
                      <div>
                        <p className="text-sm font-medium">Require photo</p>
                        <p className="text-xs text-muted-foreground">Photo becomes mandatory for task completion</p>
                      </div>
                    </div>
                    <Toggle
                      value={cat.pictureRequired}
                      onChange={() => toggle(cat.id, "pictureRequired")}
                      accentColor={cat.pictureRequired ? "#DC2626" : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ value, onChange, accentColor }: { value: boolean; onChange: () => void; accentColor?: string }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={value}
      className="relative w-11 h-6 shrink-0 transition-colors"
      style={{
        borderRadius: 99,
        backgroundColor: value ? (accentColor ?? "#C9581A") : "#D1CFC8",
      }}
    >
      <span
        className="absolute top-1 left-1 w-4 h-4 bg-white shadow-sm transition-transform"
        style={{
          borderRadius: "50%",
          transform: value ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

// ─── Overview View ──────────────────────────────────────────────────────────

function OverviewView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (t: Task) => void;
}) {
  const completed     = tasks.filter((t) => t.status === "completed").length;
  const pending       = tasks.filter((t) => t.status === "pending").length;
  const overdue       = tasks.filter((t) => t.status === "overdue").length;
  const extraCompleted = tasks.filter((t) => t.type === "extra" && t.status === "completed").length;

  const memberStats = members.map((m) => {
    const mt   = tasks.filter((t) => t.memberId === m.id);
    const done = mt.filter((t) => t.status === "completed");
    const pts  = done.reduce((s, t) => s + t.points, 0);
    return { ...m, total: mt.length, done: done.length, points: pts };
  }).sort((a, b) => b.points - a.points);

  const recent = [...tasks]
    .filter((t) => t.status === "completed" && t.submittedAt)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
        <StatCard label="Total Tasks"       value={tasks.length}   sub="this cycle" />
        <StatCard label="Completed"         value={completed}      sub={`${Math.round((completed / tasks.length) * 100)}% completion rate`} accent />
        <StatCard label="Pending"           value={pending}        sub="awaiting submission" />
        <StatCard label="Extra Tasks Done"  value={extraCompleted} sub="bonus contributions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>MEMBER STANDINGS</h3>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {memberStats.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors">
                <span className="w-5 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
                <Avatar initials={m.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-medium">{m.done}/{m.total}</p>
                  <p className="text-xs text-muted-foreground font-mono">tasks</p>
                </div>
                <div className="text-right shrink-0 w-14">
                  <p className="text-sm font-mono font-semibold text-accent">{m.points}</p>
                  <p className="text-xs text-muted-foreground font-mono">pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>RECENT SUBMISSIONS</h3>
            <CheckCircle2 size={16} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {recent.map((t) => {
              const m   = getMember(t.memberId, members);
              const cat = getCategory(t.categoryId, categories);
              return (
                <button
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className="w-full text-left px-5 py-3.5 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug flex-1 min-w-0 group-hover:text-accent transition-colors">{t.title}</p>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{m.name}</span>
                    {cat && <CategoryPill category={cat} />}
                    <span className="text-xs font-mono text-muted-foreground ml-auto">{t.submittedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {overdue > 0 && (
        <div className="border border-red-200 bg-red-50 px-5 py-4 flex items-center gap-3">
          <XCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{overdue} task{overdue > 1 ? "s are" : " is"} overdue.</strong>{" "}
            Review and follow up with the assigned members.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tasks View ─────────────────────────────────────────────────────────────

function TasksView({ tasks, members, categories, filterType, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  filterType?: TaskType;
  onTaskClick: (t: Task) => void;
}) {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [catFilter, setCatFilter]   = useState("all");

  const filtered = tasks
    .filter((t) => !filterType || t.type === filterType)
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => memberFilter === "all" || t.memberId === memberFilter)
    .filter((t) => catFilter === "all" || t.categoryId === catFilter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")} className="bg-card border border-border text-sm px-3 py-2 outline-none cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="bg-card border border-border text-sm px-3 py-2 outline-none cursor-pointer">
            <option value="all">All Members</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-card border border-border text-sm px-3 py-2 outline-none cursor-pointer">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-auto">{filtered.length} tasks</span>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Task</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Due</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Photo</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => {
                const m   = getMember(t.memberId, members);
                const cat = getCategory(t.categoryId, categories);
                const photoStatus = cat?.allowPictures
                  ? t.pictureUrl
                    ? "submitted"
                    : cat.pictureRequired ? "missing-required" : "none"
                  : "n/a";

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                    onClick={() => onTaskClick(t)}
                  >
                    <td className="px-4 py-3.5 max-w-52">
                      <p className="font-medium truncate group-hover:text-accent transition-colors">{t.title}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={m.avatar} size="sm" />
                        <p className="text-sm font-medium whitespace-nowrap">{m.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {cat && <CategoryPill category={cat} />}
                    </td>
                    <td className="px-4 py-3.5"><TypeBadge type={t.type} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{t.dueDate}</td>
                    <td className="px-4 py-3.5">
                      {photoStatus === "submitted"         && <span className="text-emerald-600"><Camera size={14} /></span>}
                      {photoStatus === "missing-required"  && <span className="text-red-500 flex items-center gap-1 text-xs font-mono"><AlertCircle size={13} /> missing</span>}
                      {photoStatus === "none"              && <span className="text-muted-foreground/40 text-xs font-mono">—</span>}
                      {photoStatus === "n/a"              && <span className="text-muted-foreground/30 text-xs font-mono">n/a</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-accent">{t.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">No tasks match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Members View ───────────────────────────────────────────────────────────

function MembersView({ tasks, members }: { tasks: Task[]; members: Member[] }) {
  const memberStats = members.map((m) => {
    const mt    = tasks.filter((t) => t.memberId === m.id);
    const done  = mt.filter((t) => t.status === "completed");
    const extra = mt.filter((t) => t.type === "extra" && t.status === "completed");
    const pts   = done.reduce((s, t) => s + t.points, 0);
    const rate  = mt.length > 0 ? Math.round((done.length / mt.length) * 100) : 0;
    return { ...m, total: mt.length, done: done.length, extra: extra.length, points: pts, rate };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {memberStats.map((m) => (
        <div key={m.id} className="bg-card border border-border hover:border-primary/30 transition-colors">
          <div className="p-5 flex items-start gap-4 border-b border-border">
            <Avatar initials={m.avatar} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{m.role}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-accent" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.points}</p>
              <p className="text-xs text-muted-foreground font-mono">pts</p>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.done}/{m.total}</p>
              <p className="text-xs text-muted-foreground font-mono">Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.extra}</p>
              <p className="text-xs text-muted-foreground font-mono">Extra</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{m.rate}%</p>
              <p className="text-xs text-muted-foreground font-mono">Rate</p>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${m.rate}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Add Task Modal ─────────────────────────────────────────────────────────

function AddTaskModal({ categories, members, onClose }: {
  categories: Category[];
  members: Member[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "", memberId: members[0].id, categoryId: categories[0]?.id ?? "",
    type: "regular" as TaskType, dueDate: "", points: "10", description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border w-full max-w-lg mx-4 shadow-2xl" style={{ borderRadius: 2 }}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", letterSpacing: "0.04em" }}>
            ASSIGN NEW TASK
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Task Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter task title…" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" style={{ borderRadius: 2 }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Assign To</label>
              <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary cursor-pointer" style={{ borderRadius: 2 }}>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary cursor-pointer" style={{ borderRadius: 2 }}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary cursor-pointer" style={{ borderRadius: 2 }}>
                <option value="regular">Regular</option>
                <option value="extra">Extra</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Due Date</label>
              <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" style={{ borderRadius: 2 }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Points</label>
              <input type="number" min="1" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary" style={{ borderRadius: 2 }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief task description…" rows={3} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" style={{ borderRadius: 2 }} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-sm py-2.5 hover:bg-secondary transition-colors" style={{ borderRadius: 2 }}>Cancel</button>
            <button type="submit" className="flex-1 bg-primary text-primary-foreground text-sm py-2.5 hover:bg-primary/90 transition-colors font-medium" style={{ borderRadius: 2 }}>Assign Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav,    setActiveNav]    = useState("overview");
  const [categories,   setCategories]   = useState<Category[]>(initialCategories);
  const [tasks]                         = useState<Task[]>(initialTasks);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const overdueCount = tasks.filter((t) => t.status === "overdue").length;

  const viewTitle: Record<string, string> = {
    overview:   "Overview",
    tasks:      "All Tasks",
    members:    "Members",
    extra:      "Extra Tasks",
    categories: "Categories",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <p className="text-xs font-mono text-sidebar-foreground/50 uppercase tracking-widest mb-1">Committee</p>
          <h2 className="text-sidebar-foreground font-bold leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.2rem", letterSpacing: "0.04em" }}>
            CULTURAL ARTS BOARD
          </h2>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                style={{ borderRadius: 2 }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {id === "tasks" && overdueCount > 0 && (
                  <span className="ml-auto text-xs font-mono bg-red-500 text-white px-1.5 py-0.5 rounded-full">{overdueCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 font-mono uppercase tracking-widest mb-2">Administrator</p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-white text-xs font-mono font-medium">MA</div>
            <div>
              <p className="text-xs text-sidebar-foreground font-medium">Murat Aydın</p>
              <p className="text-xs text-sidebar-foreground/50 font-mono">Chair</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
              {viewTitle[activeNav].toUpperCase()}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-secondary rounded transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              {(pendingCount + overdueCount) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              style={{ borderRadius: 2 }}
            >
              <Plus size={15} />
              Add Task
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeNav === "overview"   && <OverviewView   tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}
          {activeNav === "tasks"      && <TasksView      tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}
          {activeNav === "members"    && <MembersView    tasks={tasks} members={members} />}
          {activeNav === "extra"      && <TasksView      tasks={tasks} members={members} categories={categories} filterType="extra" onTaskClick={setSelectedTask} />}
          {activeNav === "categories" && <CategoriesView tasks={tasks} categories={categories} setCategories={setCategories} />}
        </main>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          categories={categories}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {addModalOpen && (
        <AddTaskModal
          categories={categories}
          members={members}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  );
}
