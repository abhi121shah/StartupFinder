/* ==========================================================================
   STARTUP FINDER - SIMPLE & MODULAR JAVASCRIPT ARCHITECTURE
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. MOCK DATA (Easy to edit & add startup projects)
   -------------------------------------------------------------------------- */
let STARTUPS = [
  {
    id: "p1",
    name: "StudyBuddy AI",
    niche: "EdTech",
    stage: "MVP",
    pitch: "An AI-powered matcher that forms verified study groups based on course load and schedule.",
    openRoles: ["ML Engineer", "Backend Dev", "UI Designer"],
    skills: ["Python", "PyTorch", "Node.js"],
    founderEmail: "ritika@university.edu",
    members: [
      { name: "Ritika Sharma", email: "ritika@university.edu", role: "Founder / ML" },
      { name: "Devansh Patel", email: "devansh@university.edu", role: "Backend" }
    ],
    milestones: [
      { title: "Matching algorithm v1 shipped", date: "May 2026", done: true },
      { title: "Piloted with 40 students", date: "Jul 2026", done: true },
      { title: "Calendar synchronization", date: "Sep 2026", done: false }
    ],
    approvedCandidates: ["devansh@university.edu"]
  },
  {
    id: "p2",
    name: "EcoTrack",
    niche: "GreenTech",
    stage: "Prototype",
    pitch: "A carbon tracker app for hostel life — food, transport, and electricity gamified per wing.",
    openRoles: ["Flutter Dev", "Data Scientist"],
    skills: ["Flutter", "Data Viz", "Firebase"],
    founderEmail: "ritika@university.edu",
    members: [{ name: "Ritika Sharma", email: "ritika@university.edu", role: "Founder" }],
    milestones: [
      { title: "Student survey (120 responses)", date: "Apr 2026", done: true },
      { title: "Figma clickable prototype", date: "May 2026", done: true }
    ],
    approvedCandidates: []
  },
  {
    id: "p3",
    name: "GreenCircuit",
    niche: "Hardware",
    stage: "Startup",
    pitch: "Solar-powered phone charging kiosks for campus common areas, run as a paid utility.",
    openRoles: ["Marketing Lead", "Finance Analyst"],
    skills: ["Hardware", "Marketing", "Finance"],
    founderEmail: "arjun@university.edu",
    members: [{ name: "Arjun V.", email: "arjun@university.edu", role: "Founder" }],
    milestones: [
      { title: "3 kiosk units active", date: "Jan 2026", done: true },
      { title: "Break-even unit economics", date: "Jun 2026", done: true }
    ],
    approvedCandidates: []
  }
];

/* Demo Candidate Join Applications */
let APPLICATIONS = [
  {
    id: "app-1",
    projectId: "p1",
    candidateName: "Aditya Verma",
    candidateEmail: "aditya@university.edu",
    targetRole: "ML Engineer",
    message: "I built NLP semantic search models in PyTorch. I would love to build the matching algorithm for StudyBuddy!",
    status: "pending"
  },
  {
    id: "app-2",
    projectId: "p1",
    candidateName: "Sneha Reddy",
    candidateEmail: "sneha@university.edu",
    targetRole: "UI Designer",
    message: "Figma portfolio with 3 shipped student tools. Ready to design the onboarding flow.",
    status: "pending"
  }
];

/* --------------------------------------------------------------------------
   2. APPLICATION STATE
   -------------------------------------------------------------------------- */
let STATE = {
  user: null,             // { name, email }
  role: null,             // "founder" | "candidate"
  view: "login",          // founder: "myprojects"|"create"|"members" | candidate: "browse"|"joined"|"profile"
  activeProjectId: null,  // When viewing details
  selectedFilter: "all",
  searchQuery: "",
  theme: localStorage.getItem("sf_theme") || "dark",
  toast: null
};

/* --------------------------------------------------------------------------
   3. CORE HELPERS
   -------------------------------------------------------------------------- */
