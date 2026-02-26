import os
import json
import re
import yaml

PROJECTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(CURRENT_DIR, "data.json")
DOCS_FILE = os.path.join(CURRENT_DIR, "specifications.md")
METADATA_FILE = os.path.join(CURRENT_DIR, "metadata.yaml")
AGENT_DIR = os.path.join(os.path.dirname(PROJECTS_DIR), ".agent")

EXCLUDE_DIRS = [
    "node_modules", ".git", ".idea", ".vscode", "__pycache__", "scripts", 
    "venv", ".next", ".gemini", "dist", "build", ".ds_store"
]

def get_project_dirs():
    dirs = []
    for d in os.listdir(PROJECTS_DIR):
        path = os.path.join(PROJECTS_DIR, d)
        if os.path.isdir(path) and d.lower() not in EXCLUDE_DIRS and not d.startswith("."):
            dirs.append(d)
    return sorted(dirs)

def detect_tech_stack(project_path):
    tech = set()
    pro_type = "Other"
    
    # Check package.json
    pkg_path = os.path.join(project_path, "package.json")
    if os.path.exists(pkg_path):
        try:
            with open(pkg_path, 'r') as f:
                data = json.load(f)
                deps = data.get("dependencies", {})
                dev_deps = data.get("devDependencies", {})
                all_deps = {**deps, **dev_deps}
                
                if "next" in all_deps:
                    tech.add("Next.js")
                    pro_type = "Web App"
                if "react" in all_deps:
                    tech.add("React")
                    if pro_type == "Other": pro_type = "Web App"
                if "vite" in all_deps:
                    tech.add("Vite")
                if "tailwindcss" in all_deps:
                    tech.add("Tailwind")
                if "typescript" in all_deps:
                    tech.add("TypeScript")
                if "puppeteer" in all_deps:
                    tech.add("Puppeteer")
                    pro_type = "Automation"
                if "remotion" in all_deps:
                    tech.add("Remotion")
                    pro_type = "Video"
                if "leaflet" in all_deps:
                    tech.add("Leaflet")
                if "supabase-js" in all_deps or "@supabase/supabase-js" in all_deps:
                    tech.add("Supabase")
                
                # Heuristics for type
                if "game" in data.get("name", "").lower():
                    pro_type = "Game"
                    
        except:
            pass

    # Subdirectory checks for nested projects (e.g. Gov_API/dashboard)
    if not tech:
        for root, dirs, files in os.walk(project_path):
            if "package.json" in files:
                # Found a nested package.json, quick check
                try:
                    with open(os.path.join(root, "package.json"), 'r') as f:
                        data = json.load(f)
                        deps = data.get("dependencies", {})
                        if "next" in deps:
                            tech.add("Next.js (Nested)")
                            pro_type = "Web App"
                except:
                    pass
            if len(tech) > 0: break # Stop after finding first relevant nested config

    # Check requirements.txt
    req_path = os.path.join(project_path, "requirements.txt")
    if os.path.exists(req_path):
        try:
            with open(req_path, 'r') as f:
                content = f.read().lower()
                if "google-genai" in content or "gemini" in content:
                    tech.add("Gemini API")
                    pro_type = "AI"
                if "flask" in content or "django" in content or "fastapi" in content:
                    tech.add("Python Web")
                    pro_type = "Web App"
                if "gradio" in content:
                    tech.add("Gradio")
                    pro_type = "AI Tool"
                if "pandas" in content:
                    tech.add("Pandas")
                    if pro_type == "Other": pro_type = "Data"
                
        except:
            pass

    # Check Python scripts directly if no requirements.txt
    if not tech:
        has_py = False
        for f in os.listdir(project_path):
            if f.endswith(".py"):
                has_py = True
                break
        if has_py:
            tech.add("Python")
            if pro_type == "Other": pro_type = "Script"
            
    # Check for Markdown documentation if no other tech found (or just to add Markdown tool)
    if not tech:
        has_md = False
        for f in os.listdir(project_path):
            if f.endswith(".md") and f.lower() != "readme.md":
                has_md = True
                break
        if has_md:
            tech.add("Markdown")
            if pro_type == "Other": pro_type = "Docs"
            
    # Project specific overrides (Manual corrections for known projects)
    name = os.path.basename(project_path)
    if name == "prosper":
        tech.add("Python")
        tech.add("Gemini")
        pro_type = "AI/Auto"
    elif name == "twitter":
        tech.add("Node.js")
        pro_type = "Automation"
    elif name == "AFF_yahoo":
        tech.add("Markdown")
        pro_type = "Docs"
    elif name == "fighters_history":
         pro_type = "Data"
    
    return list(tech), pro_type

