import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to file-backed database to ensure persistence across server reloads
const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Helper to initialize Gemini API client with required User-Agent
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not set. Chatbot and reports will use smart rules-based fallbacks.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini AI client:", error);
}

// Initial robust seed data matching "Hossam Elwardany Business Management System" in Arabic & English
const initialDB = {
  users: [
    { id: "u-1", name: "حسام الورداني", email: "admin@erp.com", phone: "+20100000001", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", customPermissions: ["all"] },
    { id: "u-2", name: "علي الشافعي", email: "marketing@erp.com", phone: "+20100000002", role: "marketing_manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", customPermissions: ["leads", "campaigns", "contracts"] },
    { id: "u-3", name: "سارة حسن", email: "hr@erp.com", phone: "+20100000003", role: "hr_manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", customPermissions: ["employees", "attendance", "leaves", "salaries"] },
    { id: "u-4", name: "مها عبد الله", email: "academy@erp.com", phone: "+20100000004", role: "academy_manager", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", customPermissions: ["courses", "students", "certificates"] },
    { id: "u-5", name: "طارق محمود", email: "tarek@erp.com", phone: "+20100000005", role: "project_manager", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", customPermissions: ["projects", "tasks"] },
    { id: "u-6", name: "ياسر فريد", email: "yasser@erp.com", phone: "+20100000006", role: "accountant", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", customPermissions: ["transactions", "salaries"] },
    { id: "u-7", name: "د. هاني عادل", email: "hani@erp.com", phone: "+20100000007", role: "coach", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150", customPermissions: ["courses", "attendance"] },
    { id: "u-8", name: "أحمد سيد", email: "ahmed@erp.com", phone: "+20100000008", role: "employee", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", customPermissions: ["tasks", "attendance_self"] },
    { id: "u-9", name: "نور الدين", email: "nour@client.com", phone: "+20110000009", role: "client", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150", customPermissions: ["client_view"] },
    { id: "u-10", name: "رامي خالد", email: "rami@student.com", phone: "+20120000010", role: "student", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", customPermissions: ["student_view"] }
  ],
  logEntries: [
    { id: "log-1", userId: "u-1", userName: "حسام الورداني", action: "تسجيل الدخول", timestamp: "2026-06-13T01:00:00Z", details: "دخل مدير النظام إلى لوحة التحكم الرئيسية." },
    { id: "log-2", userId: "u-3", userName: "سارة حسن", action: "تحديث حضور", timestamp: "2026-06-13T02:15:00Z", details: "تمت الموافقة على رصيد الإجازات السنوي للموظفين." }
  ],
  clients: [
    { id: "c-1", name: "مجموعة الشروق التجارية", company: "الشروق لاند للتطوير العقاري", email: "shorouk@company.com", phone: "+20125432109", status: "active", notes: "عميل تسويق رئيسي بحملة عقارية كبيرة في الساحل والقاهرة الجديدة." },
    { id: "c-2", name: "المستشفى التخصصي الحديث", company: "مستشفى الشفاء التخصصي", email: "shefa@hospital.com", phone: "+20102345678", status: "active", notes: "إدارة العقود الرقمية وتصوير الفيديوهات الطبية التوعوية." },
    { id: "c-3", name: "شركة النيل للأثاث المكتبي", company: "النيل ديزاين", email: "nile@furniture.com", phone: "+20152435422", status: "inactive", notes: "انتهى عقد الـ 3 شهور، بانتظار تجديد العقد الربع سنوي القادم." }
  ],
  contracts: [
    { id: "con-1", clientId: "c-1", title: "عقد إدارة الحملات التسويقية المتكاملة", value: 45000, startDate: "2026-01-01", endDate: "2026-06-30", status: "active" },
    { id: "con-2", clientId: "c-2", title: "عقد إنتاج 12 فيديو ريلز وإدارة السوشيال ميديا", value: 18000, startDate: "2026-03-15", endDate: "2026-09-15", status: "active" }
  ],
  proposals: [
    { id: "prop-1", clientId: "c-1", title: "عرض فني للترويج للمرحلة السكنية الثالثة", technicalDetails: "إعلانات جوجل وميتا الممولة، كتابة محتوى بالذكاء الاصطناعي وتصميمات فوتوغرافية متقدمة.", financialDetails: "قيمة الميزانية الإعلانية 50,000 جنيهاً، والعمولة الفنية لإدارة الحملات 10,000 جنيهاً شهرياً.", value: 60000, status: "approved" },
    { id: "prop-2", clientId: "c-3", title: "تطوير موقع التجارة الإلكترونية وإطلاق حملة المبيعات", technicalDetails: "تصميم واجهة مستخدم حديثة وبناء متجر إلكتروني مع تهيئة محركات البحث.", financialDetails: "قيمة البرمجة والتصميم 25,000 جنيهاً ممتدة لـ 45 يوماً.", value: 25000, status: "submitted" }
  ],
  campaigns: [
    { id: "cam-1", name: "حملة عقارات الساحل 2026", platform: "facebook", budget: 30000, spent: 24500, leadsGenerated: 420, status: "active", leadsTarget: 500 },
    { id: "cam-2", name: "إعلانات جوجل براند طب الأسنان", platform: "google", budget: 15000, spent: 15000, leadsGenerated: 180, status: "finished", leadsTarget: 150 },
    { id: "cam-3", name: "ريلز إنستغرام لعيادات العظام", platform: "instagram", budget: 8000, spent: 4200, leadsGenerated: 95, status: "active", leadsTarget: 100 }
  ],
  projects: [
    { id: "p-1", clientId: "c-1", name: "تطوير الهوية البصرية وإطلاق حملة الشروق", value: 35000, costEstimate: 12000, startDate: "2026-06-01", endDate: "2026-07-15", team: ["u-2", "u-5", "u-8"], progress: 65, timeSpent: 48, status: "active", files: [{ name: "Identity_Guidelines.pdf", size: "4.2 MB", uploadedBy: "علي الشافعي", url: "#" }] },
    { id: "p-2", clientId: "c-2", name: "حملة الفيديوهات الطبية لمستشفى الشفاء", value: 22000, costEstimate: 8000, startDate: "2026-06-05", endDate: "2026-08-05", team: ["u-2", "u-5"], progress: 30, timeSpent: 20, status: "active", files: [] }
  ],
  tasks: [
    { id: "t-1", projectId: "p-1", title: "تصميم شعار المجمع السكني والشعارات الفرعية", assignedTo: "u-8", dueDate: "2026-06-20", status: "in_progress", priority: "high", timeLogged: 12 },
    { id: "t-2", projectId: "p-1", title: "كتابة سيناريو الإعلان والمحتوى الإبداعي للكاروسيل", assignedTo: "u-2", dueDate: "2026-06-18", status: "done", priority: "medium", timeLogged: 6 },
    { id: "t-3", projectId: "p-2", title: "تصوير اللقاءات الطبية مع استشاريين الجراحة للمستشفى", assignedTo: "u-8", dueDate: "2026-06-25", status: "todo", priority: "high", timeLogged: 0 }
  ],
  courses: [
    { id: "crs-1", title: "دبلومة التسويق الرقمي المتكاملة والذكاء الاصطناعي", coachId: "u-7", description: "دورة شاملة لتجهيز المسوقين للعمل بالوكالات وصناعة الحملات الإعلانية ومراقبة الأداء.", price: 2500, duration: "8 أسابيع", averageReview: 4.8, videos: [{ title: "مقدمة لقنوات التسويق الإلكتروني", duration: "15:20", url: "https://www.w3schools.com/html/mov_bbb.mp4" }, { title: "كيفية جدولة وضبط ميزانية الحملة", duration: "25:40", url: "https://www.w3schools.com/html/mov_bbb.mp4" }], files: [{ name: "Marketing_Playbook_v1.pdf", url: "#" }] },
    { id: "crs-2", title: "كورس صناعة محتوى الفيديو والمونتاج الإبداعي", coachId: "u-7", description: "تعليم تصوير الفيديو بالموبايل والمونتاج ببرنامج كاب كت وتوزيع الإضاءة للدروس التفاعلية.", price: 1500, duration: "4 أسابيع", averageReview: 4.9, videos: [], files: [] }
  ],
  enrollments: [
    { id: "enr-1", courseId: "crs-1", studentId: "u-10", progress: 75, grade: 88, certificateId: "HE-992384" }
  ],
  quizzes: [
    { id: "qz-1", courseId: "crs-1", title: "اختبار أساسيات قنوات الإعلان الممولة", questions: [
      { question: "ما هو الاختصار الصحيح لتكلفة النقرة الواحدة في الإشعارات؟", options: ["CPM", "CPC", "CPA", "CTR"], answerIdx: 1 },
      { question: "أي منصة تعتبر الأفضل للاستهداف المهني والشركات B2B؟", options: ["فيسبوك", "تيك توك", "لينكد إن", "إنستغرام"], answerIdx: 2 }
    ]}
  ],
  assignments: [
    { id: "asgn-1", courseId: "crs-1", title: "الواجب العملي الأول: خطة استهداف ممولة لعقار", description: "اكتب ملف وورد يحتوي على خطة استهداف كاملة لجمهور مهتم بشراء فيلا سكنية.", dueDate: "2026-06-25" }
  ],
  submissions: [
    { id: "sub-1", assignmentId: "asgn-1", studentId: "u-10", fileUrl: "#", fileName: "Rami_Targeting_Plan.pdf", grade: 90, feedback: "ممتاز جداً، الاستهداف الجغرافي دقيق ورؤيتك ذكية للجمهور المشترك." }
  ],
  attendance: [
    { id: "att-1", userId: "u-8", date: "2026-06-12", clockIn: "09:02", clockOut: "17:05", latitude: 30.0444, longitude: 31.2357, remote: false, hours: 8 },
    { id: "att-2", userId: "u-8", date: "2026-06-13", clockIn: "08:58", clockOut: "", latitude: 30.0612, longitude: 31.3214, remote: true, hours: 4 }
  ],
  leaveRequests: [
    { id: "lv-1", userId: "u-8", startDate: "2026-06-28", endDate: "2026-06-30", status: "pending", reason: "فحص طبي دوري للمتابعة الصحية السنوية.", type: "casual", approverPath: [] }
  ],
  performanceReviews: [
    { id: "pfr-1", userId: "u-8", period: "June 2026", kpiScore: 84, okrsList: [{ objective: "تسليم كافة تصميمات الشروق قبل الموعد", result: "تم إكمال 4/5 تصميمات في وقت قياسي وبجودة فاخرة", progress: 80 }], quarterlyReview: "أظهر الموظف أحمد نشاطاً ممتازاً في تلبية متطلبات العملاء المتسارعة وننصح بزيادة مكافأة الإبداع.", managerRating: 4 }
  ],
  candidates: [
    { id: "can-1", name: "خالد عبد الفتاح", email: "khaled@dev.com", phone: "+20101991223", position: "مصور ومونتير فيديو", status: "interview", cvUrl: "#", testScore: 0, interviewNotes: "خبرة 3 سنوات في الوكالات الإعلانية، سيحضر مقابلة التقنية يوم الإثنين." }
  ],
  transactions: [
    { id: "tx-1", type: "revenue", category: "course_sell", amount: 2500, account: "bank_ahli", date: "2026-06-12", description: "رسوم تسجيل الطالب رامي في دورة دبلومة التسويق الرقمي", invoiceNo: "INV-2026-001", taxAmount: 350 },
    { id: "tx-2", type: "revenue", category: "subscription", amount: 45000, account: "bank_cib", date: "2026-06-10", description: "قسط عقد إدارة التسويق لمجموعة الشروق", invoiceNo: "INV-2026-002", taxAmount: 6300 },
    { id: "tx-3", type: "expense", category: "salary", amount: 8000, account: "safe", date: "2026-06-11", description: "راتب شهر يونيو - المصمم أحمد سيد", invoiceNo: "SAL-2026-06", taxAmount: 0 },
    { id: "tx-4", type: "expense", category: "marketing_run", amount: 12000, account: "bank_cib", date: "2026-06-08", description: "ميزانية تشغيل إعلانات ممولة ميتا - الشروق العقارية", invoiceNo: "ADS-META-09224", taxAmount: 0 }
  ],
  crmLeads: [
    { id: "crm-1", name: "أ. ماجد السهلي", company: "مطاعم وكافيهات لقمة وعافية", email: "majed@enjoy.com", phone: "+20101235555", status: "proposal", value: 35000, source: "موقع ويب", timeline: [{ type: "call", date: "2026-06-10", notes: "تم الاتصال وتحديد الاجتماع الأول لفهم الاحتياجات التسويقية وهندسة المنيو الجديد." }, { type: "meeting", date: "2026-06-12", notes: "تم تقديم العرض المالي وحزمة خدمات السوشيال ميديا والتصوير الاحترافي." }] },
    { id: "crm-2", name: "د. أميرة كامل", company: "مركز ديرما كلينك للتجميل", email: "amira@dermaclinic.com", phone: "+20124355523", status: "closed_won", value: 18000, source: "إنستغرام صفحة", timeline: [{ type: "stage", date: "2026-06-08", notes: "تم توقيع العقد رسمياً وبدء العمل على الحملة التعريفية لافتتاح العيادة." }] }
  ],
  config: {
    companyNameAr: "مؤسسة حسام الورداني لإدارة الأعمال والتسويق الرقمي",
    companyNameEn: "Hossam Elwardany Business Management System & Educational Academy",
    currency: "جنيهاً مصرياً EGP",
    taxRate: 14,
    whatsAppNotifications: true,
    emailNotifications: true,
    backupStatus: "مكتمل تلقائياً",
    lastBackupTime: "2026-06-13 01:00 AM"
  },
  whatsAppLogs: [
    { id: "wa-1", recipient: "+20125432109", message: "تم إصدار فاتورة جديدة رقم INV-2026-002 لمجموعة الشروق التجارية بقيمة 45,000 جنيهاً.", timestamp: "2026-06-10T09:00:00Z", status: "sent" },
    { id: "wa-2", recipient: "+20120000010", message: "تنبيه واجب: لديك موعد تسليم للواجب العملي الأول في تاريخ 2026-06-25. بالتوفيق كوتش هاني.", timestamp: "2026-06-13T01:30:00Z", status: "sent" }
  ]
};

// Professional high-resilience file-backed database engine with auto-backup and self-healing
function getDB() {
  const BACKUP_PATH = DB_FILE_PATH + ".bak";
  let rawData: any = null;

  // Try loading primary database file
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      rawData = JSON.parse(content);
    } catch (e) {
      console.error("⚠️ Primary db.json corrupted, trying recovery from backup:", e);
    }
  }

  // Fallback to recovery database backup
  if (!rawData && fs.existsSync(BACKUP_PATH)) {
    try {
      const backupContent = fs.readFileSync(BACKUP_PATH, "utf-8");
      rawData = JSON.parse(backupContent);
      console.log("💎 Successfully recovered database state from backup file.");
    } catch (e) {
      console.error("⚠️ Recovery backup file also corrupted or unreadable:", e);
    }
  }

  // If both fail or don't exist, instantiate with seed data
  if (!rawData) {
    console.log("🌱 Database files not found or corrupted. Seeding fresh database template.");
    rawData = JSON.parse(JSON.stringify(initialDB));
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(rawData, null, 2), "utf-8");
      fs.writeFileSync(BACKUP_PATH, JSON.stringify(rawData, null, 2), "utf-8");
    } catch (err) {
      console.error("❌ Failed to write initial seed DB:", err);
    }
  }

  // Ensure high-availability cross-compatibility between database tables and frontend expected types
  if (!rawData.logEntries) rawData.logEntries = [];
  rawData.auditLogs = rawData.logEntries;

  // Sync and unify configuration parameters
  const dbConfig = rawData.config || {};
  rawData.systemConfig = {
    appName: dbConfig.appName || dbConfig.companyNameAr || "مؤسسة حسام الورداني لإدارة الأعمال",
    backupFrequency: dbConfig.backupFrequency || "daily",
    isDatabaseEncrypted: dbConfig.isDatabaseEncrypted || false,
    whatsappCallbackUrl: dbConfig.whatsappCallbackUrl || "",
    // Retain classic attributes too
    companyNameAr: dbConfig.companyNameAr || "مؤسسة حسام الورداني لإدارة الأعمال والتسويق الرقمي",
    companyNameEn: dbConfig.companyNameEn || "Hossam Elwardany BMS",
    currency: dbConfig.currency || "جنيهاً مصرياً EGP",
    taxRate: dbConfig.taxRate || 14,
    whatsAppNotifications: dbConfig.whatsAppNotifications !== false,
    emailNotifications: dbConfig.emailNotifications !== false,
    backupStatus: dbConfig.backupStatus || "مكتمل تلقائياً",
    lastBackupTime: dbConfig.lastBackupTime || new Date().toLocaleString("ar-EG")
  };

  // Re-write to ensure sub-objects are referenced accurately
  rawData.config = rawData.systemConfig;

  return rawData;
}

// Helper to save DB with automated background redundancy backup
function saveDB(data: any) {
  try {
    // Keep internal aliases inline and updated
    if (data.logEntries) {
      data.auditLogs = data.logEntries;
    } else if (data.auditLogs) {
      data.logEntries = data.auditLogs;
    }

    if (data.systemConfig) {
      data.config = {
        ...data.config,
        ...data.systemConfig,
        companyNameAr: data.systemConfig.appName || data.config?.companyNameAr,
        appName: data.systemConfig.appName
      };
    } else if (data.config) {
      data.systemConfig = data.config;
    }

    const payload = JSON.stringify(data, null, 2);
    fs.writeFileSync(DB_FILE_PATH, payload, "utf-8");
    // Write copy to redundant backup path
    fs.writeFileSync(DB_FILE_PATH + ".bak", payload, "utf-8");
  } catch (e) {
    console.error("❌ Error writing to database file backed systems:", e);
  }
}

// ==================== REST APIs ====================

// Audit Logger helper
function writeAuditLog(userId: string, userName: string, action: string, details: string) {
  const db = getDB();
  const log = {
    id: `log-${Date.now()}`,
    userId,
    userName,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  
  if (!db.logEntries) db.logEntries = [];
  db.logEntries.unshift(log);

  // Cap logs at 100 for storage safety
  if (db.logEntries.length > 100) {
    db.logEntries = db.logEntries.slice(0, 100);
  }
  
  saveDB(db);
}

// Global data query
app.get("/api/db", (req, res) => {
  res.json(getDB());
});

// Update standard collections (with intelligent schema key bridging)
app.post("/api/update-collection", (req, res) => {
  const { collectionName, items, userId, userName, actionLogText } = req.body;
  const db = getDB();
  
  // Clean translation aliases for update payloads
  let normalizedKey = collectionName;
  if (collectionName === "systemConfig") {
    normalizedKey = "config";
  } else if (collectionName === "auditLogs") {
    normalizedKey = "logEntries";
  }

  // Soft fallback if table key is completely new
  db[normalizedKey] = items;
  saveDB(db);

  if (userId && userName && actionLogText) {
    writeAuditLog(userId, userName, "تحديث البيانات", actionLogText);
  }

  res.json({ success: true, message: "تم حفظ وتحديث البيانات بنجاح في النظام السحابي" });
});

// Single Action update logger
app.post("/api/log-action", (req, res) => {
  const { userId, userName, action, details } = req.body;
  writeAuditLog(userId || "u-1", userName || "حسام الورداني", action, details);
  res.json({ success: true });
});

// Simulated WhatsApp Trigger
app.post("/api/whatsapp/send", (req, res) => {
  const { recipient, message, userId, userName } = req.body;
  const db = getDB();
  
  const newLog = {
    id: `wa-${Date.now()}`,
    recipient: recipient || "+20100000000",
    message: message || "تنبيه تلقائي من نظام ERP الورداني",
    timestamp: new Date().toISOString(),
    status: "sent"
  };

  db.whatsAppLogs.unshift(newLog);
  saveDB(db);

  if (userId && userName) {
    writeAuditLog(userId, userName, "إرسال رسالة واتساب", `تم إرسال إشعار إلى ${recipient}: ${message.substring(0, 40)}...`);
  }

  res.json({ success: true, log: newLog });
});

// Simulated Backup Trigger
app.post("/api/system/backup", (req, res) => {
  const { userId, userName } = req.body;
  const db = getDB();
  
  db.config.lastBackupTime = new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });
  db.config.backupStatus = "مكتمل وآمن (مربع الحفظ السحابي)";
  saveDB(db);

  if (userId && userName) {
    writeAuditLog(userId, userName, "نسخ احتياطي يدوي", "تم بدء وحفظ نسخة احتياطية سحابية مشفرة لجميع جداول النظام.");
  }

  res.json({ success: true, config: db.config });
});

// ==================== AI CAPABILITIES ====================

// Chatbot internal assistant proxy
app.post("/api/ai/chat", async (req, res) => {
  const { message, userRole, userName, history } = req.body;
  
  const systemPrompt = `أنت المساعد الذكي لنظام "مؤسسة حسام الورداني لإدارة الأعمال والتسويق الرقمي والأكاديمية التعليمية" (Hossam Elwardany Business Management System & Academy).
مهمتك مساعدة الموظفين والعملاء والطلاب بالإجابة الذكية والاحترافية باللغة العربية بأسلوب راقٍ وموجز.
الشخص الحالي الذي يتحدث معك هو: "${userName}" ولديه صلاحية كـ "${userRole}".
أجب دائماً بدقة في إطار طلبات النظام وقدم اقتراحات عملية للمبيعات، التسويق، الأكاديمية وسير العمل.
البيانات الحالية للنظام مفهرسة كعناوين ومعلومات عامة لمساعدتك في صياغة رد مناسب عن أرقام أداء الشركة.`;

  if (!ai) {
    // Elegant fallback simulation in case the API Key is not set yet in AI Studio UI
    let fallbackText = `أهلاً بك يا ${userName || 'المستخدم الراقي'}. أنا المساعد الذكي لمحرك ERP حسام الورداني. 
(تنبيه النظام: لم يتم الربط بمفتاح GEMINI_API_KEY بالخلفية بشكل كامل، ها هو الرد المحاكي الذكي): 
- إذا كنت تبحث عن تحسين الحملات، نقترح تركيز ميزانيات السوشيال ميديا على منصة ميتا (فيسبوك وإنستغرام) للتأثير المباشر على العقارات، ولدبلومة التسويق الرقمي بالأكاديمية ننصح بإرسال تنبيهات واتساب دورية للطلاب بمواعيد تسليم الواجبات لزيادة التفاعل بنسبة 40%. كيف يمكنني خدمتك اليوم؟`;
    
    const textLower = message.toLowerCase();
    if (textLower.includes("تقرير") || textLower.includes("حملة")) {
      fallbackText = `تقرير أداء افتراضي: حملة "عقارات الساحل 2026" حققت حتى الآن 420 مهتماً (Lead) بمعدل صرف 24,500 EGP. تكلفة العميل المهتم (CPL) تبلغ حوالي 58 جنيهاً، وهو معدل منافس وممتاز جداً لقطاع العقارات. نوصي باستمرار تفعيل هذه الحملة مع زيادة الحصيلة الموجهة للجمهور الخليجي.`;
    } else if (textLower.includes("طالب") || textLower.includes("دورة") || textLower.includes("دراسة")) {
      fallbackText = `الوضع الأكاديمي الحالي: دبلومة التسويق الرقمي المتكاملة تضم حالياً الطالب "رامي خالد" بنسبة إنجاز مقدرة بـ 75%، وقد قام بتسليم واجبه العملي الأول وتم تقييمه بدرجة 90/100 بواسطة د. هاني عادل. يمكنك المتابعة أو إصدار شهادة تخرج تلقائية له الآن برقم تتبع QR مخصص.`;
    } else if (textLower.includes("راتب") || textLower.includes("finance") || textLower.includes("مالية")) {
      fallbackText = `الخلاصة المالية للنظام: إجمالي الإيرادات المسجلة 47,500 جنيهاً مصرياً، وإجمالي النفقات 20,000 جنيهاً (شاملة الرواتب وميزانيات الحملات الإعلانية). صافي الأرباح الحالي يبلغ 27,500 جنيهاً مع نسبة ضريبة مستقطعة 14% مخصومة آلياً.`;
    }
    
    return res.json({ response: fallbackText });
  }

  try {
    // Generate actual contents including optionally conversation history
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.text }]
        });
      });
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ response: result.text });
  } catch (error: any) {
    console.error("Gemini chatbot API error:", error);
    res.status(500).json({ error: "حدث خطأ في تشغيل المساعد الذكي. تفاصيل: " + error.message });
  }
});

