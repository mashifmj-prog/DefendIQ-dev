/* DefendIQ full interactive script.js
   - Handles landing -> dashboard
   - Dropdown module selection with watermark
   - 10 realistic questions per module
   - Next/Prev navigation, animations
   - Module progress, streak, badges, localStorage
   - Certificate print / download (PNG & PDF) & share
*/

/* ---------- DOM ---------- */
const startBtn = document.getElementById('startBtn');
const landing = document.getElementById('landing');
const app = document.getElementById('app');
const homeBtn = document.getElementById('homeBtn');
const moduleSelect = document.getElementById('moduleSelect');
const moduleBody = document.getElementById('moduleBody');
const moduleHeader = document.getElementById('moduleHeader');
const closeModuleBtn = document.getElementById('closeModuleBtn');

const streakDOM = document.getElementById('streak');
const pointsDOM = document.getElementById('points');
const completionDOM = document.getElementById('completion');
const badgesDOM = document.getElementById('badges');

/* ---------- persistent stats ---------- */
let stats = JSON.parse(localStorage.getItem('defendiq_stats')) || {
  streak: 0,
  points: 0,
  completion: 0,
  badges: []  // names of completed modules
};

/* helper to save */
function saveStats(){ localStorage.setItem('defendiq_stats', JSON.stringify(stats)); }

/* update UI */
function refreshStatsUI(){
  streakDOM.textContent = stats.streak;
  pointsDOM.textContent = stats.points;
  completionDOM.textContent = stats.completion + '%';
  badgesDOM.innerHTML = stats.badges.length ? stats.badges.map(b => `<span class="badge flash">${b}</span>`).join(' ') : 'None';
}
refreshStatsUI();

