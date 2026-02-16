import { auth, db } from "./firebase.js";
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

});


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