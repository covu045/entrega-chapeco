import { auth, db } from "./firebase.js";
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos da Tela
const listaPedidos = document.getElementById("listaPedidos");
const contagemPedidos = document.getElementById("contagemPedidos");
const somAlerta = document.getElementById("somAlerta");

let pedidosNotificados = new Set();

// 1. PROTEGER A PÁGINA (SÓ ENTRA LOGADO)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    iniciarVigilanciaPedidos();
  }
});

// 2. ESCUTAR O BANCO DE DADOS EM TEMPO REAL
function iniciarVigilanciaPedidos() {
  onSnapshot(collection(db, "pedidos"), (snapshot) => {
    listaPedidos.innerHTML = "";
    let pendentes = 0;
    let novoPedidoDetectado = false;

    snapshot.forEach((docSnap) => {
      const pedido = docSnap.data();
      const id = docSnap.id;

      if (pedido.status === "Pendente") {
        pendentes++;
        if (!pedidosNotificados.has(id)) {
          novoPedidoDetectado = true;
          pedidosNotificados.add(id);
        }
      }

      // Criar o visual do pedido
      const li = document.createElement("li");
      li.className = `pedido ${pedido.status === "Entregue" ? "entregue" : ""}`;
      
      let botoes = "";
      if (pedido.status === "Pendente") {
        botoes = `
          <button onclick="aceitarPedido('${id}')" style="background:#28a745;">✅ Aceitar</button>
          <button onclick="recusarPedido('${id}')" style="background:#dc3545;">❌ Recusar</button>
        `;
      } else if (pedido.status === "A caminho") {
        botoes = `<button onclick="finalizarPedido('${id}')" style="background:#007bff;">🏁 Entregue</button>`;
      }

      li.innerHTML = `
        <strong>👤 Cliente:</strong> ${pedido.cliente}<br>
        <strong>📍 Endereço:</strong> ${pedido.endereco}<br>
        <strong>📊 Status:</strong> ${pedido.status}<br>
        <div style="margin-top:10px;">${botoes}</div>
      `;
      listaPedidos.appendChild(li);
    });

    contagemPedidos.textContent = `Pedidos Pendentes: ${pendentes}`;
    
    if (novoPedidoDetectado) {
      tocarAlerta();
    }
  });
}

// 3. FUNÇÕES DE AÇÃO (BOTÕES)
window.aceitarPedido = async (id) => {
  pararAlerta();
  await updateDoc(doc(db, "pedidos", id), { status: "A caminho" });
  alert("Pedido aceito! Vá para o endereço.");
};

window.recusarPedido = async (id) => {
  if (confirm("Deseja recusar este pedido?")) {
    pararAlerta();
    await updateDoc(doc(db, "pedidos", id), { status: "Recusado" });
  }
};

window.finalizarPedido = async (id) => {
  await updateDoc(doc(db, "pedidos", id), { status: "Entregue" });
  alert("Entrega realizada!");
};

window.sair = () => {
  signOut(auth).then(() => window.location.href = "login.html");
};

// 4. CONTROLE DO SOM (TIN TIN TIN)
function tocarAlerta() {
  somAlerta.loop = true;
  somAlerta.play().catch(() => console.log("Clique na tela para habilitar o som"));
  setTimeout(() => pararAlerta(), 30000); // Para após 30 seg
}

function pararAlerta() {
  somAlerta.pause();
  somAlerta.currentTime = 0;
}