function showToast(msg) {
  STATE.toast = msg;
  render();
  setTimeout(() => { STATE.toast = null; render(); }, 2800);
}

function getProject(id) {
  return STARTUPS.find(p => p.id === id);
}

function isFounderOf(projectId) {
  if (!STATE.user) return false;
  const p = getProject(projectId);
  return p && p.founderEmail === STATE.user.email;
}

function hasCandidateAccess(projectId) {
  if (!STATE.user) return false;
  const p = getProject(projectId);
  return p && p.approvedCandidates.includes(STATE.user.email);
}

function canViewFullDetails(projectId) {
  if (STATE.role === "founder") return isFounderOf(projectId);
  if (STATE.role === "candidate") return hasCandidateAccess(projectId);
  return false;
}

/* --------------------------------------------------------------------------
   4. UI TEMPLATES & COMPONENTS
   -------------------------------------------------------------------------- */

/* Theme Toggle Button (Fixed Upper Right) */
function ThemeButton() {
  const isDark = STATE.theme === "dark";
  return `
    <button class="theme-btn" onclick="App.toggleTheme()" title="Toggle Theme">
      ${isDark ? '☀️ <span>Light Mode</span>' : '🌙 <span>Dark Mode</span>'}
    </button>
  `;
}

/* Sidebar Navigation */
function Sidebar() {
  const isFounder = STATE.role === "founder";
  const myProjects = STARTUPS.filter(p => p.founderEmail === STATE.user.email);
  const pendingRequests = APPLICATIONS.filter(a => myProjects.some(p => p.id === a.projectId) && a.status === "pending").length;

  /* Founder Navigation: Strictly 3 Tabs */
  const founderNav = [
    { id: "myprojects", label: "📁 My Projects", badge: null },
    { id: "create", label: "➕ Add New Project", badge: null },
    { id: "members", label: "👥 Manage Members", badge: pendingRequests > 0 ? pendingRequests : null }
  ];

  /* Candidate Navigation: 3 Tabs */
  const candidateNav = [
    { id: "browse", label: "🔍 Browse Projects", badge: null },
    { id: "joined", label: "🚀 Joined Projects", badge: null },
    { id: "profile", label: "👤 Candidate Profile", badge: null }
  ];

  const navItems = isFounder ? founderNav : candidateNav;

  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">S</div>
        <div>
          <div class="brand-title">Startup Finder</div>
          <div class="brand-sub">${isFounder ? "Founder Workspace" : "Candidate Portal"}</div>
        </div>
      </div>

      <nav class="nav-list">
        ${navItems.map(item => `
          <button class="nav-item ${STATE.view === item.id ? 'active' : ''}" onclick="App.go('${item.id}')">
            <span>${item.label}</span>
            ${item.badge ? `<span class="pill pill-amber">${item.badge}</span>` : ''}
          </button>
        `).join("")}
      </nav>

      <div class="sidebar-box sidebar-user">
        <div style="font-size:13px;font-weight:600;margin-bottom:2px;">${STATE.user.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">${STATE.user.email}</div>
        <button class="btn btn-secondary btn-sm btn-block" onclick="App.logout()">🚪 Log out</button>
      </div>
    </aside>
  `;
}

/* Topbar */
function TopBar(title, subtitle) {
  return `
    <div class="topbar">
      <div>
        <h1 style="font-size:24px;font-weight:700;">${title}</h1>
        ${subtitle ? `<p style="font-size:13px;color:var(--text-muted);margin-top:4px;">${subtitle}</p>` : ''}
      </div>
      <div class="sidebar-box" style="padding:6px 14px;border-radius:999px;font-size:12px;">
        👤 Verified <strong>${STATE.role === 'founder' ? 'Founder' : 'Candidate'}</strong>
      </div>
    </div>
  `;
}

/* Project Card Template */
function ProjectCard(p) {
  const isFounder = STATE.role === "founder";
  const fullAccess = canViewFullDetails(p.id);
  const myApp = !isFounder ? APPLICATIONS.find(a => a.projectId === p.id && a.candidateEmail === STATE.user.email) : null;

  /* 1. FOUNDER CARD */
  if (isFounder) {
    const apps = APPLICATIONS.filter(a => a.projectId === p.id && a.status === "pending");
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h3 style="font-size:17px;font-weight:700;">${p.name}</h3>
            <span class="pill pill-amber" style="font-size:9.5px;margin-top:4px;">${p.niche}</span>
          </div>
          <span class="pill pill-green">${p.stage}</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);line-height:1.5;">${p.pitch}</p>
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">OPEN ROLES:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${p.openRoles.map(r => `<span class="tag">${r}</span>`).join("")}
          </div>
        </div>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:var(--glass-border);">
          <span style="font-size:12px;color:var(--text-muted);">${p.members.length} members ${apps.length > 0 ? `<strong style="color:var(--accent-amber);">(${apps.length} pending)</strong>` : ''}</span>
          <button class="btn btn-secondary btn-sm" onclick="App.go('members')">Manage Members →</button>
        </div>
      </div>
    `;
  }

  /* 2. CANDIDATE STEALTH CARD (Access Not Yet Granted) */
  if (!fullAccess) {
    return `
      <div class="card" style="border-style:dashed;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <span class="pill pill-amber">🔒 Stealth Startup</span>
            <div style="font-size:14px;font-weight:600;margin-top:4px;">${p.niche} Project</div>
          </div>
          <span class="pill pill-green">${p.stage}</span>
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);line-height:1.5;">
          Founder privacy active. Confidential pitch and roadmap unlock once access is granted.
        </p>
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">OPEN ROLES NEEDED:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${p.openRoles.map(r => `<span class="tag">${r}</span>`).join("")}
          </div>
        </div>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:var(--glass-border);">
          <span style="font-size:12px;color:var(--text-muted);">${p.members.length} members</span>
          ${!myApp ? `
            <button class="btn btn-primary btn-sm" onclick="App.applyToProject('${p.id}')">Request Access →</button>
          ` : `
            <span class="pill ${myApp.status === 'pending' ? 'pill-amber' : 'pill-red'}">
              ${myApp.status === 'pending' ? '⏳ Access Pending' : '✗ Declined'}
            </span>
          `}
        </div>
      </div>
    `;
  }

  /* 3. CANDIDATE UNLOCKED CARD (Access Granted) */
  return `
    <div class="card" style="border-color:var(--accent-green);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h3 style="font-size:17px;font-weight:700;">${p.name}</h3>
          <span class="pill pill-green" style="font-size:9.5px;margin-top:4px;">🔓 Access Granted</span>
        </div>
        <span class="pill pill-green">${p.stage}</span>
      </div>
      <p style="font-size:13px;color:var(--text-muted);line-height:1.5;">${p.pitch}</p>
      <div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">ACTIVE TEAM:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${p.members.map(m => `<span class="tag">${m.name} (${m.role})</span>`).join("")}
        </div>
      </div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:var(--glass-border);">
        <span style="font-size:12px;color:var(--accent-green);font-weight:600;">✓ Active Member</span>
        <button class="btn btn-primary btn-sm" onclick="App.viewDetails('${p.id}')">Open Roadmap →</button>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   5. VIEWS
   -------------------------------------------------------------------------- */

/* VIEW: LOGIN */
function ViewLogin() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="brand" style="margin-bottom:20px;">
          <div class="brand-logo">S</div>
          <div>
            <div class="brand-title" style="font-size:18px;">Startup Finder</div>
            <div class="brand-sub">Verified University Platform</div>
          </div>
        </div>

        <h2 style="font-size:20px;margin-bottom:6px;">Choose Your Account</h2>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:18px;">Select whether you are uploading a project or applying to join a team.</p>

        <div class="role-grid">
          <div class="role-box ${STATE.role === 'founder' ? 'active' : ''}" onclick="App.selectRole('founder')">
            <div style="font-size:28px;margin-bottom:6px;">🏗️</div>
            <strong>Founder</strong>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Upload &amp; grant access</p>
          </div>
          <div class="role-box ${STATE.role === 'candidate' ? 'active' : ''}" onclick="App.selectRole('candidate')">
            <div style="font-size:28px;margin-bottom:6px;">🔍</div>
            <strong>Candidate</strong>
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Browse &amp; request access</p>
          </div>
        </div>

        <form onsubmit="App.handleLogin(event)">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input class="form-input" id="login-name" type="text" placeholder="e.g. Ritika Sharma" required>
          </div>
          <div class="form-group">
            <label class="form-label">University Email</label>
            <input class="form-input" id="login-email" type="email" placeholder="you@university.edu" required>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Sign In →</button>
        </form>

        <div class="demo-section">
          <div style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;text-align:center;">⚡ Quick 1-Click Demo Logins</div>
          <button class="demo-btn" onclick="App.quickLogin('founder', 'Ritika Sharma', 'ritika@university.edu')">
            <span>🏗️ <strong>Founder:</strong> Ritika Sharma</span>
            <span class="pill pill-green">2 Projects</span>
          </button>
          <button class="demo-btn" onclick="App.quickLogin('candidate', 'Aditya Verma', 'aditya@university.edu')">
            <span>🎓 <strong>Candidate:</strong> Aditya Verma</span>
            <span class="pill pill-amber">ML Dev</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/* VIEW: FOUNDER TAB 1 - MY PROJECTS */
function ViewFounderMyProjects() {
  const myProjects = STARTUPS.filter(p => p.founderEmail === STATE.user.email);
  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("My Uploaded Projects", "Your private workspace. You only see projects you created.")}
        
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-val">${myProjects.length}</div><div class="stat-label">Uploaded Projects</div></div>
          <div class="stat-card"><div class="stat-val" style="color:var(--accent-green);">${myProjects.reduce((acc, p) => acc + p.members.length, 0)}</div><div class="stat-label">Active Members</div></div>
        </div>

        ${myProjects.length > 0 ? `
          <div class="card-grid">${myProjects.map(ProjectCard).join("")}</div>
        ` : `
          <div class="panel" style="text-align:center;padding:40px;">
            <h3>No projects uploaded yet</h3>
            <p style="color:var(--text-muted);font-size:13px;margin:10px 0 16px;">Add your first project to start receiving join requests.</p>
            <button class="btn btn-primary" onclick="App.go('create')">+ Add New Project</button>
          </div>
        `}
      </main>
    </div>
  `;
}