/* ---------- modules + realistic questions (10 each) ---------- */
const MODULES = {
  keymessage: {
    title: 'Key Message',
    questions: [
      { q:"Why is cybersecurity awareness important in a company?", opts:["Reduces risk of breaches","Slows employees","Costs more","Is optional"], a:0 },
      { q:"What should you do when you receive unexpected attachments?", opts:["Open immediately","Scan and verify sender","Forward to all","Ignore permanently"], a:1 },
      { q:"Phone requests for credentials should be handled how?", opts:["Share immediately","Verify caller and escalate","Assume it's HR","Post online"], a:1 },
      { q:"What is multi-factor authentication (MFA)?", opts:["Single password","Two or more verification methods","Antivirus","Firewall only"], a:1 },
      { q:"When to change passwords?", opts:["Never","After breach or periodically","Every hour","When bored"], a:1 },
      { q:"What is a safe way to report a suspected incident?", opts:["Public social post","Notify IT/security via official channel","Delete evidence","Ignore"], a:1 },
      { q:"How should sensitive files be sent?", opts:["Open email","Use approved encrypted transfer","Share on messenger","Share via USB left on desk"], a:1 },
      { q:"Which behavior strengthens security culture?", opts:["Ignoring policies","Regular training and reporting","Using weak passwords","Sharing logins"], a:1 },
      { q:"What to do with suspicious links?", opts:["Click to see","Hover to inspect, verify sender","Forward blindly","Reply with credentials"], a:1 },
      { q:"Who is responsible for security?", opts:["Only IT","Every employee","Only executives","Only security team"], a:1 }
    ]
  },

  deepfake: {
    title: 'Deepfake Awareness',
    questions: [
      { q:"What is a deepfake?", opts:["AI-generated fake media","A firewall","A password type","A network switch"], a:0 },
      { q:"A red flag for deepfake video is:", opts:["Perfect lip sync","Unnatural facial movement","Crystal clear audio always","Very long length"], a:1 },
      { q:"Deepfakes can be used for:", opts:["Impersonation for fraud","Improving passwords","Faster internet","Reducing spam"], a:0 },
      { q:"If CEO voice asks urgent money transfer, you should:", opts:["Comply immediately","Verify using known contact method","Post on social","Ignore"], a:1 },
      { q:"A defense against deepfakes is:", opts:["Verify identity via multiple channels","Rely only on email","Trust all video","Give full access"], a:0 },
      { q:"Suspicious deepfake content often has:", opts:["Perfect background","Slight visual glitches or lip-sync issues","High reliability","Extra clarity"], a:1 },
      { q:"How to report suspected deepfake?", opts:["Share widely","Report to security and manager","Delete device","Edit and repost"], a:1 },
      { q:"Deepfakes are produced using:", opts:["Neural networks and machine learning","Manual drawings only","Antivirus engines","Routers"], a:0 },
      { q:"When asked to confirm money transfer in video call:", opts:["Transfer at once","Confirm via official phone number or email","Assume safe","Give credentials"], a:1 },
      { q:"Best prevention is:", opts:["Training to spot signs and verification procedures","Avoiding all calls","Turning off camera","Removing backups"], a:0 }
    ]
  },

  reporting: {
    title: 'Reporting Security Incidents',
    questions: [
      { q:"Why report quickly?", opts:["Speeds investigation and containment","Causes panic","Is not necessary","Annoys IT"], a:0 },
      { q:"What info helps an incident report?", opts:["Screenshots, timestamps, sender details","Only feelings","No details","Random data"], a:0 },
      { q:"Reporting channels should be:", opts:["Unofficial chat only","Official IT/security channels","Public forum","Email to attacker"], a:1 },
      { q:"If you clicked a malicious link, you should:", opts:["Wait and see","Report immediately and isolate device","Keep using","Share with colleagues"], a:1 },
      { q:"Who do you include in the initial report?", opts:["Only yourself","Your manager and IT/security as required","Social media","Only HR"], a:1 },
      { q:"Incident reporting helps to:", opts:["Prevent spread, preserve evidence, improve controls","Hide breaches","Make false claims","Reduce workload"], a:0 },
      { q:"Do not do after incident:", opts:["Turn off machine, disconnect, preserve evidence","Delete logs or hide evidence","Follow incident team guidance","Provide details"], a:1 },
      { q:"A clear incident report should be:", opts:["Concise, factual, timestamped","Long and emotional","Vague","Full of rumors"], a:0 },
      { q:"Who typically manages incident response?", opts:["Security/IT (with management)","Sales","Reception","Marketing"], a:0 },
      { q:"Practicing reporting procedures helps:", opts:["Speed real response","Confuse team","Ignore incidents","Hide information"], a:0 }
    ]
  },

  culture: {
    title: 'Culture Survey',
    questions: [
      { q:"What helps a strong security culture?", opts:["Open communication and training","Ignoring policy","Sharing passwords","Avoiding reporting"], a:0 },
      { q:"Employees contribute by:", opts:["Reporting suspicious activity","Avoiding training","Hiding issues","Sharing credentials"], a:0 },
      { q:"Frequent training results in:", opts:["Better awareness and fewer incidents","More breaches","Slower work","Confusion"], a:0 },
      { q:"Management role in culture is to:", opts:["Model good behavior and support security","Ignore it","Assign blame","Decrease budget"], a:0 },
      { q:"Trustworthy behavior includes:", opts:["Following policies and reporting","Bypassing procedures","Hoarding knowledge","Hiding incidents"], a:0 },
      { q:"Good feedback loops mean:", opts:["Employees get constructive responses when they report","Reports are ignored","Only managers are informed","Public shaming"], a:0 },
      { q:"A weak culture sign is:", opts:["Frequent unsafe shortcuts","Robust reporting","Regular training","Positive rewards"], a:0 },
      { q:"Encouraging questions leads to:", opts:["Better awareness","No change","More incidents","Fewer reports"], a:0 },
      { q:"Recognition for vigilance encourages:", opts:["More reporting and care","Less responsibility","Blocking tools","Isolation"], a:0 },
      { q:"Culture improvements require:", opts:["Time, resources, leadership support","Nothing","Only tech tools","Only policies"], a:0 }
    ]
  },

  social: {
    title: 'Social Engineering',
    questions: [
      { q:"What is social engineering?", opts:["Manipulating people to reveal secrets","A software update","A firewall rule","Antivirus"], a:0 },
      { q:"Red flags in phone social engineering:", opts:["Sense of urgency, pressure to act, odd caller ID","Perfect grammar","Long hold music","Friendly voice only"], a:0 },
      { q:"If asked for credentials by caller:", opts:["Verify identity via official channel","Share immediately","Hang up and reshare","Text credentials"], a:0 },
      { q:"Attackers may use:", opts:["Public info to build trust","Random numbers","Authorized badges","Software patches"], a:0 },
      { q:"To defend, we should:", opts:["Train employees and verify requests","Ignore all callers","Disable phones","Post credentials publicly"], a:0 },
      { q:"Phishing emails often include:", opts:["Urgency, spoofed domains, misspellings","Clear sender identity","Personal invite from CEO always","Encrypted attachments only"], a:0 },
      { q:"When partner requests sensitive data:", opts:["Verify via official channels before sharing","Share immediately","Put on social media","Assume safe"], a:0 },
      { q:"Social engineering uses:", opts:["Psychology and trust exploitation","Only technology","Only bots","Only spammers"], a:0 },
      { q:"Spotting social engineering requires:", opts:["Skepticism and verification","Blind trust","No training","Only IT knowledge"], a:0 },
      { q:"What to do when you suspect an attempt?", opts:["Report to security and preserve evidence","Share it with everyone","Delete evidence","Ignore it"], a:0 }
    ]
  },

  phishing: {
    title: 'Phishing Simulation',
    questions: [
      { q:"'Urgent – update your password' from unknown domain. You:", opts:["Hover, inspect sender, do not click; report","Click and type password","Forward to all","Reply with credentials"], a:0 },
      { q:"Suspicious attachment from supplier, you:", opts:["Verify with sender using known contact, scan file","Open immediately","Send to HR only","Ignore the email permanently"], a:0 },
      { q:"A link that shortens domain should be:", opts:["Inspected via right tools or hover reveal","Trusted","Clicked only on mobile","Pasted in social"], a:0 },
      { q:"Unexpected invoice should be:", opts:["Confirmed with vendor via official channel","Paid immediately","Forwarded","Approved"], a:0 },
      { q:"Sender address slightly off (e.g., @rn instead of @m)", opts:["Flag as suspicious and report","Assume safe","Reply with credentials","Sign contract"], a:0 },
      { q:"Email asking for payroll change from manager:", opts:["Verify in person or via official process","Change immediately","Share bank details","Ignore"], a:0 },
      { q:"Attachments with odd file types should be:", opts:["Not opened until verified","Opened on phone","Uploaded publicly","Shared on chat"], a:0 },
      { q:"Link leads to login page but domain mismatch:", opts:["Do not enter credentials; report","Enter credentials","Share screenshot","Approve access"], a:0 },
      { q:"Phishing training helps by:", opts:["Teaching recognition and response","Making employees click more","Increasing risk","Reducing reporting"], a:0 },
      { q:"When in doubt:", opts:["Report to security and IT quickly","Ignore it","Assume safe","Delete the email only"], a:0 }
    ]
  },

  password: {
    title: 'Password Training',
    questions: [
      { q:"Strong passwords should be:", opts:["Long, unique, with mixed characters","Your name","123456","Repeated across accounts"], a:0 },
      { q:"Using a password manager is:", opts:["Recommended for generating and storing strong passwords","Unsafe","Illegal","Only for admins"], a:0 },
      { q:"Reusing passwords across sites is:", opts:["Risky and should be avoided","Efficient","Secure","Required"], a:0 },
      { q:"Two-factor authentication does:", opts:["Add a second form of verification","Replace passwords entirely","Make logins slower","Is optional always"], a:0 },
      { q:"Storing passwords in plain text is:", opts:["Dangerous","Standard practice","OK if private","Recommended"], a:0 },
      { q:"A passphrase is:", opts:["A long memorable phrase used as a password","Short code","Password manager","Firewall rule"], a:0 },
      { q:"When password is compromised:", opts:["Change immediately and notify IT","Change next year","Ignore","Share with colleagues"], a:0 },
      { q:"Best practice for shared accounts is:", opts:["Use managed credentials and rotate them regularly","Share freely","Use sticky notes","Write in a public doc"], a:0 },
      { q:"Password complexity helps by:", opts:["Making brute-force attacks harder","Simplifying logins","Ensuring reuse","Removing MFA"], a:0 },
      { q:"If you must write a password temporarily:", opts:["Remove it securely and use manager","Leave it on desk","Publish it","Email it"], a:0 }
    ]
  }
};