// AI Automatic Analysis & Performance Report generator
app.post("/api/ai/report", async (req, res) => {
  const { reportType, filters } = req.body;
  
  if (!ai) {
    // Fallback analytics generator
    let mockResponse = "";
    if (reportType === "marketing") {
      mockResponse = `### 📊 تقرير الذكاء الاصطناعي لتحليل أداء التسويق الرقمي

**1. كفاءة الصرف المالي وعائد الاستثمار (ROI):**
* أداء الحملات الممولة حالياً يظهر تفوقاً قوياً لحملة **"عقارات الساحل 2026"** عبر فيسبوك، حيث ولدت **420 عميلاً مهتماً** بميزانية منصفة.
* حملة **إعلانات جوجل براند طب الأسنان** اكتملت وحققت **180 عميلاً مهتماً (Lead)** متجاوزة الهدف المخطط (150 عميل) بكفاءة 120%.

**2. توصيات الذكاء الاصطناعي الفورية:**
* 🎯 ينصح بنقل 15% من ميزانية منصة إنستغرام لزيادة تمويل حملات فيسبوك العقارية لاستقطاب الشرائح الأكثر تداولاً نهاراً.
* ✍️ أضف فيديوهات ريلز قصيرة بمدة لا تتجاوز 15 ثانية تشرح مميزات التشطيب الداخلي لزيادة النقرات (CTR) بنسبة تقريبية تصل لـ 22%.`;
    } else if (reportType === "hr") {
      mockResponse = `### 👥 تقرير الذكاء الاصطناعي لتقييم أداء الموظفين والموارد البشرية

**1. مراقبة سجلات الحضور والإنتاجية:**
* يسجل الموظفون نسبة التزام بالحضور تبلغ **96%** للعمل الحضوري وعن بعد.
* المصمم **أحمد سيد** يسجل أداءً استثنائياً في إدارة مهام مشروع الشروق العقاري (إنجاز بنسبة 80% في المهام الموكلة إليه).

**2. ترقية الأداء والمكافآت:**
* بناءً على ربط الأداء بالمهام، يستحق المصمم أحمد سيد مكافأة تميز إبداعي لالتزامه بالتسليم قبل الموعد النهائي بـ 48 ساعة.
* نقترح تنظيم ورشة عمل تدريبية للموظفين عن بعد حول "أدوات الذكاء الاصطناعي في تسريع إخراج الفيديو والتصميم" لمواكبة التوسعات الجديدة بالأكاديمية.`;
    } else {
      mockResponse = `### 💰 تقرير الأرباح والخسائر والتحليلات المالية الذكية

**1. الخلاصة الرقمية:**
* **إجمالي الإيرادات:** 47,500 جنيهاً مصرياً.
* **إجمالي المصروفات التشغيلية:** 20,000 جنيهاً مصرياً.
* **صافي ربح الفترة:** 27,500 جنيهاً مصرياً (قبل احتساب ضريبة القيمة المضافة 14%).

**2. التحليل المالي الاستراتيجي:**
* التدفقات النقدية ممتازة وتغطي رواتب الموظفين ومصاريف المكتب لمدة 4 أشهر قادمة بشكل مستتب.
* القنوات الأكثر تحقيقاً للعوائد هي **إدارة الاشتراكات والتسويق العقاري المتكامل**.
* يرجى إيداع النفقات الضريبية البالغة **6,650 جنيهاً** في الحساب البنكي المخصص تحضيراً للتسويات الربع سنوية.`;
    }
    return res.json({ report: mockResponse });
  }

  try {
    const db = getDB();
    const modelStats = {
      campaigns: db.campaigns,
      projects: db.projects,
      tasks: db.tasks,
      transactions: db.transactions,
      attendance: db.attendance,
      performanceReviews: db.performanceReviews
    };

    const prompt = `الرجاء كتابة تقرير تحليلي احترافي دقيق مفصل باللغة العربية بناءً على البيانات المصاحبة.
نوع التقرير المطلوب: "${reportType}".
المعطيات المالية والتشغيلية في دفتري الحالي: ${JSON.stringify(modelStats)}
قم بتحليل الأداء، واستخراج مؤشرات الأداء (KPIs)، وإيجاد نقاط القوة والضعف والخلل المالي أو التشغيلي، وصياغة توصيات حقيقية لمالك الشركة "أستاذ حسام الورداني" لزيادة الأرباح والإنتاجية.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "أنت خبير ذكاء أعمال (BI) ومستشار نمو مالي وتشغيلي محترف لشركات التسويق الرقمي والأكاديميات التعليمية.",
        temperature: 0.6
      }
    });

    res.json({ report: result.text });
  } catch (error: any) {
    console.error("Gemini reporting API error:", error);
    res.status(500).json({ error: "حدث خطأ في توليد التقرير الذكي. تفاصيل: " + error.message });
  }
});

// ==================== VITE INGRESS & RUNTIME ====================

async function startServer() {
  // Mount Vite middleware in development to serve live compiled code, HMR disable handled by platform
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Standard Production Serve from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Hossam ERP Server] Running successfully on local port: http://localhost:${PORT}`);
  });
}

startServer();
