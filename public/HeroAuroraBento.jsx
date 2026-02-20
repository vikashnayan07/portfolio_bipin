import { useState, useEffect } from "react";

const TYPING_WORDS = ["BPSC Aspirant", "Future Educator", "Bihar's Pride", "Consistent Dreamer"];
const TAGS = [
  { text: "BPSC Aspirant",   bg: "rgba(255,107,107,0.12)", color: "#D63031" },
  { text: "Future Educator", bg: "rgba(162,155,254,0.15)", color: "#6C5CE7" },
  { text: "Bihar Roots",     bg: "rgba(255,159,67,0.12)",  color: "#E17055" },
  { text: "Consistent",      bg: "rgba(85,239,196,0.15)",  color: "#00B894" },
  { text: "Dreamer",         bg: "rgba(253,121,168,0.12)", color: "#E84393" },
  { text: "2026 🎯",         bg: "rgba(13,13,13,0.07)",    color: "#3D3535" },
];
const PROGRESS = [
  { label: "General Studies", pct: 78, grad: "linear-gradient(to right,#FF9F43,#FF6B6B)" },
  { label: "B.Ed Coursework", pct: 62, grad: "linear-gradient(to right,#A29BFE,#FD79A8)" },
  { label: "Mock Tests",      pct: 45, grad: "linear-gradient(to right,#55EFC4,#00B894)" },
];
const LINKS = [
  { icon: "✉️", label: "Email",    href: "#", bg: "rgba(255,107,107,0.12)" },
  { icon: "💼", label: "LinkedIn", href: "#", bg: "rgba(162,155,254,0.12)" },
  { icon: "📱", label: "WhatsApp", href: "#", bg: "rgba(85,239,196,0.12)"  },
];

function useTyping() {
  const [text, setText] = useState("");
  const [idx, setIdx]   = useState(0);
  const [del, setDel]   = useState(false);
  useEffect(() => {
    const word = TYPING_WORDS[idx];
    let t;
    if (!del) {
      if (text.length < word.length)
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), 85);
      else t = setTimeout(() => setDel(true), 2000);
    } else {
      if (text.length > 0)
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), 40);
      else { setDel(false); setIdx(i => (i + 1) % TYPING_WORDS.length); }
    }
    return () => clearTimeout(t);
  }, [text, del, idx]);
  return text;
}

function useClock() {
  const fmt = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };
  const [t, setT] = useState(fmt);
  useEffect(() => { const id = setInterval(() => setT(fmt()), 10000); return () => clearInterval(id); }, []);
  return t;
}

function useGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning ☀️" : h < 17 ? "Good afternoon 🌤️" : h < 21 ? "Good evening 🌅" : "Hello, night owl 🌙";
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,800&family=DM+Serif+Display:ital@0;1&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  @keyframes b1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,20px) scale(1.08)}66%{transform:translate(-15px,35px) scale(0.95)}}
  @keyframes b2{0%,100%{transform:translate(0,0)}40%{transform:translate(-25px,15px) scale(1.06)}70%{transform:translate(10px,-20px) scale(0.97)}}
  @keyframes b3{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.15)}}
  @keyframes b4{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-20px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ping{0%,100%{box-shadow:0 0 0 2px rgba(0,196,140,0.3)}50%{box-shadow:0 0 0 7px rgba(0,196,140,0.06)}}
  @keyframes blink{50%{opacity:0}}
  @keyframes grow{from{width:0%}}
  @keyframes shine{0%,100%{transform:translateX(-100%)}40%,60%{transform:translateX(100%)}}
  @keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%,100%{background-position:-200% center}50%{background-position:200% center}}
  .blob1{animation:b1 12s ease-in-out infinite}
  .blob2{animation:b2 15s ease-in-out infinite}
  .blob3{animation:b3 10s ease-in-out infinite}
  .blob4{animation:b4 18s ease-in-out infinite}
  .bspin{animation:spin 4s linear infinite;background:conic-gradient(from 0deg,#FF6B6B,#FF9F43,#FFEAA7,#A29BFE,#FD79A8,#FF6B6B)}
  .odot{animation:ping 2s ease-in-out infinite}
  .cur{animation:blink 0.9s steps(1) infinite}
  .up{animation:up 0.65s both}
  .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
  .d4{animation-delay:.25s}.d5{animation-delay:.32s}.d6{animation-delay:.38s}
  .d7{animation-delay:.44s}.d8{animation-delay:.50s}
  .pgrow{animation:grow 1.8s both}
  .pg1{animation-delay:.5s}.pg2{animation-delay:.7s}.pg3{animation-delay:.9s}
  .shine::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);transform:translateX(-100%);animation:shine 4s 3s ease-in-out infinite;pointer-events:none}
  .nameshim{background:linear-gradient(90deg,transparent,rgba(255,220,100,0.45),transparent);background-size:200% 100%;animation:shimmer 4s 2.5s ease-in-out infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .noscroll::-webkit-scrollbar{display:none}
  .noscroll{-ms-overflow-style:none;scrollbar-width:none}
`;

const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(255,255,255,0.9)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 2px 0 rgba(255,255,255,0.8) inset,0 8px 32px -8px rgba(0,0,0,0.08),0 2px 8px -2px rgba(0,0,0,0.05)",
  borderRadius: 24,
};

export default function Hero() {
  const typed    = useTyping();
  const clock    = useClock();
  const greeting = useGreeting();

  return (
    <div style={{ width:"100%", minHeight:"100svh", background:"#F8F4F0",
      fontFamily:"'Bricolage Grotesque',sans-serif", position:"relative", overflow:"hidden",
      display:"flex", flexDirection:"column" }}>

      <style>{CSS}</style>

      {/* ── Aurora blobs ── */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
        <div className="blob1" style={{ position:"absolute", width:280, height:280, top:-60, left:-60,
          borderRadius:"50%", background:"#FF6B6B", filter:"blur(55px)", opacity:.45, mixBlendMode:"multiply" }}/>
        <div className="blob2" style={{ position:"absolute", width:240, height:240, top:-40, right:-40,
          borderRadius:"50%", background:"#A29BFE", filter:"blur(55px)", opacity:.45, mixBlendMode:"multiply" }}/>
        <div className="blob3" style={{ position:"absolute", width:200, height:200, top:160, left:"50%",
          borderRadius:"50%", background:"#FD79A8", filter:"blur(55px)", opacity:.28, mixBlendMode:"multiply" }}/>
        <div className="blob4" style={{ position:"absolute", width:320, height:200, bottom:-40, left:-40,
          borderRadius:"50%", background:"#FFEAA7", filter:"blur(55px)", opacity:.55, mixBlendMode:"multiply" }}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(248,244,240,0.55)" }}/>
      </div>

      {/* ── Status bar ── */}
      <div style={{ position:"relative", zIndex:20, display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"14px 24px 8px" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#0D0D0D", letterSpacing:"-0.02em" }}>{clock}</span>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, color:"#0D0D0D" }}>
          <span>●●●</span><span>WiFi</span><span>🔋</span>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="noscroll" style={{ position:"relative", zIndex:10, flex:1,
        overflowY:"auto", padding:"0 14px 32px", display:"flex", flexDirection:"column", gap:11 }}>

        {/* ── CARD 1: Profile ── */}
        <div className="up d1" style={glass}>
          <div style={{ padding:"22px 20px 18px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>

              {/* Photo */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <div className="bspin" style={{ position:"absolute", inset:-3, borderRadius:"50%", zIndex:0 }}/>
                <div style={{ position:"absolute", inset:-1, borderRadius:"50%", background:"white", zIndex:1 }}/>
                <div style={{ width:78, height:78, borderRadius:"50%", overflow:"hidden",
                  position:"relative", zIndex:2,
                  background:"linear-gradient(135deg,#FF9F43,#A29BFE)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {/*
                    ── PHOTO INTEGRATION ──
                    Replace the span below with:
                    <img src="/rehman.jpeg" alt="Bipin Kumar"
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 10%" }} />
                  */}
                  <span style={{ fontSize:24, fontWeight:800, color:"white" }}>BK</span>
                </div>
                <div className="odot" style={{ position:"absolute", bottom:3, right:3, zIndex:3,
                  width:12, height:12, borderRadius:"50%", background:"#00C48C", border:"2px solid white" }}/>
              </div>

              {/* Name + meta */}
              <div style={{ flex:1, paddingTop:2 }}>
                <p style={{ fontSize:10, fontWeight:500, letterSpacing:"0.15em",
                  textTransform:"uppercase", color:"rgba(13,13,13,0.4)", marginBottom:3 }}>{greeting}</p>
                <span style={{ display:"block", fontFamily:"'DM Serif Display',serif",
                  fontStyle:"italic", fontSize:27, lineHeight:1, color:"#0D0D0D", letterSpacing:"-0.02em" }}>
                  Bipin
                </span>
                <span style={{ display:"block", position:"relative", fontWeight:800,
                  fontSize:29, lineHeight:1, letterSpacing:"-0.04em",
                  background:"linear-gradient(135deg,#FF6B6B 0%,#FF9F43 50%,#A29BFE 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Kumar
                  <span className="nameshim" style={{ position:"absolute", inset:0 }}/>
                </span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:7 }}>
                  <span style={{ fontSize:9, fontWeight:500, letterSpacing:"0.06em",
                    background:"rgba(13,13,13,0.06)", color:"#3D3535",
                    borderRadius:100, padding:"3px 8px" }}>📍 Bihar, India</span>
                  <span style={{ fontSize:9, fontWeight:500, letterSpacing:"0.06em",
                    background:"linear-gradient(135deg,rgba(255,107,107,0.1),rgba(162,155,254,0.1))",
                    border:"1px solid rgba(162,155,254,0.25)", color:"#7C6DD0",
                    borderRadius:100, padding:"3px 8px" }}>BPSC 2026</span>
                </div>
              </div>
            </div>

            {/* Typing row */}
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 13px",
              background:"rgba(13,13,13,0.04)", border:"1px solid rgba(13,13,13,0.06)", borderRadius:12 }}>
              <span style={{ fontSize:10, color:"rgba(13,13,13,0.4)" }}>Currently —</span>
              <span style={{ fontSize:12, fontWeight:600, color:"#0D0D0D", letterSpacing:"-0.01em" }}>{typed}</span>
              <span className="cur" style={{ display:"inline-block", width:2, height:12,
                background:"#FF6B6B", borderRadius:1, flexShrink:0 }}/>
            </div>
          </div>
        </div>

        {/* ── CARD 2: Stats ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
          {[
            { cls:"d2", icon:"⚡", val:"500+", lbl:"Study Hours", ibg:"rgba(255,159,67,0.15)", grad:"linear-gradient(135deg,#FF9F43,#FF6B6B)" },
            { cls:"d3", icon:"🎓", val:"B.Ed",  lbl:"In Progress", ibg:"rgba(162,155,254,0.15)", grad:"linear-gradient(135deg,#A29BFE,#FD79A8)" },
          ].map(s => (
            <div key={s.val} className={`up ${s.cls}`}
              style={{ ...glass, padding:"18px 16px", display:"flex", flexDirection:"column",
                justifyContent:"space-between", minHeight:105 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:s.ibg,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:30, lineHeight:1, letterSpacing:"-0.04em",
                  background:s.grad, WebkitBackgroundClip:"text",
                  WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{s.val}</div>
                <div style={{ fontSize:10, fontWeight:500, color:"rgba(13,13,13,0.4)",
                  letterSpacing:"0.04em", marginTop:2 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CARD 3: Quote ── */}
        <div className="up d4" style={{ ...glass, padding:"20px 20px", position:"relative", overflow:"hidden",
          background:"linear-gradient(135deg,rgba(255,107,107,0.08),rgba(162,155,254,0.08))" }}>
          <div style={{ position:"absolute", top:-12, left:12, fontFamily:"'DM Serif Display',serif",
            fontSize:96, lineHeight:1, userSelect:"none", pointerEvents:"none",
            background:"linear-gradient(135deg,rgba(255,107,107,0.15),rgba(162,155,254,0.15))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>"</div>
          <p style={{ fontFamily:"'DM Serif Display',serif", fontStyle:"italic",
            fontSize:16, lineHeight:1.6, color:"#0D0D0D", letterSpacing:"-0.01em",
            position:"relative", zIndex:1, marginBottom:10 }}>
            From{" "}
            <span style={{ fontStyle:"normal",
              background:"linear-gradient(135deg,#FF6B6B,#A29BFE)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Student
            </span>
            {" "}to Civil Servant —<br/>one relentless step at a time.
          </p>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.2em",
            textTransform:"uppercase", color:"rgba(13,13,13,0.35)" }}>— Bipin Kumar's Mission</p>
        </div>

        {/* ── CARD 4: Tags ── */}
        <div className="up d5" style={{ ...glass, padding:"16px 16px" }}>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.2em",
            textTransform:"uppercase", color:"rgba(13,13,13,0.4)", marginBottom:10 }}>Identity</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {TAGS.map(t => (
              <span key={t.text} style={{ padding:"5px 12px", borderRadius:100,
                fontSize:11, fontWeight:600, letterSpacing:"-0.01em",
                background:t.bg, color:t.color }}>{t.text}</span>
            ))}
          </div>
        </div>

        {/* ── CARD 5: Progress ── */}
        <div className="up d6" style={{ ...glass, padding:"18px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:13 }}>
            <span style={{ fontSize:13, fontWeight:700, letterSpacing:"-0.02em", color:"#0D0D0D" }}>
              Preparation Track
            </span>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
              background:"rgba(85,239,196,0.15)", color:"#00B894", borderRadius:100, padding:"3px 8px" }}>
              Active
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {PROGRESS.map((p, i) => (
              <div key={p.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:500, color:"#3D3535" }}>{p.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:"#0D0D0D" }}>{p.pct}%</span>
                </div>
                <div style={{ height:5, background:"rgba(13,13,13,0.07)", borderRadius:100, overflow:"hidden" }}>
                  <div className={`pgrow pg${i+1}`}
                    style={{ height:"100%", borderRadius:100, background:p.grad, width:`${p.pct}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CARD 6: CTA ── */}
        <div className="up d7 shine" style={{ borderRadius:24, padding:"18px 18px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          cursor:"pointer", position:"relative", overflow:"hidden",
          background:"linear-gradient(135deg,#0D0D0D 0%,#2D2520 100%)",
          boxShadow:"0 2px 0 rgba(255,255,255,0.06) inset,0 20px 60px -12px rgba(13,13,13,0.4)" }}>
          <div>
            <p style={{ fontSize:9, fontWeight:500, letterSpacing:"0.2em",
              textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:4 }}>Explore</p>
            <p style={{ fontWeight:800, fontSize:21, letterSpacing:"-0.03em", lineHeight:1,
              background:"linear-gradient(135deg,#FF9F43,#FF6B6B,#A29BFE)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              My Journey →
            </p>
          </div>
          <div style={{ width:42, height:42, borderRadius:"50%",
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, color:"rgba(255,255,255,0.6)", flexShrink:0 }}>↗</div>
        </div>

        {/* ── CARD 7: Connect ── */}
        <div className="up d8" style={{ ...glass, padding:"14px 14px",
          display:"flex", alignItems:"center", gap:10 }}>
          {LINKS.map(l => (
            <a key={l.label} href={l.href} style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:4, textDecoration:"none" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:l.bg,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:17, marginBottom:2 }}>{l.icon}</div>
              <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"rgba(13,13,13,0.4)" }}>{l.label}</span>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
