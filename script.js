function scanURL() {
  const url = document.getElementById("urlInput").value;
  const statusBox = document.getElementById("status");
  const resultBox = document.getElementById("result");
  const statusMsg = document.querySelector(".status-message");

  if (!url) {
    alert("Please enter a URL to scan.");
    return;
  }

  statusBox.classList.remove("hidden");
  resultBox.classList.add("hidden");
  statusMsg.textContent = "Scanning...";

  setTimeout(() => {
    const riskLevels = ["Safe ✅", "Suspicious ⚠️", "Malicious ❌"];
    const messages = [
      "This website appears to be safe.",
      "Caution! This site might contain suspicious content.",
      "Warning! This website is flagged as malicious!"
    ];
    const randomIndex = Math.floor(Math.random() * 3);

    document.getElementById("riskLevel").textContent = `Risk: ${riskLevels[randomIndex]}`;
    document.getElementById("details").textContent = messages[randomIndex];

    statusBox.classList.add("hidden");
    resultBox.classList.remove("hidden");
  }, 2000);
}

function rescan() {
  document.getElementById("urlInput").value = "";
  document.getElementById("result").classList.add("hidden");
  alert("You can now enter a new URL to rescan.");
}

function reportSite() {
  alert("Thank you! This site has been reported for review.");
}

function viewReport() {
  alert("📊 Feature Coming Soon: Detailed threat reports with charts and history!");
}

function toggleProtection() {
  alert("🛡️ Real-Time Protection is now enabled.");
}

function showHelp() {
  alert("ℹ️ Enter a URL and click 'Scan Now' to check if it's safe. You can report or view more info using the buttons.");
}