import datetime

# ... existing code ...

def get_last_modified_date(project_path):
    """Recursively find the latest mtime in directory, ignoring excluded ones."""
    latest_mtime = 0
    for root, dirs, files in os.walk(project_path):
        # Filter directories in place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
        
        for file in files:
            if file.startswith("."): continue
            try:
                mtime = os.path.getmtime(os.path.join(root, file))
                if mtime > latest_mtime:
                    latest_mtime = mtime
            except:
                pass
    
    if latest_mtime > 0:
        return datetime.datetime.fromtimestamp(latest_mtime).strftime('%Y-%m-%d %H:%M')
    return "Unknown"

    return "No description available."

def get_description(project_path):
    # Priority 1: README.md
    readme_path = os.path.join(project_path, "README.md")
    
    # Priority 2: Any other .md file
    target_files = [readme_path]
    try:
        md_files = [os.path.join(project_path, f) for f in os.listdir(project_path) if f.endswith(".md") and f.lower() != "readme.md"]
        target_files.extend(md_files)
    except: pass

    for file_path in target_files:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                    # Try to find headers or first paragraph
                    for line in lines:
                        line = line.strip()
                        if line:
                            # If header, clean it
                            if line.startswith("#"):
                                return line.lstrip("#").strip()
                            # If text, return it
                            return line[:100] + "..." if len(line) > 100 else line
            except:
                pass
                
    return "No description available."

def load_metadata():
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, 'r') as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            print(f"Warning: Failed to load metadata.yaml: {e}")
    return {}

def parse_frontmatter(file_path):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
        if match:
            return yaml.safe_load(match.group(1))
    except:
        pass
    return {}