/* ---------- state for current module ---------- */
let current = {
  key: null,      // module key eg 'deepfake'
  idx: 0          // current question index
};

/* ---------- landing -> app ---------- */
startBtn.addEventListener('click', () => {
  landing.classList.add('hidden');
  app.classList.remove('hidden');
});

/* ---------- home button (back to landing) ---------- */
homeBtn.addEventListener('click', () => {
  // flicker animation handled by CSS :active; go to landing
  app.classList.add('hidden');
  landing.classList.remove('hidden');
});

/* ---------- dropdown interactions ---------- */
/* watermark behavior - show watermark only when no selection */
const watermark = document.querySelector('.select-wrap .watermark');
moduleSelect.addEventListener('focus', ()=> watermark.style.opacity = 0.2);
moduleSelect.addEventListener('blur', ()=> watermark.style.opacity = 1);

moduleSelect.addEventListener('change', () => {
  const v = moduleSelect.value;
  if(!v || v === "") return;
  if(v === 'exit'){
    // reset
    moduleSelect.selectedIndex = 0;
    moduleBody.innerHTML = `<div class="welcome-message">DefendIQ: Your trusted partner in training</div>`;
    closeModule(); // reset state
    return;
  }
  openModule(v);
});

/* close module button resets dropdown and content */
closeModuleBtn.addEventListener('click', () => {
  moduleSelect.selectedIndex = 0;
  closeModule();
});

