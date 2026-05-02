# GitHub Pages ML Portfolio

Static multi-page portfolio for a resume, live ML projects, free demo-hosting links, and Markdown-powered blog/tutorial posts.

## Pages

- `index.html`: home page
- `projects.html`: project portfolio
- `resume.html`: resume
- `blog.html`: blog and tutorial index
- `post.html?post=your-slug`: Markdown post renderer
- `hosting.html`: free ML demo hosting options

## Customize

1. Edit personal details and home intro in `content/home.md`.
2. Edit the resume in `content/resume.md`.
3. Add project Markdown files in `content/projects/` and register them in `content/projects.json`.
4. Add blog/tutorial Markdown files in `content/posts/` and register them in `content/posts.json`.
5. Edit ML demo hosting cards in `content/hosting/` and `content/hosting.json`.
6. Optional: add your resume PDF at `assets/resume.pdf`.

Most rendering is controlled by Markdown front matter. Use tags such as `type`, `tags`, `stack`, `language`, `demo`, and `code` to decide how cards and pages appear.

## Markdown Post Format

```markdown
---
title: "Post Title"
date: "2026-05-02"
type: "tutorial"
language: "Python"
description: "Short summary shown on the blog card."
tags: ["python", "ml"]
---

# Post Title

## Section

Your content here.
```

Use `type: "blog"` for general posts and `type: "tutorial"` for language tutorials. The blog page automatically creates filters, and each post opens on its own `post.html?post=slug` page with a table of contents from Markdown headings.

## Project Markdown Format

```markdown
---
title: "Project Name"
type: "ml-project"
description: "Short project summary."
stack: ["Python", "Streamlit"]
tags: ["classification", "demo"]
demo: "https://your-demo-url"
code: "https://github.com/your-username/project"
---

# Project Name

Longer project notes can go here.
```

## Deploy To GitHub Pages

1. Create a repository named `your-username.github.io`.
2. Push these files to the repository's `main` branch.
3. In GitHub, open **Settings > Pages** and select **Deploy from a branch** if it is not already enabled.
4. Visit `https://your-username.github.io`.

## ML Demo Hosting Options

- Hugging Face Spaces: good for Gradio, Streamlit, Docker, and static AI demos.
- Streamlit Community Cloud: good for Streamlit apps connected to GitHub.
- Gradio on Hugging Face Spaces: good for interactive model demos with a permanent URL.
- GitHub Pages: good for static reports, exported notebooks, project writeups, and this portfolio.
