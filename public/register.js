const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // Проверка успешности ответа
    // Перенаправление на главную страницу после успешной регистрации
    window.location.href = "/"; // Укажите путь к вашей главной странице
  } else {
    // Если возникла ошибка, отобразите сообщение пользователю
    alert(data.message);
  }
});
