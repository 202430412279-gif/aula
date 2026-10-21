const URL = "https://qmpqeeiiizbxxemqkjpw.supabase.co";
const KEY = "sb_publishable_gePMVQaTeziQZ0zDzF-yMQ_ZN4Bkc32";
const lista = document.getElementById("lista");
const msg = document.getElementById("mensagem");
const btn = document.getElementById("salvar-btn");
document.getElementById("ano").textContent = new Date().getFullYear();

function moeda(v) {
  if (v === null || v === undefined || v === "") return "Consulte o preço";
  return Number(v).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
}
function mostrar(produtos) {
  lista.replaceChildren();
  document.getElementById("contagem").textContent = produtos.length + (produtos.length === 1 ? " produto" : " produtos");
  if (!produtos.length) {
    const vazio = document.createElement("div"); vazio.className = "empty";
    vazio.textContent = "Sua vitrine começa aqui. Adicione seu primeiro produto no formulário abaixo.";
    lista.appendChild(vazio); return;
  }
  produtos.forEach(p => {
    const card = document.createElement("article"); card.className = "product";
    const foto = document.createElement("div"); foto.className = "photo";
    if (p.imagem_url) {
      const img = document.createElement("img"); img.src = p.imagem_url; img.alt = p.nome || "Produto"; img.loading = "lazy";
      img.onerror = () => { foto.replaceChildren(); const ph = document.createElement("div"); ph.className = "placeholder"; ph.textContent = "◇"; foto.appendChild(ph); };
      foto.appendChild(img);
    } else { const ph = document.createElement("div"); ph.className = "placeholder"; ph.textContent = "◇"; foto.appendChild(ph); }
    const info = document.createElement("div"); info.className = "info";
    const top = document.createElement("div"); top.className = "top";
    const nome = document.createElement("h3"); nome.textContent = p.nome || "Produto";
    const preco = document.createElement("span"); preco.className = "price"; preco.textContent = moeda(p.preco);
    top.append(nome, preco);
    const desc = document.createElement("p"); desc.className = "desc"; desc.textContent = p.descricao || "Detalhes deste produto em breve.";
    info.append(top, desc); card.append(foto, info); lista.appendChild(card);
  });
}
async function listarProdutos() {
  try {
    const r = await fetch(URL + "/rest/v1/produtos?select=id,nome,preco,imagem_url,descricao&order=id.desc", {headers:{"apikey":KEY,"Authorization":"Bearer "+KEY}});
    if (!r.ok) throw new Error("Falha ao carregar produtos");
    mostrar(await r.json());
  } catch(e) {
    lista.textContent = "Não foi possível carregar os produtos. Verifique a conexão com o banco de dados.";
    document.getElementById("contagem").textContent = "Vitrine";
    console.error(e);
  }
}
document.getElementById("produto-form").addEventListener("submit", async e => {
  e.preventDefault(); msg.textContent = ""; btn.disabled = true; btn.textContent = "Salvando…";
  const nome = document.getElementById("nome").value.trim();
  const rawPreco = document.getElementById("preco").value;
  const imagem_url = document.getElementById("imagem_url").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  if (!nome) { msg.textContent = "Informe o nome do produto."; btn.disabled = false; btn.textContent = "Adicionar produto"; return; }
  try {
    const r = await fetch(URL + "/rest/v1/produtos", {
      method:"POST", headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({nome,preco:rawPreco === "" ? null : Number(rawPreco),imagem_url:imagem_url || null,descricao:descricao || null})
    });
    if (!r.ok) throw new Error("Não foi possível salvar. Confira as permissões do banco de dados.");
    e.target.reset(); msg.textContent = "Produto adicionado à vitrine."; await listarProdutos();
  } catch(err) { msg.textContent = err.message; }
  finally { btn.disabled = false; btn.textContent = "Adicionar produto"; }
});
listarProdutos();