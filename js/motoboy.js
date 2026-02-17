import { auth, db } from "./firebase.js";
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

window.marcarEntregue = async function(id) {
    const pedidoRef = doc(db, "pedidos", id);
    await updateDoc(pedidoRef, { status: "Entregue" });
};