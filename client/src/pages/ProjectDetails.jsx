import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock3, FolderKanban, Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";
import Navbar from "../components/Navbar";

const STATUS_OPTIONS = ["todo", "in-progress", "review", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const statusStyle = {
  "todo": "text-slate-400 border-slate-500/30 bg-slate-500/10",
  "in-progress": "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "review": "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  "done": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

const priorityStyle = { low: "text-slate-400", medium: "text-yellow-400", high: "text-red-400" };

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [creating, setCreating] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberErr, setMemberErr] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  async function loadProject() {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data.project);
  }

  async function loadTasks() {
    try {
      const res = await api.get(`/tasks/${id}/tasks`);
      setTasks(res.data.tasks || []);
    } catch { setTasks([]); }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await Promise.all([loadProject(), loadTasks()]); }
      catch (e) { setError(e.response?.data?.message || "Failed to load project"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  async function createTask(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/tasks/${id}/tasks`, taskForm);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "" });
      setShowForm(false);
      await loadTasks();
    } catch (err) { setError(err.response?.data?.message || "Failed to create task"); }
    finally { setCreating(false); }
  }

  async function updateStatus(taskId, status) {
    try {
      await api.put(`/tasks/${id}/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    } catch {}
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch {}
  }

  async function addMember(e) {
    e.preventDefault();
    setMemberErr("");
    setAddingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      await loadProject();
    } catch (err) { setMemberErr(err.response?.data?.message || "Failed to add member"); }
    finally { setAddingMember(false); }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-400" size={36} />
    </div>
  );

  if (!project) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-red-400">{error || "Project not found"}</p>
      <button onClick={() => navigate("/dashboard")} className="text-sm text-indigo-400 hover:underline">Back to Dashboard</button>
    </div>
  );

  const byStatus = STATUS_OPTIONS.reduce((a, s) => ({ ...a, [s]: tasks.filter(t => t.status === s) }), {});
  const doneCount = byStatus["done"]?.length || 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 text-indigo-400">
              <FolderKanban size={28} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">{project.name}</h1>
              <p className="mt-1 text-slate-400">{project.description || "No description."}</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium capitalize text-emerald-400">{project.status}</span>
        </motion.div>

        {error && <div className="mb-6 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Tasks */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">Tasks</h2>
              <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold hover:opacity-90">
                <Plus size={16} /> {showForm ? "Cancel" : "Add Task"}
              </button>
            </div>

            {showForm && (
              <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={createTask} className="glass mb-6 rounded-2xl p-5 space-y-3">
                <input name="title" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400" />
                <textarea name="description" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows="2" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400" />
                <div className="flex gap-3">
                  <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-[#0d0d1a] px-4 py-2.5 text-white outline-none">
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                  </select>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-[#0d0d1a] px-4 py-2.5 text-slate-300 outline-none" />
                </div>
                <button disabled={creating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 font-semibold disabled:opacity-50">
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </motion.form>
            )}

            {tasks.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <CheckCircle2 className="mx-auto mb-3 text-slate-600" size={36} />
                <p className="text-slate-400">No tasks yet. Create one above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {STATUS_OPTIONS.map(status => byStatus[status].length > 0 && (
                  <div key={status}>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                      <span className={`rounded-full border px-2 py-0.5 ${statusStyle[status]}`}>{status.replace("-", " ")}</span>
                      <span>{byStatus[status].length}</span>
                    </h3>
                    <div className="space-y-3">
                      {byStatus[status].map((task, i) => (
                        <motion.div key={task._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass group rounded-2xl p-4">
                          <div className="flex items-start gap-3">
                            <button onClick={() => updateStatus(task._id, task.status === "done" ? "todo" : "done")} className="mt-0.5 shrink-0 text-slate-500 hover:text-emerald-400">
                              {task.status === "done" ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${task.status === "done" ? "line-through text-slate-500" : "text-white"}`}>{task.title}</p>
                              {task.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{task.description}</p>}
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                                <span className={`font-medium ${priorityStyle[task.priority]}`}>{task.priority} priority</span>
                                {task.assignee && <span className="text-slate-500">→ {task.assignee.name}</span>}
                                {task.dueDate && <span className="flex items-center gap-1 text-slate-500"><Clock3 size={11} />{new Date(task.dueDate).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 outline-none">
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
                              </select>
                              <button onClick={() => deleteTask(task._id)} className="rounded-lg p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Members */}
            <div className="glass rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Users size={18} className="text-indigo-400" />
                <h3 className="font-semibold">Members ({project.members?.length})</h3>
              </div>
              <ul className="space-y-2 mb-4">
                {project.members?.map(m => (
                  <li key={m._id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold">{m.name?.[0]?.toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={addMember} className="space-y-2">
                {memberErr && <p className="text-xs text-red-400">{memberErr}</p>}
                <input type="email" placeholder="Add member by email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400" />
                <button disabled={addingMember} className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-sm text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-50">
                  <UserPlus size={14} /> {addingMember ? "Adding..." : "Add Member"}
                </button>
              </form>
            </div>

            {/* Progress */}
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-4 font-semibold text-white">Progress</h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(s => (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-400">{s.replace("-", " ")}</span>
                    <span className={`font-semibold ${statusStyle[s].split(" ")[0]}`}>{byStatus[s].length}</span>
                  </div>
                ))}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all" style={{ width: tasks.length ? `${(doneCount / tasks.length) * 100}%` : "0%" }} />
                </div>
                <p className="text-right text-xs text-slate-500">{tasks.length ? `${Math.round((doneCount / tasks.length) * 100)}% complete` : "No tasks yet"}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}