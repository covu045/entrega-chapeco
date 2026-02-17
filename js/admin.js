import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
    if(!user) {
        window.location.href = "login.html";
    } else {
        carregarTudo();
    }
});

function carregarTudo() {
    const lista = document.getElementById("listaPedidos");
    const totalTxt = document.getElementById("totalPedidos");

    // onSnapshot para atualizar em tempo real
    onSnapshot(collection(db, "pedidos"), (snapshot) => {
        lista.innerHTML = "";
        totalTxt.innerText = snapshot.size;

        snapshot.forEach(doc => {
            const p = doc.data();
            const li = document.createElement("li");
            li.className = "pedido";
            li.style.color = "#333";
            li.innerHTML = `
                <strong>Cliente:</strong> ${p.cliente} | 
                <strong>Status:</strong> ${p.status} <br>
                <small>ID: ${doc.id}</small>
            `;
            lista.appendChild(li);
        });
    });
}

window.sair = () => signOut(auth).then(() => window.location.href = "login.html");