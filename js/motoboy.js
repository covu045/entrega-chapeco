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

// 1. PROTEGER A PÁGINA (MUDADO PARA index.html)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // Redireciona para a nova tela de login
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

      // 🛑 FILTRO: Se o pedido já foi Recusado ou Entregue, ele não aparece na lista do motoboy
      if (pedido.status === "Recusado" || pedido.status === "Entregue") {
        return; 
      }

      if (pedido.status === "Pendente") {
        pendentes++;
        if (!pedidosNotificados.has(id)) {
          novoPedidoDetectado = true;
          pedidosNotificados.add(id);
        }
      }

      // Criar o visual do pedido
      const li = document.createElement("li");
      li.className = "pedido";
      
      let botoes = "";
      if (pedido.status === "Pendente") {
        botoes = `
          <button onclick="aceitarPedido('${id}')" style="background:#28a745; color:white; border:none; padding:10px; margin-right:5px; border-radius:5px; cursor:pointer;">✅ Aceitar</button>
          <button onclick="recusarPedido('${id}')" style="background:#dc3545; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">❌ Recusar</button>
        `;
      } else if (pedido.status === "A caminho") {
        botoes = `<button onclick="finalizarPedido('${id}')" style="background:#007bff; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">🏁 Entregue</button>`;
      }

      li.innerHTML = `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fff;">
            <strong>👤 Cliente:</strong> ${pedido.cliente}<br>
            <strong>📍 Endereço:</strong> ${pedido.endereco}<br>
            <strong>📊 Status:</strong> <span style="color: ${pedido.status === 'Pendente' ? 'orange' : 'blue'}">${pedido.status}</span><br>
            <div style="margin-top:10px;">${botoes}</div>
        </div>
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
    // O pedido sumirá da tela automaticamente devido ao filtro lá em cima
  }
};

window.finalizarPedido = async (id) => {
  await updateDoc(doc(db, "pedidos", id), { status: "Entregue" });
  alert("Entrega realizada!");
};

// MUDADO PARA index.html
window.sair = () => {
  signOut(auth).then(() => {
      window.location.href = "index.html";
  });
};

// 4. CONTROLE DO SOM
function tocarAlerta() {
  somAlerta.loop = true;
  somAlerta.play().catch(() => console.log("Clique na tela para habilitar o som"));
  setTimeout(() => pararAlerta(), 30000); 
}

function pararAlerta() {
  somAlerta.pause();
  somAlerta.currentTime = 0;
}