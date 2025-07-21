import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
  try {
    // Initialize UI elements
    const reviewerInput = document.getElementById("reviewerEmail");
    const saveBtn = document.getElementById("saveReviewerBtn");
    const statusMessage = document.getElementById("statusMessage");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const mainDashboard = document.getElementById("mainDashboard");
    const saveVersionBtn = document.getElementById("saveVersionBtn");
    const requestApprovalBtn = document.getElementById("requestApprovalBtn");
    const log = document.getElementById("log");

    // Wait for sandbox proxy
    const sandboxApi = await addOnUISdk.instance.runtime.apiProxy("documentSandbox");
    console.log("Sandbox API proxy ready");

    // Get designer email
    let reviewerEmail = "";
    const designerEmail = addOnUISdk.instance.user?.email || "unknown@designer.com";
    console.log(`Designer: ${designerEmail}`);

    // Event listeners
    saveBtn.addEventListener("click", () => {
      const email = reviewerInput.value.trim();
      reviewerEmail = email;
      if (!validateEmail(email)) {
        statusMessage.textContent = "❌ Please enter a valid email.";
        return;
      }
      statusMessage.textContent = `✅ Reviewer email saved: ${email}`;
      welcomeScreen.style.display = "none";
      mainDashboard.style.display = "block";
    });

    /*saveVersionBtn.addEventListener("click", async () => {
      try {
        saveVersionBtn.disabled = true;
        saveVersionBtn.textContent = "Saving...";
        
        const options = {
          range: addOnUISdk.constants.Range.currentPage,
          format: addOnUISdk.constants.RenditionFormat.png,
        };
        const renditions = await addOnUISdk.app.document.createRenditions(
          options, 
          addOnUISdk.constants.RenditionIntent.view // Changed from preview
        );
        const blob = renditions[0].blob;
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-version-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Release the object URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        log.innerHTML += `
          <div class="log-entry">
            ✅ Version saved at ${new Date().toLocaleString()}<br>
            <small>Downloaded as PNG</small>
          </div>`;
      } catch (error) {
        console.error("Error saving version:", error);
        log.innerHTML += `<div class="log-entry error">❌ Failed to save version: ${error.message}</div>`;
      } finally {
        saveVersionBtn.disabled = false;
        saveVersionBtn.textContent = "Save Version";
      }
    });*/

   
requestApprovalBtn.addEventListener("click", async () => {
  try {
    requestApprovalBtn.disabled = true;
    requestApprovalBtn.textContent = "Sending...";

    const options = {
      range: addOnUISdk.constants.Range.currentPage,
      format: addOnUISdk.constants.RenditionFormat.png,
    };
    const renditions = await addOnUISdk.app.document.createRenditions(
      options, 
      addOnUISdk.constants.RenditionIntent.view
    );
    const blob = renditions[0].blob;
    const url = URL.createObjectURL(blob);

    // Randomly determine approval status
    const status = Math.random() < 0.5 ? "✅ Approved" : "❌ Denied";
    const statusColor = status.includes("Approved") ? "#4CAF50" : "#E53935";

    // Add to log
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerHTML = `
      📧 Approval request sent at ${new Date().toLocaleString()}<br>
      <strong>${status}</strong><br>
      <img src="${url}" alt="Snapshot preview" style="max-width: 100%; margin-top: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" />
    `;
    log.appendChild(logEntry);

    // Fade out log entry after 10s
    setTimeout(() => {
      logEntry.style.transition = "opacity 1s ease-out";
      logEntry.style.opacity = "0";
      setTimeout(() => logEntry.remove(), 1000);
    }, 10000);

    // Add to approval history table
    const historyTable = document.getElementById("approvalHistoryTable").querySelector("tbody");
    const row = historyTable.insertRow();
    document.getElementById("emptyMessageRow")?.remove();

    row.insertCell().textContent = reviewerEmail;
    row.insertCell().textContent = new Date().toLocaleString();

    const statusCell = row.insertCell();
    statusCell.textContent = status;
    statusCell.style.color = statusColor;

    const previewCell = row.insertCell();
    previewCell.innerHTML = `<img src="${url}" style="max-height: 50px; border: 1px solid #ddd; border-radius: 4px;" />`;

    // Toggle approval log view
    
;



    // Clean up URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);

    // Example placeholder action

  } catch (error) {
    console.error("Error requesting approval:", error);
    const errorEntry = document.createElement("div");
    errorEntry.className = "log-entry error";
    errorEntry.textContent = `❌ Failed to send approval request: ${error.message}`;
    log.appendChild(errorEntry);
  } finally {
    requestApprovalBtn.disabled = false;
    requestApprovalBtn.textContent = "Request Approval";
  }
});




  } catch (error) {
    console.error("UI initialization failed:", error);
    document.body.innerHTML = `<div class="error">Initialization failed: ${error.message}</div>`;
  }
});

const toggleStatusBtn = document.getElementById("toggleStatusBtn");
const statusTables = document.getElementById("statusTables");

toggleStatusBtn.addEventListener("click", () => {
  const isVisible = statusTables.style.display === "block";
  statusTables.style.display = isVisible ? "none" : "block";
  toggleStatusBtn.textContent = isVisible ? "➕ View Approval Log" : "➖ Minimize Log";

  const emptyRow = document.getElementById("emptyMessageRow");
  const hasData = document.querySelector("#approvalTableBody").querySelectorAll("tr").length > 1;
  if (emptyRow) {
    emptyRow.style.display = hasData ? "none" : "table-row";
  }
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}