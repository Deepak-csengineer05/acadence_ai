import React, { useState, useEffect } from 'react';
import { Terminal, ArrowRight, Loader2, Link2, PanelLeftClose, PanelLeftOpen, Copy, Check, BookOpen, Mic, MicOff } from 'lucide-react';

const LOADING_STATUSES = [
  "🔍 Searching Qdrant local vector database...",
  "📚 Retrieving relevant course textbooks & interview papers...",
  "🧠 Loading local LLM weights (qwen3:8b)...",
  "⚡ Synthesizing grounded response text...",
  "✍️ Formulating final academic recommendation..."
];

// Helper: Custom Markdown parser to render HTML elements securely
const parseMarkdownToHtml = (text) => {
  if (!text) return "";
  
  // Escape raw HTML strings
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```javascript ... ```
  html = html.replace(/```([\s\S]+?)```/g, (match, codeContent) => {
    return `<div class="markdown-code-wrapper">
      <button class="code-copy-btn" onclick="window.copyCodeBlock(this)">
        📋 Copy
      </button>
      <pre class="markdown-code-block"><code>${codeContent}</code></pre>
    </div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');

  // Headers: ### Header or standalone **Header**
  html = html.replace(/^\s*\*\*([^*]+)\*\*\s*$/gm, '<h3>$1</h3>');
  html = html.replace(/^### ([\s\S]+?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## ([\s\S]+?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# ([\s\S]+?)$/gm, '<h1>$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

  // Links: [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  // Strip excessive <br /> tags around block elements (headers, list items, code blocks)
  html = html.replace(/(<br\s*\/?>\s*)+(<\/?(h1|h2|h3|li|ul|ol|pre|div)[^>]*>)/gi, '$2');
  html = html.replace(/(<\/(h1|h2|h3|li|ul|ol|pre|div)>)\s*(<br\s*\/?>\s*)+/gi, '$1');
  html = html.replace(/(<br\s*\/?>\s*){2,}/gi, '<br />');

  return html;
};

function AIChat({ 
  chatHistory, 
  chatQuery, 
  setChatQuery, 
  chatLoading, 
  handleChatSend, 
  chatEndRef,
  activeSources = [],
  onCitationClick
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your current browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setChatQuery(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Global window code copy helper
  useEffect(() => {
    window.copyCodeBlock = (buttonEl) => {
      const wrapper = buttonEl.closest('.markdown-code-wrapper');
      const codeEl = wrapper?.querySelector('code');
      if (codeEl) {
        const textToCopy = codeEl.innerText || codeEl.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
          buttonEl.classList.add('copied');
          buttonEl.innerHTML = '✅ Copied!';
          setTimeout(() => {
            buttonEl.classList.remove('copied');
            buttonEl.innerHTML = '📋 Copy';
          }, 2000);
        });
      }
    };
  }, []);

  // Cycle status message when loading
  useEffect(() => {
    if (!chatLoading) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [chatLoading]);

  // Message Bubble Component that separates body text from backend citation links
  const renderMessageContent = (msg, msgIdx) => {
    if (msg.role === 'user') {
      return <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>;
    }

    const content = msg.content;
    if (!content) return null;

    // Robustly strip any "Sources Referenced:" section from textBody
    let textBody = content;
    let citations = [];

    const sourceMarkerRegex = /(?:\*\*|#*\s*)Sources Referenced:?\*?\*?/i;
    const markerMatch = sourceMarkerRegex.exec(content);

    if (markerMatch) {
      const markerIndex = markerMatch.index;
      textBody = content.substring(0, markerIndex).trim();
      const sourcesText = content.substring(markerIndex);

      // Parse link formats: - [index] Title (View [here](#/source/type/id))
      const regex = /-\s*\[(\d+)\]\s*([^(]+)\s*\(View\s*\[here\]\(([^)]+)\)\)/gi;
      let match;
      const seenCitations = new Set();

      while ((match = regex.exec(sourcesText)) !== null) {
        const titleStr = match[2].trim();
        const urlPath = match[3];
        const pathParts = urlPath.split('/');
        const type = pathParts[2] || 'document';
        const id = pathParts[3] || '1';

        const citKey = `${type}_${id}`;
        if (!seenCitations.has(citKey)) {
          seenCitations.add(citKey);
          const matchedSourceObj = activeSources.find(s => String(s.id) === String(id)) || null;
          citations.push({
            index: citations.length + 1,
            title: titleStr,
            url: urlPath,
            type,
            id,
            sourceObj: matchedSourceObj
          });
        }
      }
    }

    const bodyHtml = parseMarkdownToHtml(textBody);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        
        {citations.length > 0 && (
          <div className="citations-container">
            <div className="citations-header">
              <Link2 size={12} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />
              Sources Referenced
            </div>
            <div className="citations-grid">
              {citations.map((c, idx) => (
                <div 
                  key={idx}
                  className="citation-chip-wrapper"
                  onMouseEnter={() => setHoveredCitation({ msgIdx, idx })}
                  onMouseLeave={() => setHoveredCitation(null)}
                >
                  <button 
                    className="citation-chip" 
                    onClick={() => onCitationClick && onCitationClick(c.type, c.id)}
                    style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                  >
                    <span className="citation-badge">{c.index}</span>
                    <span className="citation-title">{c.title}</span>
                  </button>

                  {/* Interactive Citation Popover */}
                  {hoveredCitation?.msgIdx === msgIdx && hoveredCitation?.idx === idx && (
                    <div className={`citation-popover-card ${idx >= Math.max(1, Math.floor(citations.length / 2)) ? 'right-align' : ''}`}>
                      <div className="citation-popover-header">
                        <span style={{ color: 'var(--color-blue)' }}>
                          {c.type === 'document' ? '📄 Notes / Guide' : '🏢 Interview Review'}
                        </span>
                        <span style={{ color: 'var(--color-emerald)' }}>Source #{c.index}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                      </div>
                      {c.sourceObj?.matching_chunk ? (
                        <div className="citation-popover-quote">
                          "{c.sourceObj.matching_chunk.substring(0, 120)}..."
                        </div>
                      ) : (
                        <div className="citation-popover-quote">
                          "Verified academic vector context source retrieved from database."
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>👤 {c.sourceObj?.uploader_name || 'Senior Contributor'}</span>
                        <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Click to View ↗</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chat-split-container ${isContextCollapsed ? 'context-collapsed' : ''}`}>
      {/* Left: Grounding context display */}
      <div className={`panel grounding-panel ${isContextCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isContextCollapsed ? 'center' : 'space-between', marginBottom: isContextCollapsed ? 12 : 14 }}>
          {!isContextCollapsed && (
            <h2 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>📚 Source Grounding</h2>
          )}
          <button
            className="grounding-toggle-btn"
            onClick={() => setIsContextCollapsed(!isContextCollapsed)}
            title={isContextCollapsed ? "Expand Grounding Context" : "Collapse Grounding Context"}
          >
            {isContextCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {isContextCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <div style={{ position: 'relative' }} title={`${activeSources.length} Context Sources`}>
              <BookOpen size={20} style={{ color: 'var(--color-blue)' }} />
              {activeSources.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8, background: 'var(--color-blue)',
                  color: '#fff', fontSize: 9, fontWeight: 800, width: 15, height: 15,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {activeSources.length}
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Senior AI strictly references information found inside the verified knowledge database. 
              Hallucinations are minimized by matching your queries directly to relevant chunks uploaded by students.
            </p>
            
            {chatHistory[chatHistory.length - 1]?.role === "assistant" && chatLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-blue)', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing vector database...</span>
              </div>
            )}

            {activeSources && activeSources.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Retrieved {activeSources.length} verified context sources:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeSources.map((source, idx) => (
                    <div key={idx} className="document-card" style={{ padding: 12, border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-blue)' }}>
                          {source.type === 'document' ? '📄 Notes / Lab Guide' : '🏢 Placement Review'}
                        </span>
                        {source.relevance_score && (
                          <span style={{ fontSize: 11, color: 'var(--color-emerald)', fontWeight: 700 }}>
                            {source.relevance_score}% Match
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: 12.5, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {source.title}
                      </h4>
                      {source.matching_chunk && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, background: 'var(--bg-hover)', padding: 8, borderRadius: 6, fontStyle: 'italic', borderLeft: '2.5px solid var(--color-blue)' }}>
                          "{source.matching_chunk.length > 150 ? source.matching_chunk.substring(0, 150) + '...' : source.matching_chunk}"
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>👤 Contributor: {source.uploader_name || 'System'}</span>
                        {source.course_code && <span>📖 {source.course_code}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Context chunks will load here when you query the AI.</p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                  Querying knowledge vector space...
                </p>
              )
            )}
          </>
        )}
      </div>

      {/* Right: Conversational UI */}
      <div className="chat-panel">
        <div className="chat-messages">
          {chatHistory.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 400 }}>
              <Terminal size={48} style={{ color: 'var(--text-muted)', marginBottom: 15 }} />
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>Chat with Senior AI</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Ask questions about courses, assignments, syllabus structures, or previous placement interviews.
              </p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              {msg.content === "" ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="typing-indicator" style={{ margin: 0 }}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--color-blue)', fontWeight: 600, fontStyle: 'italic', display: 'block', marginTop: 2 }}>
                    {LOADING_STATUSES[statusIndex]}
                  </span>
                </div>
              ) : (
                renderMessageContent(msg, i)
              )}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {isListening && (
          <div className="listening-badge">
            <Mic size={12} style={{ animation: 'pulse 1.2s infinite' }} /> Listening... Speak now
          </div>
        )}
        <form className="chat-input-bar" onSubmit={handleChatSend}>
          <input 
            className="chat-input" 
            type="text" 
            placeholder={isListening ? "Listening... Speak now..." : "Ask Senior AI about courses, interviews..."}
            value={chatQuery} 
            onChange={e => setChatQuery(e.target.value)} 
            disabled={chatLoading} 
          />
          
          <button 
            type="button" 
            className={`btn ${isListening ? 'pulsing-mic' : 'btn-secondary'}`}
            onClick={toggleVoiceInput}
            title={isListening ? "Listening... Click to stop" : "Voice Input (Speech-to-Text)"}
            style={{ width: '44px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 'var(--radius-md)' }}
            disabled={chatLoading}
          >
            {isListening ? <MicOff size={18} style={{ color: '#ffffff' }} /> : <Mic size={18} />}
          </button>

          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={chatLoading}
            style={{ width: '44px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 'var(--radius-md)' }}
          >
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChat;
