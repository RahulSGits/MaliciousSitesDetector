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

const toggle = document.getElementById('realTimeToggle');
  const status = document.getElementById('toggleStatus');

  // Real-time update on toggle
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;

    status.textContent = enabled ? 'Status: Enabled' : 'Status: Disabled';
    status.classList.toggle('text-green-400', enabled);
    status.classList.toggle('text-gray-300', !enabled);

    // Optional: Add console log or function call
    console.log(`Real-Time Protection is ${enabled ? 'ENABLED' : 'DISABLED'}`);
  });
  
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

  fetch("http://127.0.0.1:5000/analyze-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("riskLevel").textContent = `Risk: ${data.risk}`;
      document.getElementById("details").textContent = data.reason;

      statusBox.classList.add("hidden");
      resultBox.classList.remove("hidden");
    })
    .catch((err) => {
      console.error("Error:", err);
      document.getElementById("riskLevel").textContent = "Error ❌";
      document.getElementById("details").textContent = "Could not connect to server.";
      statusBox.classList.add("hidden");
      resultBox.classList.remove("hidden");
    });
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scanBtn').addEventListener('click', scanURL);
  document.getElementById('rescanBtn').addEventListener('click', rescan);
  document.getElementById('viewReportBtn').addEventListener('click', viewReport);
  document.getElementById('toggleProtectionBtn').addEventListener('click', toggleProtection);
  document.getElementById('helpBtn').addEventListener('click', showHelp);
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reportBtn').addEventListener('click', reportSite);
});
function reportSite() {
  alert("This site has been reported.");
  // You can also send data to the backend here if needed
}



