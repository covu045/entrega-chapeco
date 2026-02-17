import { auth, db } from "./firebase.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos da Tela
const listaPedidos = document.getElementById("listaPedidos");
const contagemPedidos = document.getElementById("contagemPedidos");
const somAlerta = document.getElementById("somAlerta");

let pedidosNotificados = new Set();

// 1) PROTEGER A PÁGINA
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    iniciarVigilanciaPedidos();
  }
});

// 2) ESCUTAR O BANCO EM TEMPO REAL
function iniciarVigilanciaPedidos() {
  if (!listaPedidos) return;

  onSnapshot(collection(db, "pedidos"), (snapshot) => {
    listaPedidos.innerHTML = "";
    let pendentes = 0;
    let novoPedidoDetectado = false;

    snapshot.forEach((docSnap) => {
      const pedido = docSnap.data() || {};
      const id = docSnap.id;

      // ✅ NORMALIZA STATUS (pra nunca falhar)
      const status = (pedido.status || "").toString().trim().toLowerCase();

      // 🛑 FILTRO: Esconder recusado/entregue
      if (status === "recusado" || status === "entregue") return;

      // ✅ CONTAGEM + ALERTA
      if (status === "pendente") {
        pendentes++;
        if (!pedidosNotificados.has(id)) {
          novoPedidoDetectado = true;
          pedidosNotificados.add(id);
        }
      }

      // ✅ BOTÕES GARANTIDOS
      let botoesHTML = "";
      if (status === "pendente") {
        botoesHTML = `
          <button onclick="aceitarPedido('${id}')" style="background:#28a745; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; width:48%;">✅ Aceitar</button>
          <button onclick="recusarPedido('${id}')" style="background:#dc3545; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; width:48%;">❌ Recusar</button>
        `;
      } else if (status === "a caminho" || status === "acaminho") {
        botoesHTML = `
          <button onclick="finalizarPedido('${id}')" style="background:#007bff; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; width:100%;">🏁 Entregue</button>
        `;
      }

      // ✅ FALLBACKS (não travar se pedido for antigo)
      const nomeRestaurante = pedido.nomeRestaurante || "Nome não definido";
      const enderecoLoja = pedido.enderecoRestaurante || "Endereço da loja não definido";
      const cliente = pedido.cliente || "Sem nome";
      const enderecoCliente = pedido.endereco || "Sem endereço";

      const corStatus = status === "pendente" ? "orange" : "blue";
      const statusBonito =
        status === "pendente" ? "pendente" :
        (status === "a caminho" || status === "acaminho") ? "A caminho" :
        status || "Sem status";

      const li = document.createElement("li");
      li.className = "pedido";
      li.innerHTML = `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color:#333;">
          
          <div style="background: #764ba2; color: white; padding: 8px; border-radius: 5px; margin-bottom: 10px; font-weight: bold;">
            🏬 Loja: ${nomeRestaurante}
          </div>

          <div style="margin-bottom:10px; line-height:1.6;">
            <strong>📌 Endereço da Loja:</strong> ${enderecoLoja}<br>
            <strong>👤 Cliente:</strong> ${cliente}<br>
            <strong>📍 Endereço do Cliente:</strong> ${enderecoCliente}<br>
            <strong>📊 Status:</strong> <span style="font-weight:bold; color:${corStatus}">${statusBonito}</span>
          </div>

          <div style="display:flex; justify-content:space-between; gap:10px;">
            ${botoesHTML}
          </div>
        </div>
      `;

      listaPedidos.appendChild(li);
    });

    if (contagemPedidos) {
      contagemPedidos.textContent = `Pedidos Pendentes: ${pendentes}`;
    }

    if (novoPedidoDetectado) tocarAlerta();
  });
}

// 3) FUNÇÕES DE AÇÃO
window.aceitarPedido = async (id) => {
  pararAlerta();
  await updateDoc(doc(db, "pedidos", id), { status: "a caminho" }); // ✅ minúsculo
  alert("Pedido aceito! Vá para o endereço.");
};

window.recusarPedido = async (id) => {
  if (confirm("Deseja recusar este pedido?")) {
    pararAlerta();
    await updateDoc(doc(db, "pedidos", id), { status: "recusado" }); // ✅ minúsculo
  }
};

window.finalizarPedido = async (id) => {
  await updateDoc(doc(db, "pedidos", id), { status: "entregue" }); // ✅ minúsculo
  alert("Entrega realizada!");
};

window.sair = () => {
  signOut(auth).then(() => window.location.href = "index.html");
};

// 4) SOM (30s)
function tocarAlerta() {
  if (!somAlerta) return;

  somAlerta.loop = true;
  somAlerta.play().catch(() => console.log("Clique na tela para habilitar o som"));
  setTimeout(() => pararAlerta(), 30000);
}

function pararAlerta() {
  if (!somAlerta) return;

  somAlerta.pause();
  somAlerta.currentTime = 0;
}
