import React, { useState } from "react";
import { Project, ERPTask, ClientCorp, User } from "../types";
import { syncERPCollection } from "../utils";
import { Briefcase, FolderPlus, ListTodo, Plus, DollarSign, Calendar, Users, Eye, Trash, Clock, CheckSquare, Pencil, Sparkles } from "lucide-react";

interface ProjectModuleProps {
  currentUser: User;
  projects: Project[];
  tasks: ERPTask[];
  clients: ClientCorp[];
  users: User[];
  onDataChanged: () => void;
}

export default function ProjectModule({
  currentUser,
  projects,
  tasks,
  clients,
  users,
  onDataChanged
}: ProjectModuleProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New Project modal/form states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    clientId: "",
    value: 0,
    costEstimate: 0,
    startDate: "",
    endDate: "",
    team: [] as string[],
    status: "active" as const
  });

  // Track hours modal/form states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium" as const,
    status: "todo" as const
  });

  // Sub-folders and files lists specifically for selected project
  const [designs, setDesigns] = useState<any[]>([
    { id: "ds-1", projId: "p-1", title: "كفر فيسبوك لمستشفى الشفاء التخصصي", url: "#", date: "2026-06-12" },
    { id: "ds-2", projId: "p-1", title: "كاروسيل إنستغرام لعيادات العظام", url: "#", date: "2026-06-13" }
  ]);
  const [content, setContent] = useState<any[]>([
    { id: "ct-1", projId: "p-1", text: "سكريبت حملة الشفاء عيادات العيون: عيونك بأمان معنا مع نخبة من الاستشاريين بالدوم...", author: "علي الشافعي", date: "2026-06-12" }
  ]);
  const [videos, setVideos] = useState<any[]>([
    { id: "vd-1", projId: "p-1", title: "وفصل تصوير فلوق داخل غرف العمليات التخصصية", duration: "1:30", url: "#", date: "2026-06-11" }
  ]);
  const [ads, setAds] = useState<any[]>([
    { id: "ad-1", projId: "p-1", name: "إعلان تفاعلي (Leads) فيسبوك لجمهور القاهرة", budget: 5000, leads: 120, date: "2026-06-10" }
  ]);
  const [reports, setReports] = useState<any[]>([
    { id: "rp-1", projId: "p-1", title: "تقرير العائد الإعلاني الفصلي لعيادات الشفاء ريكورد", file: "PDF REPORT", date: "2026-06-13" }
  ]);
  const [meetings, setMeetings] = useState<any[]>([
    { id: "mt-1", projId: "p-1", title: "جلسة التنسيق الأولى وفريق التصوير لمستشفى الشفاء", time: "11:00 AM", link: "https://meet.google.com/abc-defg-hij", date: "2026-06-14" }
  ]);

  // Form states to add inside expanded project folders
  const [expandedFolder, setExpandedFolder] = useState<"designs" | "content" | "videos" | "ads" | "reports" | "meetings">("designs");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemMeta, setNewItemMeta] = useState("");

  const handleAddFolderItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newItemTitle) return;

    const matchedProjectId = selectedProjectId;

    if (expandedFolder === "designs") {
      setDesigns([...designs, { id: `ds-${Date.now()}`, projId: matchedProjectId, title: newItemTitle, url: "#", date: new Date().toISOString().split("T")[0] }]);
    } else if (expandedFolder === "content") {
      setContent([...content, { id: `ct-${Date.now()}`, projId: matchedProjectId, text: newItemTitle, author: currentUser.name, date: new Date().toISOString().split("T")[0] }]);
    } else if (expandedFolder === "videos") {
      setVideos([...videos, { id: `vd-${Date.now()}`, projId: matchedProjectId, title: newItemTitle, duration: newItemMeta || "1:00", url: "#", date: new Date().toISOString().split("T")[0] }]);
    } else if (expandedFolder === "ads") {
      setAds([...ads, { id: `ad-${Date.now()}`, projId: matchedProjectId, name: newItemTitle, budget: Number(newItemMeta) || 1000, leads: 0, date: new Date().toISOString().split("T")[0] }]);
    } else if (expandedFolder === "reports") {
      setReports([...reports, { id: `rp-${Date.now()}`, projId: matchedProjectId, title: newItemTitle, file: "PDF", date: new Date().toISOString().split("T")[0] }]);
    } else if (expandedFolder === "meetings") {
      setMeetings([...meetings, { id: `mt-${Date.now()}`, projId: matchedProjectId, title: newItemTitle, time: newItemMeta || "12:00 PM", link: "https://meet.google.com", date: new Date().toISOString().split("T")[0] }]);
    }

    setNewItemTitle("");
    setNewItemMeta("");
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.clientId) return;

    const updated = [
      ...projects,
      {
        ...newProject,
        id: `p-${Date.now()}`,
        progress: 0,
        timeSpent: 0,
        files: []
      }
    ];

    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, `إنشاء مشروع جديد "${newProject.name}" وإسناد المهام لفريق العمل.`);
    if (success) {
      setShowProjectModal(false);
      setNewProject({ name: "", clientId: "", value: 0, costEstimate: 0, startDate: "", endDate: "", team: [], status: "active" });
      onDataChanged();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) return;

    const updated = [
      ...tasks,
      {
        ...newTask,
        id: `t-${Date.now()}`,
        timeLogged: 0
      }
    ];

    const success = await syncERPCollection("tasks", updated, currentUser.id, currentUser.name, `إسناد مهمة جديدة: "${newTask.title}" للمطور في لوحة المهام.`);
    if (success) {
      setShowTaskModal(false);
      setNewTask({ title: "", projectId: "", assignedTo: "", dueDate: "", priority: "medium", status: "todo" });
      onDataChanged();
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'review' | 'done') => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    const success = await syncERPCollection("tasks", updated, currentUser.id, currentUser.name, `تحديث حالة المهمة رقم ${taskId} إلى "${status}".`);
    if (success) onDataChanged();
  };

  const updateProjectProgress = async (projId: string, progress: number) => {
    const updated = projects.map(p => p.id === projId ? { ...p, progress } : p);
    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, `تعديل نسبة إنجاز المشروع بمعدل ${progress}%.`);
    if (success) onDataChanged();
  };

  const handleDeleteProject = async (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    const success = await syncERPCollection("projects", updated, currentUser.id, currentUser.name, "حذف كارت مشروع تسويق مؤقتاً.");
    if (success) onDataChanged();
  };

  const developers = users.filter(u => ["employee", "coach", "marketing_manager", "project_manager", "admin"].includes(u.role));

  return (
    <div className="space-y-6 text-right" id="projects-module-main">
      
      {/* Tab controls */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "projects" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>المشروعات ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs font-sans transitionCursor ${
            activeTab === "tasks" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>لوحة المهام المشتركة ({tasks.length})</span>
        </button>
      </div>

      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-sans transition"
            >
              <FolderPlus className="w-4 h-4" />
              <span>إنشاء مشروع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(proj => {
              const cli = clients.find(c => c.id === proj.clientId);
              const profitEstim = proj.value - proj.costEstimate;
              const isSelected = selectedProjectId === proj.id;
              
              return (
                <div key={proj.id} className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                  isSelected ? "border-2 border-indigo-500/80 ring-2 ring-indigo-550/20" : "border-slate-800"
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 text-slate-400 font-sans rounded">
                        {cli ? cli.company : "عميل عابر"}
                      </span>
                      <span className="text-xs text-indigo-400 font-mono font-bold">صافي الربح المتوقع: <span className="text-emerald-400">{profitEstim.toLocaleString()} ج.م</span></span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 font-sans mb-2 text-right">{proj.name}</h3>

                    {/* Progress tracking */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px] font-sans">
                        <span className="text-slate-400">مستوى الإنجاز والعمل</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={proj.progress}
                          onChange={e => updateProjectProgress(proj.id, Number(e.target.value))}
                          className="w-24 sm:w-36 h-1 bg-slate-950 rounded bg-indigo-500/10 cursor-pointer accent-indigo-500"
                        />
                        <span className="text-indigo-400 font-mono font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs border border-slate-800/40 p-2.5 rounded-lg bg-slate-950/45 mb-4 font-sans">
                      <div>
                        <div className="text-[10px] text-slate-500">ميزانية المشروع</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{proj.value.toLocaleString()} j.m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">التكاليف المقدرة</div>
                        <div className="text-xs font-bold text-rose-400 mt-0.5">{proj.costEstimate.toLocaleString()} j.m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-sans">فريق العمل</div>
                        <div className="text-[10px] font-bold text-indigo-400 mt-0.5">{proj.team ? proj.team.length : 0} طاقم</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-805 pt-3 mt-1 flex justify-between items-center text-xs font-sans">
                    <button
                      onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-2.5 py-1.5 rounded flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? "إخفاء التفاصيل المتقدمة" : "فتح تفاصيل المشروع والمجلدات"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-xs text-rose-500/80 hover:text-rose-400"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Project Workspace Details Drawer with folders (designs, content, videos, ads, reports, meetings) */}
          {selectedProjectId && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6.5 shadow-2xl relative overflow-hidden transition-all animate-fade-in text-xs font-sans">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="text-xs bg-indigo-900/30 text-indigo-300 font-bold px-3 py-1 rounded">
                  PROJECT ADVANCED VAULT
                </div>
                <h4 className="font-extrabold text-slate-100 text-sm">
                  مجلدات الأصول الرقمية للمشروع: {projects.find(p => p.id === selectedProjectId)?.name}
                </h4>
              </div>

              {/* Sub-folder selectors grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center pb-4 border-b border-slate-850">
                <button onClick={() => setExpandedFolder("designs")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "designs" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>🎨 تصميمات</button>
                <button onClick={() => setExpandedFolder("content")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "content" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>📝 محتوى</button>
                <button onClick={() => setExpandedFolder("videos")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "videos" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>🎥 فيديوهات</button>
                <button onClick={() => setExpandedFolder("ads")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "ads" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>📣 إعلانات</button>
                <button onClick={() => setExpandedFolder("reports")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "reports" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>📊 تقارير</button>
                <button onClick={() => setExpandedFolder("meetings")} className={`p-2.5 rounded-lg border font-bold ${expandedFolder === "meetings" ? "bg-indigo-600 text-white border-transparent" : "bg-slate-950 text-slate-400 border-slate-850"}`}>📅 اجتماعات</button>
              </div>

              {/* Dynamic folder viewer & editor form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
                
                {/* Form to insert item into current sub folder */}
                <form onSubmit={handleAddFolderItem} className="lg:col-span-4 bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="text-slate-300 font-bold border-b border-slate-850 pb-1">
                    إدراج أصل/ملف جديد بـ ({expandedFolder})
                  </div>
                  
                  <div>
                    <label className="block text-slate-450 mb-1 text-[11px] text-slate-400">العنوان المعنون</label>
                    <input required type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="مثال: التصميم النهائي لواجهة فيسبوك..." className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 text-right" />
                  </div>

                  {["videos", "ads", "meetings"].includes(expandedFolder) && (
                    <div>
                      <label className="block text-slate-450 mb-1 text-[11px] text-slate-400">
                        {expandedFolder === "videos" ? "مدة الفيديو (مثال 1:30)" : expandedFolder === "meetings" ? "ميعاد وموقد الاجتماع" : "الميزانية المخصصة بالإيجاب"}
                      </label>
                      <input type="text" value={newItemMeta} onChange={e => setNewItemMeta(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-slate-200 font-mono text-right" />
                    </div>
                  )}

                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded font-bold">
                    حفظ بمجلد المشروع
                  </button>
                </form>

                {/* Listing of folder assets */}
                <div className="lg:col-span-8 bg-slate-950/60 p-4 rounded-xl border border-slate-850 font-sans text-xs">
                  <div className="font-bold text-slate-300 mb-3 border-b border-slate-850 pb-1 text-right">الأرشيف الحالي المعنون:</div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {expandedFolder === "designs" && designs.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-slate-200">
                        <span className="text-[10px] text-slate-500 font-mono">{it.date}</span>
                        <div className="font-semibold">{it.title}</div>
                      </div>
                    ))}
                    {expandedFolder === "content" && content.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-slate-200">
                        <span className="text-[10px] text-slate-500 font-sans">بواسطة: {it.author}</span>
                        <div className="font-semibold truncate max-w-sm">{it.text}</div>
                      </div>
                    ))}
                    {expandedFolder === "videos" && videos.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-slate-200">
                        <span className="text-[10px] text-indigo-400 font-mono">{it.duration}</span>
                        <div className="font-semibold">{it.title}</div>
                      </div>
                    ))}
                    {expandedFolder === "ads" && ads.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-slate-200">
                        <span className="text-[10px] text-emerald-400 font-mono">{it.budget.toLocaleString()} ج.م ميزانية</span>
                        <div className="font-semibold">{it.name}</div>
                      </div>
                    ))}
                    {expandedFolder === "reports" && reports.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-slate-200">
                        <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">{it.file}</span>
                        <div className="font-semibold">{it.title}</div>
                      </div>
                    ))}
                    {expandedFolder === "meetings" && meetings.map(it => (
                      <div key={it.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-indigo-300">
                        <a href={it.link} target="_blank" rel="noreferrer" className="bg-indigo-900/30 font-bold p-1 rounded font-mono text-[10px]">JOIN MEET</a>
                        <div className="font-semibold text-right">
                          <div className="text-slate-200">{it.title}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{it.date} @ {it.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Task Kanban board inside list */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400 font-sans">اسحب المهام أو حدث حالتها مباشرة لمتابعة مؤشرات الإنجاز للموظفين.</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-sans transition"
            >
              <Plus className="w-4 h-4" />
              <span>إسناد مهمة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
            
            {/* TODO column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-slate-400 font-bold flex justify-between stroke-slate-400 pb-1.5 border-b border-slate-900">
                <span>المستلمة (مستودع)</span>
                <span className="bg-slate-900 text-[10px] text-indigo-300 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "todo").length}</span>
              </div>
              {tasks.filter(t => t.status === "todo").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-indigo-500/40 transition">
                  <h4 className="font-semibold text-slate-205 text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-indigo-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* IN PROGRESS column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-amber-500 font-bold flex justify-between stroke-amber-500 pb-1.5 border-b border-slate-900">
                <span>قيد التنفيذ الإعلاني</span>
                <span className="bg-amber-500/10 text-amber-400 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "in_progress").length}</span>
              </div>
              {tasks.filter(t => t.status === "in_progress").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-amber-500/40 transition">
                  <h4 className="font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-amber-500 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* REVIEW column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-indigo-400 font-bold flex justify-between stroke-indigo-400 pb-1.5 border-b border-slate-900">
                <span>جاهز للمراجعة الفنية</span>
                <span className="bg-indigo-500/10 text-indigo-300 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "review").length}</span>
              </div>
              {tasks.filter(t => t.status === "review").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-indigo-500/40 transition">
                  <h4 className="font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-indigo-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DONE column */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 space-y-3 min-h-[400px]">
              <div className="text-emerald-500 font-bold flex justify-between stroke-emerald-500 pb-1.5 border-b border-slate-900">
                <span>منتهية ومكتملة</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-bold py-0.5 px-1.5 rounded">{tasks.filter(t => t.status === "done").length}</span>
              </div>
              {tasks.filter(t => t.status === "done").map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-emerald-500/40 transition">
                  <h4 className="font-semibold text-slate-200 mb-2">{task.title}</h4>
                  <div className="flex justify-between items-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-slate-950 text-[10px] text-emerald-400 font-sans py-0.5 px-1 rounded focus:outline-none border border-slate-800"
                    >
                      <option value="todo">جديدة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="review">مراجعة</option>
                      <option value="done">مكتملة</option>
                    </select>
                    <span className="text-[10px] text-slate-500">{users.find(u => u.id === task.assignedTo)?.name || "غير محدد"}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* MODALS */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProject} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-105 border-b border-slate-801 pb-2 font-sans">إنشاء وإسناد مشروع جديد</h3>
            
            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">اسم المشروع بالتفصيل</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-205 text-slate-200 text-right" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اختر العميل المستفيد</label>
                <select required value={newProject.clientId} onChange={e => setNewProject({...newProject, clientId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200">
                  <option value="">-- اختر --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <div>
                  <label className="block text-slate-400 mb-1">قيمة تمويل العقد (EGP)</label>
                  <input required type="number" value={newProject.value} onChange={e => setNewProject({...newProject, value: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-802 rounded p-2 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة التشغيلية (EGP)</label>
                  <input required type="number" value={newProject.costEstimate} onChange={e => setNewProject({...newProject, costEstimate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ البدء</label>
                  <input required type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التسليم المتوقع</label>
                  <input required type="date" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-505 text-white font-medium text-xs px-4 py-2 rounded">إنشاء وتأسيس</button>
              <button type="button" onClick={() => setShowProjectModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTask} className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md text-right space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-sans border-b border-slate-800 pb-2">إسناد مهمة جديدة للموظفين</h3>
            
            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">عنوان المهمة</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="تصميم كاروسيل فيس بوك لمشروع الشفاء..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اختر المشروع</label>
                <select required value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 focus:outline-none">
                  <option value="">-- اختر المشروع --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <div>
                  <label className="block text-slate-400 mb-1">الموظف المسؤول</label>
                  <select required value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2">
                    <option value="">-- اختر الموظف --</option>
                    {developers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ التسليم</label>
                  <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-start gap-2 pt-3 border-t border-slate-800">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded">تأكيد الإسناد المجدول</button>
              <button type="button" onClick={() => setShowTaskModal(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium text-xs px-4 py-2 rounded">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
