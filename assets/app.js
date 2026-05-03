const page = document.body.dataset.page;
const state = {
  owner: {
    name: "Mangaldeep Singh",
    initials: "MS",
    role: "Machine Learning Engineer",
    email: "mangaldeep95.ms@gmail.com"
  },
  posts: [],
  type: "all",
  language: "all"
};

const byId = (id) => document.getElementById(id);

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function firstParagraph(markdown) {
  return markdown
    .split(/\n\s*\n/)
    .find((block) => block.trim() && !block.trim().startsWith("#"))
    ?.replace(/\n/g, " ")
    .trim();
}

function stripTopHeading(markdown) {
  return markdown.replace(/^#\s+.+(\r?\n)+/, "").trim();
}

function sectionMarkdown(markdown, title) {
  const pattern = new RegExp(`(^|\\n)##\\s+${title}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  return pattern.exec(markdown)?.[2]?.trim() || "";
}

async function loadMarkdown(path) {
  const markdown = await fetch(path).then((response) => response.text());
  const [meta, body] = Markdown.frontMatter(markdown);
  return { meta, body };
}

async function loadIndex(path, key) {
  const response = await fetch(path);
  const index = await response.json();
  return Promise.all(
    index[key].map(async (item) => {
      const { meta, body } = await loadMarkdown(item.file);
      return { ...item, ...meta, body };
    })
  );
}

async function loadProfile() {
  const { meta, body } = await loadMarkdown("content/home.md");
  state.owner = { ...state.owner, ...meta };
  applyOwner();
  renderHome(meta, body);
}

function applyOwner() {
  document.title = document.title.replace("Mangaldeep Singh", state.owner.name);
  setText(".brand span:last-child", state.owner.name);
  setText(".brand-mark", state.owner.initials);
  setText("#year", new Date().getFullYear());

  const activeNav = document.querySelector(`[data-nav="${page === "post" ? "blog" : page}"]`);
  if (activeNav) activeNav.setAttribute("aria-current", "page");

  const contactLink = document.querySelector('a[href="mailto:you@example.com"]');
  if (contactLink) contactLink.href = `mailto:${state.owner.email}`;
}

function renderHome(meta, body) {
  const profile = byId("home-profile");
  if (!profile) return;

  const about = Markdown.render(sectionMarkdown(body, "About") || stripTopHeading(body));
  profile.innerHTML = `
    <img class="profile-photo" src="${meta.avatar || "assets/profile.svg"}" alt="${state.owner.name} profile photo" />
    <div class="profile-copy">
      <h1>${state.owner.name}</h1>
      <p class="profile-role">${state.owner.role}</p>
      ${meta.location ? `<p class="profile-location">${meta.location}</p>` : ""}
      <div class="profile-links">
        ${meta.github ? `<a href="${meta.github}">Github</a>` : ""}
        ${meta.linkedin ? `<a href="${meta.linkedin}">LinkedIn</a>` : ""}
        ${meta.email ? `<a href="mailto:${meta.email}">Email</a>` : ""}
      </div>
      <section class="home-block">
        <h2>About</h2>
        ${about.html}
      </section>
    </div>
  `;
}

function renderHomeList(items, mapper, emptyText) {
  return items.length ? `<ul class="plain-list">${items.map(mapper).join("")}</ul>` : `<p>${emptyText}</p>`;
}

async function renderHomeSections() {
  const container = byId("home-sections");
  if (!container) return;

  const [{ body: resumeBody }, projects, posts] = await Promise.all([
    loadMarkdown("content/resume.md"),
    loadIndex("content/projects.json", "projects"),
    loadIndex("content/posts.json", "posts")
  ]);

  const education = Markdown.render(sectionMarkdown(resumeBody, "Education"));
  const skills = Markdown.render(sectionMarkdown(resumeBody, "Skills"));
  const recentPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const featuredProjects = projects.slice(0, 3);

  container.innerHTML = `
    <section class="home-block">
      <h2>Education</h2>
      ${education.html}
    </section>
    <section class="home-block">
      <div class="section-row">
        <h2>Posts</h2>
        <a href="blog.html">More posts</a>
      </div>
      ${renderHomeList(
    recentPosts,
    (post) => `<li><span>${post.date || ""}</span><a href="post.html?post=${encodeURIComponent(post.slug)}">${post.title}</a></li>`,
    "No posts yet."
  )}
    </section>
    <section class="home-block">
      <div class="section-row">
        <h2>Projects</h2>
        <a href="projects.html">More projects</a>
      </div>
      ${renderHomeList(
    featuredProjects,
    (project) => `<li><span>${(project.tags || []).slice(0, 1).join("")}</span><a href="${project.demo || project.code || "projects.html"}">${project.title}</a></li>`,
    "No projects yet."
  )}
    </section>
    <section class="home-block skills-block">
      <h2>Skills</h2>
      ${skills.html}
    </section>
  `;
}

async function renderProjects() {
  const grid = byId("project-grid");
  if (!grid) return;

  const projects = await loadIndex("content/projects.json", "projects");
  grid.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card">
          <p class="eyebrow">${project.type || "project"}</p>
          <h3>${project.title}</h3>
          <p>${project.description || firstParagraph(project.body) || ""}</p>
          <div class="tag-row">${[...(project.stack || []), ...(project.tags || [])]
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join("")}</div>
          <div class="card-actions">
            ${project.demo ? `<a href="${project.demo}">Live demo</a>` : ""}
            ${project.code ? `<a href="${project.code}">Source code</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");
}

async function renderResume() {
  const container = byId("resume-content");
  if (!container) return;

  const { meta, body } = await loadMarkdown("content/resume.md");
  const rendered = Markdown.render(stripTopHeading(body));
  container.innerHTML = `
    <article class="resume-block markdown-page">
      <p class="eyebrow">${meta.type || "resume"} - ${(meta.tags || []).join(", ")}</p>
      ${rendered.html}
    </article>
  `;
}

async function renderHosting() {
  const grid = byId("hosting-grid");
  if (!grid) return;

  const options = await loadIndex("content/hosting.json", "hosting");
  grid.innerHTML = options
    .map(
      (option) => `
        <article class="hosting-card">
          <p class="eyebrow">${(option.tags || []).join(" - ")}</p>
          <h3>${option.title}</h3>
          <p>${option.description || firstParagraph(option.body) || ""}</p>
          <div class="card-actions">${option.url ? `<a href="${option.url}">Docs</a>` : ""}</div>
        </article>
      `
    )
    .join("");
}

async function loadPosts() {
  if (!["blog", "post"].includes(page)) return;

  state.posts = (await loadIndex("content/posts.json", "posts")).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (page === "blog") {
    renderLanguageOptions();
    bindPostFilters();
    renderPostList();
  }

  if (page === "post") renderCurrentPost();
}

function renderLanguageOptions() {
  const select = byId("language-filter");
  if (!select) return;

  const languages = [...new Set(state.posts.map((post) => post.language).filter(Boolean))].sort();
  select.innerHTML = [
    '<option value="all">All languages</option>',
    ...languages.map((language) => `<option value="${language}">${language}</option>`)
  ].join("");
}

function filteredPosts() {
  return state.posts.filter((post) => {
    const typeMatches = state.type === "all" || post.type === state.type;
    const languageMatches = state.language === "all" || post.language === state.language;
    return typeMatches && languageMatches;
  });
}

function renderPostList() {
  const list = byId("post-list");
  if (!list) return;

  const posts = filteredPosts();
  list.innerHTML = posts.length
    ? posts
      .map(
        (post) => `
            <article class="post-card">
              <p class="eyebrow">${post.type} - ${post.language || "General"}</p>
              <h3>${post.title}</h3>
              <p>${post.description || firstParagraph(post.body) || ""}</p>
              <div class="tag-row">${(post.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
              <a class="button" href="post.html?post=${encodeURIComponent(post.slug)}">Read</a>
            </article>
          `
      )
      .join("")
    : "<p>No posts match this filter yet.</p>";
}

function renderCurrentPost() {
  const viewer = byId("post-viewer");
  if (!viewer) return;

  const slug = new URLSearchParams(window.location.search).get("post") || state.posts[0]?.slug;
  const post = state.posts.find((item) => item.slug === slug);

  if (!post) {
    viewer.innerHTML = "<h1>Post not found</h1><p>Return to the blog index and choose another post.</p>";
    return;
  }

  const body = stripTopHeading(post.body);
  const rendered = Markdown.render(body);
  const toc = rendered.headings
    .filter((heading) => heading.level > 1)
    .map((heading) => `<a href="#${heading.id}">${heading.text}</a>`)
    .join("");

  document.title = `${post.title} | ${state.owner.name}`;
  viewer.innerHTML = `
    <p class="eyebrow">${post.type} - ${post.language || "General"} - ${post.date}</p>
    <h1>${post.title}</h1>
    ${toc ? `<nav class="toc" aria-label="Post sections">${toc}</nav>` : ""}
    ${rendered.html}
  `;
}

function bindPostFilters() {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.type = button.dataset.filter;
      renderPostList();
    });
  });

  const languageFilter = byId("language-filter");
  if (languageFilter) {
    languageFilter.addEventListener("change", (event) => {
      state.language = event.target.value;
      renderPostList();
    });
  }
}

async function boot() {
  applyOwner();
  await loadProfile();
  await Promise.all([renderHomeSections(), renderProjects(), renderResume(), renderHosting(), loadPosts()]);
}

boot().catch(() => {
  const target = byId("post-list") || byId("post-viewer") || byId("resume-content") || byId("project-grid");
  if (target) {
    target.innerHTML =
      "<p>Content could not be loaded. Use a local server or GitHub Pages so Markdown files can be fetched.</p>";
  }
});
