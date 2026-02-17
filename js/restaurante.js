import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let usuarioAtual = null;

// SEGURANÇA: Se não estiver logado, volta para o index.html
onAuthStateChanged(auth, (user) => {
    if(!user) {
        window.location.href = "index.html";
    } else {
        usuarioAtual = user;
        carregarMeusPedidos();
    }
});

// FUNÇÃO PARA CRIAR PEDIDO
window.criarPedido = async function() {
    const cliente = document.getElementById("cliente").value;
    const endereco = document.getElementById("endereco").value;

    if(!cliente || !endereco) return alert("Preencha o nome e o endereço!");

    try {
        await addDoc(collection(db, "pedidos"), {
            cliente,
            endereco,
            status: "Pendente",
            restauranteId: usuarioAtual.uid,
            dataCriacao: new Date()
        });
        document.getElementById("cliente").value = "";
        document.getElementById("endereco").value = "";
        alert("Pedido enviado com sucesso!");
    } catch (e) {
        console.error("Erro ao criar pedido:", e);
    }
}

// CARREGAR PEDIDOS EM TEMPO REAL
function carregarMeusPedidos() {
    const q = query(collection(db, "pedidos"), where("restauranteId", "==", usuarioAtual.uid));
    onSnapshot(q, (snapshot) => {
        const lista = document.getElementById("listaPedidos");
        lista.innerHTML = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            const li = document.createElement("li");
            li.className = "pedido";
            li.innerHTML = `<strong>${p.cliente}</strong> - Status: ${p.status}`;
            lista.appendChild(li);
        });
    });
}

// FUNÇÃO SAIR (CORRIGIDA PARA INDEX.HTML)
window.sair = function() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
}