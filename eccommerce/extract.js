fetch('https://ciseco-nextjs.vercel.app/home-2').then(r=>r.text()).then(t => { 
  const matches = [...t.matchAll(/_next\/static\/media\/[^"\' ]+\.png/g)].map(m=>m[0]);
  console.log(Array.from(new Set(matches)).join('\n')); 
})
