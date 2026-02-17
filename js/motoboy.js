import { auth, db } from "./firebase.js";
<<<<<<< HEAD
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listaPedidos = document.getElementById("listaPedidos");
const contagemPedidos = document.getElementById("contagemPedidos");
const somAlerta = document.getElementById("somAlerta");

let pedidosIDsExistentes = new Set();

// Escutar pedidos do Firebase
onSnapshot(collection(db, "pedidos"), (snapshot) => {
    listaPedidos.innerHTML = "";
    let pendentes = 0;

    snapshot.forEach((doc) => {
        const pedido = doc.data();
        const id = doc.id;

        if (pedido.status !== "Entregue") pendentes++;

        // Alerta de som para novos pedidos
        if (!pedidosIDsExistentes.has(id) && pedido.status !== "Entregue") {
            somAlerta.play().catch(() => console.log("Som bloqueado pelo navegador"));
            pedidosIDsExistentes.add(id);
        }
=======
import { 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  carregarPedidos();
>>>>>>> 31dabdcebcb67e708749791855f8cff6bb2eb6c8

        const li = document.createElement("li");
        li.className = `pedido ${pedido.status === "Entregue" ? "entregue" : ""}`;
        li.innerHTML = `
            <strong>Cliente:</strong> ${pedido.cliente}<br>
            <strong>Endereço:</strong> ${pedido.endereco}<br>
            <strong>Status:</strong> ${pedido.status}<br>
            <button class="pedido-btn" ${pedido.status === "Entregue" ? "disabled" : ""} 
                onclick="marcarEntregue('${id}')">Marcar como Entregue</button>
        `;
        listaPedidos.appendChild(li);
    });

    contagemPedidos.textContent = `Pedidos Pendentes: ${pendentes}`;
});

<<<<<<< HEAD
window.marcarEntregue = async function(id) {
    const pedidoRef = doc(db, "pedidos", id);
    await updateDoc(pedidoRef, { status: "Entregue" });
};
=======

function carregarPedidos(){

  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "Carregando pedidos...";

  const q = query(
    collection(db, "pedidos"),
    where("status", "==", "pendente")
  );

  onSnapshot(q, (snapshot) => {

    lista.innerHTML = "";

    if(snapshot.empty){
      lista.innerHTML = "<p>Nenhum pedido disponível.</p>";
      return;
    }

    snapshot.forEach((documento) => {

      const pedido = documento.data();

      lista.innerHTML += `
        <li style="margin-bottom:20px;">
          <strong>${pedido.cliente}</strong><br>
          ${pedido.endereco}<br><br>
          <button onclick="aceitarPedido('${documento.id}')">
            Aceitar Pedido
          </button>
        </li>
      `;
    });

  });

}


window.aceitarPedido = async function(id){

  const pedidoRef = doc(db, "pedidos", id);

  await updateDoc(pedidoRef, {
    status: "em_entega"
  });

  alert("Pedido aceito!");

}


window.sair = function(){
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}
>>>>>>> 31dabdcebcb67e708749791855f8cff6bb2eb6c8