/* ---------- open module ---------- */
function openModule(key){
  current.key = key;
  current.idx = 0;
  renderQuestion();
  // set header title
  const title = MODULES[key] ? MODULES[key].title : key;
  document.querySelector('.module-title')?.replaceWith(createModuleTitleElem(title));
}

/* helper to create a title element */
function createModuleTitleElem(title){
  const el = document.createElement('div');
  el.className = 'module-title';
  el.textContent = title;
  return el;
}

/* ---------- render question ---------- */
function renderQuestion(){
  if(!current.key) return;
  const mod = MODULES[current.key];
  const qObj = mod.questions[current.idx];

  // progress percent within module
  const pct = Math.round(((current.idx+1) / mod.questions.length) * 100);

  // render HTML
  moduleBody.innerHTML = `
    <div class="question-card" aria-live="polite">
      <div class="q-text">${sanitize(qObj.q)}</div>
      <div class="options">
        ${qObj.opts.map((o,i)=>`<button class="opt-btn" data-i="${i}">${sanitize(o)}</button>`).join('')}
      </div>
      <div class="progress-wrap">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
      </div>
      <div class="controls">
        <button class="prev-btn" ${current.idx===0? 'disabled':''}>Previous</button>
        <button class="next-btn" ${current.idx===mod.questions.length-1? '':'disabled'}>Next Question</button>
        <div style="flex:1"></div>
        <div class="badge-strip" aria-hidden="true">
          ${stats.badges && stats.badges.length ? stats.badges.map(b=>`<span class="badge">${b}</span>`).join('') : ''}
        </div>
      </div>
    </div>`;

  // attach handlers
  moduleBody.querySelectorAll('.opt-btn').forEach(btn => btn.addEventListener('click', onOptionClicked));
  const prev = moduleBody.querySelector('.prev-btn');
  const next = moduleBody.querySelector('.next-btn');

  prev?.addEventListener('click', () => {
    if(current.idx>0){ current.idx--; slideTransition('left'); renderQuestion(); }
  });

  // Next button initially disabled until answer selected. We'll handle enabling.
  if(current.idx === mod.questions.length -1){
    // Last question -> change Next to Finish
    next.textContent = 'Finish Module';
    next.disabled = true;
    next.addEventListener('click', finishModule);
  } else {
    next.textContent = 'Next Question';
    next.disabled = true; // becomes enabled after selecting an answer
    next.addEventListener('click', () => {
      if(current.idx < mod.questions.length -1){ current.idx++; slideTransition('right'); renderQuestion(); }
    });
  }

  // update small progress bar globally:
  updateGlobalProgress();
}

