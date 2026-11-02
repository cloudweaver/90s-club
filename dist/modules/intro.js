const PC = `<svg viewBox="0 0 384 280" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
  <ellipse cx="193" cy="259" rx="115" ry="7" fill="#235744" opacity=".09"/>
  <g class="intro-computer">
    <path d="M108 42H278V48H286V184H278V194H108V188H100V50H108V42Z" fill="#235744"/>
    <path d="M110 48H276V55H280V180H274V188H110V182H106V55H110V48Z" fill="#c8d3b7"/>
    <path d="M112 49H274V55H112V49ZM107 56H113V179H107V56Z" fill="#fffbed"/>
    <path d="M275 56H280V180H274V186H113V180H275V56Z" fill="#98aa8a"/>
    <rect x="118" y="62" width="150" height="104" fill="#235744"/>
    <rect class="intro-screen-light" x="124" y="68" width="138" height="92" fill="#98c7af"/>
    <g class="intro-boot-message"><text x="193" y="104" fill="#235744" text-anchor="middle" font-family="Pixelify,monospace" font-size="13">hello, old friend.</text><rect class="intro-boot-cursor" x="188" y="114" width="9" height="3" fill="#235744"/></g>
    <rect class="intro-scan" x="124" y="68" width="138" height="3" fill="#f3efdf" opacity=".5"/>
    <g class="intro-screen-world">
      <rect x="134" y="79" width="90" height="61" fill="#235744"/>
      <rect x="136" y="81" width="86" height="57" fill="#f3efdf"/>
      <rect x="136" y="81" width="86" height="9" fill="#235744"/>
      <rect x="140" y="84" width="4" height="3" fill="#e5a750"/>
      <rect x="147" y="84" width="4" height="3" fill="#98c7af"/>
      <path d="M158 120H173V115H178V110H187V115H192V120H208V125H158V120Z" fill="#98c7af"/>
      <rect x="181" y="103" width="5" height="24" fill="#235744"/>
      <path d="M176 98H181V93H191V98H196V108H191V113H181V108H176V98Z" fill="#e5a750"/>
      <rect x="182" y="100" width="8" height="7" fill="#cf755c"/>
      <rect x="209" y="114" width="38" height="32" fill="#235744"/>
      <rect x="211" y="116" width="34" height="28" fill="#f3efdf"/>
      <rect x="211" y="116" width="34" height="7" fill="#e5a750"/>
      <path d="M219 131H226V128H230V131H237V136H230V139H226V136H219V131Z" fill="#235744"/>
      <rect x="141" y="145" width="18" height="5" fill="#235744" opacity=".6"/>
      <rect x="163" y="145" width="18" height="5" fill="#235744" opacity=".3"/>
    </g>
    <rect x="119" y="176" width="46" height="3" fill="#235744" opacity=".4"/>
    <rect class="intro-power" x="253" y="175" width="8" height="5" fill="#e5a750"/>
    <path d="M171 194H216V211H232V221H151V211H171V194Z" fill="#235744"/>
    <path d="M177 194H210V214H226V217H157V214H177V194Z" fill="#c8d3b7"/>
    <path d="M114 232H273V238H280V252H107V238H114V232Z" fill="#235744"/>
    <path d="M116 236H271V242H276V248H111V242H116V236Z" fill="#d4d9bc"/>
    <path d="M123 240H132V243H123V240ZM138 240H147V243H138V240ZM153 240H162V243H153V240ZM168 240H177V243H168V240ZM183 240H192V243H183V240ZM198 240H207V243H198V240ZM213 240H222V243H213V240ZM228 240H237V243H228V240ZM243 240H261V243H243V240Z" fill="#235744" opacity=".55"/>
  </g>
  <g class="intro-star intro-star-one" fill="#e5a750"><path d="M52 133H58V127H62V133H68V137H62V143H58V137H52V133Z"/></g>
  <g class="intro-star intro-star-two" fill="#98c7af"><path d="M307 67H313V61H317V67H323V71H317V77H313V71H307V67Z"/></g>
  <g class="intro-star intro-star-three" fill="#e5a750"><rect x="304" y="202" width="5" height="5"/><rect x="76" y="212" width="4" height="4"/></g>
</svg>`;

const GAME = `<svg viewBox="0 0 64 44" aria-hidden="true" shape-rendering="crispEdges"><path d="M12 11H52V15H57V35H51V39H41V33H23V39H13V35H7V15H12Z" fill="#235744"/><path d="M14 15H50V19H53V31H49V35H45V29H19V35H15V31H11V19H14Z" fill="#98c7af"/><path d="M19 19H24V24H29V29H24V34H19V29H14V24H19Z" fill="#235744"/><rect x="39" y="21" width="5" height="5" fill="#cf755c"/><rect x="46" y="27" width="5" height="5" fill="#e5a750"/></svg>`;
const PAINT = `<svg viewBox="0 0 64 44" aria-hidden="true" shape-rendering="crispEdges"><path d="M10 32H16V26H22V20H28V26H34V32H41V36H10Z" fill="#98c7af"/><path d="M38 8H43V13H48V18H43V23H38V28H33V23H28V18H33V13H38Z" fill="#e5a750"/><path d="M43 8H48V13H43ZM38 13H43V18H38ZM33 18H38V23H33Z" fill="#235744"/><rect x="12" y="8" width="6" height="6" fill="#cf755c"/><rect x="21" y="8" width="6" height="6" fill="#aaa0c1"/></svg>`;
const FLOWER = `<svg viewBox="0 0 64 44" aria-hidden="true" shape-rendering="crispEdges"><path d="M30 18H35V40H30Z" fill="#235744"/><path d="M21 27H30V33H25V30H21ZM35 31H44V34H40V37H35Z" fill="#98c7af"/><path d="M25 6H30V1H40V6H45V16H40V21H30V16H25Z" fill="#e5a750"/><rect x="31" y="8" width="8" height="7" fill="#cf755c"/></svg>`;