def get_agent_resources(metadata):
    resources = {}
    
    def normalize_name(name):
        return name.lower().replace(" ", "").replace("-", "")

    # Skills
    skills_dir = os.path.join(AGENT_DIR, "skills")
    if os.path.exists(skills_dir):
        for d in os.listdir(skills_dir):
            path = os.path.join(skills_dir, d)
            skill_md = os.path.join(path, "SKILL.md")
            if os.path.isdir(path) and os.path.exists(skill_md):
                # Try to load from frontmatter first
                fm_meta = parse_frontmatter(skill_md)
                # Then overlay with centralized metadata.yaml if exists
                central_meta = metadata.get(d, {})
                
                name = central_meta.get("name") or fm_meta.get("name", d).replace("-", " ").title()
                desc = central_meta.get("purpose") or fm_meta.get("description", "No description.")
                
                key = normalize_name(name)
                resources[key] = {
                    "name": name,
                    "dir_name": d,
                    "path": path,
                    "type": "Skill",
                    "description": desc,
                    "status": "Operational",
                    "last_modified": get_last_modified_date(path),
                    "api": [],
                    "tools": ["Agent Skill"],
                    "outputs": [],
                    "depends_on": [],
                    "related_to": [],
                    "service": [],
                    "account": []
                }

    # Workflows
    workflows_dir = os.path.join(AGENT_DIR, "workflows")
    if os.path.exists(workflows_dir):
        for f in os.listdir(workflows_dir):
            if f.endswith(".md"):
                path = os.path.join(workflows_dir, f)
                fm_meta = parse_frontmatter(path)
                central_meta = metadata.get(f, {})
                
                name = central_meta.get("name") or fm_meta.get("name", f.replace(".md", "").replace("-", " ").title())
                desc = central_meta.get("purpose") or fm_meta.get("description", "No description.")
                
                key = normalize_name(name)
                if key in resources:
                    # Merge with existing
                    existing = resources[key]
                    existing["type"] += " / Workflow"
                    if "Agent Workflow" not in existing["tools"]:
                        existing["tools"].append("Agent Workflow")
                    # Keep existing description if it's longer/better, otherwise overwrite?
                    # Usually Skill description is better, so we only overwrite if existing is empty
                    if existing["description"] == "No description." and desc != "No description.":
                         existing["description"] = desc
                else:
                    resources[key] = {
                        "name": name,
                        "dir_name": f,
                        "path": path,
                        "type": "Workflow",
                        "description": desc,
                        "status": "Operational",
                        "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d %H:%M'),
                        "api": [],
                        "tools": ["Agent Workflow"],
                        "outputs": [],
                        "depends_on": [],
                        "related_to": [],
                        "service": [],
                        "account": []
                    }

    # Scripts
    scripts_dir = os.path.join(AGENT_DIR, "scripts")
    if os.path.exists(scripts_dir):
        for f in os.listdir(scripts_dir):
            if f.endswith(".py") or f.endswith(".sh"):
                path = os.path.join(scripts_dir, f)
                central_meta = metadata.get(f, {})
                
                desc = central_meta.get("purpose", "Agent Script")
                if not central_meta.get("purpose") and f.endswith(".py"):
                    try:
                        with open(path, 'r') as df:
                            content = df.read()
                            match = re.search(r'"""(.*?)"""', content, re.DOTALL)
                            if match:
                                desc = match.group(1).strip().split('\n')[0]
                    except: pass
                
                name = central_meta.get("name", f)
                key = normalize_name(name)
                
                tool_type = "Python" if f.endswith(".py") else "Shell"
                
                if key in resources:
                     existing = resources[key]
                     existing["type"] += " / Script"
                     if tool_type not in existing["tools"]:
                         existing["tools"].append(tool_type)
                else:
                    resources[key] = {
                        "name": name,
                        "dir_name": f,
                        "path": path,
                        "type": "Script",
                        "description": desc,
                        "status": "Operational",
                        "last_modified": datetime.datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d %H:%M'),
                        "api": [],
                        "tools": [tool_type],
                        "outputs": [],
                        "depends_on": [],
                        "related_to": [],
                        "service": [],
                        "account": []
                    }

    return list(resources.values())

def generate_data():
    projects = []
    metadata = load_metadata()
    
    for d in get_project_dirs():
        path = os.path.join(PROJECTS_DIR, d)
        tech, p_type = detect_tech_stack(path)
        
        # Default or Auto-detected values
        auto_desc = get_description(path)
        last_modified = get_last_modified_date(path)
        
        # Merge with Metadata
        meta = metadata.get(d, {})
        
        # Helper to ensure list
        def get_list(key):
            val = meta.get(key, [])
            return val if isinstance(val, list) else [val] if val else []

        # Categorization Logic
        api_list = get_list("api")
        output_list = get_list("outputs")
        
        # Tools: Merge detected tech + manual tools, but remove items if they are already in API or Outputs to avoid dupes
        # Also remove 'service' if it exists in old metadata (migration handle)
        manual_tools = get_list("tools")
        combined_tools = list(set(tech + manual_tools))
        
        # Clean up tools list (remove things that are actually APIs or Outputs if duplicates exist)
        final_tools = [t for t in combined_tools if t not in api_list and t not in output_list]

        project_data = {
            "name": meta.get("name", d),
            "dir_name": d, 
            "path": path,
            "type": p_type,
            "description": meta.get("purpose", auto_desc),
            "status": meta.get("status", "Active"),
            "last_modified": last_modified,
            
            # Categories
            "api": api_list,
            "tools": final_tools,
            "outputs": output_list,
            
            # Relations
            "depends_on": get_list("depends_on"),
            "related_to": get_list("related_to"),
            
            # Legacy/Unused for display but kept for data integrity if needed
            "service": get_list("service"), 
            "account": get_list("account")
        }
        
        projects.append(project_data)
    
    # Add Agent Resources
    projects.extend(get_agent_resources(metadata))
    
    # Sort by Last Modified (Descending)
    projects.sort(key=lambda x: x['last_modified'], reverse=True)
    return projects

