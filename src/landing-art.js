// SVG orisinal; ilustrasi konseptual, bukan foto atau denah BLI.
export function campusArt(id) {
  return `<svg class="campus-art" viewBox="0 0 1120 340" fill="none" aria-hidden="true">
    <defs>
      <pattern id="${id}-windows" width="37" height="40" patternUnits="userSpaceOnUse"><path d="M6 4h23v25H6z" fill="var(--ice)"/><path d="M17 4v25M6 16h23" stroke="var(--sky-300)" stroke-width="1.2"/></pattern>
      <pattern id="${id}-dots" width="17" height="17" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="var(--blue)" opacity=".17"/></pattern>
    </defs>
    <ellipse cx="560" cy="235" rx="358" ry="89" fill="var(--ice)"/>
    <ellipse cx="560" cy="235" rx="444" ry="99" stroke="var(--sky-300)" stroke-dasharray="4 9"/>
    <path class="map-route" d="M149 184C195 120 298 297 401 280S660 300 723 266S846 181 965 180" stroke="var(--blue)" stroke-width="2" stroke-dasharray="6 8"/>
    <path d="M442 220l140-54 163 71-135 63z" fill="var(--sky-300)" opacity=".5"/>
    <path d="M590 193l45-14 191 58-45 19z" fill="var(--white)"/>
    <path d="M609 95l153 50v95l-153-50z" fill="var(--blue)"/>
    <path d="M384 119l225-24v95l-225 24z" fill="var(--white)" stroke="var(--blue)" stroke-width="2"/>
    <path d="M384 119l84-35 219-12-78 23z" fill="var(--ice)" stroke="var(--blue)" stroke-width="2"/>
    <path d="M609 95l78-23 151 51-76 22z" fill="var(--sky-300)" stroke="var(--blue)" stroke-width="2"/>
    <path d="M401 137l190-20v67l-190 20z" fill="url(#${id}-windows)"/>
    <path d="M625 120l120 40v59l-120-41z" fill="var(--navy)"/>
    <path d="M648 128v58m24-50v58m24-50v58m24-50v58M625 149l120 40" stroke="var(--sky-300)" stroke-width="2"/>
    <path d="M465 149l72-7v58l-72 8z" fill="var(--blue)"/>
    <path d="M481 160l39-4v46l-39 4z" fill="var(--sky-300)"/>
    <path d="M500 158v46" stroke="var(--white)" stroke-width="2"/>
    <path d="M450 209l96-11 24 9-97 12zM450 216l97-11 24 9-97 12z" fill="var(--sky-300)"/>
    <path d="M372 117l241-26 79-22" stroke="var(--blue)" stroke-width="5" stroke-linecap="round"/>
    <path d="M462 101l59-5M471 92l39-2" stroke="var(--blue)" stroke-width="2"/>
    <path d="M519 88V47l44 7-1 24-43-8" fill="var(--blue)"/>
    <path d="M519 47v48" stroke="var(--navy)" stroke-width="2"/>
    <path d="M529 57l20 3m-20 5 12 2" stroke="var(--white)" stroke-width="2"/>
    <g stroke="var(--blue)" stroke-width="2">
      <path d="M341 233v-66m-18 38 18 13 19-17M808 241v-65m-17 38 17 13 18-18"/>
      <path d="M320 196c-15-28 6-64 23-64s38 43 20 66c-11 15-34 12-43-2z" fill="var(--sky-300)"/>
      <path d="M790 211c-15-22 2-65 20-65s39 43 22 64c-12 15-32 15-42 1z" fill="var(--ice)"/>
      <path d="M341 172v37m467-32v37"/>
    </g>
    <g class="map-object map-object--laptop">
      <path d="M140 124l109 20-13 79-109-20z" fill="var(--white)" stroke="var(--blue)" stroke-width="2"/>
      <path d="M150 138l85 16-9 52-86-16z" fill="var(--blue)"/>
      <path d="m172 155-15 8 10 12m37-14 11 12-15 7m-12-27-10 30" stroke="var(--white)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M127 203l109 20-33 21-110-21z" fill="var(--ice)" stroke="var(--blue)" stroke-width="2"/>
      <path d="m120 219 73 14M145 215l20 4" stroke="var(--sky-300)" stroke-width="3"/>
    </g>
    <g class="map-object map-object--book">
      <path d="M889 134l53-10 31 97-56 12z" fill="var(--blue)"/>
      <path d="M884 136l8-1 29 91 49-11 3 9-56 13z" fill="var(--white)" stroke="var(--blue)" stroke-width="2"/>
      <path d="m904 159 24-4m-21 14 25-5m-22 14 26-5" stroke="var(--sky-300)" stroke-width="3"/>
      <path d="m902 230 60-12-10-27-60 14z" fill="var(--ice)" stroke="var(--blue)" stroke-width="2"/>
      <path d="m913 217 24-5" stroke="var(--blue)" stroke-width="2"/>
    </g>
    <g stroke="var(--sky)" stroke-width="2" stroke-linecap="round"><path d="M292 99v16m-8-8h16M857 98v16m-8-8h16M250 264v10m-5-5h10"/><circle cx="765" cy="56" r="5"/><circle cx="349" cy="69" r="3"/></g>
    <path d="M66 100h90v45H66zM970 239h82v65h-82z" fill="url(#${id}-dots)"/>
    <path d="M518 281h89" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="563" cy="281" r="5" fill="var(--blue)" stroke="var(--white)" stroke-width="3"/>
  </svg>`;
}

export function programArt(type) {
  if (type === 'ppti') return `<div class="program-illustration" aria-hidden="true"><div class="code-window"><div class="window-toolbar"><i></i><i></i><i></i><span>hello_future.js</span></div><div class="code-lines"><span><small>01</small> const <b>masaDepan</b> = {</span><span><small>02</small> &nbsp; ide: <em>"tanpa batas"</em>,</span><span><small>03</small> &nbsp; mulai: <em>"hari ini"</em></span><span><small>04</small> };</span><span><small>05</small> <b>build</b>(masaDepan);<i class="code-cursor"></i></span></div></div><div class="floating-token">&lt;/&gt;</div><div class="illustration-caption">DARI IDE → JADI KARYA</div></div>`;
  return `<div class="program-illustration" aria-hidden="true"><div class="business-window"><div class="window-toolbar"><i></i><i></i><i></i><span>Langkah bertumbuh</span></div><div class="business-chart"><span>Potensi diri</span><div class="chart-bars"><i></i><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 200 95" fill="none"><path d="M5 86 53 69 91 75 140 38 191 10m-25 0h25v25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><div class="floating-token">↗</div><div class="illustration-caption">DARI POTENSI → JADI PELUANG</div></div>`;
}
