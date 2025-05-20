// scan url by calling Flask backend
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
  statusMsg.textContent = "🔍 Scanning...";

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

function rescan() {
  // clear URL input
  document.getElementById("urlInput").value = "";

  // hide the result box and status box
  document.getElementById("result").classList.add("hidden");
  document.getElementById("status").classList.add("hidden");

  // reset risk level and details text to default
  document.getElementById("riskLevel").textContent = "Risk: -";
  document.getElementById("details").textContent = "Waiting for analysis...";

  // reset real-time toggle switch and status text
  const toggle = document.getElementById("realTimeToggle");
  const statusText = document.getElementById("toggleStatus");
  toggle.checked = false;
  statusText.textContent = "Status: Disabled";

  alert("UI reset. You can enter a new URL to scan.");
}


// send report to backend and alert user
function reportSite() {
  const url = document.getElementById("urlInput").value;
  const risk = document.getElementById("riskLevel").textContent.replace("Risk: ", "");
  if (!url) {
    alert("Please enter a URL before reporting.");
    return;
  }

  fetch("http://127.0.0.1:5000/report-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url, risk: risk }),
  })
    .then(() => alert("✅ Site reported. Thank you!"))
    .catch(() => alert("❌ Failed to report site."));
}

// placeholder alert for viewing reports
function viewReport() {
  alert("📊 Feature Coming Soon: Detailed threat reports with charts and history!");
}

// placeholder alert for toggling protection
function toggleProtection() {
  alert("🛡️ Real-Time Protection toggled.");
}

// Help message alert
function showHelp() {
  alert("ℹ️ Enter a URL and click 'Scan Now' to check if it's safe. Use other buttons for more actions.");
}

// Toggle real-time protection switch and update status text
function toggleRealTimeProtection() {
  const toggle = document.getElementById("realTimeToggle");
  const statusText = document.getElementById("toggleStatus");
  toggle.checked = !toggle.checked;
  statusText.textContent = toggle.checked ? "Status: Enabled" : "Status: Disabled";
}

// event listeners for buttons and toggle switch
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("scanBtn").addEventListener("click", scanURL);
  document.getElementById("rescanBtn").addEventListener("click", rescan);
  document.getElementById("viewReportBtn").addEventListener("click", viewReport);
  document.getElementById("toggleProtectionBtn").addEventListener("click", toggleProtection);
  document.getElementById("helpBtn").addEventListener("click", showHelp);
  document.getElementById("reportBtn").addEventListener("click", reportSite);

  // Real-time toggle event
  const toggle = document.getElementById("realTimeToggle");
  toggle.addEventListener("change", () => {
    const status = document.getElementById("toggleStatus");
    status.textContent = toggle.checked ? "Status: Enabled" : "Status: Disabled";
  });
});


fetch("http://127.0.0.1:5000/analyze-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: url }),
})
.then((res) => res.json())
.then((data) => {
  // show result on UI
  document.getElementById("riskLevel").textContent = `Risk: ${data.risk}`;
  document.getElementById("details").textContent = data.reason;

  // Report site automatically
  fetch("http://127.0.0.1:5000/report-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url, risk: data.risk }),
  });

  // side scanning animation, show results
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
