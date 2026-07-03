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
  LogOut
} from "lucide-react";

//     Types                                     

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
  submittedAt: string;
  points: number;
  description: string;
  pictureUrl?: string;
}

//     Initial Data                                     

const CATEGORY_COLORS = [
  "#1B2A3B", "#C9581A", "#4A7C59", "#6B4E8A", "#8B5A2B",
  "#2563EB", "#DC2626", "#0891B2", "#65A30D", "#D97706",
];


// Define which roles can see which tabs
const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Admin": ["overview", "tasks", "members", "categories"],
  "Committee": ["overview", "tasks", "categories"],
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
      const response = await fetch("http://localhost:5000/api/login", {
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

//     Task Detail Modal                                     

function TaskDetailModal({ task, members, categories, onClose, onDelete }: {
  task: Task | null;
  members: Member[];
  categories: Category[];
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!task) return null;
  const member = getMember(task.memberId, members);
  const category = getCategory(task.categoryId, categories);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-muted rounded">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
        <div className="flex flex-wrap gap-2 mb-6">
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
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm opacity-75 leading-relaxed">{task.description}</p>
        </div>

{task.pictureUrl && (
    <div className="border-t border-border pt-4 mb-4">
      <h3 className="font-semibold mb-2">Submission Photo</h3>
      <img src={task.pictureUrl} alt="Task submission" className="w-full rounded-lg" />
    </div>
  )}

  {/* ADD THIS NEW BLOCK FOR THE DELETE BUTTON */}
  <div className="flex justify-end border-t border-border pt-4 mt-4">
    <button 
      onClick={() => onDelete(task.id)} 
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 font-semibold transition-colors"
    >
      <Trash2 size={16} /> Delete Task
    </button>
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

  const toggle = (id: string, field: "allowPictures" | "pictureRequired") => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
      const response = await fetch("http://localhost:5000/api/categories", {
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

  const updateName = async (id: string, name: string) => {
    try {
      // 1. Send the updated name to the SQLite database
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        // 2. If the database saved it successfully, update the UI!
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to update category name:", error);
      setEditingId(null); // Close the input box even if it fails
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

//     Overview View                                     

function OverviewView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
}) {
/*  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const totalPoints = tasks.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.points, 0); 
  */

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

// Replace your current TasksView definition (around line 335) with this:
function TasksView({ tasks, members, categories, onTaskClick }: {
  tasks: Task[];
  members: Member[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
}) {
  // We removed the 'filtered' variable entirely. Map directly over 'tasks'.
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
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
                {/* <StatusBadge status={task.status} /> <-- THIS LINE IS REMOVED */}
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
      const response = await fetch("http://localhost:5000/api/members", {
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
    const response = await fetch(`http://localhost:5000/api/members/${memberId}`, {
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

function AddTaskModal({ categories, members, onClose, onAdd }: {
  categories: Category[];
  members: Member[];
  onClose: () => void;
  onAdd: (task: Task) => void;
}) {
  // 1. Create a safe list of people who can actually receive tasks
  const assignableMembers = members.filter(m => m.role !== "Admin");

  const [formData, setFormData] = useState({
    title: "",
    // 2. Default to the first assignable person, not the Admin
    memberId: assignableMembers.length > 0 ? assignableMembers[0].id : "",
    categoryId: categories[0]?.id || "",
    type: "regular" as TaskType,
    points: 10,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create today's date formatted as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const newTask: Task = {
      id: "t" + uid(),
      title: formData.title,
      memberId: formData.memberId,
      categoryId: formData.categoryId,
      type: formData.type,
      submittedAt: "",
      points: formData.points,
      description: formData.description,
    };

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        onAdd(newTask); // Tell the main App to update the UI
        onClose();
      }
    } catch (error) {
      console.error("Failed to save task:", error);
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
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assigned to</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded mt-1 bg-input text-foreground"
            >
              {assignableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
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

//     Main App                                     

export default function App() {
// 1. Start with completely empty arrays
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  
  // 3. Keep the UI states exactly the same
  const [view, setView] = useState<"overview" | "tasks" | "members" | "categories">("overview");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);


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
    fetch("http://localhost:5000/api/verify", {
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
        fetch("http://localhost:5000/api/members").then(r => r.json()),
        fetch("http://localhost:5000/api/tasks").then(r => r.json()),
        fetch("http://localhost:5000/api/categories").then(r => r.json())
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
      fetch("http://localhost:5000/api/members").then(res => res.json()),
      fetch("http://localhost:5000/api/tasks").then(res => res.json()),
      fetch("http://localhost:5000/api/categories").then(res => res.json())
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
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
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
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
  <div className="p-6 border-b border-sidebar-border">
    <h1 className="text-2xl font-bold text-sidebar-primary">Dormitory</h1>
    <p className="text-xs opacity-60">Task Management</p>
  </div>

  {/* Add flex-1 and overflow-y-auto here so the navigation stretches and scrolls if needed */}
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

  {/* LOGOUT SECTION */}
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
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {view === "overview" && "Overview"}
              {view === "tasks" && "Tasks"}
              {view === "members" && "Members"}
              {view === "categories" && "Categories"}
            </h1>
            {view === "tasks" && (currentUser?.role === "Member" || currentUser?.role === "Admin") && (
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="bg-accent text-accent-foreground px-4 py-2 rounded font-semibold flex items-center gap-2"
              >
                <Plus size={18} /> New Task
              </button>
            )}
          </div>



          <div className="flex-1 overflow-y-auto px-8 py-6">
            {view === "overview" && <OverviewView tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}
            {view === "tasks" && <TasksView tasks={tasks} members={members} categories={categories} onTaskClick={setSelectedTask} />}            {view === "members" && <MembersView tasks={tasks} members={members} setMembers={setMembers} />}
            {view === "categories" && <CategoriesView categories={categories} setCategories={setCategories} tasks={tasks} />}
          </div>
        </div>
      </div>

      {selectedTask && (
  <TaskDetailModal 
    task={selectedTask} 
    members={members} 
    categories={categories} 
    onClose={() => setSelectedTask(null)} 
    onDelete={deleteTask} // <-- ADD THIS LINE
  />
)}
      {showAddTaskModal && (
        <AddTaskModal 
          categories={categories} 
          members={members} 
          onClose={() => setShowAddTaskModal(false)} 
          onAdd={(newTask) => setTasks(prev => [...prev, newTask])} // <-- Add this line
        />
      )}
    </div>
  );
}
