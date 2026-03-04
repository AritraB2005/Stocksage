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
  const [liveData, setLiveData] = useState(null);
  const [alphaScore, setAlphaScore] = useState(null);
  const [sentiment, setSentiment] = useState(null);

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

  // --- RAG: Fetch live financial data from Yahoo Finance ---
  async function fetchLiveStockData(ticker) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1mo`;
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxy);
      if (!res.ok) return null;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      if (!meta) return null;
      const price = meta.regularMarketPrice || 0;
      const prevClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = price - prevClose;
      const changePct = prevClose ? ((change / prevClose) * 100).toFixed(2) : 0;
      const high52 = meta.fiftyTwoWeekHigh || 0;
      const low52 = meta.fiftyTwoWeekLow || 0;
      const validCloses = closes.filter(c => c !== null);
      const vol = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.volume;
      const lastVol = vol ? vol[vol.length - 1] : 0;
      return {
        symbol: meta.symbol,
        price: price.toFixed(2),
        change: change.toFixed(2),
        changePct,
        high52: high52.toFixed(2),
        low52: low52.toFixed(2),
        currency: meta.currency || "USD",
        exchange: meta.exchangeName || "N/A",
        volume: lastVol,
        marketState: meta.marketState || "REGULAR",
        closes: validCloses.slice(-20),
        sma20: validCloses.length >= 20 ? (validCloses.slice(-20).reduce((a, b) => a + b, 0) / 20).toFixed(2) : null,
        sma5: validCloses.length >= 5 ? (validCloses.slice(-5).reduce((a, b) => a + b, 0) / 5).toFixed(2) : null,
      };
    } catch (e) {
      console.warn("Live data fetch failed:", e);
      return null;
    }
  }

  async function callGroq(prompt, retries = 3) {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_KEY_HERE") {
      return "WARNING: Please add your Groq API key in .env file. Get one free at console.groq.com";
    }
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are a senior equity research analyst. Output CONCISE, data-rich analysis using ONLY these formats:

For key numbers use: METRIC: Label | Value | Change
For comparisons use: TABLE: Header1 | Header2 | Header3 \\n Row1Col1 | Row1Col2 | Row1Col3
For important points use: BULLET: text here
For signals use: SIGNAL: BULLISH/BEARISH/NEUTRAL | Reason text
For short labels use: TAG: Label

Keep responses SHORT and STRUCTURED. No long paragraphs. Maximum 8-10 lines per section. Focus only on the most critical, actionable data points. Use real numbers and specific price levels.`
              },
              { role: "user", content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.6
          })
        });
        if (response.status === 429) {
          // Rate limited — wait and retry
          const wait = (attempt + 1) * 5000;
          console.warn(`Rate limited. Waiting ${wait / 1000}s before retry ${attempt + 1}/${retries}...`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        if (!response.ok) {
          const err = await response.json();
          return `API Error: ${err.error?.message || "Status " + response.status}`;
        }
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) return "No response from Groq. Please try again.";
        return text.replace(/#{1,3}\s/g, "").trim();
      } catch (err) {
        if (attempt === retries - 1) return `Network error: ${err.message}. Check your internet connection.`;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    return "Rate limit reached. Please wait a minute and try again.";
  }

  // Parse structured AI output into rich JSX elements
  function parseStructuredOutput(text) {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    const elements = [];
    let tableBuffer = null;

    function flushTable() {
      if (tableBuffer && tableBuffer.rows.length > 0) {
        elements.push(
          <div key={`tbl-${elements.length}`} className="rich-table-wrap">
            <table className="rich-table">
              <thead><tr>{tableBuffer.headers.map((h, i) => <th key={i}>{h.trim()}</th>)}</tr></thead>
              <tbody>{tableBuffer.rows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c.trim()}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        tableBuffer = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('METRIC:')) {
        flushTable();
        const parts = line.slice(7).split('|').map(p => p.trim());
        const [label, value, change] = parts;
        const isUp = change && (change.startsWith('+') || change.includes('up') || change.includes('▲'));
        const isDown = change && (change.startsWith('-') || change.includes('down') || change.includes('▼'));
        elements.push(
          <div key={`m-${i}`} className="rich-metric">
            <div className="rm-label">{label || ''}</div>
            <div className="rm-value">{value || ''}</div>
            {change && <div className={`rm-change ${isUp ? 'up' : isDown ? 'down' : ''}`}>{change}</div>}
          </div>
        );
      } else if (line.startsWith('TABLE:')) {
        flushTable();
        const headers = line.slice(6).split('|').map(p => p.trim());
        tableBuffer = { headers, rows: [] };
      } else if (tableBuffer && line.includes('|')) {
        tableBuffer.rows.push(line.split('|').map(p => p.trim()));
      } else if (line.startsWith('BULLET:') || line.startsWith('- ') || line.startsWith('• ')) {
        flushTable();
        const text = line.replace(/^(BULLET:|[•-]\s*)/, '').trim();
        elements.push(
          <div key={`b-${i}`} className="rich-bullet"><span className="rb-dot">▸</span>{text}</div>
        );
      } else if (line.startsWith('SIGNAL:')) {
        flushTable();
        const parts = line.slice(7).split('|').map(p => p.trim());
        const [signal, reason] = parts;
        const cls = signal?.includes('BULL') ? 'sig-bull' : signal?.includes('BEAR') ? 'sig-bear' : 'sig-neutral';
        elements.push(
          <div key={`s-${i}`} className={`rich-signal ${cls}`}>
            <span className="rs-badge">{signal || 'NEUTRAL'}</span>
            {reason && <span className="rs-reason">{reason}</span>}
          </div>
        );
      } else if (line.startsWith('TAG:')) {
        flushTable();
        elements.push(<span key={`t-${i}`} className="rich-tag">{line.slice(4).trim()}</span>);
      } else {
        flushTable();
        // plain text line — check for bold markers
        const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        elements.push(<div key={`p-${i}`} className="rich-text" dangerouslySetInnerHTML={{ __html: processed }} />);
      }
    }
    flushTable();
    return elements.length > 0 ? elements : <div className="rich-text">{text}</div>;
  }

  function getSectionPrompt(section, q, type, live) {
    // Build a live data injection block if available (RAG)
    const dataBlock = live ? `
LIVE MARKET DATA (use these EXACT numbers in your analysis):
- Symbol: ${live.symbol}
- Current Price: ${live.currency} ${live.price}
- Change: ${live.change} (${live.changePct}%)
- 52-Week High: ${live.high52}
- 52-Week Low: ${live.low52}
- Exchange: ${live.exchange}
- Volume: ${live.volume ? live.volume.toLocaleString() : 'N/A'}
- SMA-20: ${live.sma20 || 'N/A'}
- SMA-5: ${live.sma5 || 'N/A'}
- Market State: ${live.marketState}
- Last 20 Daily Closes: [${live.closes.map(c => c.toFixed(2)).join(', ')}]
` : '';

    const prompts = {
      "Company Overview": type === "stock"
        ? `${dataBlock}Execute structural overview for ${q}. Cover: core business segments with approx revenue %, 3 main growth drivers, geographic revenue breakdown, notable recent M&A, executive leadership, and 2 critical recent developments.`
        : `Execute sector overview for ${q}. Cover: macroeconomic definition, primary sub-segments, estimated TAM, current lifecycle maturity, and structural macro headwinds/tailwinds.`,
      "Market Cap & Valuation": type === "stock"
        ? `${dataBlock}Execute valuation analysis for ${q}. Use the LIVE price data provided. List: Enterprise Value, Trailing P/E vs Forward P/E vs industry median, EV/EBITDA, Price/Sales, Price/Book, FCF yield, Dividend Yield. State if trading at historical premium/discount based on the current price of ${live?.price || 'unknown'}.`
        : `Execute valuation analysis for ${q} sector. List: aggregate sector P/E vs S&P 500, historical 10-year valuation bands, sub-sectors offering relative value.`,
      "Technical Analysis": type === "stock"
        ? `${dataBlock}Execute technical analysis for ${q}. Use the LIVE price data and SMA values provided above. Detail: primary trend based on SMA-5 vs SMA-20 crossover, 3 key support/resistance zones based on recent closes, RSI estimate from the closing data pattern, MACD state, and identified chart patterns. Price is currently ${live?.price || 'unknown'}.`
        : `Execute technical analysis for ${q} sector ETF/Index. Detail: relative strength vs SPY, primary trend, critical support/resistance levels, breadth indicators.`,
      "Entry Price Strategy": type === "stock"
        ? `${dataBlock}Compute entry strategy for ${q}. Current price is ${live?.price || 'unknown'}, 52W High is ${live?.high52 || 'unknown'}, 52W Low is ${live?.low52 || 'unknown'}. Define: optimal buy zone range, conservative entry tier, aggressive breakout trigger, stop-loss level, and Risk/Reward ratio. Use EXACT price levels.`
        : `Compute allocation strategy for ${q} sector. Suggest: OW/UW stance, optimal macro conditions for entry, rotation timing markers, downside risk threshold.`,
      "Peer Comparison": type === "stock"
        ? `${dataBlock}Execute peer comparison for ${q}. Compare top 3-4 competitors on: Operating Margins, 3yr Revenue CAGR, ROIC, Debt/Equity. Reference ${q}'s live price of ${live?.price || 'unknown'} for relative valuation context.`
        : `Execute peer comparison for ${q} sector. Rank top 5 mega-caps. Identify disruptors, market concentration, and M&A consolidation probability.`,
      "Sector Analysis": type === "stock"
        ? `${dataBlock}Execute macro environment analysis for ${q}. Cover: business cycle position, sector YTD performance, regulatory threats, supply chain status, macro margin constraints.`
        : `Deep dive macro drivers for ${q} sector. Cover: rate/inflation sensitivity, commodity input costs, geopolitical exposure, 5-year secular CAGR forecast.`,
      "Risk Assessment": type === "stock"
        ? `${dataBlock}Execute risk matrix for ${q}. Current price ${live?.price || 'unknown'} vs 52W range ${live?.low52 || '?'}-${live?.high52 || '?'}. Categorize: 1) Operational risk, 2) Financial/Liquidity risk, 3) Competitive risk, 4) Macro/Regulatory risk. Assign LOW/MED/HIGH severity to each.`
        : `Execute systemic risk analysis for ${q} sector. Cover: cyclical demand risk, legislative overhangs, labor pressures, FX risk. Output overall risk classification.`,
      "Investment Verdict": type === "stock"
        ? `${dataBlock}Synthesize verdict on ${q}. Current price: ${live?.price || 'unknown'}. Output: rating (STRONG BUY/BUY/HOLD/SELL/STRONG SELL), 12-month price target with upside/downside % from current price, 3 near-term catalysts, single-sentence thesis.`
        : `Synthesize verdict on ${q} sector. Output: tactical weight (OVERWEIGHT/MARKET WEIGHT/UNDERWEIGHT), 12-month outlook, top 2 pure-play stocks, core rationale.`,
    };
    return prompts[section] || `Provide analysis for ${section} on ${q}`;
  }

  async function handleAnalyze() {
    if (!query.trim()) { setError("ERR_INVALID_INPUT: Query parameter missing."); return; }
    setError("");
    setLoading(true);
    setAnalysisData(null);
    setAlphaScore(null);
    setSentiment(null);
    setLiveData(null);
    setActiveSection(0);
    setProgress(0);

    // Batch sections into 3 groups to minimize API calls
    const batches = [
      ["Company Overview", "Market Cap & Valuation", "Technical Analysis"],
      ["Entry Price Strategy", "Peer Comparison", "Sector Analysis"],
      ["Risk Assessment", "Investment Verdict"],
    ];
    const totalSteps = batches.length + 2; // +1 live data, +1 alpha+sentiment

    try {
      // PHASE 0: Fetch live market data (RAG)
      let live = null;
      if (queryType === "stock") {
        setProgress(2);
        live = await fetchLiveStockData(query.trim());
        setLiveData(live);
      }
      setProgress((1 / totalSteps) * 100);

      // PHASE 1-3: Run batched section analyses
      const results = {};
      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        setActiveSection(b * 3); // approximate section index for UI
        setProgress(((b + 1) / totalSteps) * 100);

        // Build a combined prompt for all sections in this batch
        const batchPrompts = batch.map(sec => {
          const p = getSectionPrompt(sec, query.trim(), queryType, live);
          return `=== SECTION: ${sec} ===\n${p}`;
        }).join('\n\n');

        const combinedPrompt = `Analyze the following sections. Output each section separately, starting each with the exact marker "=== SECTION: SectionName ===" on its own line. Keep each section concise (6-8 lines max).\n\n${batchPrompts}`;

        const rawResponse = await callGroq(combinedPrompt);

        // Split the combined response back into individual sections
        for (const sec of batch) {
          const marker = `=== SECTION: ${sec} ===`;
          const idx = rawResponse.indexOf(marker);
          if (idx !== -1) {
            // Find the end — next marker or end of string
            let endIdx = rawResponse.length;
            for (const otherSec of batch) {
              if (otherSec === sec) continue;
              const otherMarker = `=== SECTION: ${otherSec} ===`;
              const otherIdx = rawResponse.indexOf(otherMarker);
              if (otherIdx > idx && otherIdx < endIdx) endIdx = otherIdx;
            }
            results[sec] = rawResponse.slice(idx + marker.length, endIdx).trim();
          } else {
            // Fallback: if markers aren't found, dump entire response into first section
            if (sec === batch[0]) results[sec] = rawResponse;
            else results[sec] = "Analysis included in previous section.";
          }
        }

        if (b < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 8000));
        }
      }

      // PHASE 4: Alpha Score + Sentiment (combined into 1 call)
      setActiveSection(SECTIONS.length);
      setProgress(((batches.length + 1) / totalSteps) * 100);
      await new Promise(resolve => setTimeout(resolve, 8000));

      const comboPrompt = `Perform TWO tasks for ${queryType === "stock" ? `stock ${query.trim()}` : `the ${query.trim()} sector`}. ${live ? `Current price: ${live.price}, 52W High: ${live.high52}, 52W Low: ${live.low52}.` : ''}

TASK 1 - ALPHA SCORE: Score across 5 factors (value, growth, momentum, profitability, risk) each 0-100. Output as:
ALPHA_JSON: {"value":72,"growth":65,"momentum":80,"profitability":58,"risk":45,"overall":64,"rating":"BUY","target":"250.00","summary":"One sentence thesis"}

TASK 2 - SENTIMENT: Analyze market sentiment. Output as:
SENTIMENT_JSON: {"sentiment":"BULLISH","confidence":75,"catalysts":["C1","C2","C3"],"risks":["R1","R2"],"newsScore":72}

Output ONLY the two JSON lines prefixed with ALPHA_JSON: and SENTIMENT_JSON: respectively. No other text.`;

      try {
        const comboRaw = await callGroq(comboPrompt);
        // Parse Alpha Score
        const alphaMatch = comboRaw.match(/ALPHA_JSON:\s*(\{[\s\S]*?\})/);
        if (alphaMatch) {
          setAlphaScore(JSON.parse(alphaMatch[1]));
        } else {
          const jsonM = comboRaw.match(/\{[\s\S]*?"overall"[\s\S]*?\}/);
          if (jsonM) setAlphaScore(JSON.parse(jsonM[0]));
        }
        // Parse Sentiment
        const sentMatch = comboRaw.match(/SENTIMENT_JSON:\s*(\{[\s\S]*?\})/);
        if (sentMatch) {
          setSentiment(JSON.parse(sentMatch[1]));
        } else {
          const jsonS = comboRaw.match(/\{[\s\S]*?"sentiment"[\s\S]*?\}/);
          if (jsonS) setSentiment(JSON.parse(jsonS[0]));
        }
      } catch (e) { console.warn("Alpha/Sentiment parse failed", e); }

      setActiveSection(totalSteps + SECTIONS.length);
      setProgress(100);
      setAnalysisData(results);
    } catch (e) {
      setError("ERR_SYS_FAILURE: " + e.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
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

        /* Live Data Banner */
        .live-banner {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px;
          background: #131722;
          border-bottom: 1px solid #2A2E39;
        }
        .live-item {
          padding: 10px 12px;
          background: #1E222D;
          border: 1px solid #2A2E39;
          font-family: 'JetBrains Mono', monospace;
        }
        .live-label { font-size: 9px; color: #787B86; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .live-value { font-size: 16px; font-weight: 700; color: #E0E3EA; }
        .live-change { font-size: 11px; margin-top: 2px; }
        .live-change.up { color: #00C853; }
        .live-change.down { color: #D50000; }

        /* Alpha Score + Sentiment Row */
        .score-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px;
        }
        @media (max-width: 900px) { .score-row { grid-template-columns: 1fr; } }

        .alpha-card, .sentiment-card {
          background: #131722;
          border: 1px solid #2A2E39;
          padding: 20px;
        }
        .score-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #787B86;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          border-bottom: 1px solid #2A2E39;
          padding-bottom: 8px;
        }

        /* SVG Ring */
        .ring-container { display: flex; align-items: center; gap: 24px; }
        .score-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
        .score-ring svg { transform: rotate(-90deg); }
        .ring-bg { fill: none; stroke: #1E222D; stroke-width: 8; }
        .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s ease-out; }
        .ring-text {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'JetBrains Mono', monospace;
          text-align: center;
        }
        .ring-number { font-size: 28px; font-weight: 800; color: #E0E3EA; display: block; }
        .ring-label { font-size: 9px; color: #787B86; text-transform: uppercase; }

        .alpha-details { flex: 1; }
        .alpha-rating {
          display: inline-block;
          padding: 4px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .rating-buy { background: rgba(0,200,83,0.15); color: #00C853; border: 1px solid rgba(0,200,83,0.3); }
        .rating-hold { background: rgba(255,214,0,0.15); color: #FFD600; border: 1px solid rgba(255,214,0,0.3); }
        .rating-sell { background: rgba(213,0,0,0.15); color: #D50000; border: 1px solid rgba(213,0,0,0.3); }
        .alpha-target { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #B2B5BE; margin-bottom: 12px; }
        .alpha-summary { font-size: 13px; color: #B2B5BE; line-height: 1.5; }

        .factor-bars { margin-top: 16px; }
        .factor-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
        .factor-name { width: 90px; color: #787B86; text-transform: uppercase; }
        .factor-bar-bg { flex: 1; height: 6px; background: #1E222D; }
        .factor-bar-fill { height: 100%; transition: width 0.8s ease-out; }
        .factor-val { width: 30px; text-align: right; font-weight: 700; color: #E0E3EA; }

        /* Sentiment */
        .sent-badge {
          display: inline-block;
          padding: 6px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .sent-bullish { background: rgba(0,200,83,0.15); color: #00C853; border: 1px solid rgba(0,200,83,0.3); }
        .sent-bearish { background: rgba(213,0,0,0.15); color: #D50000; border: 1px solid rgba(213,0,0,0.3); }
        .sent-neutral { background: rgba(255,214,0,0.15); color: #FFD600; border: 1px solid rgba(255,214,0,0.3); }

        .sent-conf { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #787B86; margin-bottom: 16px; }
        .sent-conf strong { color: #E0E3EA; }
        .sent-section-title { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2962FF; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 6px; }
        .sent-list { list-style: none; padding: 0; }
        .sent-list li { font-size: 12px; color: #B2B5BE; padding: 3px 0; font-family: 'Inter', sans-serif; }
        .sent-list li::before { content: '▸ '; color: #787B86; }

        /* Rich Structured Output */
        .rich-metric {
          display: inline-flex;
          flex-direction: column;
          background: #1E222D;
          border: 1px solid #2A2E39;
          padding: 8px 14px;
          margin: 4px 6px 4px 0;
          min-width: 120px;
        }
        .rm-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #787B86; text-transform: uppercase; letter-spacing: 0.5px; }
        .rm-value { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; color: #E0E3EA; margin: 2px 0; }
        .rm-change { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #787B86; }
        .rm-change.up { color: #00C853; }
        .rm-change.down { color: #D50000; }

        .rich-table-wrap { overflow-x: auto; margin: 8px 0; }
        .rich-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }
        .rich-table th {
          background: #1E222D;
          color: #2962FF;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 8px 12px;
          text-align: left;
          border-bottom: 2px solid #2A2E39;
        }
        .rich-table td {
          padding: 7px 12px;
          color: #B2B5BE;
          border-bottom: 1px solid #1E222D;
        }
        .rich-table tr:hover td { background: rgba(41,98,255,0.05); }

        .rich-bullet {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 4px 0;
          font-size: 12px;
          color: #B2B5BE;
          line-height: 1.5;
        }
        .rb-dot { color: #2962FF; font-size: 10px; margin-top: 3px; flex-shrink: 0; }

        .rich-signal {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin: 6px 0;
          border-left: 3px solid;
        }
        .sig-bull { border-color: #00C853; background: rgba(0,200,83,0.05); }
        .sig-bear { border-color: #D50000; background: rgba(213,0,0,0.05); }
        .sig-neutral { border-color: #FFD600; background: rgba(255,214,0,0.05); }
        .rs-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 2px 8px;
          flex-shrink: 0;
        }
        .sig-bull .rs-badge { color: #00C853; background: rgba(0,200,83,0.15); }
        .sig-bear .rs-badge { color: #D50000; background: rgba(213,0,0,0.15); }
        .sig-neutral .rs-badge { color: #FFD600; background: rgba(255,214,0,0.15); }
        .rs-reason { font-size: 12px; color: #B2B5BE; }

        .rich-tag {
          display: inline-block;
          background: rgba(41,98,255,0.1);
          border: 1px solid rgba(41,98,255,0.2);
          color: #2962FF;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          margin: 2px 4px 2px 0;
        }

        .rich-text { font-size: 12px; color: #B2B5BE; line-height: 1.6; padding: 2px 0; }
        .rich-text strong { color: #E0E3EA; font-weight: 700; }

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
                  {/* Live data phase */}
                  <div className={`matrix-log-item ${activeSection > 0 ? 'log-done' : activeSection === 0 ? 'log-active' : 'log-wait'}`}>
                    <span>[0] FETCH_LIVE_MARKET_DATA</span>
                    <span>{activeSection > 0 ? '100%' : 'FETCHING...'}</span>
                  </div>
                  {SECTIONS.map((sec, i) => {
                    let status = "0%";
                    let cn = "log-wait";
                    if (i < activeSection) { status = "100%"; cn = "log-done"; }
                    else if (i === activeSection) { status = "FETCHING..."; cn = "log-active"; }
                    return (
                      <div key={sec} className={`matrix-log-item ${cn}`}>
                        <span>[{i + 1}/{SECTIONS.length + 2}] REQ_{sec.replace(/\s+/g, '_').toUpperCase()}</span>
                        <span>{status}</span>
                      </div>
                    );
                  })}
                  {/* Alpha Score phase */}
                  <div className={`matrix-log-item ${activeSection > SECTIONS.length ? 'log-done' : activeSection === SECTIONS.length ? 'log-active' : 'log-wait'}`}>
                    <span>[{SECTIONS.length + 1}] COMPUTE_ALPHA_SCORE</span>
                    <span>{activeSection > SECTIONS.length ? '100%' : activeSection === SECTIONS.length ? 'COMPUTING...' : '0%'}</span>
                  </div>
                  {/* Sentiment phase */}
                  <div className={`matrix-log-item ${activeSection > SECTIONS.length + 1 ? 'log-done' : activeSection === SECTIONS.length + 1 ? 'log-active' : 'log-wait'}`}>
                    <span>[{SECTIONS.length + 2}] ANALYZE_SENTIMENT</span>
                    <span>{activeSection > SECTIONS.length + 1 ? '100%' : activeSection === SECTIONS.length + 1 ? 'ANALYZING...' : '0%'}</span>
                  </div>
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
                  {liveData && <span style={{ color: parseFloat(liveData.changePct) >= 0 ? '#00C853' : '#D50000' }}>{liveData.currency} {liveData.price} ({liveData.changePct}%)</span>}
                </div>
                <button className="btn-export" onClick={downloadPDF} disabled={pdfLoading}>
                  {pdfLoading ? "EXPORTING..." : "[ EXPORT_HTML ]"}
                </button>
              </div>

              {/* Live Market Data Banner */}
              {liveData && (
                <div className="live-banner">
                  <div className="live-item">
                    <div className="live-label">PRICE</div>
                    <div className="live-value">{liveData.currency} {liveData.price}</div>
                    <div className={`live-change ${parseFloat(liveData.changePct) >= 0 ? 'up' : 'down'}`}>
                      {parseFloat(liveData.changePct) >= 0 ? '▲' : '▼'} {liveData.change} ({liveData.changePct}%)
                    </div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">52W HIGH</div>
                    <div className="live-value">{liveData.high52}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">52W LOW</div>
                    <div className="live-value">{liveData.low52}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">SMA-20</div>
                    <div className="live-value">{liveData.sma20 || 'N/A'}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">SMA-5</div>
                    <div className="live-value">{liveData.sma5 || 'N/A'}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">VOLUME</div>
                    <div className="live-value">{liveData.volume ? liveData.volume.toLocaleString() : 'N/A'}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">EXCHANGE</div>
                    <div className="live-value">{liveData.exchange}</div>
                  </div>
                  <div className="live-item">
                    <div className="live-label">MKT STATE</div>
                    <div className="live-value">{liveData.marketState}</div>
                  </div>
                </div>
              )}

              {/* Alpha Score + Sentiment Row */}
              {(alphaScore || sentiment) && (
                <div className="score-row">
                  {/* Alpha Score Card */}
                  {alphaScore && (() => {
                    const score = alphaScore.overall || 50;
                    const circ = 2 * Math.PI * 48;
                    const offset = circ - (score / 100) * circ;
                    const ringColor = score >= 70 ? '#00C853' : score >= 40 ? '#FFD600' : '#D50000';
                    const r = alphaScore.rating || '';
                    const rClass = r.includes('BUY') || r.includes('OVERWEIGHT') ? 'rating-buy' : r.includes('SELL') || r.includes('UNDERWEIGHT') ? 'rating-sell' : 'rating-hold';
                    const factors = [
                      { name: 'Value', val: alphaScore.value, color: '#2962FF' },
                      { name: 'Growth', val: alphaScore.growth, color: '#00BFA5' },
                      { name: 'Momentum', val: alphaScore.momentum, color: '#AA00FF' },
                      { name: 'Profit', val: alphaScore.profitability, color: '#FF6D00' },
                      { name: 'Risk', val: 100 - (alphaScore.risk || 50), color: '#D50000' },
                    ];
                    return (
                      <div className="alpha-card">
                        <div className="score-title">ALPHA SCORE ENGINE</div>
                        <div className="ring-container">
                          <div className="score-ring">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                              <circle className="ring-bg" cx="60" cy="60" r="48" />
                              <circle className="ring-fill" cx="60" cy="60" r="48" stroke={ringColor} strokeDasharray={circ} strokeDashoffset={offset} />
                            </svg>
                            <div className="ring-text">
                              <span className="ring-number">{score}</span>
                              <span className="ring-label">ALPHA</span>
                            </div>
                          </div>
                          <div className="alpha-details">
                            <div className={`alpha-rating ${rClass}`}>{r}</div>
                            {alphaScore.target && <div className="alpha-target">12M TARGET: {alphaScore.target}</div>}
                            {alphaScore.summary && <div className="alpha-summary">{alphaScore.summary}</div>}
                          </div>
                        </div>
                        <div className="factor-bars">
                          {factors.map(f => (
                            <div key={f.name} className="factor-row">
                              <span className="factor-name">{f.name}</span>
                              <div className="factor-bar-bg"><div className="factor-bar-fill" style={{ width: `${f.val || 0}%`, background: f.color }}></div></div>
                              <span className="factor-val">{f.val || 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sentiment Card */}
                  {sentiment && (() => {
                    const s = sentiment.sentiment || 'NEUTRAL';
                    const sClass = s.includes('BULL') ? 'sent-bullish' : s.includes('BEAR') ? 'sent-bearish' : 'sent-neutral';
                    return (
                      <div className="sentiment-card">
                        <div className="score-title">MARKET SENTIMENT ANALYSIS</div>
                        <div className={`sent-badge ${sClass}`}>{s.replace(/_/g, ' ')}</div>
                        <div className="sent-conf">CONFIDENCE: <strong>{sentiment.confidence || 0}%</strong> &nbsp;|&nbsp; NEWS SCORE: <strong>{sentiment.newsScore || 0}/100</strong></div>
                        {sentiment.catalysts && sentiment.catalysts.length > 0 && (
                          <>
                            <div className="sent-section-title">CATALYSTS</div>
                            <ul className="sent-list">
                              {sentiment.catalysts.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </>
                        )}
                        {sentiment.risks && sentiment.risks.length > 0 && (
                          <>
                            <div className="sent-section-title">KEY RISKS</div>
                            <ul className="sent-list">
                              {sentiment.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="data-grid">
                {SECTIONS.map((section, i) => (
                  <div key={section} className="data-card">
                    <div className="dc-header" style={{ borderLeft: `3px solid ${SEC_COLORS[i]}` }}>
                      <span style={{ color: SEC_COLORS[i] }}>{ICONS[i]}</span>
                      {section}
                    </div>
                    <div className="dc-body">
                      {analysisData[section] ? parseStructuredOutput(analysisData[section]) : "NO_DATA"}
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
