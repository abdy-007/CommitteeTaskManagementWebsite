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

// 🎨 🎨 🎨  Types 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

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

// 🎨 🎨 🎨  Initial Data 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

const CATEGORY_COLORS = [
  "#1B2A3B", "#C9581A", "#4A7C59", "#6B4E8A", "#8B5A2B",
  "#2563EB", "#DC2626", "#0891B2", "#65A30D", "#D97706",
];

const initialCategories: Category[] = [
  { id: "c1", name: "Finance",       color: "#4A7C59", allowPictures: false, pictureRequired: false },
  { id: "c2", name: "Documentation", color: "#1B2A3B", allowPictures: false, pictureRequired: false },
  { id: "c3", name: "Events",        color: "#C9581A", allowPictures: true,  pictureRequired: true   },
  { id: "c4", name: "Outreach",      color: "#6B4E8A", allowPictures: true,  pictureRequired: false  },
  { id: "c5", name: "Digital",       color: "#2563EB", allowPictures: true,  pictureRequired: false  },
];

const members: Member[] = [
  { id: "m1", name: "Ayşe Kaya",        role: "Secretary",   avatar: "AK" },
  { id: "m2", name: "Burak Demir",      role: "Treasurer",   avatar: "BD" },
  { id: "m3", name: "Ceren Yıldız",     role: "Vice Chair",  avatar: "CY" },
  { id: "m4", name: "Deniz Arslan",     role: "Member",      avatar: "DA" },
  { id: "m5", name: "Emre Şahin",       role: "Member",      avatar: "ES" },
  { id: "m6", name: "Fatma Çelik",      role: "Member",      avatar: "FC" },
];

const initialTasks: Task[] = [
  { id: "t1",  title: "Draft Q3 Budget Proposal",               memberId: "m2", categoryId: "c1", type: "regular", status: "completed", submittedAt: "2026-06-22", dueDate: "2026-06-23", points: 10, description: "Prepare the quarterly budget allocation report. This includes reviewing all department requests, cross-referencing with last year's actuals, and presenting a balanced projection for Q3." },
  { id: "t2",  title: "Meeting Minutes – June Session",         memberId: "m1", categoryId: "c2", type: "regular", status: "completed", submittedAt: "2026-06-20", dueDate: "2026-06-21", points: 8,  description: "Transcribe and distribute the June committee meeting minutes. Must capture all motions, votes, and action items accurately and distribute within 24 hours of the meeting." },
  { id: "t3",  title: "Volunteer Coordination Report",          memberId: "m4", categoryId: "c3", type: "extra",   status: "completed", submittedAt: "2026-06-23", dueDate: "2026-06-25", points: 15, description: "Coordinated 12 volunteers for the annual fundraiser event. Includes shift scheduling, briefing materials, and a post-event debrief summary with photos from the event floor.", pictureUrl: "https://images.unsplash.com/photo-1511795759370-ef04db6c3c69?w=800&h=500&fit=crop&auto=format" },
  { id: "t4",  title: "Newsletter – Summer Edition",             memberId: "m3", categoryId: "c4", type: "regular", status: "pending",   submittedAt: "",         dueDate: "2026-06-28", points: 12, description: "Write and design the summer newsletter for distribution to 400+ subscribers. Content includes: chair's letter, upcoming events, member spotlight, and community news roundup." },
  { id: "t5",  title: "Sponsor Outreach Deck",                  memberId: "m5", categoryId: "c4", type: "extra",   status: "pending",   submittedAt: "",         dueDate: "2026-06-30", points: 20, description: "Build a professional pitch deck targeting five potential sponsors identified at the spring gala. Deck should include mission statement, audience demographics, sponsorship tiers, and past event highlights." },
  { id: "t6",  title: "Annual Event Logistics Plan",             memberId: "m3", categoryId: "c3", type: "regular", status: "completed", submittedAt: "2026-06-18", dueDate: "2026-06-20", points: 10, description: "Full venue and schedule plan for the annual gala including catering coordination, AV setup requirements, parking logistics, and accessibility arrangements.", pictureUrl: "https://images.unsplash.com/photo-1540575467063-178f50002ef1?w=800&h=500&fit=crop&auto=format" },
  { id: "t7",  title: "Social Media Campaign",                   memberId: "m6", categoryId: "c5", type: "extra",   status: "overdue",   submittedAt: "",         dueDate: "2026-06-15", points: 12, description: "Launch a 2-week awareness campaign on Instagram and LinkedIn. Deliverables: 14 posts, 3 short-form videos, weekly analytics report, and a final performance summary." },
  { id: "t8",  title: "Member Onboarding Guide",                 memberId: "m1", categoryId: "c2", type: "regular", status: "completed", submittedAt: "2026-06-21", dueDate: "2026-06-24", points: 14, description: "Create comprehensive onboarding documentation for new members including: committee history, member roles, meeting schedule, decision-making process, and key contact information." },
  { id: "t9",  title: "Quarterly Financial Report",              memberId: "m2", categoryId: "c1", type: "regular", status: "overdue",   submittedAt: "",         dueDate: "2026-06-17", points: 18, description: "Compile Q2 financial statements including income/expense summary, bank reconciliation, variance analysis, and recommendations for Q3 budget adjustments." },
  { id: "t10", title: "Community Partnership Outreach",          memberId: "m5", categoryId: "c4", type: "extra",   status: "pending",   submittedAt: "",         dueDate: "2026-07-05", points: 16, description: "Identify and contact 10+ potential community partners for collaborative initiatives. Prepare partnership proposal outlining mutual benefits and proposed partnership structure." },
];

