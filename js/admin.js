import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. PROTEGER A PÁGINA (MUDADO PARA index.html)
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html"; // Se não estiver logado, volta para o início
    } else {
        console.log("Admin logado com sucesso!");
        // Aqui você pode chamar funções para carregar relatórios, etc.
    }
});

// 2. FUNÇÃO SAIR (CORRIGIDA)
window.sair = function() {
    signOut(auth).then(() => {
        // O segredo está aqui: mudar para index.html
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
        alert("Erro ao tentar sair. Tente novamente.");
    });
};