import { useState, useEffect } from "react";
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
  LogOut,
  Menu,
  Edit
} from "lucide-react";


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
  submittedAt: string;
  points: number;
  description: string;
  pictureUrl?: string;
}
                                   

const CATEGORY_COLORS = [
  "#1B2A3B", "#C9581A", "#4A7C59", "#6B4E8A", "#8B5A2B",
  "#2563EB", "#DC2626", "#0891B2", "#65A30D", "#D97706",
];


// Define which roles can see which tabs
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Admin": ["overview", "tasks", "members", "categories"],
  "Committee": ["overview", "tasks", "members", "categories"],
  "Member": ["overview", "tasks"],
  "Observer": ["overview", "tasks"],
};

//     Helper Functions                                     

const getMember   = (id: string, list: Member[])     => list.find((m) => m.id === id)!;
const getCategory = (id: string, cats: Category[])   => cats.find((c) => c.id === id);

function uid() {
  return "c" + Math.random().toString(36).slice(2, 9);
}

//     UI Components                                     

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

function LoginScreen({ onLogin }: { onLogin: (userId: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

    if (response.ok) {
        const data = await response.json();
        // Save the secure token, not the raw ID
        localStorage.setItem("committee_token", data.token);
        // Reload the app to trigger the secure verification flow
        window.location.reload(); 
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card border border-border p-8 rounded-lg max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Committee</h1>
          <p className="text-sm opacity-60">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-100 p-2 rounded">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground py-2 rounded font-bold hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
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

//     Task Detail Modal                                     

function TaskDetailModal({ task, members, categories, currentUser, onClose, onDelete, onEdit }: {
  task: Task | null;
  members: Member[];
  currentUser: Member | null;
  categories: Category[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  if (!task) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    categoryId: task.categoryId,
    points: task.points,
    description: task.description,
  });

  const member = getMember(task.memberId, members) || { id: "unknown", avatar: "?", name: "Unknown", role: "Unknown" };
  const category = getCategory(task.categoryId, categories) || { id: "unknown", name: "Unknown", color: "#ccc", allowPictures: false, pictureRequired: false };

  // --- TIME CALCULATION LOGIC ---
  const submittedTime = new Date(task.submittedAt).getTime();
  const currentTime = new Date().getTime();
  const hoursElapsed = (currentTime - submittedTime) / (1000 * 60 * 60);

  // --- RBAC & TIME PERMISSIONS ---
  const isOwner = currentUser?.role === "Member" && task.memberId === currentUser?.id;
  const isPrivileged = currentUser?.role === "Admin" || currentUser?.role === "Committee";

  const canEdit = isPrivileged || (isOwner && hoursElapsed <= 24);
  const canDelete = isPrivileged || (isOwner && hoursElapsed <= 168); // 168 hours = 7 days

  const formattedDate = task.submittedAt ? new Date(task.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";
  const formattedTime = task.submittedAt ? new Date(task.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "Unknown";

  const handleSaveEdit = () => {
    onEdit({
      ...task,
      title: editForm.title,
      categoryId: editForm.categoryId,
      points: editForm.points,
      description: editForm.description,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-card text-card-foreground rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-muted rounded transition-colors">
          <X size={20} />
        </button>

        {isEditing ? (
          <div className="space-y-4 mb-6 pt-4 border-b border-border pb-6">
            <h2 className="text-xl font-bold">Edit Task</h2>
            <input 
              type="text" 
              value={editForm.title} 
              onChange={e => setEditForm({...editForm, title: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded bg-input text-foreground font-bold text-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold opacity-60 uppercase">Category</label>
                <select 
                  value={editForm.categoryId} 
                  onChange={e => setEditForm({...editForm, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded bg-input text-foreground mt-1"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold opacity-60 uppercase">Points</label>
                <input 
                  type="number" 
                  min="0" /* <-- Add HTML minimum bound */
                  value={editForm.points} 
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    // Enforce strict zero minimum in state
                    setEditForm({...editForm, points: Math.max(0, val)});
                  }}  
                className="w-full px-3 py-2 border border-border rounded bg-input text-foreground mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold opacity-60 uppercase">Description</label>
              <textarea 
                value={editForm.description} 
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded bg-input text-foreground mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-border rounded hover:bg-muted">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-accent text-accent-foreground rounded font-bold hover:opacity-90">Save Changes</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 pr-8">{task.title}</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              <CategoryPill category={category} />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider font-semibold">Done by</div>
            <div className="flex items-center gap-2 mt-2">
              <Avatar initials={member.avatar} />
              <div>
                <div className="font-semibold text-sm leading-tight">{member.name}</div>
                <div className="text-xs opacity-60">{member.role}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider font-semibold">Submitted On</div>
            <div className="mt-2 text-sm">
              <div className="font-semibold">{formattedDate}</div>
              <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5 text-accent">
                {formattedTime}
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <div className="text-xs opacity-60 uppercase tracking-wider font-semibold">Points</div>
            <div className="text-2xl font-bold text-accent mt-1">{task.points}</div>
          </div>
        </div>

        {!isEditing && (
          <div className="border-t border-border pt-4 mb-4">
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider opacity-60">Description</h3>
            <p className="text-sm opacity-90 leading-relaxed bg-muted/50 p-3 rounded-lg border border-border">
              {task.description || "No description provided."}
            </p>
          </div>
        )}

        {task.pictureUrl && !isEditing && (
          <div className="border-t border-border pt-4 mb-4">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-60">Submission Photo</h3>
            <img src={task.pictureUrl} alt="Task submission" className="w-full rounded-lg border border-border shadow-sm object-cover max-h-[400px]" />
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4 mt-4">
          {canEdit && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 border border-border text-foreground rounded hover:bg-muted flex items-center gap-2 font-semibold transition-colors shadow-sm"
            >
              <Edit size={16} /> Edit Task
            </button>
          )}
          {canDelete && !isEditing && (
            <button 
              onClick={() => onDelete(task.id)} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 font-semibold transition-colors shadow-sm"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

//     Categories View                                     

function CategoriesView({ categories, setCategories, tasks }: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  tasks: Task[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const getTaskCount = (categoryId: string) => tasks.filter((t) => t.categoryId === categoryId).length;

  // const toggle = (id: string, field: "allowPictures" | "pictureRequired") => {
  //   setCategories((prev) =>
  //     prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c))
  //   );
  // };

// Inside CategoriesView (around line 220), REPLACE your existing `toggle` and `updateName` functions with this block:

  // Centralized function to push any category update to the backend
  const updateCategory = async (updatedCat: Category) => {
    // Optimistic UI update (feels instantaneous to the user)
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));

    try {
      await fetch(`/api/categories/${updatedCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCat)
      });
    } catch (error) {
      console.error("Failed to save category update:", error);
    }
  };

  // Helper for checkboxes
  const toggle = (cat: Category, field: "allowPictures" | "pictureRequired") => {
    updateCategory({ ...cat, [field]: !cat[field] });
  };

  // Helper for color cycling
  const cycleColor = (cat: Category) => {
    const currentIndex = CATEGORY_COLORS.indexOf(cat.color);
    const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % CATEGORY_COLORS.length : 0;
    updateCategory({ ...cat, color: CATEGORY_COLORS[nextIndex] });
  };

  // Helper for renaming
  const saveName = (cat: Category, newName: string) => {
    updateCategory({ ...cat, name: newName });
    setEditingId(null);
  };

const deleteCategory = async (id: string) => {
  if (getTaskCount(id) > 0) {
    alert("Cannot delete a category that is currently assigned to tasks. Please reassign or delete those tasks first.");
    return;
  }

  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  } catch (error) {
    console.error("Failed to delete category:", error);
  }
};

 const addCategory = async () => {
    const newCategory: Category = {
      id: "c" + uid(),
      name: "New Category",
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      allowPictures: false,
      pictureRequired: false,
    };

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
      });
      
      if (response.ok) {
        setCategories((prev) => [...prev, newCategory]);
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    }
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
              <div 
                className="w-4 h-4 rounded cursor-pointer ring-offset-background hover:ring-2 ring-border transition-all" 
                style={{ backgroundColor: cat.color }} 
                onClick={() => cycleColor(cat)}
                title="Click to change color"
                />
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName(cat, editingName)}
                  onBlur={() => saveName(cat, editingName)}
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
                onChange={() => toggle(cat, "allowPictures")}
                className="rounded"
                />
              Allow pictures
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cat.pictureRequired}
                onChange={() => toggle(cat, "pictureRequired")}
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

//     Overview View                                     

function OverviewView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
}) {
  // 1. Determine current calendar month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 2. Filter tasks strictly for the current month
  const currentMonthTasks = tasks.filter(t => {
    if (!t.submittedAt) return false;
    const d = new Date(t.submittedAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // 3. Aggregate data to find top performers
  const memberStats: Record<string, { tasks: number; points: number }> = {};
  
  currentMonthTasks.forEach(t => {
     if (!memberStats[t.memberId]) {
         memberStats[t.memberId] = { tasks: 0, points: 0 };
     }
     memberStats[t.memberId].tasks += 1;
     memberStats[t.memberId].points += (t.points || 0);
  });

  let topTaskMemberId: string | null = null;
  let maxTasks = 0;
  let topPointsMemberId: string | null = null;
  let maxPoints = 0;

  Object.entries(memberStats).forEach(([memberId, stats]) => {
      if (stats.tasks > maxTasks) {
          maxTasks = stats.tasks;
          topTaskMemberId = memberId;
      }
      if (stats.points > maxPoints) {
          maxPoints = stats.points;
          topPointsMemberId = memberId;
      }
  });

  // Resolve member names or fallback
  const topTaskMember = topTaskMemberId ? (members.find(m => m.id === topTaskMemberId)?.name || "Unknown") : "N/A";
  const topPointsMember = topPointsMemberId ? (members.find(m => m.id === topPointsMemberId)?.name || "Unknown") : "N/A";

  // 4. Mock online users (active session)
  const onlineUsers = 1; 

  return (
    <div className="space-y-6">
      
      {/* NEW: Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-md">
          <div className="text-sm font-medium opacity-75">Tasks This Month</div>
          <div className="text-3xl font-bold mt-1">{currentMonthTasks.length}</div>
          <div className="text-xs opacity-50 mt-1 text-accent">Total Completed</div>
        </div>

        <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center shadow-md">
          <div className="text-sm font-medium opacity-90">Most Tasks</div>
          <div className="text-3xl font-bold mt-1">{maxTasks}</div>
          <div className="text-xs opacity-75 mt-1">{topTaskMember}</div>
        </div>

        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-md">
          <div className="text-sm font-medium opacity-75">Most Points</div>
          <div className="text-3xl font-bold mt-1">{maxPoints}</div>
          <div className="text-xs opacity-50 mt-1 text-accent font-semibold">{topPointsMember}</div>
        </div>

        <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center shadow-md">
          <div className="text-sm font-medium opacity-90">Online Users</div>
          <div className="text-3xl font-bold mt-1">{onlineUsers}</div>
          <div className="text-xs opacity-75 mt-1">Active Now</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Recent Tasks</h2>
        {tasks.slice(0, 5).map((task) => {
          const member = getMember(task.memberId, members) || { 
            id: "unknown", 
            avatar: "?", 
            name: "Unknown", 
            role: "Unknown" 
          };
          
          const category = getCategory(task.categoryId, categories) || { 
            id: "unknown", 
            name: "Unknown", 
            color: "#ccc", 
            allowPictures: false, 
            pictureRequired: false 
          };

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

//     Tasks View                                     

function TasksView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
}) {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedMember, setSelectedMember] = useState("All");

  // Dynamically extract unique "Month Year" combinations from existing tasks
  const uniqueMonths = Array.from(new Set(tasks.map(t => {
    if (!t.submittedAt) return null;
    const d = new Date(t.submittedAt);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }).filter(Boolean))) as string[];

  // Apply filters to the task list
  const filteredTasks = tasks.filter(t => {
    const matchMember = selectedMember === "All" || t.memberId === selectedMember;
    let matchMonth = true;
    
    if (selectedMonth !== "All") {
       if (!t.submittedAt) { 
         matchMonth = false; 
       } else {
         const d = new Date(t.submittedAt);
         const mStr = isNaN(d.getTime()) ? "" : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
         matchMonth = mStr === selectedMonth;
       }
    }
    return matchMember && matchMonth;
  });

  return (
    <div className="space-y-4">
      {/* NEW: Filter Controls */}
      <div className="flex gap-4 bg-card p-3 rounded-lg border border-border">
        <div className="flex-1">
          <label className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1 block">Filter by Month</label>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm cursor-pointer"
          >
            <option value="All">All Months</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1 block">Done by Member</label>
          <select 
            value={selectedMember} 
            onChange={e => setSelectedMember(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm cursor-pointer"
          >
            <option value="All">All Members</option>
            {members.filter(m => m.role == "Member").map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-8 opacity-50 font-semibold border border-dashed border-border rounded-lg">
            No tasks found for these filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const member = getMember(task.memberId, members) || { id: "unknown", avatar: "?", name: "Unknown", role: "Unknown" };
            const category = getCategory(task.categoryId, categories) || { id: "unknown", name: "Unknown", color: "#ccc", allowPictures: false, pictureRequired: false };
            
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
          })
        )}
      </div>
    </div>
  );
}
//     Members View - ENHANCED WITH CREATE/DELETE                               

// Inside the MembersView function (around line 249):
function MembersView({ tasks, members, setMembers }: { tasks: Task[]; members: Member[]; setMembers: React.Dispatch<React.SetStateAction<Member[]>> }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");

  const getTaskCount = (memberId: string) => tasks.filter((t) => t.memberId === memberId).length;
  const getCompletedCount = (memberId: string) => tasks.filter((t) => t.memberId === memberId).length;
  const getTotalPoints = (memberId: string) =>
    tasks.filter((t) => t.memberId === memberId).reduce((sum, t) => sum + t.points, 0);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase();
  };

// Inside the addMember function (around line 259):
  const addMember = async () => {
    // Require the new fields to be filled
    if (!newMemberName.trim() || !newMemberRole.trim() || !newMemberUsername.trim() || !newMemberPassword.trim()) return;

    const newMemberPayload = {
      id: "m" + uid(),
      name: newMemberName,
      role: newMemberRole,
      avatar: getInitials(newMemberName),
      username: newMemberUsername, // Send username
      password: newMemberPassword  // Send password
    };

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemberPayload) // Send the updated payload
      });
      
      if (response.ok) {
        // Create the local member object without the password for state
        const newMember: Member = {
          id: newMemberPayload.id,
          name: newMemberPayload.name,
          role: newMemberPayload.role,
          avatar: newMemberPayload.avatar,
        };
        
        setMembers((prev) => [...prev, newMember]);
        // Reset all fields
        setNewMemberName("");
        setNewMemberRole("");
        setNewMemberUsername("");
        setNewMemberPassword("");
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  
const deleteMember = async (memberId: string) => {
  if (getTaskCount(memberId) > 0) {
    alert("Cannot delete member with assigned tasks. Please reassign tasks first.");
    return;
  }
  
  try {
    const response = await fetch(`/api/members/${memberId}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  } catch (error) {
    console.error("Failed to delete member:", error);
  }
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
  
  {/* ADD USERNAME FIELD */}
  <div>
    <label className="text-sm font-medium">Username</label>
    <input
      type="text"
      value={newMemberUsername}
      onChange={(e) => setNewMemberUsername(e.target.value)}
      placeholder="Login ID"
      className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
    />
  </div>

  {/* ADD PASSWORD FIELD */}
  <div>
    <label className="text-sm font-medium">Password</label>
    <input
      type="password"
      value={newMemberPassword}
      onChange={(e) => setNewMemberPassword(e.target.value)}
      placeholder="Secret password"
      className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
    />
  </div>

  <div>
    <label className="text-sm font-medium">Role</label>
    <select
      value={newMemberRole}
      onChange={(e) => setNewMemberRole(e.target.value)}
      className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground">
      <option value="" disabled>Select a role...</option>
      <option value="Committee">Committee</option>
      <option value="Member">Member</option>
      <option value="Observer">Observer</option>
    </select>
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
        {members.filter(member => member.role !== "Admin").map((member) => (
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

//     Add Task Modal                                     

function AddTaskModal({ categories, members, currentUserId, onClose, onAdd }: {
  categories: Category[];
  members: Member[];
  currentUserId: string;
  onClose: () => void;
  onAdd: (task: Task) => void;
}) {
  const assignableMembers = members.filter(m => m.role !== "Admin");

  const [formData, setFormData] = useState({
    title: "",
    categoryId: categories[0]?.id || "",
    points: 10,
    description: "",
  });

  // NEW: State to hold the selected image file
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // NEW: Dynamically find the active category to check its picture rules
  const activeCategory = categories.find(c => c.id === formData.categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: Block submission if a picture is strictly required but not provided
    if (activeCategory?.pictureRequired && !pictureFile) {
      alert(`A picture is explicitly required for the "${activeCategory.name}" category.`);
      return;
    }

    setIsUploading(true);
    let uploadedPictureUrl = "";

    // 2. If a picture was selected, send it to the Multer upload endpoint first
    if (pictureFile) {
      const uploadData = new FormData();
      uploadData.append("picture", pictureFile);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData, // Note: DO NOT set "Content-Type" manually when using FormData
        });
        
        if (uploadRes.ok) {
          const result = await uploadRes.json();
          uploadedPictureUrl = result.pictureUrl; // Extract the saved URL
        } else {
          alert("Image upload failed.");
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error("Upload connection error:", error);
        setIsUploading(false);
        return;
      }
    }

    // 3. Create the final Task object, attaching the new picture URL (or null)
    const newTask: Task = {
      id: "t" + uid(),
      title: formData.title,
      memberId: currentUserId,
      categoryId: formData.categoryId,
      submittedAt: new Date().toISOString(),
      points: formData.points,
      description: formData.description,
      pictureUrl: uploadedPictureUrl || undefined, // Send the URL to the SQLite database
    };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        onAdd(newTask);
        onClose();
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsUploading(false);
    }
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
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ ...formData, categoryId: e.target.value });
                  setPictureFile(null); // Reset picture if they change categories
                }}
                className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* NEW: Conditional Picture Upload Input */}
          {activeCategory?.allowPictures && (
            <div className="bg-muted p-3 rounded-lg border border-border border-dashed">
              <label className="text-sm font-medium flex items-center gap-2">
                Task Picture 
                {activeCategory.pictureRequired ? 
                  <span className="text-xs text-red-500 font-bold">(Required)</span> : 
                  <span className="text-xs opacity-60">(Optional)</span>
                }
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
                className="w-full mt-2 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:opacity-90"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Points</label>
            <input
            type="number"
            min="0" /* <-- Add HTML minimum bound */
            value={formData.points}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              const val = isNaN(parsed) ? 0 : parsed;
              // Enforce strict zero minimum in state
              setFormData({ ...formData, points: Math.max(0, val) });
            }}
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
            <button type="button" onClick={onClose} disabled={isUploading} className="flex-1 px-3 py-2 border border-border rounded hover:bg-muted disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isUploading} className="flex-1 px-3 py-2 bg-accent text-accent-foreground rounded disabled:opacity-50 flex justify-center items-center">
              {isUploading ? "Uploading..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//     Main App                                     

export default function App() {
// 1. Start with completely empty arrays
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  
  // 2. Keep the UI states exactly the same
  const [view, setView] = useState<"overview" | "tasks" | "members" | "categories">("overview");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // NEW: State for Custom Prune Modal
  const [showPruneModal, setShowPruneModal] = useState(false);
  const [pruneStatus, setPruneStatus] = useState<"confirm" | "loading" | "success">("confirm");
  const [pruneCutoffDisplay, setPruneCutoffDisplay] = useState("");
  const [prunedCount, setPrunedCount] = useState(0);

  // 3. Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Start with a null user and loading true
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("committee_token");
    
    if (!token) {
      setLoading(false); // No token found, stop loading and show login screen
      return;
    }

    // 1. Ask the server if this token is still valid (survived a restart)
    fetch("/api/verify", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Token invalid or expired");
      return res.json();
    })
    .then(data => {
      setCurrentUserId(data.userId); // Authentication Passed!
      
      // 2. ONLY fetch the sensitive dashboard data if auth was successful
      return Promise.all([
        fetch("/api/members").then(r => r.json()),
        fetch("/api/tasks").then(r => r.json()),
        fetch("/api/categories").then(r => r.json())
      ]);
    })
    .then(([membersData, tasksData, categoriesData]) => {
      setMembers(membersData);
      setTasks(tasksData);
      setCategories(categoriesData);
      setLoading(false); // Unlock the dashboard
    })
    .catch(err => {
      console.error("Session terminated:", err);
      localStorage.removeItem("committee_token"); // Wipe the dead token
      setCurrentUserId(null);
      setLoading(false); // Show login screen
    });
  }, []);
// 4. FETCH THE DATA
  useEffect(() => {
    Promise.all([
      fetch("/api/members").then(res => res.json()),
      fetch("/api/tasks").then(res => res.json()),
      fetch("/api/categories").then(res => res.json())
    ]).then(([membersData, tasksData, categoriesData]) => {
      setMembers(membersData);
      setTasks(tasksData);
      setCategories(categoriesData);
      setLoading(false); // Tell React the data is ready!
    }).catch(err => {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    });
  }, []);

const deleteTask = async (taskId: string) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null); // Close the modal
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

const editTask = async (updatedTask: Task) => {
  try {
    const response = await fetch(`/api/tasks/${updatedTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask)
    });
    
    if (response.ok) {
      const returnedTask = await response.json();
      // Update the main list
      setTasks((prev) => prev.map((t) => t.id === returnedTask.id ? returnedTask : t));
      // Update the currently open modal
      setSelectedTask(returnedTask); 
    }
  } catch (error) {
    console.error("Failed to edit task:", error);
  }
};

// 1. Opens the UI Modal and formats the date
  const initiatePrune = () => {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1); // Set to your desired retention window
    setPruneCutoffDisplay(cutoff.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setPruneStatus("confirm");
    setShowPruneModal(true);
  };

  // 2. Executes the API call inside the Modal
  const executePrune = async () => {
    setPruneStatus("loading"); // Trigger loading spinner
    
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const cutoffDate = cutoff.toISOString().split('T')[0];

    try {
      const response = await fetch("/api/tasks/cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cutoffDate })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update React state by keeping only tasks strictly AFTER the cutoff date
        setTasks((prev) => prev.filter(t => t.submittedAt && t.submittedAt.split('T')[0] > cutoffDate));
        
        // Switch UI to success screen
        setPrunedCount(data.deletedCount || 0);
        setPruneStatus("success");
      } else {
        alert("Cleanup failed. Check server console.");
        setShowPruneModal(false);
      }
    } catch (error) {
      console.error("Failed to prune tasks:", error);
      setShowPruneModal(false);
    }
  };


  // 5. If no user is logged in, STOP HERE and show the Login Screen
  if (!currentUserId) {
    return <LoginScreen onLogin={(id) => setCurrentUserId(id)} />;
  }

  // 6. SAFE Role Checking (Wait until data exists)
  const currentUser = members.find(m => m.id === currentUserId) || null;
  const allowedTabs = currentUser ? ROLE_PERMISSIONS[currentUser.role] || [] : [];

  // 7. Block the UI from rendering until loading is done
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-xl font-bold">
        Connecting to SQLite Database...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Added 'relative' to the main wrapper to contain the absolute sidebar */}
      <div className="flex h-screen overflow-hidden relative">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Sidebar - Upgraded to 'lg:' and 'absolute' for foolproof mobile rendering */}
        <div className={`absolute inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          
          <div className="p-6 border-b border-sidebar-border flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-sidebar-primary">Dormitory</h1>
              <p className="text-xs opacity-60">Task Management</p>
            </div>
            {/* Close button inside sidebar specifically for mobile users */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 -mr-2 rounded hover:bg-sidebar-accent">
              <X size={20} />
            </button>
          </div>

          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "tasks", label: "Tasks", icon: ClipboardList },
              { id: "members", label: "Members", icon: Users },
              { id: "categories", label: "Categories", icon: Tag },
            ]
            .filter(tab => allowedTabs.includes(tab.id))
            .map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setView(id as typeof view);
                  setIsSidebarOpen(false); // Auto-close menu on mobile after selection
                }}
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

          <div className="p-4 border-t border-sidebar-border mt-auto">
            <button
              onClick={() => {
                localStorage.removeItem("committee_token");
                window.location.reload();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded text-left hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col w-full">
          <div className="bg-card border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button - Upgraded to lg:hidden */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded hover:bg-muted text-foreground flex items-center justify-center"
              >
                <Menu size={24} />
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold">
                {view === "overview" && "Overview"}
                {view === "tasks" && "Tasks"}
                {view === "members" && "Members"}
                {view === "categories" && "Categories"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
{view === "tasks" && (currentUser?.role === "Committee" || currentUser?.role === "Admin") && (
  <button
    onClick={initiatePrune}
    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border border-red-500 text-red-500 rounded font-semibold hover:bg-red-500 hover:text-white transition-colors"
  >
    Prune Old
  </button>
)}
              {view === "tasks" && currentUser?.role === "Member" && (
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="bg-accent text-accent-foreground px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded font-semibold flex items-center gap-2"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">New Task</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 md:py-6">
            {view === "overview" && <OverviewView tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}
            {view === "tasks" && <TasksView tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />} 
            {view === "members" && <MembersView tasks={tasks} members={members} setMembers={setMembers} />}
            {view === "categories" && <CategoriesView categories={categories} setCategories={setCategories} tasks={tasks} />}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          members={members} 
          categories={categories} 
          currentUser={currentUser} 
          onClose={() => setSelectedTask(null)} 
          onDelete={deleteTask} 
          onEdit={editTask}
        />
      )}
      
      {showAddTaskModal && currentUserId && (
        <AddTaskModal 
          categories={categories} 
          members={members} 
          currentUserId={currentUserId}
          onClose={() => setShowAddTaskModal(false)} 
          onAdd={(newTask) => setTasks(prev => [...prev, newTask])} 
        />
      )}
      {showPruneModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-card text-card-foreground rounded-lg max-w-sm w-full p-6 shadow-xl text-center relative overflow-hidden">
            
            {pruneStatus === "confirm" && (
              <div className="animate-in fade-in zoom-in duration-200">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Prune Old Tasks?</h3>
                <p className="text-sm opacity-75 mb-6">
                  Are you sure? Everything before and including <strong className="text-foreground">{pruneCutoffDisplay}</strong> will be permanently deleted from the database.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowPruneModal(false)} 
                    className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executePrune} 
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {pruneStatus === "loading" && (
              <div className="py-8 animate-in fade-in duration-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent mx-auto mb-4"></div>
                <h3 className="text-lg font-bold">Cleaning Database</h3>
                <p className="text-sm opacity-60 mt-1">This might take a moment...</p>
              </div>
            )}

            {pruneStatus === "success" && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cleanup Complete</h3>
                <p className="text-sm opacity-75 mb-6">
                  Successfully deleted <strong className="text-accent text-lg">{prunedCount}</strong> old task(s).
                </p>
                <button 
                  onClick={() => setShowPruneModal(false)} 
                  className="w-full px-4 py-2 bg-accent text-accent-foreground rounded hover:opacity-90 font-semibold transition-colors shadow-lg"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  ); 
} 