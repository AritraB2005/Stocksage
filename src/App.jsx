import React, { useState, useRef, useEffect } from "react";

const SECTIONS = [
  "Company Overview",
  "Market Cap & Valuation",
  "Technical Analysis",
  "Entry Price Strategy",
  "Peer Comparison",
  "Sector Analysis",
  "Risk Assessment",
  "Investment Verdict",
];

const SECTOR_OPTIONS = [
  "Technology", "Healthcare", "Finance", "Energy",
  "Consumer Goods", "Industrials", "Materials",
  "Utilities", "Real Estate", "Telecom",
];

const POPULAR_STOCKS = [
  "AAPL", "TSLA", "NVDA", "RELIANCE", "TCS", "INFY"
];

// Terminal accent colors for each section indicating different data modules
const SEC_COLORS = [
  "#2962FF", // Overview (Deep Blue)
  "#00BFA5", // Valuation (Teal)
  "#AA00FF", // Technical (Purple)
  "#00C853", // Entry (Green)
  "#FF6D00", // Peer (Orange)
  "#C51162", // Sector (Pink)
  "#D50000", // Risk (Red)
  "#FFD600"  // Verdict (Yellow)
];

const ICONS = ["⌘", "▤", "◱", "⌖", "⇋", "⊞", "⚠", "★"];

