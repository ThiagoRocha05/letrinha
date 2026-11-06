// Teste de conteudo da Letrinha: roda no navegador e confere os dados e as perguntas de todas as fases.
const { chromium } = require('playwright');
const URL = 'file://' + process.cwd() + '/index.html';
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL);
  const res = await pg.evaluate(() => {
    const bad = [];
    const norm = s => s.replace(/-/g, '');
    const allWords = new Set();
    for (const [pid, ph] of Object.entries(PHASES)) {
      const emo = new Map();
      for (const w of ph.words) {
        allWords.add(w.word);
        if (emo.has(w.emoji)) bad.push(`fase ${pid}: emoji ${w.emoji} repetido em ${emo.get(w.emoji)} e ${w.word}`);
        emo.set(w.emoji, w.word);
      }
    }
    for (const [w, s] of Object.entries(SYLLABLE_MAP)) {
      if (norm(s.join('')) !== norm(w)) bad.push(`silabas de ${w} nao formam a palavra: ${s.join('-')}`);
      if (!allWords.has(w)) bad.push(`SYLLABLE_MAP tem ${w}, que nao esta em nenhuma fase`);
    }
    for (const [pid, ph] of Object.entries(PHASES)) {
      for (const w of ph.words) {
        for (let rep = 0; rep < 6; rep++) {
          currentPhase = Number(pid);
          shuffledWords = ph.words.slice();
          currentQ = ph.words.indexOf(w) % ph.questions;
          shuffledWords[currentQ] = w;
          lives = 3;
          try { loadQuestion(); } catch (e) { bad.push(`loadQuestion falhou em ${w.word}: ${e.message}`); continue; }
          const opts = [...document.querySelectorAll('#optionsGrid .option-btn')].map(x => x.dataset.value);
          if (currentMode !== 'letter' && new Set(opts).size !== opts.length) bad.push(`opcoes repetidas em ${w.word} (${currentMode}): ${opts.join(',')}`);
        }
      }
    }
    return bad;
  });
  await b.close();
  const all = [...new Set([...res, ...errs])];
  if (all.length) { console.error(all.slice(0, 40).join('\n')); console.error(`${all.length} problema(s)`); process.exit(1); }
  console.log('conteudo ok');
})();