/* VIEW: FOUNDER TAB 2 - ADD NEW PROJECT */
function ViewFounderCreate() {
  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("Add New Project", "Upload and launch your startup project.")}
        
        <div class="panel" style="max-width:620px;">
          <form onsubmit="App.handleCreateProject(event)">
            <div class="form-group">
              <label class="form-label">Project Name</label>
              <input class="form-input" id="p-name" type="text" placeholder="e.g. StudyBuddy AI" required>
            </div>
            <div class="form-group">
              <label class="form-label">Confidential Pitch / Description</label>
              <textarea class="form-textarea" id="p-pitch" placeholder="Describe what your startup does (visible only to approved candidates)..." required></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Niche Domain</label>
                <select class="form-select" id="p-niche">
                  <option>EdTech</option><option>GreenTech</option><option>FinTech</option>
                  <option>HealthTech</option><option>Hardware</option><option>SaaS</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Development Stage</label>
                <select class="form-select" id="p-stage">
                  <option>Idea</option><option>Prototype</option><option>MVP</option><option>Startup</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Open Roles Needed (comma separated)</label>
              <input class="form-input" id="p-roles" type="text" placeholder="e.g. Frontend Dev, ML Engineer, UI Designer" required>
            </div>
            <button class="btn btn-primary btn-block" type="submit">🚀 Upload Project</button>
          </form>
        </div>
      </main>
    </div>
  `;
}

/* VIEW: FOUNDER TAB 3 - MANAGE MEMBERS & ACCESS */
function ViewFounderManageMembers() {
  const myProjects = STARTUPS.filter(p => p.founderEmail === STATE.user.email);
  const myProjectIds = myProjects.map(p => p.id);
  const pendingApps = APPLICATIONS.filter(a => myProjectIds.includes(a.projectId) && a.status === "pending");

  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("Manage Members & Access", "Grant access to candidates so they can view your confidential details.")}

        <div class="panel">
          <h3 style="margin-bottom:14px;">📥 Candidate Access Requests (${pendingApps.length})</h3>
          
          ${pendingApps.length === 0 ? `
            <p style="color:var(--text-muted);font-size:13px;">No pending join requests at this time.</p>
          ` : pendingApps.map(app => {
            const p = getProject(app.projectId);
            return `
              <div class="sidebar-box" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:10px;">
                <div>
                  <div style="font-weight:600;font-size:14px;">${app.candidateName} <span class="pill pill-amber">${app.targetRole}</span></div>
                  <div style="font-size:12px;color:var(--text-muted);margin:3px 0;">Applying to: <strong>${p ? p.name : 'Project'}</strong> · ${app.candidateEmail}</div>
                  <div style="font-size:12.5px;color:var(--text-main);font-style:italic;">"${app.message}"</div>
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-danger btn-sm" onclick="App.rejectAccess('${app.id}')">Decline ✗</button>
                  <button class="btn btn-primary btn-sm" onclick="App.grantAccess('${app.id}')">Grant Access ✓</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="panel">
          <h3 style="margin-bottom:14px;">👥 Active Project Members</h3>
          ${myProjects.map(p => `
            <div style="margin-bottom:16px;">
              <h4 style="font-size:14px;color:var(--accent-green);margin-bottom:8px;">${p.name}</h4>
              ${p.members.map(m => `
                <div class="sidebar-box" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding:10px 14px;">
                  <div>
                    <strong>${m.name}</strong> <span style="font-size:11px;color:var(--text-muted);">(${m.role})</span>
                    <div style="font-size:11px;color:var(--text-muted);">${m.email}</div>
                  </div>
                  ${m.email !== p.founderEmail ? `
                    <button class="btn btn-danger btn-sm" onclick="App.revokeAccess('${p.id}', '${m.email}')">Revoke Access</button>
                  ` : `<span class="pill pill-green">Founder</span>`}
                </div>
              `).join("")}
            </div>
          `).join("")}
        </div>
      </main>
    </div>
  `;
}

/* VIEW: CANDIDATE TAB 1 - BROWSE PROJECTS */
function ViewCandidateBrowse() {
  const query = STATE.searchQuery.toLowerCase();
  const list = STARTUPS.filter(p => !query || p.niche.toLowerCase().includes(query) || p.openRoles.some(r => r.toLowerCase().includes(query)));

  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("Browse Startup Projects", "Discover university startups. Sensitive details unlock once the founder approves your request.")}

        <div class="form-group">
          <input class="form-input" type="text" placeholder="Search by niche or role (e.g. ML, Flutter, EdTech)..." value="${STATE.searchQuery}" oninput="App.handleSearch(this.value)">
        </div>

        <div class="card-grid">${list.map(ProjectCard).join("")}</div>
      </main>
    </div>
  `;
}