def update_markdown(projects):
    content = "# Antigravity Projects Specifications\n\n"
    content += f"Last Updated: {os.popen('date').read().strip()}\n\n"
    content += "## 📁 Project List\n\n"
    content += "| Project Name | Status | Last Update | Type | Description |\n"
    content += "| :--- | :--- | :--- | :--- | :--- |\n"
    
    for p in projects:
        content += f"| **{p['name']}** | {p['status']} | {p['last_modified']} | {p['type']} | {p['description']} |\n"
        
    with open(DOCS_FILE, 'w') as f:
        f.write(content)

HTML_FILE = os.path.join(CURRENT_DIR, "index.html")

def generate_html(projects):
    json_data = json.dumps(projects, ensure_ascii=False)

    # Calculate counts for badges
    def count_items(items):
        counts = {}
        for item in items:
            counts[item] = counts.get(item, 0) + 1
        return sorted(counts.items(), key=lambda x: x[1], reverse=True)

    api_counts = count_items(sum([p['api'] for p in projects], []))
    output_counts = count_items(sum([p['outputs'] for p in projects], []))
    tool_counts = count_items(sum([p['tools'] for p in projects], []))

    html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity Projects</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; }}
        [x-cloak] {{ display: none !important; }}
        .glass {{ background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }}
        .scrollbar-hide::-webkit-scrollbar {{ display: none; }}
        .scrollbar-hide {{ -ms-overflow-style: none; scrollbar-width: none; }}
    </style>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    colors: {{
                        slate: {{ 850: '#1e293b' }} // Deeper slate for contrast
                    }},
                    boxShadow: {{
                        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                        'glow': '0 0 20px rgba(99, 102, 241, 0.15)'
                    }}
                }}
            }}
        }}
    </script>
