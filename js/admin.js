import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos
const corpoTabela = document.getElementById("corpoTabela");
const totalPedidos = document.getElementById("totalPedidos");
const totalPendentes = document.getElementById("totalPendentes");
const totalCaminho = document.getElementById("totalCaminho");
const totalEntregues = document.getElementById("totalEntregues");

// 1. PROTEÇÃO DE ROTA
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        monitorarPedidos();
    }
});

// 2. MONITORAR PEDIDOS (REAL-TIME)
function monitorarPedidos() {
    onSnapshot(collection(db, "pedidos"), (snapshot) => {
        corpoTabela.innerHTML = "";
        
        let contagem = { total: 0, pendentes: 0, caminho: 0, entregues: 0 };

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const id = docSnap.id;
            contagem.total++;

            // Lógica de contagem e cores de status
            let statusClass = "";
            if (p.status === "Pendente") { contagem.pendentes++; statusClass = "st-pendente"; }
            if (p.status === "A caminho") { contagem.caminho++; statusClass = "st-caminho"; }
            if (p.status === "Entregue") { contagem.entregues++; statusClass = "st-entregue"; }

            // Criar linha da tabela
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${p.cliente}</strong></td>
                <td>${p.endereco}</td>
                <td><span class="badge-status ${statusClass}">${p.status}</span></td>
                <td>
                    <button class="btn-excluir" onclick="removerPedido('${id}')">🗑️</button>
                </td>
            `;
            corpoTabela.appendChild(tr);
        });

        // Atualizar painel de números
        totalPedidos.innerText = contagem.total;
        totalPendentes.innerText = contagem.pendentes;
        totalCaminho.innerText = contagem.caminho;
        totalEntregues.innerText = contagem.entregues;
    });
}

// 3. REMOVER PEDIDO (LIMPEZA DO ADMIN)
window.removerPedido = async (id) => {
    if(confirm("Deseja apagar este pedido do histórico permanentemente?")) {
        await deleteDoc(doc(db, "pedidos", id));
    }
};

// 4. SAIR
window.sair = () => {
    signOut(auth).then(() => window.location.href = "index.html");
};