/* VIEW: CANDIDATE TAB 2 - JOINED PROJECTS */
function ViewCandidateJoined() {
  const approved = STARTUPS.filter(p => p.approvedCandidates.includes(STATE.user.email));
  const myApps = APPLICATIONS.filter(a => a.candidateEmail === STATE.user.email);

  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("My Joined Projects", "Projects where founders granted you full access.")}

        <h3 style="font-size:16px;margin-bottom:14px;">🚀 Joined Projects (${approved.length})</h3>
        ${approved.length > 0 ? `
          <div class="card-grid" style="margin-bottom:30px;">${approved.map(ProjectCard).join("")}</div>
        ` : `
          <div class="panel" style="text-align:center;padding:30px;margin-bottom:30px;">
            <p style="color:var(--text-muted);font-size:13px;">No approved projects yet. Request access from Browse Projects.</p>
          </div>
        `}

        <h3 style="font-size:16px;margin-bottom:14px;">📋 Application Status</h3>
        <div class="panel">
          ${myApps.length === 0 ? `<p style="color:var(--text-muted);font-size:13px;">No applications submitted yet.</p>` : myApps.map(a => {
            const p = getProject(a.projectId);
            return `
              <div class="sidebar-box" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                  <strong>${p ? p.name : 'Startup'}</strong> - Role: ${a.targetRole}
                </div>
                <span class="pill ${a.status === 'approved' ? 'pill-green' : a.status === 'pending' ? 'pill-amber' : 'pill-red'}">
                  ${a.status === 'approved' ? '✓ Access Granted' : a.status === 'pending' ? '⏳ Pending' : '✗ Declined'}
                </span>
              </div>
            `;
          }).join("")}
        </div>
      </main>
    </div>
  `;
}

/* VIEW: CANDIDATE TAB 3 - PROFILE */
function ViewCandidateProfile() {
  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        ${TopBar("Candidate Profile", "Your student credentials and skills.")}
        
        <div class="panel" style="max-width:540px;">
          <h3 style="margin-bottom:14px;">Student Account</h3>
          <p><strong>Name:</strong> ${STATE.user.name}</p>
          <p style="margin-top:6px;"><strong>Email:</strong> ${STATE.user.email}</p>
          <p style="margin-top:6px;"><strong>Status:</strong> <span class="pill pill-green">Verified Student</span></p>
        </div>
      </main>
    </div>
  `;
}