</head>
<body class="bg-[#F8FAFC] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900" x-data="projectDashboard()">

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 glass border-b border-slate-200/60">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-slate-200">A</div>
                <h1 class="text-lg font-bold tracking-tight text-slate-900">Antigravity<span class="text-slate-400 font-normal">.projects</span></h1>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Last Sync: <span class="text-slate-700 font-mono" x-text="lastUpdated"></span>
                </div>
            </div>
        </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
            <div class="flex items-center gap-4 w-full md:w-auto flex-1">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap pl-1">Dashboard</h2>
                <div class="relative w-full max-w-md group">
                    <input type="text" x-model="search" placeholder="Search projects..." 
                        class="pl-9 pr-3 py-1.5 w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-700">
                    <svg class="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            <div class="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide items-center justify-end">
                <button @click="filterType = 'All'" 
                    :class="filterType === 'All' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
                    class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-wider">
                    All
                </button>
                <template x-for="type in uniqueTypes" :key="type">
                    <button @click="filterType = type" 
                        :class="filterType === type ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'"
                        class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-wider"
                        x-text="type">
                    </button>
                </template>
            </div>
        </div>

        <!-- Filter Tags Panel -->
        <div class="bg-white rounded-2xl p-6 shadow-soft ring-1 ring-slate-100 transition-all duration-500" 
             x-show="filterType === 'All' && !search.includes('tag:')">
            
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Filters</h3>
                <span class="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Select tags to refine view</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Group 1: AI -->
                <div class="space-y-3">
                   <div class="flex items-center gap-2 text-indigo-600 mb-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        <span class="text-xs font-bold uppercase tracking-wider">Models</span>
                   </div>
                   <div class="flex flex-wrap gap-2">
                        {"".join([f'<button @click="toggleTag(\'{k}\')" :class="activeTags.includes(\'{k}\') ? \'bg-indigo-600 text-white ring-2 ring-indigo-200 shadow-md\' : \'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 ring-1 ring-slate-100\'" class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"><span class="mr-1.5">{k}</span><span class="opacity-40 text-[9px]">{v}</span></button>' for k, v in api_counts])}
                   </div>
                </div>

                <!-- Group 2: Output -->
                <div class="space-y-3">
                   <div class="flex items-center gap-2 text-emerald-600 mb-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        <span class="text-xs font-bold uppercase tracking-wider">Outputs</span>
                   </div>
                    <div class="flex flex-wrap gap-2">
                        {"".join([f'<button @click="toggleTag(\'{k}\')" :class="activeTags.includes(\'{k}\') ? \'bg-emerald-600 text-white ring-2 ring-emerald-200 shadow-md\' : \'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm hover:text-emerald-600 ring-1 ring-slate-100\'" class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"><span class="mr-1.5">{k}</span><span class="opacity-40 text-[9px]">{v}</span></button>' for k, v in output_counts])}
                   </div>
                </div>

                <!-- Group 3: Tech -->
                <div class="space-y-3">
                   <div class="flex items-center gap-2 text-slate-500 mb-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        <span class="text-xs font-bold uppercase tracking-wider">Tech Stack</span>
                   </div>
                    <div class="flex flex-wrap gap-2">
                        {"".join([f'<button @click="toggleTag(\'{k}\')" :class="activeTags.includes(\'{k}\') ? \'bg-slate-700 text-white ring-2 ring-slate-400 shadow-md\' : \'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-800 ring-1 ring-slate-100\'" class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"><span class="mr-1.5">{k}</span><span class="opacity-40 text-[9px]">{v}</span></button>' for k, v in tool_counts if v > 1])}
                   </div>
                </div>
            </div>
        </div>
        
        <!-- Active Tags -->
        <div x-show="activeTags.length > 0" class="flex items-center gap-3 animate-fade-in" x-cloak>
            <div class="text-xs font-bold text-slate-900">Active Filters:</div>
            <div class="flex flex-wrap gap-2">
                <template x-for="tag in activeTags" :key="tag">
                    <button @click="toggleTag(tag)" class="group inline-flex items-center pl-2.5 pr-1 py-1 rounded-full text-xs font-medium bg-slate-800 text-white shadow-md hover:bg-slate-700 transition">
                        <span x-text="tag"></span>
                        <span class="ml-1.5 p-0.5 rounded-full bg-slate-700 group-hover:bg-slate-600 text-slate-300 group-hover:text-white">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </span>
                    </button>
                </template>
                <button @click="activeTags = []" class="px-2 py-1 text-xs text-slate-500 hover:text-indigo-600 transition font-medium border-b border-transparent hover:border-indigo-600 ml-1">Clear All</button>
            </div>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <template x-for="project in filteredProjects" :key="project.dir_name">
                <div class="bg-white rounded-2xl p-0 ring-1 ring-slate-200/60 shadow-sm hover:shadow-xl hover:ring-indigo-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group h-full">
                    
                    <!-- Card Top -->
                    <div class="p-6 pb-2">
                        <div class="flex justify-between items-start mb-4">
                             <div class="flex gap-2">
                                 <!-- Status -->
                                 <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset"
                                     :class="getStatusColor(project.status)">
                                     <span class="mr-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                     <span x-text="project.status"></span>
                                 </span>
                             </div>
                             <div class="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded" x-text="project.last_modified"></div>
                        </div>

                        <div class="flex justify-between items-start gap-4 mb-2">
                             <h3 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight" x-text="project.name"></h3>
                             <a :href="'file://' + project.path" class="text-slate-300 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-indigo-50 shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                             </a>
                        </div>
                        <p class="text-slate-500 text-sm leading-relaxed mb-4 h-[3rem] line-clamp-2" x-text="project.description || 'No description available.'"></p>
                    </div>

                    <!-- Tech Grid -->
                    <div class="flex-1 px-6 py-4 bg-slate-50/50 border-t border-slate-100/60 space-y-4">
                        
                        <!-- AI & Output Row -->
                        <div class="grid grid-cols-2 gap-4">
                            <!-- AI -->
                            <div x-show="project.api && project.api.length > 0">
                                <h4 class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Models</h4>
                                <div class="flex flex-col gap-1.5">
                                    <template x-for="item in project.api" :key="item">
                                        <span class="text-xs font-medium text-slate-700 truncate border-l-2 border-indigo-400 pl-2" x-text="item"></span>
                                    </template>
                                </div>
                            </div>

                            <!-- Output -->
                            <div x-show="project.outputs && project.outputs.length > 0">
                                <h4 class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Target</h4>
                                <div class="flex flex-col gap-1.5">
                                    <template x-for="item in project.outputs" :key="item">
                                        <span class="text-xs font-medium text-slate-700 truncate border-l-2 border-emerald-400 pl-2" x-text="item"></span>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Tools Row -->
                         <div x-show="project.tools && project.tools.length > 0">
                             <div class="flex flex-wrap gap-1.5 pt-1">
                                <template x-for="item in project.tools" :key="item">
                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-500 ring-1 ring-slate-200">
                                        <span x-text="item"></span>
                                    </span>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Relations Footer -->
                    <div class="px-6 py-3 border-t border-slate-100 bg-white min-h-[46px] flex items-center">
                         <div x-show="(project.depends_on && project.depends_on.length > 0) || (project.related_to && project.related_to.length > 0)" class="flex flex-wrap gap-2 w-full">
                             <template x-for="dep in project.depends_on" :key="dep">
                                <div class="flex items-center text-[9px] font-bold text-amber-600 bg-amber-50/50 px-2 py-1 rounded border border-amber-100/50 hover:bg-amber-100 transition cursor-help" title="Dependency">
                                    <span class="mr-1 opacity-70">←</span>
                                    <span x-text="dep"></span>
                                </div>
                            </template>
                             <template x-for="rel in project.related_to" :key="rel">
                                <div class="flex items-center text-[9px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 transition cursor-help" title="Related Project">
                                    <span class="mr-1 opacity-70">↔</span>
                                    <span x-text="rel"></span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>

    </main>

    <script>
        document.addEventListener('alpine:init', () => {{
            Alpine.data('projectDashboard', () => ({{
                projects: {json_data},
                search: '',
                filterType: 'All',
                activeTags: [],
                lastUpdated: new Date().toLocaleTimeString('ja-JP', {{ hour: '2-digit', minute: '2-digit' }}),

                toggleTag(tag) {{
                    if (this.activeTags.includes(tag)) {{
                        this.activeTags = this.activeTags.filter(t => t !== tag);
                    }} else {{
                        this.activeTags.push(tag);
                    }}
                }},

                get filteredProjects() {{
                    return this.projects.filter(p => {{
                        const matchesSearch = p.name.toLowerCase().includes(this.search.toLowerCase()) || 
                                              (p.description && p.description.toLowerCase().includes(this.search.toLowerCase())) ||
                                              p.tech.some(t => t.toLowerCase().includes(this.search.toLowerCase()));
                        
                        const matchesType = this.filterType === 'All' || p.type === this.filterType;
                        
                        const matchesTags = this.activeTags.length === 0 || this.activeTags.every(tag => {{
                            const allProjectTags = [...(p.api||[]), ...(p.tools||[]), ...(p.outputs||[])];
                            return allProjectTags.includes(tag);
                        }});

                        return matchesSearch && matchesType && matchesTags;
                    }});
                }},

                get uniqueTypes() {{
                    const types = new Set(this.projects.map(p => p.type).filter(Boolean));
                    return Array.from(types).sort();
                }},

                getStatusColor(status) {{
                     const map = {{
                        'Active': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
                        'Development': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
                        'Prototype': 'bg-amber-50 text-amber-700 ring-amber-600/20',
                        'Research': 'bg-violet-50 text-violet-700 ring-violet-600/20',
                        'Operational': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
                        'Completed': 'bg-slate-100 text-slate-600 ring-slate-500/20',
                        'Archived': 'bg-slate-50 text-slate-400 ring-slate-200 line-through opacity-70'
                     }};
                     return map[status] || 'bg-slate-50 text-slate-600 ring-slate-200';
                }}
            }}));
        }});
    </script>
</body>
</html>"""
    
    with open(HTML_FILE, 'w') as f:
        f.write(html_content)

def main():
    print("Updates project specifications...")
    projects = generate_data()
    
    with open(DATA_FILE, 'w') as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)
        
    update_markdown(projects)
    generate_html(projects)
    print(f"✅ Updated {DATA_FILE}")
    print(f"✅ Updated {DOCS_FILE}")
    print(f"✅ Updated {HTML_FILE}")

if __name__ == "__main__":
    main()