/* ---------- sanitize helper to avoid injection in demo */
function sanitize(s){ return String(s).replace(/</g,"&lt;").replace(/>/g,"&gt;") }

/* ---------- option click handler ---------- */
function onOptionClicked(ev){
  const btn = ev.currentTarget;
  const chosenIndex = Number(btn.dataset.i);
  const mod = MODULES[current.key];
  const qObj = mod.questions[current.idx];

  // disable all options, mark correct/incorrect
  moduleBody.querySelectorAll('.opt-btn').forEach(ob=>{
    ob.disabled = true;
    const idx = Number(ob.dataset.i);
    if(mod.questions[current.idx].opts[idx] === qObj.opts[qObj.a]) {
      ob.classList.add('correct');
    }
    if(idx === chosenIndex && qObj.a !== idx) ob.classList.add('incorrect');
  });

  // award points & streak if correct
  if(chosenIndex === qObj.a){
    stats.points += 10;
    stats.streak += 1;
    // small confetti-like visual: we'll flash the next button via CSS
    flashNextButton();
  } else {
    // incorrect resets streak
    stats.streak = 0;
  }

  // enable next or finish button
  const nextBtn = moduleBody.querySelector('.next-btn');
  if(nextBtn) nextBtn.disabled = false;

  // mark current module progress in temporary store so progress persists
  // We store per-module answeredCount (basic)
  const keyProgress = JSON.parse(localStorage.getItem('defendiq_module_progress') || '{}');
  const prog = keyProgress[current.key] || {answered: []};
  // mark this question answered (avoid duplicate awarding)
  if(!prog.answered.includes(current.idx)){
    prog.answered.push(current.idx);
    keyProgress[current.key] = prog;
    localStorage.setItem('defendiq_module_progress', JSON.stringify(keyProgress));
  }

  // update completion and UI
  updateModuleCompletionStats();
  saveAndRefresh();
}

/* ---------- update module completion and global completion ---------- */
function updateModuleCompletionStats(){
  const keyProgress = JSON.parse(localStorage.getItem('defendiq_module_progress') || '{}');
  const totalModules = Object.keys(MODULES).length;
  // completed modules = badges length
  // We compute overall completion as percent of modules completed
  stats.completion = Math.round((stats.badges.length / totalModules) * 100);
}

/* ---------- flash next button effect ---------- */
function flashNextButton(){
  const nextBtn = moduleBody.querySelector('.next-btn');
  if(!nextBtn) return;
  nextBtn.animate([
    { transform: 'scale(1)', boxShadow: '0 0 8px rgba(255,204,0,0.5)' },
    { transform: 'scale(1.06)', boxShadow: '0 0 24px rgba(255,204,0,0.95)' }
  ], { duration: 450, iterations: 1 });
}

/* ---------- slide transition (moduleBody) ---------- */
function slideTransition(dir='right'){
  moduleBody.style.transition = 'transform .28s ease, opacity .28s ease';
  moduleBody.style.opacity = '0';
  moduleBody.style.transform = dir === 'right' ? 'translateX(12px)' : 'translateX(-12px)';
  setTimeout(()=>{ moduleBody.style.opacity = '1'; moduleBody.style.transform='translateX(0)'; }, 260);
}

/* ---------- next/finish flow ---------- */
function finishModule(){
  // mark module as completed (add badge if not present)
  if(!stats.badges.includes(MODULES[current.key].title)){
    stats.badges.push(MODULES[current.key].title);
  }
  // award some points for finishing
  stats.points += 50;
  stats.streak += 1;
  // compute new completion
  updateModuleCompletionStats();
  saveAndRefresh();

  // show certificate area within moduleBody
  showCertificate(MODULES[current.key].title);
}

