document.addEventListener("DOMContentLoaded", function () {

  const profiles = [
    { name: "Ana Torres", email: "ana@email.com", subject: "Math" },
    { name: "Carlos Ruiz", email: "carlos@email.com", subject: "Physics" },
    { name: "Laura Méndez", email: "laura@email.com", subject: "English" }
  ];

  let currentIndex = 0;
  const card = document.getElementById("profileCard");
  const approveBtn = document.getElementById("approveBtn");
  const rejectBtn = document.getElementById("rejectBtn");

  function renderProfile() {
    if (currentIndex >= profiles.length) {
      card.innerHTML = "<h3>No more profiles</h3>";
      return;
    }

    const profile = profiles[currentIndex];

    card.innerHTML = `
      <strong>${profile.name}</strong>
      <div>${profile.email}</div>
      <div>${profile.subject}</div>
    `;
  }

  function saveLike(profile) {
    let likes = JSON.parse(localStorage.getItem("likedProfiles")) || [];
    likes.push(profile);
    localStorage.setItem("likedProfiles", JSON.stringify(likes));
  }

  function nextProfile() {
    setTimeout(() => {
      card.classList.remove("swipe-right", "swipe-left");
      card.style.transform = "translateX(0)";
      currentIndex++;
      renderProfile();
    }, 400);
  }

  function swipeRight() {
    if (currentIndex >= profiles.length) return;
    saveLike(profiles[currentIndex]);
    card.classList.add("swipe-right");
    nextProfile();
  }

  function swipeLeft() {
    if (currentIndex >= profiles.length) return;
    card.classList.add("swipe-left");
    nextProfile();
  }

  approveBtn.addEventListener("click", swipeRight);
  rejectBtn.addEventListener("click", swipeLeft);

  /* ---------- DRAG ---------- */

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  card.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    card.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    card.style.transition = "transform 0.3s ease";

    if (currentX > 120) {
      swipeRight();
    } else if (currentX < -120) {
      swipeLeft();
    } else {
      card.style.transform = "translateX(0)";
    }

    currentX = 0;
  });

  renderProfile();
});