function generatePDFContent(query, queryType, analysisData, timestamp) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0E1015; color: #E0E3EA; }
  .cover { background: #131722; color: white; padding: 40px; border-bottom: 2px solid #2962FF; font-family: 'JetBrains Mono', monospace; }
  .cover-badge { display: inline-block; background: rgba(41,98,255,0.2); border: 1px solid #2962FF; color: #2962FF; font-size: 11px; text-transform: uppercase; padding: 4px 8px; margin-bottom: 16px; }
  .cover h1 { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .cover-meta { margin-top: 16px; display: flex; gap: 30px; font-size: 11px; color: #787B86; }
  .cover-meta strong { display: block; color: #B2B5BE; font-size: 13px; margin-bottom: 2px; }
  .content { padding: 30px; }
  .disclaimer { background: #1E222D; border-left: 3px solid #FFD600; padding: 16px; margin-bottom: 30px; font-size: 12px; color: #A3A6AF; font-family: 'JetBrains Mono', monospace; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .section { background: #131722; border: 1px solid #2A2E39; margin-bottom: 20px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #2A2E39; background: #1E222D; }
  .section-header h2 { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #D1D4DC; text-transform: uppercase; letter-spacing: 0.5px; }
  .section-content { padding: 16px; font-size: 13px; line-height: 1.6; color: #B2B5BE; white-space: pre-wrap; }
  .section-content strong { color: #E0E3EA; font-weight: 600; }
  .footer { background: #0E1015; color: #787B86; padding: 20px 40px; font-size: 10px; font-family: 'JetBrains Mono', monospace; display: flex; justify-content: space-between; border-top: 1px solid #2A2E39; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-badge">TERM-REQ // RESEARCH_EXPORT</div>
  <h1>SYM_${query.toUpperCase()}</h1>
  <div class="cover-meta">
    <div><strong>ASSET CLASS</strong>${queryType === "stock" ? "Equities" : "Macro/Sector"}</div>
    <div><strong>TIMESTAMP</strong>${timestamp}</div>
    <div><strong>SYS</strong>Terminal Alpha</div>
  </div>
</div>
<div class="content">
  <div class="disclaimer">
    SYS_MSG: Generative analysis output. Data is for informational terminal use only. Not investment advice. Proceed with manual verification.
  </div>
  <div class="grid">
    ${SECTIONS.map((title, i) => {
    return `
    <div class="section">
      <div class="section-header" style="border-left: 3px solid ${SEC_COLORS[i]}">
        <span style="color: ${SEC_COLORS[i]}">${ICONS[i]}</span>
        <h2>${title}</h2>
      </div>
      <div class="section-content">${analysisData[title] ? analysisData[title].replace(/</g, "&lt;").replace(/>/g, "&gt;") : "NO_DATA"}</div>
    </div>`;
  }).join("")}
  </div>
</div>
<div class="footer">
  <span>STOCKSAGE TERMINAL © ${new Date().getFullYear()}</span>
  <span>SECURE EXPORT</span>
</div>
</body>
</html>`;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState("stock");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);

  // Time tracking for terminal UI
  const [time, setTime] = useState(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading && analysisData !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading, analysisData]);

  async function fetchSectionAnalysis(section, q, type) {
    const systemPrompt = `You are a strictly professional financial terminal logic unit (like Bloomberg or Koyfin). Provide dense, factual, data-driven analysis for the queried asset. Use real metrics, critical resistance/support levels, percentages, margins, and industry comparisons. Format precisely using brief bullet points. NO conversational filler. NO asterisks (**) or hashes (##) for markdown. Use CAPITALIZED headings if needed. Output pure data-dense professional text.`;

    const prompts = {
      "Company Overview": type === "stock"
        ? `Execute structural overview query for ${q}. Outline: core business segments (w/ approx rev %), 3 main growth drivers, geographic revenue breakdown, notable recent M&A, executive leadership profile, and 2 critical recent developments.`
        : `Execute sector overview query for ${q}. Outline: macroeconomic definition, primary sub-segments, estimated total addressable market (TAM), current lifecycle maturity, and structural macro headwinds/tailwinds.`,

      "Market Cap & Valuation": type === "stock"
        ? `Execute valuation query for ${q}. List: Enterprise Value, Trailing P/E vs Forward P/E vs industry median, EV/EBITDA, Price/Sales, Price/Book, Free Cash Flow yield, and current Dividend Yield. State if trading at historical premium/discount.`
        : `Execute valuation query for ${q} sector. List: aggregate sector P/E vs S&P 500, historical 10-year valuation bands, and identify specific sub-sectors offering relative value discounts.`,

      "Technical Analysis": type === "stock"
        ? `Execute tech-analysis query for ${q} daily/weekly charts. Detail: primary trend classification, 3 precise support/resistance price zones, SMA-50 and SMA-200 interaction status, 14-day RSI (momentum), MACD state, and identified chart pattern formations.`
        : `Execute tech-analysis query for ${q} sector ETF/Index. Detail: relative strength versus SPY, primary trend, critical support/resistance boundaries, and breadth/momentum indicators.`,

      "Entry Price Strategy": type === "stock"
        ? `Compute entry strategy for ${q}. Define: optimal "buy zone" price range, conservative entry tier, aggressive breakout trigger, hard stop-loss invalidation level, and estimated Risk/Reward ratio parameters.`
        : `Compute macro allocation strategy for ${q} sector. Suggest: Overweight/Underweight stance, optimal macro conditions for entry, rotation timing markers, and downside risk threshold variables.`,

      "Peer Comparison": type === "stock"
        ? `Execute peer-comp query for ${q}. Compare against top 3-4 largest pure-play competitors. Compare metrics: Operating Margins, 3-year Revenue CAGR, ROIC, Debt-to-Equity. Identify exact economic moat advantages or relative weaknesses.`
        : `Execute peer-comp query for ${q} sector. Rank top 5 mega-cap constituents. Identify current disruptors taking share from incumbents, market concentration ratio, and M&A consolidation probability.`,

      "Sector Analysis": type === "stock"
        ? `Execute macro environment query for ${q}. Analyze: current business cycle position (early/mid/late), sector YTD relative performance, regulatory threats, supply chain status, and specific macro factors acting as margin constraints.`
        : `Deep dive macro drivers for ${q} sector. Analyze: sensitivity coefficients to interest rates and inflation YoY, commodity input costs, geopolitical exposure matrix, and 5-year secular CAGR forecast.`,

      "Risk Assessment": type === "stock"
        ? `Execute risk matrix query for ${q}. Categorize: 1. Operational/Execution risk, 2. Financial/Liquidity risk, 3. Competitive risk, 4. Macro/Regulatory risk. Assign severity rating (LOW/MED/HIGH) to each and output aggregated risk premium.`
        : `Execute systemic risk query for ${q} sector. Detail: cyclical demand destruction probability, legislative/antitrust overhangs, labor/wage input pressures, and FX risk. Output overall sector risk classification.`,

      "Investment Verdict": type === "stock"
        ? `Synthesize final verdict on ${q}. Output official rating (STRONG BUY / BUY / HOLD / SELL / STRONG SELL). Provide 12-month base-case price target with upside/downside %. List minimum 3 near-term binary catalysts. Conclude with single-sentence thesis.`
        : `Synthesize final verdict on ${q} sector. Output target tactical weight (OVERWEIGHT / MARKET WEIGHT / UNDERWEIGHT). Provide 12-month outlook bias. List top 2 pure-play stock vehicles to capture the thesis. Summarize core rationale.`,
    };

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${prompts[section] || `Query logic for ${section} on ${q}`}` }],
            },
          ],
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_DATA_AVAILABLE";
  }

  async function handleAnalyze() {
    if (!query.trim()) { setError("ERR_INVALID_INPUT: Query parameter missing."); return; }
    setError("");
    setLoading(true);
    setAnalysisData(null);
    setActiveSection(0);
    setProgress(0);

    try {
      const results = {};
      for (let i = 0; i < SECTIONS.length; i++) {
        setActiveSection(i);
        setProgress(((i) / SECTIONS.length) * 100);
        results[SECTIONS[i]] = await fetchSectionAnalysis(SECTIONS[i], query.trim(), queryType);
      }
      setAnalysisData(results);
      setProgress(100);
    } catch (e) {
      setError("ERR_NETWORK_FAILURE: Connection to quant inference engine lost. " + e.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }

  function downloadPDF() {
    if (!analysisData) return;
    setPdfLoading(true);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const html = generatePDFContent(query, queryType, analysisData, timestamp);

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TERM_EXPORT_${query.replace(/\s+/g, "_").toUpperCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setPdfLoading(false), 800);
  }

  return (
    <div className="terminal-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body, html {
          background-color: #0E1015; /* TradingView/Bloomberg dark */
          color: #D1D4DC;
          font-family: 'Inter', -apple-system, sans-serif;
          height: 100vh;
          overflow: hidden; /* App container handles scrolling */
        }

        /* Scrollbar styles to look like a terminal */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0E1015; border-left: 1px solid #2A2E39; }
        ::-webkit-scrollbar-thumb { background: #434651; border-radius: 0; }
        ::-webkit-scrollbar-thumb:hover { background: #50535E; }

        input, select, button { outline: none; font-family: inherit; }

        .terminal-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background-color: #0E1015;
        }

        /* Top Control Bar */
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #131722;
          border-bottom: 1px solid #2A2E39;
          padding: 0 16px;
          height: 50px;
          flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .sys-logo {
          color: #2962FF;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
        }
        
        .sys-logo span { color: #E0E3EA; }

        .sys-clock {
          color: #787B86;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .sys-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #00BFA5;
        }
        .sys-status::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          background: #00BFA5;
          border-radius: 50%;
          box-shadow: 0 0 8px #00BFA5;
        }

        /* Main Workspace layout */
        .workspace {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Left Side Panel (Command/Query form) */
        .cmd-panel {
          width: 320px;
          background: #131722;
          border-right: 1px solid #2A2E39;
          display: flex;
          flex-direction: column;
          padding: 20px;
          flex-shrink: 0;
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .workspace { flex-direction: column; }
          .cmd-panel { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #2A2E39; flex-shrink: 0; }
        }

        .panel-title {
          font-family: 'JetBrains Mono', monospace;
          color: #787B86;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          border-bottom: 1px dashed #2A2E39;
          padding-bottom: 8px;
        }

        /* Form elements */
        .cmd-label {
          font-family: 'JetBrains Mono', monospace;
          color: #B2B5BE;
          font-size: 11px;
          margin-bottom: 8px;
          display: block;
        }

        .cmd-input {
          width: 100%;
          background: #0E1015;
          border: 1px solid #363A45;
          color: #E0E3EA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          padding: 10px 12px;
          margin-bottom: 20px;
          transition: border-color 0.2s;
        }
        .cmd-input:focus { border-color: #2962FF; box-shadow: inset 0 0 0 1px rgba(41,98,255,0.5); }
        .cmd-input::placeholder { color: #434651; }

        .type-toggle {
          display: flex;
          margin-bottom: 24px;
          background: #0E1015;
          border: 1px solid #363A45;
          border-radius: 2px;
          overflow: hidden;
        }
        .type-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #787B86;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 8px 0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .type-btn.active { background: #2962FF; color: #fff; font-weight: 700; }

        .cmd-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
        }
        .cmd-chip {
          background: #1E222D;
          border: 1px solid #2A2E39;
          color: #B2B5BE;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cmd-chip:hover { border-color: #2962FF; color: #E0E3EA; }

        .cmd-execute {
          background: #2962FF;
          color: #fff;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          transition: background 0.2s;
          text-transform: uppercase;
        }
        .cmd-execute:hover:not(:disabled) { background: #1E4BD8; }
        .cmd-execute:disabled { background: #2A2E39; color: #787B86; cursor: not-allowed; }

        .cmd-error {
          background: rgba(213,0,0,0.1);
          border-left: 3px solid #D50000;
          color: #FF5252;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 8px;
          margin-bottom: 16px;
        }

        /* Right Side Panels (Results) */
        .data-panel {
          flex: 1;
          background: #0E1015;
          position: relative;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /* Loading / Progress State */
        .term-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          font-family: 'JetBrains Mono', monospace;
          padding: 40px;
        }
        
        @keyframes pulseMatrix {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .matrix-box {
          border: 1px solid #2962FF;
          padding: 20px;
          width: 100%;
          max-width: 500px;
          background: #131722;
        }
        
        .matrix-header {
          color: #2962FF;
          font-size: 11px;
          margin-bottom: 16px;
          border-bottom: 1px solid #2A2E39;
          padding-bottom: 8px;
          animation: pulseMatrix 1.5s infinite;
        }

        .matrix-bar-bg { width: 100%; height: 6px; background: #1E222D; margin-bottom: 16px; }
        .matrix-bar-fill { height: 100%; background: #2962FF; transition: width 0.3s; }
        
        .matrix-logs { font-size: 11px; color: #B2B5BE; }
        .matrix-log-item { margin-bottom: 4px; display: flex; justify-content: space-between; }
        .log-done { color: #00BFA5; }
        .log-wait { color: #787B86; }
        .log-active { color: #2962FF; animation: pulseMatrix 1s infinite; }

        /* Data Grid */
        .data-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 16px;
        }
        
        @media (max-width: 1200px) {
          .data-grid { grid-template-columns: 1fr; }
        }

        .data-card {
          background: #131722;
          border: 1px solid #2A2E39;
          display: flex;
          flex-direction: column;
        }

        .dc-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #1E222D;
          border-bottom: 1px solid #2A2E39;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #D1D4DC;
          text-transform: uppercase;
        }

        .dc-body {
          padding: 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #B2B5BE;
          white-space: pre-wrap;
          font-family: 'Inter', sans-serif;
          height: 100%;
        }

        .dc-body strong { color: #E0E3EA; font-weight: 600; }
        .dc-body span.ticker { color: #2962FF; font-family: 'JetBrains Mono', monospace; font-size: 12px; }

        /* Welcome screen */
        .welcome-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #434651;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          text-align: center;
        }
        .welcome-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.2; }

        /* Export Button */
        .export-bar {
          padding: 12px 16px;
          background: #131722;
          border-bottom: 1px solid #2A2E39;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .export-info { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2962FF; font-weight: 700; }
        .export-info span { color: #787B86; font-weight: 400; margin-left: 8px; }

        .btn-export {
          background: transparent;
          border: 1px solid #363A45;
          color: #E0E3EA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-export:hover:not(:disabled) { border-color: #2962FF; color: #2962FF; background: rgba(41,98,255,0.05); }
        .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

      `}</style>

      {/* Top Application Bar */}
      <div className="top-bar">
        <div className="sys-logo">
          ▨ STOCKSAGE <span>TERMINAL</span>
        </div>
        <div className="sys-clock">
          <div className="sys-status">SYS_ONLINE</div>
          {time}
        </div>
      </div>

      <div className="workspace">
        {/* Left Side Command Panel */}
        <div className="cmd-panel">
          <div className="panel-title">ASSET_QUERY_MODULE</div>

          <div className="type-toggle">
            <button
              className={`type-btn ${queryType === "stock" ? "active" : ""}`}
              onClick={() => setQueryType("stock")}
            >
              EQUITIES
            </button>
            <button
              className={`type-btn ${queryType === "sector" ? "active" : ""}`}
              onClick={() => setQueryType("sector")}
            >
              MACRO/SECTOR
            </button>
          </div>

          <label className="cmd-label">
            {queryType === "stock" ? "> INPUT TICKER (e.g. AAPL)" : "> INPUT SECTOR"}
          </label>
          <input
            type="text"
            className="cmd-input"
            placeholder="_"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            autoFocus
          />

          <label className="cmd-label">&gt; QUICK_SELECT</label>
          <div className="cmd-chips">
            {queryType === "stock"
              ? POPULAR_STOCKS.map(s => <div key={s} className="cmd-chip" onClick={() => setQuery(s)}>{s}</div>)
              : SECTOR_OPTIONS.map(s => <div key={s} className="cmd-chip" onClick={() => setQuery(s)}>{s}</div>)
            }
          </div>

          <div style={{ flex: 1 }}></div>

          {error && <div className="cmd-error">{error}</div>}

          <button
            className="cmd-execute"
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
          >
            {loading ? "EXECUTING..." : "EXECUTE_QUERY"}
          </button>
        </div>

        {/* Right Side Data Display Panel */}
        <div className="data-panel">

          {/* Default Empty State */}
          {!loading && !analysisData && (
            <div className="welcome-screen">
              <div className="welcome-icon">◱</div>
              <div>STOCKSAGE TERMINAL v2.0</div>
              <div style={{ marginTop: 8 }}>AWAITING INPUT QUERY...</div>
            </div>
          )}

          {/* Loading / Fetching State */}
          {loading && (
            <div className="term-loader">
              <div className="matrix-box">
                <div className="matrix-header">
                  &gt; RUNNING QUANTITATIVE ANALYSIS ON: {query.toUpperCase()}
                </div>
                <div className="matrix-bar-bg">
                  <div className="matrix-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="matrix-logs">
                  {SECTIONS.map((sec, i) => {
                    let status = "0%";
                    let className = "log-wait";
                    if (i < activeSection) { status = "100%"; className = "log-done"; }
                    else if (i === activeSection) { status = "FETCHING..."; className = "log-active"; }

                    return (
                      <div key={sec} className={`matrix-log-item ${className}`}>
                        <span>[{i + 1}/{SECTIONS.length}] REQ_{sec.replace(/\s+/g, '_').toUpperCase()}</span>
                        <span>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Data Display */}
          {!loading && analysisData && (
            <>
              <div className="export-bar">
                <div className="export-info">
                  SYM_{query.toUpperCase()}
                  <span>{queryType === 'stock' ? 'EQUITY ANALYSIS' : 'SECTOR ANALYSIS'}</span>
                </div>
                <button className="btn-export" onClick={downloadPDF} disabled={pdfLoading}>
                  {pdfLoading ? "EXPORTING..." : "[ EXPORT_HTML ]"}
                </button>
              </div>
              <div className="data-grid">
                {SECTIONS.map((section, i) => (
                  <div key={section} className="data-card">
                    <div className="dc-header" style={{ borderLeft: `3px solid ${SEC_COLORS[i]}` }}>
                      <span style={{ color: SEC_COLORS[i] }}>{ICONS[i]}</span>
                      {section}
                    </div>
                    <div className="dc-body">
                      {analysisData[section] || "NO_DATA"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
