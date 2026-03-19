document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const errorMsg = document.querySelector(".message-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // empêche le navigateur d'envoyer le formulaire (évite le 405)

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // on efface le message d'erreur
    errorMsg.textContent = "";

    if (!email || !password) {
      errorMsg.textContent = "Email ou mot de passe incorrect";
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        errorMsg.textContent = "Email ou mot de passe incorrect";
        return;
      }

      const data = await response.json();

      // on garde les infos de connexion
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("logged", "true");

      // redirection vers l'accueil
      window.location.href = "index.html";

    } catch (error) {
      errorMsg.textContent = "Erreur serveur. Vérifie que le backend est lancé.";
    }

  });

});