/** An original, silent pixel scene. The host owns when the intro is shown. */
export function mountIntro(container, { onEnter } = {}) {
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  const controller = new win.AbortController();
  const root = doc.createElement('section');
  root.className = 'intro-root intro-running';
  root.setAttribute('aria-label', "Welcome to 90's-club");
  root.innerHTML = `<div class="intro-top"><span class="intro-wordmark">90's-club <span aria-hidden="true">✳</span></span><button type="button" class="intro-skip">Skip intro <span aria-hidden="true">↗</span></button></div>
    <div class="intro-content"><div class="intro-stage" aria-hidden="true"><div class="intro-orbit"></div><div class="intro-pc">${PC}</div><div class="intro-tile intro-tile-game"><div class="intro-tile-bar"><i></i><span>play.exe</span></div>${GAME}</div><div class="intro-tile intro-tile-paint"><div class="intro-tile-bar"><i></i><span>paint.exe</span></div>${PAINT}</div><div class="intro-tile intro-tile-flower"><div class="intro-tile-bar"><i></i><span>take a breath</span></div>${FLOWER}</div><span class="intro-scene-caption">a softer kind of screen time</span></div>
    <div class="intro-copy"><p class="intro-eyebrow">HELLO, OLD FRIEND.</p><h1>A little internet<br>time machine.</h1><p class="intro-description">A few old favorites. A blank page.<br>A slower afternoon.</p><button type="button" class="intro-enter">Step inside <span aria-hidden="true">→</span></button><p class="intro-footnote">Make something. Play a little. Stay awhile.</p></div></div>
    <div class="intro-bottom"><span class="intro-caption">a small place to be, for a little while</span><button type="button" class="intro-motion">Pause animation</button></div>`;
  container.append(root);
  const scene = root.querySelector('.intro-stage');
  const motion = root.querySelector('.intro-motion');
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 4800;
  let timer = null, elapsed = 0, startedAt = win.performance.now(), paused = false, finished = false, destroyed = false, entered = false;

  function clearTimer() { if (timer !== null) { win.clearTimeout(timer); timer = null; } }
  function finish() {
    clearTimer();
    finished = true;
    paused = false;
    root.classList.remove('intro-running', 'intro-paused');
    root.classList.add('intro-finished');
    motion.textContent = preference.matches ? 'Still scene' : 'Replay animation';
    motion.disabled = preference.matches;
  }
  function replay() {
    if (destroyed || preference.matches) return;
    clearTimer();
    elapsed = 0; paused = false; finished = false;
    root.classList.remove('intro-running', 'intro-paused', 'intro-finished');
    void scene.offsetWidth;
    root.classList.add('intro-running');
    motion.textContent = 'Pause animation';
    startedAt = win.performance.now();
    timer = win.setTimeout(finish, duration);
  }
  motion.addEventListener('click', () => {
    if (finished) { replay(); return; }
    if (paused) {
      paused = false;
      root.classList.remove('intro-paused');
      startedAt = win.performance.now();
      motion.textContent = 'Pause animation';
      timer = win.setTimeout(finish, Math.max(0, duration - elapsed));
    } else {
      elapsed += win.performance.now() - startedAt;
      paused = true;
      clearTimer();
      root.classList.add('intro-paused');
      motion.textContent = 'Continue animation';
    }
  }, { signal: controller.signal });
  function enter() { if (!destroyed && !entered) { entered = true; if (typeof onEnter === 'function') onEnter(); } }
  root.querySelector('.intro-skip').addEventListener('click', enter, { signal: controller.signal });
  root.querySelector('.intro-enter').addEventListener('click', enter, { signal: controller.signal });
  function preferenceChanged() {
    root.classList.toggle('intro-reduced', preference.matches);
    if (preference.matches) finish();
    else { motion.disabled = false; motion.textContent = 'Replay animation'; }
  }
  if (preference.matches) { root.classList.add('intro-reduced'); finish(); }
  else timer = win.setTimeout(finish, duration);
  if (preference.addEventListener) preference.addEventListener('change', preferenceChanged);
  else preference.addListener(preferenceChanged);
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimer();
      controller.abort();
      if (preference.removeEventListener) preference.removeEventListener('change', preferenceChanged);
      else preference.removeListener(preferenceChanged);
      root.remove();
    },
  };
}