/* VIEW: PROJECT DETAILS & ROADMAP */
function ViewProjectDetails() {
  const p = getProject(STATE.activeProjectId);
  if (!p) return ViewCandidateBrowse();

  return `
    <div class="app-layout">
      ${Sidebar()}
      <main class="main-content">
        <button class="btn btn-secondary btn-sm" style="margin-bottom:18px;" onclick="App.go('joined')">← Back</button>
        
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <h1 style="font-size:26px;">${p.name}</h1>
              <span class="pill pill-green" style="margin-top:6px;">${p.niche}</span>
            </div>
            <span class="pill pill-green">${p.stage}</span>
          </div>
          <p style="font-size:14px;color:var(--text-muted);margin:16px 0;line-height:1.6;">${p.pitch}</p>

          <h3 style="font-size:16px;margin:20px 0 10px;">Roadmap &amp; Milestones</h3>
          ${p.milestones.map(m => `
            <div class="sidebar-box" style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>${m.done ? '✓' : '⏳'} ${m.title}</span>
              <span style="color:var(--text-muted);font-size:12px;">${m.date}</span>
            </div>
          `).join("")}

          <h3 style="font-size:16px;margin:20px 0 10px;">Team Members</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${p.members.map(m => `<span class="tag">${m.name} — ${m.role}</span>`).join("")}
          </div>
        </div>
      </main>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   6. RENDER CONTROLLER
   -------------------------------------------------------------------------- */
function render() {
  const root = document.getElementById("app");
  document.documentElement.setAttribute("data-theme", STATE.theme);

  let html = "";
  if (!STATE.user || STATE.view === "login") {
    html = ViewLogin();
  } else if (STATE.view === "details") {
    html = ViewProjectDetails();
  } else if (STATE.role === "founder") {
    if (STATE.view === "create") html = ViewFounderCreate();
    else if (STATE.view === "members") html = ViewFounderManageMembers();
    else html = ViewFounderMyProjects();
  } else {
    if (STATE.view === "joined") html = ViewCandidateJoined();
    else if (STATE.view === "profile") html = ViewCandidateProfile();
    else html = ViewCandidateBrowse();
  }

  root.innerHTML = html + ThemeButton() + (STATE.toast ? `<div class="toast-msg">${STATE.toast}</div>` : "");
}

/* --------------------------------------------------------------------------
   7. USER ACTIONS & CONTROLLER
   -------------------------------------------------------------------------- */
const App = {
  selectRole(role) {
    STATE.role = role;
    render();
  },

  handleLogin(e) {
    e.preventDefault();
    if (!STATE.role) {
      showToast("Please choose Founder or Candidate first.");
      return;
    }
    const name = document.getElementById("login-name").value.trim();
    const email = document.getElementById("login-email").value.trim();
    STATE.user = { name, email };
    STATE.view = STATE.role === "founder" ? "myprojects" : "browse";
    render();
    showToast(`Signed in as ${name}`);
  },

  quickLogin(role, name, email) {
    STATE.role = role;
    STATE.user = { name, email };
    STATE.view = role === "founder" ? "myprojects" : "browse";
    render();
    showToast(`Logged in as ${name} (${role})`);
  },

  logout() {
    STATE.user = null;
    STATE.role = null;
    STATE.view = "login";
    render();
  },

  toggleTheme() {
    STATE.theme = STATE.theme === "dark" ? "light" : "dark";
    localStorage.setItem("sf_theme", STATE.theme);
    render();
    showToast(`Switched to ${STATE.theme === 'dark' ? 'Dark' : 'Light'} Mode`);
  },

  go(view) {
    STATE.view = view;
    render();
    window.scrollTo(0, 0);
  },

  viewDetails(id) {
    STATE.activeProjectId = id;
    STATE.view = "details";
    render();
  },

  handleSearch(query) {
    STATE.searchQuery = query;
    render();
  },

  handleCreateProject(e) {
    e.preventDefault();
    const name = document.getElementById("p-name").value.trim();
    const pitch = document.getElementById("p-pitch").value.trim();
    const niche = document.getElementById("p-niche").value;
    const stage = document.getElementById("p-stage").value;
    const roles = document.getElementById("p-roles").value.split(",").map(r => r.trim()).filter(Boolean);

    const newProject = {
      id: "p" + Date.now(),
      name, pitch, niche, stage,
      openRoles: roles.length ? roles : ["Collaborator"],
      skills: [],
      founderEmail: STATE.user.email,
      members: [{ name: STATE.user.name, email: STATE.user.email, role: "Founder" }],
      milestones: [{ title: "Project uploaded", date: "Today", done: true }],
      approvedCandidates: []
    };

    STARTUPS.unshift(newProject);
    STATE.view = "myprojects";
    render();
    showToast(`"${name}" uploaded successfully!`);
  },

  applyToProject(projectId) {
    const role = prompt("Enter the role you are applying for (e.g. ML Engineer, UI Designer):", "Collaborator");
    if (!role) return;

    APPLICATIONS.push({
      id: "app-" + Date.now(),
      projectId,
      candidateName: STATE.user.name,
      candidateEmail: STATE.user.email,
      targetRole: role,
      message: "Excited to contribute my skills to this startup.",
      status: "pending"
    });

    render();
    showToast("Access request submitted to founder!");
  },

  grantAccess(appId) {
    const app = APPLICATIONS.find(a => a.id === appId);
    if (!app) return;

    app.status = "approved";
    const p = getProject(app.projectId);
    if (p) {
      if (!p.approvedCandidates.includes(app.candidateEmail)) {
        p.approvedCandidates.push(app.candidateEmail);
      }
      p.members.push({ name: app.candidateName, email: app.candidateEmail, role: app.targetRole });
    }

    render();
    showToast(`Access granted to ${app.candidateName}! Full details unlocked.`);
  },

  rejectAccess(appId) {
    const app = APPLICATIONS.find(a => a.id === appId);
    if (app) app.status = "rejected";
    render();
    showToast("Application declined.");
  },

  revokeAccess(projectId, email) {
    const p = getProject(projectId);
    if (!p) return;

    p.approvedCandidates = p.approvedCandidates.filter(e => e !== email);
    p.members = p.members.filter(m => m.email !== email);
    render();
    showToast("Access revoked.");
  }
};

/* Start Application */
render();