/* close module resets selection & module content */
function closeModule(){
  current.key = null; current.idx = 0;
  moduleSelect.selectedIndex = 0;
  moduleBody.innerHTML = `<div class="welcome-message">DefendIQ: Your trusted partner in training</div>`;
  // restore module title
  const t = document.querySelector('.module-title');
  if(t) t.textContent = 'DefendIQ: Your trusted partner in training';
  saveAndRefresh();
}

/* ---------- save & refresh ---------- */
function saveAndRefresh(){
  saveStats();
  refreshStatsUI();
}

/* ---------- certificate rendering & actions ---------- */
function showCertificate(moduleName){
  // populate cert template (use the hidden certificateTemplate container in DOM)
  const cTemp = document.getElementById('certificateTemplate');
  if(!cTemp){
    // fallback: insert inline
    moduleBody.innerHTML = certificateHTML(moduleName);
  } else {
    // build certificate HTML from template
    const certHtml = `
      <div class="certificate-card" id="certificateCard">
        <div class="cert-inner">
          <h1 class="cert-title">Certificate of Appreciation</h1>
          <div contenteditable="true" id="certName" class="cert-name" aria-label="Recipient name">Name Surname</div>
          <p class="cert-body">This certificate is presented to the recipient in recognition of successful completion of the ${escapeHtml(moduleName)} training module.</p>
          <div class="cert-meta">
            <div>Date: <span id="certDate">${new Date().toLocaleDateString()}</span></div>
            <div>Signature: ____________________</div>
          </div>
          <div class="cert-seal">GRAND AWARD</div>
          <div class="cert-actions">
            <button id="printCert">Print</button>
            <button id="downloadPNG">Download PNG</button>
            <button id="downloadPDF">Download PDF</button>
            <button id="shareCert">Share</button>
            <button id="closeCert">Close Certificate</button>
          </div>
        </div>
      </div>
    `;
    moduleBody.innerHTML = certHtml;
  }

  // wire certificate buttons
  document.getElementById('printCert').addEventListener('click', () => window.print());
  document.getElementById('closeCert').addEventListener('click', () => {
    closeModule(); // returns to module selection default message
  });

  document.getElementById('downloadPNG').addEventListener('click', async () => {
    await downloadCertificatePNG();
  });

  document.getElementById('downloadPDF').addEventListener('click', async () => {
    await downloadCertificatePDF();
  });

  document.getElementById('shareCert').addEventListener('click', async () => {
    await shareCertificate();
  });
}

/* ---------- certificate export helpers ---------- */
async function downloadCertificatePNG(){
  const node = document.getElementById('certificateCard');
  if(!node) return alert('Certificate not ready');
  const canvas = await html2canvas(node, { scale: 2 });
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url; a.download = 'DefendIQ_Certificate.png'; document.body.appendChild(a); a.click(); a.remove();
}

async function downloadCertificatePDF(){
  const node = document.getElementById('certificateCard');
  if(!node) return alert('Certificate not ready');
  const canvas = await html2canvas(node, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight - 10);
  pdf.save('DefendIQ_Certificate.pdf');
}

async function shareCertificate(){
  if(!navigator.canShare) {
    alert('Sharing not supported by this browser — you can download the certificate instead.');
    return;
  }
  const node = document.getElementById('certificateCard');
  if(!node) return;
  const canvas = await html2canvas(node, { scale: 2 });
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'DefendIQ_Certificate.png', { type: 'image/png' });
  try {
    await navigator.share({ files: [file], title: 'DefendIQ Certificate', text: 'Certificate of Appreciation' });
  } catch (err) {
    console.warn('Share canceled or failed', err);
  }
}

/* ---------- escape html helper ---------- */
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

/* ---------- initial render state ---------- */
closeModule();
saveAndRefresh();

/* ---------- small utility: preload progressive answered states if localStorage has data ---------- */
/* This demo uses a simple approach: per-question awarding occurs once and is stored in defendiq_module_progress,
   but we don't deduct points if user repeats on refresh. That logic can be made stricter later. */
