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
          background-color: #0E1015;
          color: #D1D4DC;
          font-family: 'Inter', -apple-system, sans-serif;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        /* ===== ANIMATION KEYFRAMES ===== */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 8px rgba(41,98,255,0.4), 0 0 20px rgba(41,98,255,0.1); }
          50% { text-shadow: 0 0 16px rgba(41,98,255,0.8), 0 0 40px rgba(41,98,255,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: #2A2E39; box-shadow: none; }
          50% { border-color: rgba(41,98,255,0.4); box-shadow: 0 0 12px rgba(41,98,255,0.1); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ripple {
          0% { box-shadow: 0 0 0 0 rgba(41,98,255,0.3); }
          100% { box-shadow: 0 0 0 12px rgba(41,98,255,0); }
        }
        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 4px #00BFA5; }
          50% { box-shadow: 0 0 12px #00BFA5, 0 0 24px rgba(0,191,165,0.3); }
        }

        /* Scrollbar styles */
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
          max-height: 100vh;
          max-width: 100vw;
          overflow: hidden;
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
          height: 48px;
          min-height: 48px;
          flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          animation: fadeIn 0.6s ease-out;
        }

        .sys-logo {
          color: #2962FF;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
          animation: glowPulse 3s ease-in-out infinite;
          cursor: default;
          transition: transform 0.3s ease;
        }
        .sys-logo:hover { transform: scale(1.05); }
        .sys-logo span { color: #E0E3EA; }

        .sys-clock {
          color: #787B86;
          display: flex;
          align-items: center;
          gap: 16px;
          animation: fadeIn 1s ease-out 0.3s both;
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
          animation: statusPulse 2s ease-in-out infinite;
        }

        /* Main Workspace layout */
        .workspace {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* Left Side Panel (Command/Query form) */
        .cmd-panel {
          width: 300px;
          background: #131722;
          border-right: 1px solid #2A2E39;
          display: flex;
          flex-direction: column;
          padding: 16px;
          flex-shrink: 0;
          overflow-y: auto;
          animation: slideInLeft 0.5s ease-out;
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
          margin-bottom: 14px;
          border-bottom: 1px dashed #2A2E39;
          padding-bottom: 8px;
          animation: fadeInUp 0.5s ease-out 0.2s both;
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
          margin-bottom: 16px;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
          animation: fadeInUp 0.5s ease-out 0.3s both;
        }
        .cmd-input:focus { 
          border-color: #2962FF; 
          box-shadow: inset 0 0 0 1px rgba(41,98,255,0.5), 0 0 20px rgba(41,98,255,0.1);
          transform: scale(1.01);
        }
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
          margin-bottom: 20px;
          animation: fadeInUp 0.5s ease-out 0.5s both;
        }
        .cmd-chip {
          background: #1E222D;
          border: 1px solid #2A2E39;
          color: #B2B5BE;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 8px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .cmd-chip:hover { 
          border-color: #2962FF; 
          color: #E0E3EA; 
          background: rgba(41,98,255,0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(41,98,255,0.15);
        }
        .cmd-chip:active { transform: translateY(0) scale(0.97); }

        .cmd-execute {
          background: linear-gradient(135deg, #2962FF, #1E88E5);
          background-size: 200% 200%;
          color: #fff;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s ease-out 0.6s both;
        }
        .cmd-execute::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg) translateX(-100%);
          transition: transform 0.6s;
        }
        .cmd-execute:hover:not(:disabled)::after { transform: rotate(45deg) translateX(100%); }
        .cmd-execute:hover:not(:disabled) { 
          background: linear-gradient(135deg, #1E4BD8, #1565C0);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(41,98,255,0.4);
        }
        .cmd-execute:active:not(:disabled) { transform: translateY(0) scale(0.98); }
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
          min-width: 0;
          background: #0E1015;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.5s ease-out;
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
          animation: scaleIn 0.5s ease-out, borderGlow 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .matrix-box::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(41,98,255,0.05), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .matrix-header {
          color: #2962FF;
          font-size: 11px;
          margin-bottom: 16px;
          border-bottom: 1px solid #2A2E39;
          padding-bottom: 8px;
          animation: pulseMatrix 1.5s infinite;
        }

        .matrix-bar-bg { width: 100%; height: 6px; background: #1E222D; margin-bottom: 16px; border-radius: 3px; overflow: hidden; position: relative; }
        .matrix-bar-fill { 
          height: 100%; 
          background: linear-gradient(90deg, #2962FF, #00BFA5, #2962FF);
          background-size: 200% 100%;
          animation: gradientShift 2s ease-in-out infinite;
          transition: width 0.5s ease-out;
          border-radius: 3px;
          position: relative;
        }
        .matrix-bar-fill::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        .matrix-logs { font-size: 11px; color: #B2B5BE; }
        .matrix-log-item { margin-bottom: 4px; display: flex; justify-content: space-between; animation: fadeIn 0.3s ease-out both; }
        .log-done { color: #00BFA5; }
        .log-wait { color: #787B86; }
        .log-active { color: #2962FF; animation: pulseMatrix 1s infinite; }

        /* Data Grid */
        .data-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          padding: 14px;
        }
        
        @media (max-width: 1200px) {
          .data-grid { grid-template-columns: 1fr; }
        }

        .data-card {
          background: #131722;
          border: 1px solid #2A2E39;
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.6s ease-out both;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .data-card:nth-child(1) { animation-delay: 0.05s; }
        .data-card:nth-child(2) { animation-delay: 0.1s; }
        .data-card:nth-child(3) { animation-delay: 0.15s; }
        .data-card:nth-child(4) { animation-delay: 0.2s; }
        .data-card:nth-child(5) { animation-delay: 0.25s; }
        .data-card:nth-child(6) { animation-delay: 0.3s; }
        .data-card:nth-child(7) { animation-delay: 0.35s; }
        .data-card:nth-child(8) { animation-delay: 0.4s; }
        .data-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(41,98,255,0.08);
          border-color: rgba(41,98,255,0.3);
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
          transition: background 0.3s;
        }
        .data-card:hover .dc-header { background: #252a37; }

        .dc-body {
          padding: 14px;
          font-size: 13px;
          line-height: 1.6;
          color: #B2B5BE;
          white-space: pre-wrap;
          font-family: 'Inter', sans-serif;
          flex: 1;
        }

        .dc-body strong { color: #E0E3EA; font-weight: 600; }
        .dc-body span.ticker { color: #2962FF; font-family: 'JetBrains Mono', monospace; font-size: 12px; }

        /* ===== WELCOME SCREEN REDESIGN ===== */
        .welcome-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 50%, rgba(41,98,255,0.04) 0%, transparent 70%);
        }

        /* Animated grid background */
        .welcome-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(41,98,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(41,98,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: fadeIn 2s ease-out;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }

        /* Scanning line */
        @keyframes scanLine {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .welcome-scan {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #2962FF, rgba(41,98,255,0.6), #2962FF, transparent);
          animation: scanLine 4s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(41,98,255,0.5), 0 0 40px rgba(41,98,255,0.2);
          z-index: 1;
        }

        /* Floating particles */
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-20px) translateX(15px); opacity: 0.8; }
        }
        .welcome-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #2962FF;
          border-radius: 50%;
          animation: particleFloat 6s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(41,98,255,0.5);
        }

        /* Main content wrapper */
        .welcome-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        /* Radar ring behind logo */
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radarPulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        .welcome-radar {
          position: relative;
          width: 140px;
          height: 140px;
          margin-bottom: 8px;
          animation: scaleIn 0.8s ease-out;
        }
        .radar-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(41,98,255,0.15);
          border-radius: 50%;
          animation: radarPulse 3s ease-in-out infinite;
        }
        .radar-ring:nth-child(2) {
          inset: 15px;
          animation-delay: 0.5s;
          border-color: rgba(41,98,255,0.1);
        }
        .radar-ring:nth-child(3) {
          inset: 30px;
          animation-delay: 1s;
          border-color: rgba(41,98,255,0.08);
        }
        .radar-sweep {
          position: absolute;
          top: 50%; left: 50%;
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, #2962FF, transparent);
          transform-origin: left center;
          animation: radarSpin 4s linear infinite;
          box-shadow: 0 0 10px rgba(41,98,255,0.4);
        }
        .radar-center {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 36px;
          filter: drop-shadow(0 0 20px rgba(41,98,255,0.5));
          animation: floatY 3s ease-in-out infinite;
        }

        /* Logo text */
        .welcome-brand {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #E0E3EA;
          animation: fadeInUp 0.6s ease-out 0.3s both;
          text-shadow: 0 0 30px rgba(41,98,255,0.3);
        }
        .welcome-brand .brand-accent { color: #2962FF; }

        .welcome-tagline {
          font-size: 11px;
          color: #787B86;
          letter-spacing: 4px;
          text-transform: uppercase;
          animation: fadeInUp 0.6s ease-out 0.5s both;
          margin-bottom: 16px;
        }

        /* Animated stock chart SVG */
        @keyframes drawChart {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes chartGlow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(0,200,83,0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(0,200,83,0.6)); }
        }
        .welcome-chart {
          width: 320px;
          height: 80px;
          margin-bottom: 20px;
          animation: fadeIn 0.8s ease-out 0.7s both, chartGlow 3s ease-in-out infinite;
        }
        .chart-line {
          fill: none;
          stroke: #00C853;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 600;
          animation: drawChart 2.5s ease-out 0.8s both;
        }
        .chart-area {
          animation: fadeIn 1.5s ease-out 2s both;
        }
        .chart-grid-line {
          stroke: rgba(42,46,57,0.5);
          stroke-width: 0.5;
          stroke-dasharray: 4 4;
        }
        .chart-dot {
          animation: fadeIn 0.3s ease-out both;
        }

        /* Feature badges row */
        .welcome-features {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 20px;
        }
        .feature-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(30,34,45,0.8);
          border: 1px solid #2A2E39;
          padding: 6px 14px;
          font-size: 10px;
          color: #B2B5BE;
          letter-spacing: 0.5px;
          animation: fadeInUp 0.5s ease-out both;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .feature-badge:nth-child(1) { animation-delay: 0.9s; }
        .feature-badge:nth-child(2) { animation-delay: 1.0s; }
        .feature-badge:nth-child(3) { animation-delay: 1.1s; }
        .feature-badge:nth-child(4) { animation-delay: 1.2s; }
        .feature-badge:hover {
          border-color: #2962FF;
          background: rgba(41,98,255,0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(41,98,255,0.15);
        }
        .feature-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Status line */
        .welcome-status-line {
          font-size: 11px;
          color: #434651;
          animation: fadeInUp 0.6s ease-out 1.3s both;
          position: relative;
        }
        .welcome-status-line::after {
          content: '\\2588';
          animation: cursorBlink 1s step-end infinite;
          margin-left: 4px;
          color: #2962FF;
        }

        /* Scrolling ticker tape */
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .welcome-ticker {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 28px;
          background: rgba(19,23,34,0.9);
          border-top: 1px solid #2A2E39;
          overflow: hidden;
          display: flex;
          align-items: center;
          animation: fadeIn 1s ease-out 1.5s both;
        }
        .ticker-track {
          display: flex;
          animation: tickerScroll 30s linear infinite;
          white-space: nowrap;
        }
        .ticker-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ticker-symbol { color: #E0E3EA; font-weight: 700; }
        .ticker-up { color: #00C853; }
        .ticker-down { color: #D50000; }

        /* Export Button */
        .export-bar {
          padding: 10px 14px;
          background: #131722;
          border-bottom: 1px solid #2A2E39;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: fadeIn 0.4s ease-out;
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
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-export:hover:not(:disabled) { 
          border-color: #2962FF; 
          color: #2962FF; 
          background: rgba(41,98,255,0.08);
          box-shadow: 0 0 15px rgba(41,98,255,0.15);
          transform: translateY(-1px);
        }
        .btn-export:active:not(:disabled) { transform: scale(0.97); }
        .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Live Data Banner */
        .live-banner {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          padding: 12px;
          background: #131722;
          border-bottom: 1px solid #2A2E39;
          animation: fadeIn 0.5s ease-out;
        }
        .live-item {
          padding: 8px 10px;
          background: #1E222D;
          border: 1px solid #2A2E39;
          font-family: 'JetBrains Mono', monospace;
          animation: fadeInUp 0.4s ease-out both;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .live-item:nth-child(1) { animation-delay: 0.05s; }
        .live-item:nth-child(2) { animation-delay: 0.1s; }
        .live-item:nth-child(3) { animation-delay: 0.15s; }
        .live-item:nth-child(4) { animation-delay: 0.2s; }
        .live-item:nth-child(5) { animation-delay: 0.25s; }
        .live-item:nth-child(6) { animation-delay: 0.3s; }
        .live-item:nth-child(7) { animation-delay: 0.35s; }
        .live-item:nth-child(8) { animation-delay: 0.4s; }
        .live-item:hover {
          transform: translateY(-2px);
          border-color: rgba(41,98,255,0.3);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .live-label { font-size: 9px; color: #787B86; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
        .live-value { font-size: 14px; font-weight: 700; color: #E0E3EA; }
        .live-change { font-size: 11px; margin-top: 2px; }
        .live-change.up { color: #00C853; }
        .live-change.down { color: #D50000; }

        /* Alpha Score + Sentiment Row */
        .score-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 14px;
        }
        @media (max-width: 900px) { .score-row { grid-template-columns: 1fr; } }

        .alpha-card, .sentiment-card {
          background: #131722;
          border: 1px solid #2A2E39;
          padding: 16px;
          animation: scaleIn 0.5s ease-out both;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .alpha-card { animation-delay: 0.1s; }
        .sentiment-card { animation-delay: 0.2s; }
        .alpha-card:hover, .sentiment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
          border-color: rgba(41,98,255,0.3);
        }
        .score-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #787B86;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
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

          {/* Default Empty State — Animated Front Page */}
          {!loading && !analysisData && (
            <div className="welcome-screen">
              {/* Animated grid background */}
              <div className="welcome-grid" />
              {/* Scanning line */}
              <div className="welcome-scan" />
              {/* Floating particles */}
              <div className="welcome-particles">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={{
                      left: `${8 + (i * 7.5) % 85}%`,
                      top: `${15 + (i * 13) % 70}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${4 + (i % 3) * 2}s`,
                      width: `${2 + (i % 3)}px`,
                      height: `${2 + (i % 3)}px`,
                      background: i % 3 === 0 ? '#2962FF' : i % 3 === 1 ? '#00BFA5' : '#AA00FF',
                      boxShadow: `0 0 ${4 + i % 4}px ${i % 3 === 0 ? 'rgba(41,98,255,0.5)' : i % 3 === 1 ? 'rgba(0,191,165,0.5)' : 'rgba(170,0,255,0.5)'}`,
                    }}
                  />
                ))}
              </div>

              <div className="welcome-content">
                {/* Radar ring behind logo */}
                <div className="welcome-radar">
                  <div className="radar-ring" />
                  <div className="radar-ring" />
                  <div className="radar-ring" />
                  <div className="radar-sweep" />
                  <div className="radar-center">◱</div>
                </div>

                <div className="welcome-brand">
                  <span className="brand-accent">STOCK</span>SAGE
                </div>
                <div className="welcome-tagline">AI-Powered Terminal Analytics</div>

                {/* Animated stock chart */}
                <svg className="welcome-chart" viewBox="0 0 320 80" fill="none">
                  {/* Grid lines */}
                  <line className="chart-grid-line" x1="0" y1="20" x2="320" y2="20" />
                  <line className="chart-grid-line" x1="0" y1="40" x2="320" y2="40" />
                  <line className="chart-grid-line" x1="0" y1="60" x2="320" y2="60" />
                  {/* Area fill under chart */}
                  <path className="chart-area" d="M0,65 L20,58 L45,62 L70,50 L95,55 L120,42 L140,45 L165,35 L190,38 L210,28 L235,32 L255,22 L275,18 L295,24 L320,12 L320,80 L0,80 Z" fill="url(#chartGrad)" />
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0,200,83,0.15)" />
                      <stop offset="100%" stopColor="rgba(0,200,83,0)" />
                    </linearGradient>
                  </defs>
                  {/* Main chart line */}
                  <polyline
                    className="chart-line"
                    points="0,65 20,58 45,62 70,50 95,55 120,42 140,45 165,35 190,38 210,28 235,32 255,22 275,18 295,24 320,12"
                  />
                  {/* Endpoint glow dot */}
                  <circle className="chart-dot" cx="320" cy="12" r="3" fill="#00C853" style={{ animationDelay: '2.8s' }}>
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle className="chart-dot" cx="320" cy="12" r="8" fill="none" stroke="rgba(0,200,83,0.3)" strokeWidth="1" style={{ animationDelay: '2.8s' }}>
                    <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>

                {/* Feature badges */}
                <div className="welcome-features">
                  <div className="feature-badge">
                    <span className="feature-dot" style={{ background: '#00C853' }} />
                    LIVE DATA
                  </div>
                  <div className="feature-badge">
                    <span className="feature-dot" style={{ background: '#2962FF' }} />
                    AI ANALYSIS
                  </div>
                  <div className="feature-badge">
                    <span className="feature-dot" style={{ background: '#AA00FF' }} />
                    ALPHA SCORE
                  </div>
                  <div className="feature-badge">
                    <span className="feature-dot" style={{ background: '#FF6D00' }} />
                    SENTIMENT
                  </div>
                </div>

                <div className="welcome-status-line">SYS_READY — AWAITING INPUT</div>
              </div>

              {/* Scrolling ticker tape */}
              <div className="welcome-ticker">
                <div className="ticker-track">
                  {[...Array(2)].map((_, setIdx) => (
                    <React.Fragment key={setIdx}>
                      <span className="ticker-item"><span className="ticker-symbol">AAPL</span> <span className="ticker-up">▲ 2.34%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">TSLA</span> <span className="ticker-down">▼ 1.12%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">NVDA</span> <span className="ticker-up">▲ 4.56%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">RELIANCE</span> <span className="ticker-up">▲ 0.87%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">TCS</span> <span className="ticker-down">▼ 0.45%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">INFY</span> <span className="ticker-up">▲ 1.23%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">MSFT</span> <span className="ticker-up">▲ 1.67%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">GOOG</span> <span className="ticker-down">▼ 0.89%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">AMZN</span> <span className="ticker-up">▲ 3.21%</span></span>
                      <span className="ticker-item"><span className="ticker-symbol">META</span> <span className="ticker-up">▲ 2.05%</span></span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
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
