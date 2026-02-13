(() => {
  // Ranking module (page-only)
  if (!document.getElementById('rows')) return;

const DATA = {
    lil: {
      title: "Lil Height",
      sub: "Classement officiel",
      champion: "NextWeedy",
      rows: [
        { name: "Marco", w: 3, l: 0 },
        { name: "NextWeedy", w: 1, l: 0 },
        { name: "Zack", w: 3, l: 1 },
        { name: "Brookitoo", w: 2, l: 1 },
        { name: "Lil fenchi", w: 0, l: 1 }
      ]
    },
    welter: {
      title: "Welter Height",
      sub: "Classement officiel",
      champion: "Dbs",
      rows: [
        { name: "Just Drew", w: 10, l: 2 },
        { name: "Jay", w: 11, l: 5 },
        { name: "Dbs", w: 5, l: 0 },
        { name: "Joedoo", w: 4, l: 0 },
        { name: "Mike", w: 3, l: 0 }
      ]
    },
    big: {
      title: "Big Height",
      sub: "Classement officiel",
      champion: "Mamaye",
      rows: [
        { name: "Max", w: 3, l: 0 },
        { name: "Kevin Kone", w: 3, l: 0 },
        { name: "Mamaye", w: 5, l: 1 },
        { name: "Yona", w: 2, l: 1 },
        { name: "Hakinator", w: 0, l: 1 }
      ]
    }
  };

  const boardTitle = document.getElementById('boardTitle');
  const boardSub = document.getElementById('boardSub');
  const rowsEl = document.getElementById('rows');
  const q = document.getElementById('q');

  let activeCat = "lil";
  let query = "";

  const norm = (s)=> (s||"").toString().trim().toLowerCase();

  function statusFor(i, row, champName){
    const isChamp = norm(row.name) === norm(champName);
    if(isChamp) return { label:"Champion", cls:"badge--champ", dot:"badge__dot--p" };
    if(i <= 1) return { label:"Contender", cls:"badge--cont", dot:"badge__dot--b" };
    return { label:"Rookie", cls:"badge--cont", dot:"badge__dot--w" };
  }

  function render(){
    const cat = DATA[activeCat];

    if(boardTitle) boardTitle.textContent = cat.title;
    if(boardSub) boardSub.textContent = cat.sub;

    const filtered = cat.rows
      .map((r, idx)=> ({...r, idx}))
      .filter(r => !query || norm(r.name).includes(query));

    rowsEl.innerHTML = filtered.map((r)=>{
      const rank = r.idx + 1;
      const rec = `${r.w}V - ${r.l}D`;
      const st = statusFor(r.idx, r, cat.champion);
      const isChamp = norm(r.name) === norm(cat.champion);

      return `
        <tr class="${isChamp ? "tr--champ" : ""}">
          <td class="c-rank"><strong>#${rank}</strong></td>
          <td>${r.name}</td>
          <td class="c-rec">${rec}</td>
          <td class="c-tag">
            <span class="badge ${st.cls}">
              <i class="badge__dot ${st.dot}"></i>${st.label}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Category switch
  document.querySelectorAll(".seg__btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const next = btn.getAttribute("data-cat");
      if(!next || !DATA[next]) return;

      activeCat = next;
      document.querySelectorAll(".seg__btn").forEach(b=>{
        const is = b === btn;
        b.classList.toggle("is-active", is);
        b.setAttribute("aria-selected", is ? "true" : "false");
      });

      render();
    });
  });

  // Search
  if(q){
    q.addEventListener("input", ()=>{
      query = norm(q.value);
      render();
    });
  }

  render();
})();
