import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
    if(!user) window.location.href = "login.html";
    else {
        usuarioAtual = user;
        carregarMeusPedidos();
    }
});

window.criarPedido = async function() {
    const cliente = document.getElementById("cliente").value;
    const endereco = document.getElementById("endereco").value;

    if(!cliente || !endereco) return alert("Preencha tudo!");

    await addDoc(collection(db, "pedidos"), {
        cliente,
        endereco,
        status: "Pendente",
        restauranteId: usuarioAtual.uid,
        data: new Date()
    });

    document.getElementById("cliente").value = "";
    document.getElementById("endereco").value = "";
    alert("Pedido enviado para os motoboys!");
}

function carregarMeusPedidos() {
    const q = query(collection(db, "pedidos"), where("restauranteId", "==", usuarioAtual.uid));
    onSnapshot(q, (snapshot) => {
        const lista = document.getElementById("listaPedidos");
        lista.innerHTML = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            lista.innerHTML += `<li>${p.cliente} - <strong>${p.status}</strong></li>`;
        });
    });
}

window.sair = () => signOut(auth).then(() => window.location.href = "login.html");