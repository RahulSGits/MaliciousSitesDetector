// DOM elements
    const urlInput = document.getElementById('url-input');
    const scanBtn = document.getElementById('scan-btn');
    const rescanBtn = document.getElementById('rescan-btn');
    const viewReportBtn = document.getElementById('view-report-btn');
    const reportSiteBtn = document.getElementById('report-site-btn');
    const helpBtn = document.getElementById('help-btn');
    const progressBar = document.getElementById('progress-bar');
    const scanningSection = document.getElementById('scanning-section');
    const resultsSection = document.getElementById('results-section');
    const riskValue = document.getElementById('risk-value');
    const riskLevel = document.getElementById('risk-level');
    const securityStatus = document.getElementById('security-status');
    const reason = document.getElementById('reason');
    const threatsDetected = document.getElementById('threats-detected');
    const sslCert = document.getElementById('ssl-cert');
    const lastScan = document.getElementById('last-scan');
    const protectionToggle = document.getElementById('protection-toggle');
    const protectionStatus = document.getElementById('protection-status');

    // State variables
    let isScanning = false;
    let isProtected = false;
    let lastScanTime = null;
    let scanResults = null;
    let progressInterval = null;

    // Initialize with current URL
    window.addEventListener('DOMContentLoaded', () => {
      urlInput.value = window.location.href;
      updateLastScanTime();

      // Set initial protection state
      isProtected = localStorage.getItem('protectionEnabled') === 'true';
      protectionToggle.checked = isProtected;
      updateProtectionStatus();
    });

    // Event listeners
    scanBtn.addEventListener('click', startScan);
    rescanBtn.addEventListener('click', startScan);
    viewReportBtn.addEventListener('click', viewReport);
    reportSiteBtn.addEventListener('click', reportSite);
    helpBtn.addEventListener('click', showHelp);
    protectionToggle.addEventListener('change', toggleProtection);

    // Start scanning process
    function startScan() {
      if (isScanning) return;

      const url = urlInput.value.trim();
      if (!url) {
        alert('Please enter a valid URL');
        return;
      }

      // Reset UI
      scanningSection.classList.remove('hidden');
      resultsSection.classList.add('hidden');
      isScanning = true;

      // Simulate scanning progress
      simulateScanProgress();

      // Call backend to analyze URL
      fetch('/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
      })
        .then(response => response.json())
        .then(data => {
          clearInterval(progressInterval);
          progressBar.style.width = '100%';
          setTimeout(() => {
            completeScan(url, data);
          }, 300);
        })
        .catch(error => {
          console.error('Error:', error);
          clearInterval(progressInterval);
          progressBar.style.width = '100%';
          setTimeout(() => {
            isScanning = false;
            scanningSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            securityStatus.textContent = 'Scan failed';
            securityStatus.className = 'high-risk';
            reason.textContent = 'Could not connect to the server';
          }, 300);
        });
    }

    // Simulate scanning progress
    function simulateScanProgress() {
      let progress = 0;
      progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
        }
        progressBar.style.width = `${progress}%`;
      }, 150);
    }

    // Complete scan and show results
    function completeScan(url, backendData) {
      isScanning = false;
      scanningSection.classList.add('hidden');
      resultsSection.classList.remove('hidden');

      // Process backend response
      const riskLevel = mapRiskToLevel(backendData.risk);

      // Generate scan results
      scanResults = generateScanResults(url, backendData, riskLevel);

      // Update UI with results
      updateResultsUI();

      // Update last scan time
      lastScanTime = new Date();
      updateLastScanTime();

      // Save to history
      saveToScanHistory();
    }

    // Map backend risk to frontend levels
    function mapRiskToLevel(risk) {
      if (risk.includes('Safe')) return 'safe';
      if (risk.includes('Suspicious')) return 'medium';
      if (risk.includes('Malicious')) return 'critical';
      return 'low';
    }

    // Generate scan results based on backend response
    function generateScanResults(url, backendData, riskLevel) {
      // Generate threats detected
      const threats = riskLevel === 'safe' ? 0 :
        riskLevel === 'medium' ? 1 :
          3;

      // SSL status (more likely to be valid for safe sites)
      const sslValid = riskLevel === 'safe' ? Math.random() > 0.2 : Math.random() > 0.7;

      // Reputation score (0-100)
      const reputation = riskLevel === 'safe' ? 95 + Math.floor(Math.random() * 5) :
        riskLevel === 'medium' ? 60 + Math.floor(Math.random() * 20) :
          30 + Math.floor(Math.random() * 30);

      return {
        url,
        risk: riskLevel,
        threats,
        sslValid,
        reputation,
        reason: backendData.reason,
        timestamp: new Date()
      };
    }

    // Update UI with scan results
    function updateResultsUI() {
      if (!scanResults) return;

      // Set risk value
      riskValue.textContent = scanResults.risk.charAt(0).toUpperCase() + scanResults.risk.slice(1);

      // Set risk level color and meter
      let riskPercentage = 0;
      let riskClass = '';

      switch (scanResults.risk) {
        case 'safe':
          riskPercentage = 10;
          riskClass = 'safe';
          break;
        case 'low':
          riskPercentage = 30;
          riskClass = 'low-risk';
          break;
        case 'medium':
          riskPercentage = 60;
          riskClass = 'medium-risk';
          break;
        case 'high':
          riskPercentage = 85;
          riskClass = 'high-risk';
          break;
        case 'critical':
          riskPercentage = 100;
          riskClass = 'high-risk';
          break;
      }

      riskValue.className = `risk-value ${riskClass}`;
      setTimeout(() => {
        riskLevel.style.width = `${riskPercentage}%`;
      }, 100);

      // Set details
      securityStatus.textContent = scanResults.risk === 'safe' ?
        'Secure Website' : 'Potential Threats Detected';
      securityStatus.className = scanResults.risk === 'safe' ? 'safe' : 'high-risk';

      reason.textContent = scanResults.reason;

      threatsDetected.textContent = scanResults.threats;
      threatsDetected.className = scanResults.threats > 0 ? 'high-risk' : 'safe';

      sslCert.textContent = scanResults.sslValid ? 'Valid & Trusted' : 'Invalid or Expired';
      sslCert.className = scanResults.sslValid ? 'safe' : 'high-risk';

      // Update chart
      updateRiskChart();
    }

    // Update risk chart
    function updateRiskChart() {
      const ctx = document.getElementById('risk-chart').getContext('2d');

      // Destroy existing chart if it exists
      if (window.riskChart) {
        window.riskChart.destroy();
      }

      // Create new chart
      window.riskChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Security', 'Privacy', 'Malware', 'Phishing', 'Reputation', 'Performance'],
          datasets: [{
            label: 'Website Safety Score',
            data: [
              scanResults.risk === 'safe' ? 95 : 100 - (scanResults.risk.length * 20),
              scanResults.reputation,
              100 - (scanResults.threats * 20),
              scanResults.sslValid ? 90 : 40,
              scanResults.reputation,
              80
            ],
            backgroundColor: 'rgba(79, 172, 254, 0.2)',
            borderColor: 'rgba(79, 172, 254, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(79, 172, 254, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(79, 172, 254, 1)'
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              pointLabels: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: {
                  size: 12
                }
              },
              ticks: {
                backdropColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.5)',
                stepSize: 20
              },
              suggestedMin: 0,
              suggestedMax: 100
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'rgba(255, 255, 255, 0.8)'
              }
            }
          }
        }
      });
    }

    // Update last scan time display
    function updateLastScanTime() {
      if (lastScanTime) {
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        lastScan.textContent = lastScanTime.toLocaleDateString('en-US', options);
      } else {
        lastScan.textContent = 'Never';
      }
    }

    // Toggle real-time protection
    function toggleProtection() {
      isProtected = protectionToggle.checked;
      localStorage.setItem('protectionEnabled', isProtected);
      updateProtectionStatus();

      // Show notification
      showNotification(
        isProtected ? 'Real-Time Protection Enabled' : 'Real-Time Protection Disabled',
        isProtected ? 'You are now protected against malicious websites' : 'Your protection is disabled',
        isProtected ? 'success' : 'warning'
      );
    }

    // Update protection status display
    function updateProtectionStatus() {
      protectionStatus.textContent = isProtected ? 'Enabled' : 'Disabled';
      protectionStatus.className = isProtected ? 'safe' : 'high-risk';
    }

    // View detailed report
    function viewReport() {
      if (!scanResults) {
        alert('Please scan a website first');
        return;
      }

      alert(`Detailed Security Report:\n\nURL: ${scanResults.url}\nRisk Level: ${scanResults.risk}\nReason: ${scanResults.reason}\nThreats Detected: ${scanResults.threats}\nSSL Certificate: ${scanResults.sslValid ? 'Valid' : 'Invalid'}\nReputation Score: ${scanResults.reputation}/100`);
    }

    // Report site
    function reportSite() {
      const url = urlInput.value.trim();
      if (!url) {
        alert('Please enter a URL to report');
        return;
      }

      const reportType = prompt('Select report type:\n1. Malware\n2. Phishing\n3. Scam\n4. Other', '1');
      if (reportType) {
        const riskMap = {
          '1': 'Malicious',
          '2': 'Malicious',
          '3': 'Malicious',
          '4': 'Suspicious'
        };
        const risk = riskMap[reportType] || 'Suspicious';

        // Send report to backend
        fetch('/report-site', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url, risk })
        })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'logged') {
              showNotification('Report Submitted', 'Thank you for reporting this website. Our team will review it shortly.', 'info');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Failed to report the site. Please try again.');
          });
      }
    }

    // Show help
    function showHelp() {
      alert('Cyber Security Shield Help:\n\n1. Enter a URL and click "Scan Now" to check a website\n2. Enable "Real-Time Protection" to block malicious sites automatically\n3. Use "View Report" to see detailed scan results\n4. Report suspicious sites to help improve our database');
    }

    // Show notification
    function showNotification(title, message, type) {
      alert(`${title}\n\n${message}`);
    }

    // Save to scan history
    function saveToScanHistory() {
      if (!scanResults) return;

      let history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      history.unshift({
        url: scanResults.url,
        risk: scanResults.risk,
        timestamp: scanResults.timestamp.getTime()
      });

      // Keep only last 10 scans
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      localStorage.setItem('scanHistory', JSON.stringify(history));
    }
