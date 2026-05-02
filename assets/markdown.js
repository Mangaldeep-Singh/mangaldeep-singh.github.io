window.Markdown = (() => {
  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const inline = (value) =>
    escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const frontMatter = (source) => {
    if (!source.startsWith("---")) return [{}, source];
    const end = source.indexOf("\n---", 3);
    if (end === -1) return [{}, source];
    const raw = source.slice(3, end).trim();
    const body = source.slice(end + 4).trim();
    const meta = {};

    raw.split(/\r?\n/).forEach((line) => {
      const index = line.indexOf(":");
      if (index === -1) return;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (value.startsWith("[") && value.endsWith("]")) {
        meta[key] = value
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else {
        meta[key] = value.replace(/^["']|["']$/g, "");
      }
    });

    return [meta, body];
  };

  const render = (source) => {
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    const headings = [];
    let listOpen = false;
    let codeOpen = false;
    let codeBuffer = [];
    let paragraph = [];

    const closeParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const closeList = () => {
      if (!listOpen) return;
      html.push("</ul>");
      listOpen = false;
    };

    const closeCode = () => {
      if (!codeOpen) return;
      html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
      codeOpen = false;
      codeBuffer = [];
    };

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        if (codeOpen) closeCode();
        else {
          closeParagraph();
          closeList();
          codeOpen = true;
        }
        return;
      }

      if (codeOpen) {
        codeBuffer.push(line);
        return;
      }

      if (!line.trim()) {
        closeParagraph();
        closeList();
        return;
      }

      const heading = /^(#{1,3})\s+(.+)$/.exec(line);
      if (heading) {
        closeParagraph();
        closeList();
        const level = heading[1].length;
        const text = heading[2].trim();
        const id = slugify(text);
        headings.push({ level, text, id });
        html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
        return;
      }

      if (/^[-*]\s+/.test(line)) {
        closeParagraph();
        if (!listOpen) {
          html.push("<ul>");
          listOpen = true;
        }
        html.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
        return;
      }

      if (/^>\s?/.test(line)) {
        closeParagraph();
        closeList();
        html.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
        return;
      }

      paragraph.push(line.trim());
    });

    closeCode();
    closeParagraph();
    closeList();

    return { html: html.join("\n"), headings };
  };

  return { frontMatter, render };
})();
