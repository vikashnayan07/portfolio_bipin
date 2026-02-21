-- ═══════════════════════════════════════════════════════════
--  SEED DATA: Migrate hardcoded Projects & Blog Posts into Supabase
--  Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. PROJECTS ───────────────────────────────────────────
INSERT INTO projects (title, description, tech_stack, live_url, github_url, is_featured, sort_order)
VALUES
(
  'BPSC Complete Notes',
  'Comprehensive study notes covering all BPSC Prelims & Mains topics — Indian History, Geography, Polity, Economy, and Bihar-specific GK.',
  ARRAY['General Studies', 'Bihar GK', 'Indian Polity'],
  '#',
  '',
  true,
  1
),
(
  'Bihar History Research',
  'In-depth research project on Bihar''s role in India''s freedom movement — from Champaran Satyagraha to the Quit India Movement in Bihar.',
  ARRAY['History', 'Research', 'Bihar Heritage'],
  '#',
  '',
  false,
  2
),
(
  'B.Ed Teaching Portfolio',
  'Collection of lesson plans, teaching methodologies, and classroom management strategies developed during B.Ed practicum.',
  ARRAY['Pedagogy', 'Lesson Plans', 'Teaching'],
  '#',
  '',
  false,
  3
),
(
  'Current Affairs Digest',
  'Monthly compilation of important current affairs for BPSC, covering national & international events, government schemes, and Bihar developments.',
  ARRAY['Current Affairs', 'Monthly Digest', 'BPSC'],
  '#',
  '',
  false,
  4
),
(
  'Essay & Answer Writing',
  'Curated collection of model essays & answer writing practice for BPSC Mains — covering ethics, governance, social issues, and Bihar development.',
  ARRAY['Essay Writing', 'Mains Prep', 'Ethics'],
  '#',
  '',
  false,
  5
),
(
  'Community Study Group',
  'Founded a peer study group of 30+ BPSC aspirants for collaborative learning, doubt sessions, and mock test discussions.',
  ARRAY['Community', 'Peer Learning', 'Leadership'],
  '#',
  '',
  false,
  6
);