// 🎨 🎨 🎨  Helper Functions 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

const getMember   = (id: string, list: Member[])     => list.find((m) => m.id === id)!;
const getCategory = (id: string, cats: Category[])   => cats.find((c) => c.id === id);

function uid() {
  return "c" + Math.random().toString(36).slice(2, 9);
}

// 🎨 🎨 🎨  UI Components 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg text-center ${accent ? "bg-accent text-accent-foreground" : "bg-card text-card-foreground"}`}>
      <div className="text-sm font-medium opacity-75">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs opacity-50">{sub}</div>}
    </div>
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const config = {
    completed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
    pending: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
    overdue: { bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
  };
  const { bg, text, icon: Icon } = config[status];
  return (
    <div className={`${bg} ${text} px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}

function TypeBadge({ type }: { type: TaskType }) {
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${type === "extra" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
      <Tag size={12} className="inline mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </div>
  );
}

function CategoryPill({ category }: { category: Category | undefined }) {
  if (!category) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: category.color }}>
      <div className="w-2 h-2 rounded-full bg-white opacity-50" />
      {category.name}
    </div>
  );
}

// 🎨 🎨 🎨  Task Detail Modal 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function TaskDetailModal({ task, members, categories, onClose }: {
  task: Task | null;
  members: Member[];
  categories: Category[];
  onClose: () => void;
}) {
  if (!task) return null;
  const member = getMember(task.memberId, members);
  const category = getCategory(task.categoryId, categories);
  const isCompleted = task.status === "completed";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-muted rounded">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <StatusBadge status={task.status} />
          <TypeBadge type={task.type} />
          <CategoryPill category={category} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider">Assigned to</div>
            <div className="flex items-center gap-2 mt-1">
              <Avatar initials={member.avatar} />
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-xs opacity-60">{member.role}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider">Points</div>
            <div className="text-2xl font-bold text-accent mt-1">{task.points}</div>
          </div>
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider">Due Date</div>
            <div className="font-semibold mt-1">{task.dueDate}</div>
          </div>
          {isCompleted && (
            <div>
              <div className="text-xs opacity-60 uppercase tracking-wider">Completed</div>
              <div className="font-semibold mt-1">{task.submittedAt}</div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm opacity-75 leading-relaxed">{task.description}</p>
        </div>

        {task.pictureUrl && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-2">Submission Photo</h3>
            <img src={task.pictureUrl} alt="Task submission" className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}

// 🎨 🎨 🎨  Categories View 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function CategoriesView({ categories, setCategories, tasks }: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  tasks: Task[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const getTaskCount = (categoryId: string) => tasks.filter((t) => t.categoryId === categoryId).length;

  const toggle = (id: string, field: "allowPictures" | "pictureRequired") => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addCategory = () => {
    const newCategory: Category = {
      id: "c" + uid(),
      name: "New Category",
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      allowPictures: false,
      pictureRequired: false,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateName = (id: string, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <button onClick={addCategory} className="bg-accent text-accent-foreground px-3 py-1 rounded text-sm flex items-center gap-1">
          <Plus size={16} /> Add
        </button>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateName(cat.id, editingName)}
                  onBlur={() => updateName(cat.id, editingName)}
                  className="flex-1 px-2 py-1 border border-border rounded bg-input text-foreground"
                />
              ) : (
                <div
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                  className="cursor-pointer font-semibold hover:opacity-75"
                >
                  {cat.name}
                </div>
              )}
            </div>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-1 hover:bg-muted rounded text-muted-foreground"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="text-xs opacity-60 mb-3">{getTaskCount(cat.id)} tasks</div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cat.allowPictures}
                onChange={() => toggle(cat.id, "allowPictures")}
                className="rounded"
              />
              Allow pictures
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cat.pictureRequired}
                onChange={() => toggle(cat.id, "pictureRequired")}
                disabled={!cat.allowPictures}
                className="rounded disabled:opacity-50"
              />
              Picture required
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, accentColor }: { value: boolean; onChange: () => void; accentColor?: string }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
        value ? "bg-accent" : "bg-muted"
      }`}
      style={value && accentColor ? { backgroundColor: accentColor } : {}}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// 🎨 🎨 🎨  Overview View 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function OverviewView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
}) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const totalPoints = tasks.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Completed" value={completed} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Overdue" value={overdue} />
        <StatCard label="Points Earned" value={totalPoints} accent />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Recent Tasks</h2>
        {tasks.slice(0, 5).map((task) => {
          const member = getMember(task.memberId, members);
          const category = getCategory(task.categoryId, categories);
          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="bg-card border border-border rounded-lg p-4 hover:border-accent cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold mb-2">{task.title}</div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={task.status} />
                    <CategoryPill category={category} />
                  </div>
                </div>
                <div className="text-right">
                  <Avatar initials={member.avatar} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 🎨 🎨 🎨  Tasks View 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function TasksView({ tasks, members, categories, filterType, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  filterType: "all" | "completed" | "pending" | "overdue";
  onTaskClick: (task: Task) => void;
}) {
  const filtered = filterType === "all" ? tasks : tasks.filter((t) => t.status === filterType);

  return (
    <div className="space-y-3">
      {filtered.map((task) => {
        const member = getMember(task.memberId, members);
        const category = getCategory(task.categoryId, categories);
        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="bg-card border border-border rounded-lg p-4 hover:border-accent cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground hover:opacity-75">{task.title}</h3>
                <div className="text-sm opacity-60 mt-1">{task.description.substring(0, 80)}...</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-lg text-accent">{task.points}</div>
                <div className="text-xs opacity-60">points</div>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={task.status} />
                <TypeBadge type={task.type} />
                <CategoryPill category={category} />
              </div>
              <div className="flex items-center gap-2">
                <Avatar initials={member.avatar} size="sm" />
                <div className="text-sm">
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-xs opacity-60">{member.role}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 🎨 🎨 🎨  Members View - ENHANCED WITH CREATE/DELETE 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function MembersView({ tasks, members, setMembers }: { tasks: Task[]; members: Member[]; setMembers: React.Dispatch<React.SetStateAction<Member[]>> }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  const getTaskCount = (memberId: string) => tasks.filter((t) => t.memberId === memberId).length;
  const getCompletedCount = (memberId: string) => tasks.filter((t) => t.memberId === memberId && t.status === "completed").length;
  const getTotalPoints = (memberId: string) =>
    tasks.filter((t) => t.memberId === memberId && t.status === "completed").reduce((sum, t) => sum + t.points, 0);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase();
  };

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberRole.trim()) return;

    const newMember: Member = {
      id: "m" + uid(),
      name: newMemberName,
      role: newMemberRole,
      avatar: getInitials(newMemberName),
    };

    setMembers((prev) => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberRole("");
    setShowAddModal(false);
  };

  const deleteMember = (memberId: string) => {
    if (getTaskCount(memberId) > 0) {
      alert("Cannot delete member with assigned tasks. Please reassign tasks first.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Members</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent text-accent-foreground px-3 py-1 rounded text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Add New Member</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g., Secretary, Member"
                  className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemberName("");
                  setNewMemberRole("");
                }}
                className="flex-1 px-3 py-2 border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                disabled={!newMemberName.trim() || !newMemberRole.trim()}
                className="flex-1 px-3 py-2 bg-accent text-accent-foreground rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <Avatar initials={member.avatar} />
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-xs opacity-60">{member.role}</div>
                </div>
              </div>
              <button
                onClick={() => deleteMember(member.id)}
                className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                title={getTaskCount(member.id) > 0 ? "Cannot delete - member has tasks" : "Delete member"}
                disabled={getTaskCount(member.id) > 0}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted rounded p-2">
                <div className="text-sm font-bold">{getTaskCount(member.id)}</div>
                <div className="text-xs opacity-60">Tasks</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-sm font-bold">{getCompletedCount(member.id)}</div>
                <div className="text-xs opacity-60">Completed</div>
              </div>
              <div className="bg-accent text-accent-foreground rounded p-2">
                <div className="text-sm font-bold">{getTotalPoints(member.id)}</div>
                <div className="text-xs opacity-60">Points</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 🎨 🎨  Add Task Modal 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

function AddTaskModal({ categories, members, onClose }: {
  categories: Category[];
  members: Member[];
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    memberId: members[0]?.id || "",
    categoryId: categories[0]?.id || "",
    type: "regular" as TaskType,
    points: 10,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assigned to</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
              >
                <option value="regular">Regular</option>
                <option value="extra">Extra</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Points</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border border-border rounded hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-3 py-2 bg-accent text-accent-foreground rounded">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 🎨 🎨 🎨  Main App 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨 🎨

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [members, setMembers] = useState<Member[]>(members);
  const [view, setView] = useState<"overview" | "tasks" | "members" | "categories">("overview");
  const [filterType, setFilterType] = useState<"all" | "completed" | "pending" | "overdue">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-y-auto">
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-2xl font-bold text-sidebar-primary">Committee</h1>
            <p className="text-xs opacity-60">Task Management</p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "tasks", label: "Tasks", icon: ClipboardList },
              { id: "members", label: "Members", icon: Users },
              { id: "categories", label: "Categories", icon: Tag },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id as typeof view)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded text-left ${
                  view === id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {view === "overview" && "Overview"}
              {view === "tasks" && "Tasks"}
              {view === "members" && "Members"}
              {view === "categories" && "Categories"}
            </h1>
            {view === "tasks" && (
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-accent text-accent-foreground px-4 py-2 rounded font-semibold flex items-center gap-2"
              >
                <Plus size={18} /> New Task
              </button>
            )}
          </div>

          {view === "tasks" && (
            <div className="border-b border-border px-8 py-3 flex gap-2 bg-card">
              {["all", "completed", "pending", "overdue"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterType(status as typeof filterType)}
                  className={`px-4 py-1 rounded text-sm font-medium ${
                    filterType === status
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {view === "overview" && <OverviewView tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}
            {view === "tasks" && <TasksView tasks={tasks} members={members} categories={categories} filterType={filterType} onTaskClick={setSelectedTask} />}
            {view === "members" && <MembersView tasks={tasks} members={members} setMembers={setMembers} />}
            {view === "categories" && <CategoriesView categories={categories} setCategories={setCategories} tasks={tasks} />}
          </div>
        </div>
      </div>

      {selectedTask && <TaskDetailModal task={selectedTask} members={members} categories={categories} onClose={() => setSelectedTask(null)} />}
      {showAddTaskModal && <AddTaskModal categories={categories} members={members} onClose={() => setShowAddTaskModal(false)} />}
    </div>
  );
}
