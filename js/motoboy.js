import { db } from "./firebase.js";
import { collection, onSnapshot, doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const lista = document.getElementById("listaPedidos");

onSnapshot(collection(db, "pedidos"), (snapshot) => {

  lista.innerHTML = "";

  snapshot.forEach((pedidoDoc) => {

    const pedido = pedidoDoc.data();
    const id = pedidoDoc.id;

    lista.innerHTML += `
      <div class="pedido">
        <strong>Cliente:</strong> ${pedido.cliente || ""} <br>
        <strong>Endereço:</strong> ${pedido.endereco || ""} <br>
        <strong>Status:</strong> ${pedido.status || ""} <br>

        ${
          pedido.status === "em_rota"
            ? `<button onclick="finalizarEntrega('${id}')">
                 Finalizar Entrega
               </button>`
            : ""
        }
      </div>
    `;
  });

});

window.finalizarEntrega = async function(id){

  const pedidoRef = doc(db, "pedidos", id);

  await updateDoc(pedidoRef, {
    status: "entregue",
    finalizadoEm: new Date()
  });

  alert("Entrega finalizada 🚀");

};