-- ─── 2. BLOG POSTS ─────────────────────────────────────────
INSERT INTO blog_posts (title, slug, content, excerpt, is_published, tags, read_time, views)
VALUES
(
  'How I Structure My BPSC Preparation: A Complete Study Plan',
  'bpsc-preparation-complete-study-plan',
  '<h2>My Proven BPSC Study Plan</h2><p>Sharing my proven timetable strategy: subject-wise breakdown, revision cycles, and balancing daily current affairs with deep study. This comprehensive guide covers how I divide my day into focused study blocks, handle revision, and stay consistent throughout the preparation journey.</p><h3>Morning Routine (6 AM - 12 PM)</h3><p>I dedicate mornings to fresh subjects like Indian Polity and Economy which need maximum concentration. I follow the 50-10 rule — 50 minutes of focused study followed by a 10-minute break.</p><h3>Afternoon Block (2 PM - 6 PM)</h3><p>Post-lunch hours are reserved for History, Geography, and answer writing practice. I make sure to write at least 2-3 model answers daily.</p><h3>Evening Session (7 PM - 10 PM)</h3><p>Current affairs, revision of morning topics, and test series analysis. I maintain a daily current affairs diary which has been a game-changer.</p>',
  'Sharing my proven timetable strategy: subject-wise breakdown, revision cycles, and balancing daily current affairs with deep study.',
  true,
  ARRAY['BPSC', 'Study Plan', 'Strategy'],
  8,
  124
),
(
  'Bihar''s Forgotten Heroes: Untold Stories from the Freedom Struggle',
  'bihar-forgotten-heroes-freedom-struggle',
  '<h2>Bihar''s Role in India''s Independence</h2><p>A deep-dive into Bihar''s immense contribution to India''s independence movement — from Champaran Satyagraha to the Quit India movement.</p><h3>Champaran Satyagraha (1917)</h3><p>Bihar became the birthplace of Gandhian Satyagraha when Mahatma Gandhi arrived in Champaran to fight for the rights of indigo farmers. This movement changed the course of India''s freedom struggle.</p><h3>The Quit India Movement in Bihar</h3><p>Bihar played a pivotal role in the 1942 Quit India Movement. The people of Bihar showed extraordinary courage and sacrifice that often goes unrecognized in mainstream narratives.</p><h3>Unsung Heroes</h3><p>From Rajendra Prasad to Jayaprakash Narayan, Bihar has given India some of its finest leaders. This article explores the lesser-known freedom fighters from Bihar who deserve recognition.</p>',
  'A deep-dive into Bihar''s immense contribution to India''s independence movement — from Champaran Satyagraha to the Quit India movement.',
  true,
  ARRAY['Bihar History', 'Freedom Struggle', 'Research'],
  12,
  98
),
(
  'Understanding Pedagogy: Why Child-Centric Education Matters',
  'understanding-pedagogy-child-centric-education',
  '<h2>Child-Centric Education: A B.Ed Perspective</h2><p>My reflections from B.Ed — how constructivist pedagogy, activity-based learning, and inclusive classrooms can transform rural Bihar.</p><h3>What is Constructivist Pedagogy?</h3><p>Instead of treating students as passive receivers of knowledge, constructivist pedagogy encourages them to build understanding through experience, discussion, and reflection.</p><h3>Activity-Based Learning in Practice</h3><p>During my B.Ed practicum, I implemented activity-based learning in a rural Bihar school. The results were remarkable — student engagement increased dramatically, and learning outcomes improved significantly.</p><h3>Inclusive Classrooms</h3><p>Every child deserves quality education regardless of their background. Creating an inclusive classroom environment is not just an ideal — it''s a necessity for rural Bihar''s educational transformation.</p>',
  'My reflections from B.Ed — how constructivist pedagogy, activity-based learning, and inclusive classrooms can transform rural Bihar.',
  true,
  ARRAY['B.Ed', 'Pedagogy', 'Education'],
  6,
  75
),
(
  'Current Affairs April 2025: Top 30 Questions for BPSC Prelims',
  'current-affairs-april-2025-bpsc-prelims',
  '<h2>April 2025 Current Affairs for BPSC</h2><p>A curated list of the most probable BPSC-relevant current affairs from April 2025, with one-liner answers and source links.</p><h3>National Events</h3><p>1. India launched its first indigenous green hydrogen fuel cell bus.<br>2. The new National Education Policy amendments were announced.<br>3. India''s GDP growth rate for Q4 FY2025 was recorded at 7.2%.</p><h3>Bihar-Specific Developments</h3><p>1. Bihar announced a new industrial policy for 2025-2030.<br>2. The Patna Metro project achieved a major milestone.<br>3. Bihar''s literacy rate improved to 72.5% as per the latest survey.</p><h3>International Affairs</h3><p>Key international developments relevant to BPSC prelims including diplomatic relations, trade agreements, and global organizations updates.</p>',
  'A curated list of the most probable BPSC-relevant current affairs from April 2025, with one-liner answers and source links.',
  true,
  ARRAY['Current Affairs', 'BPSC', 'Prelims'],
  10,
  210
),
(
  'Essay Writing Masterclass: How to Score 150+ in BPSC Mains',
  'essay-writing-masterclass-bpsc-mains',
  '<h2>Score 150+ in BPSC Mains Essays</h2><p>Structure, vocabulary, and argumentation techniques that I use to craft high-scoring essays on social, political, and ethical topics.</p><h3>The Perfect Essay Structure</h3><p>Every high-scoring essay follows a clear structure: Introduction with a hook, 3-4 body paragraphs with arguments and counter-arguments, and a powerful conclusion. I break down each component with examples.</p><h3>Vocabulary That Impresses</h3><p>Using the right vocabulary elevates your essay. I maintain a curated word bank of 200+ power words categorized by topic — governance, ethics, society, and economy.</p><h3>Practice Strategy</h3><p>Write one essay daily. Start with 45 minutes and gradually reduce to 30. Get feedback from peers and mentors. Analyze toppers'' essays for patterns.</p>',
  'Structure, vocabulary, and argumentation techniques that I use to craft high-scoring essays on social, political, and ethical topics.',
  true,
  ARRAY['Essay Writing', 'BPSC Mains', 'Tips'],
  9,
  156
),
(
  'The Power of Group Study: Building a BPSC Community in Bihar',
  'power-of-group-study-bpsc-community',
  '<h2>Building a Study Community</h2><p>How I formed a 20-member study group, our weekly discussion format, and how peer learning accelerated my preparation.</p><h3>Why Group Study Works</h3><p>Preparing alone for BPSC can be isolating. A study group provides motivation, diverse perspectives, and accountability. When one person explains a concept to others, everyone benefits.</p><h3>Our Weekly Format</h3><p>Every Sunday, we have a 3-hour session: 1 hour for current affairs discussion, 1 hour for topic deep-dive, and 1 hour for mock test review. This structured approach has been incredibly effective.</p><h3>How to Start Your Own Group</h3><p>Start small with 5-6 serious aspirants. Set clear rules: regular attendance, preparation before sessions, and mutual respect. Use WhatsApp for daily coordination and meet weekly in person.</p>',
  'How I formed a 20-member study group, our weekly discussion format, and how peer learning accelerated my preparation.',
  true,
  ARRAY['Community', 'Study Group', 'Motivation'],
  5,
  88
);

-- ─── VERIFY INSERTS ────────────────────────────────────────
SELECT 'Projects inserted: ' || count(*) FROM projects WHERE is_deleted = false;
SELECT 'Blog posts inserted: ' || count(*) FROM blog_posts WHERE is_deleted = false AND is_published = true;
