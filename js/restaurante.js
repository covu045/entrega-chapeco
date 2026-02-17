import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  collection, addDoc, query, where, onSnapshot, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Variáveis globais
let usuarioAtual = null;
let nomeDaMinhaLoja = "Carregando...";
let dadosLoja = {}; // ✅ NOVO: guarda os dados da loja pra usar depois no criarPedido()

// ✅ 1) “Porteiro” (quando loga, carrega dados da loja e pedidos)
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;

  // Busca os dados do restaurante no Firestore
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("Seu usuário não tem perfil no Firestore (usuarios).");
    window.location.href = "login.html";
    return;
  }

  // Só deixa entrar se for restaurante
  const dados = userSnap.data();
  if (dados.tipo !== "restaurante") {
    alert("Você não é restaurante.");
    window.location.href = "login.html";
    return;
  }

  dadosLoja = dados; // ✅ NOVO: salva os dados da loja numa variável global

  // ✅ Aqui pegamos o nome real!
  nomeDaMinhaLoja = dados.nomeLoja || "Minha Loja";

  // Atualiza o título da aba
  document.title = "Painel - " + nomeDaMinhaLoja;

  // Se existir no HTML, mostra o nome
  const el = document.getElementById("nomeRestaurante");
  if (el) el.innerText = "Loja: " + nomeDaMinhaLoja;

  carregarMeusPedidos();
});


// ✅ 2) Criar pedido (com nome e endereço da loja indo junto)
window.criarPedido = async function () {
  const clienteEl = document.getElementById("cliente");
  const enderecoEl = document.getElementById("endereco");

  const cliente = clienteEl?.value.trim();
  const endereco = enderecoEl?.value.trim();

  if (!cliente || !endereco) {
    alert("Preencha cliente e endereço!");
    return;
  }

  await addDoc(collection(db, "pedidos"), {
    cliente,
    endereco,
    status: "pendente",
    restauranteId: usuarioAtual.uid,
    nomeRestaurante: nomeDaMinhaLoja,

    // ✅ NOVO: endereço da loja indo junto no pedido
    enderecoRestaurante: dadosLoja.enderecoLoja || "Endereço da loja não cadastrado",

    criadoEm: new Date()
  });

  // Limpa campos
  if (clienteEl) clienteEl.value = "";
  if (enderecoEl) enderecoEl.value = "";

  alert("Pedido enviado para os Motoboys!");
};


// ✅ 3) Carregar pedidos do restaurante em tempo real
function carregarMeusPedidos() {
  const lista = document.getElementById("listaPedidos");
  if (!lista) return;

  lista.innerHTML = "Carregando...";

  const q = query(
    collection(db, "pedidos"),
    where("restauranteId", "==", usuarioAtual.uid)
  );

  onSnapshot(q, (snapshot) => {
    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<li>Nenhum pedido ainda.</li>";
      return;
    }

    snapshot.forEach((d) => {
      const p = d.data();
      lista.innerHTML += `<li><strong>${p.cliente}</strong> - ${p.status}</li>`;
    });
  });
}


// ✅ 4) Sair
window.sair = function () {
  signOut(auth).then(() => window.location.href = "login.html");
};
