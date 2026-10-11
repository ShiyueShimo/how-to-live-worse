type GuideMarkdownProps = { markdown: string; lang?: string };

function visibleLines(markdown: string): string[] {
  return markdown
    .replace(/<!--\s*[\s\S]*?-->/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function GuideMarkdown({ markdown, lang = 'en' }: GuideMarkdownProps) {
  const lines = visibleLines(markdown);

  return (
    <div className="guide-markdown" lang={lang}>
      {lines.map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index}>{line.slice(4)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={index}>{line.slice(2)}</h2>;
        }
        if (line.startsWith('- ')) {
          const field = /^-\s*([^:：]+)[:：]\s*(.*)$/.exec(line);
          return (
            <p className="guide-markdown-field" key={index}>
              {field ? <strong>{field[1]}: </strong> : null}
              {field?.[2] ?? line.slice(2)}
            </p>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}
