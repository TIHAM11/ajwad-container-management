function calculateProfit(event) {
    event.preventDefault();

    const containerNo = document.getElementById("containerNo").value;
    const item = document.getElementById("item").value;
    const containerDate = document.getElementById("containerDate").value;
    const purchase = Number(document.getElementById("purchase").value);
    const shipping = Number(document.getElementById("shipping").value);
    const customs = Number(document.getElementById("customs").value);
    const selling = Number(document.getElementById("selling").value);

    const totalCost = purchase + shipping + customs;
    const profitLoss = selling - totalCost;

    const containerData = {
        containerNo,
        item,
        date: containerDate,
        purchase,
        shipping,
        customs,
        selling,
        profitLoss
    };

    let containers = JSON.parse(localStorage.getItem("containers")) || [];
    containers.push(containerData);
    localStorage.setItem("containers", JSON.stringify(containers));

    const resultBox = document.getElementById("resultBox");

    if (profitLoss >= 0) {
        resultBox.innerHTML = "✅ Profit: AED " + profitLoss;
        resultBox.style.color = "green";
    } else {
        resultBox.innerHTML = "❌ Loss: AED " + Math.abs(profitLoss);
        resultBox.style.color = "red";
    }

    resultBox.style.marginTop = "15px";
    resultBox.style.fontWeight = "bold";

    event.target.reset();
}


/* ==========================
   GLOBAL POPUP DELETE SYSTEM
========================== */

// Popup elements
const confirmPopup = document.getElementById("confirmPopup");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// Store row index to delete
let deleteId = null;


/* ==========================
   DASHBOARD — SUMMARY STATS
========================== */

function updateDashboardStats() {

    const containers = JSON.parse(localStorage.getItem("containers")) || [];

    if (!document.getElementById("totalContainers")) return;

    let totalInvestment = 0;
    let totalSelling = 0;

    containers.forEach(c => {
        const cost =
            Number(c.purchase || 0) +
            Number(c.shipping || 0) +
            Number(c.customs || 0);

        totalInvestment += cost;
        totalSelling += Number(c.selling || 0);
    });

    const netProfit = totalSelling - totalInvestment;

    document.getElementById("totalContainers").textContent = containers.length;
    document.getElementById("totalInvestment").textContent = "AED " + totalInvestment;

    document.getElementById("netProfit").textContent =
        (netProfit >= 0 ? "+ AED " : "- AED ") + Math.abs(netProfit);
}


/* ==========================
   DASHBOARD — RECENT TABLE
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const containers = JSON.parse(localStorage.getItem("containers")) || [];
    const table = document.getElementById("containerTable");

    if (!table) return;

    containers.forEach(c => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${c.containerNo || "—"}</td>
            <td>${c.item || "—"}</td>
            <td>${formatDate(c.date)}</td>
            <td class="${c.profitLoss >= 0 ? 'profit-text' : 'loss-text'}">
                ${c.profitLoss >= 0 ? '+ AED ' : '- AED '} ${Math.abs(c.profitLoss)}
            </td>
        `;

        table.appendChild(row);
    });

    updateDashboardStats();
});


/* ==========================
   ALL CONTAINERS PAGE
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const containers = JSON.parse(localStorage.getItem("containers")) || [];
    const table = document.getElementById("allContainersTable");

    if (!table) return;

    containers.forEach((c, index) => {

        const totalCost =
            Number(c.purchase || 0) +
            Number(c.shipping || 0) +
            Number(c.customs || 0);

        const row = document.createElement("tr");

        // row color highlighting
        row.className = c.profitLoss >= 0 ? "row-profit" : "row-loss";

        row.innerHTML = `
            <td>${c.containerNo}</td>
            <td>${c.item}</td>
            <td>${formatDate(c.date)}</td>
            <td>AED ${totalCost}</td>
            <td>AED ${c.selling}</td>

            <td class="${c.profitLoss >= 0 ? 'profit-text' : 'loss-text'}">
                ${c.profitLoss >= 0 ? '+ AED ' : '- AED '} ${Math.abs(c.profitLoss)}
            </td>

            <td>
                <button onclick="editContainer(${index})">Edit</button>
                <button onclick="showDeletePopup(${index})" class="delete-btn">Delete</button>
            </td>
        `;

        table.appendChild(row);
    });
});


/* ==========================
   SEARCH FILTER
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const searchBox = document.getElementById("searchBox");
    const table = document.getElementById("allContainersTable");

    if (!searchBox || !table) return;

    searchBox.addEventListener("keyup", function () {

        const filterValue = this.value.toLowerCase();
        const rows = table.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {

            const rowText = rows[i].innerText.toLowerCase();

            rows[i].style.display =
                rowText.includes(filterValue) ? "" : "none";
        }
    });
});


/* ==========================
   DELETE SYSTEM — POPUP FLOW
========================== */

function showDeletePopup(index) {

    deleteId = index; // store index

    // If popup exists (index.html)
    if (confirmPopup) {
        confirmPopup.style.display = "flex";
        return;
    }

    // Fallback confirm (containers.html)
    const ok = confirm("Are you sure you want to delete this container?");

    if (ok) {
        let containers = JSON.parse(localStorage.getItem("containers")) || [];
        containers.splice(deleteId, 1);
        localStorage.setItem("containers", JSON.stringify(containers));
        location.reload();
    }
}


// Confirm delete button (popup pages only)
if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener("click", () => {

        let containers = JSON.parse(localStorage.getItem("containers")) || [];

        containers.splice(deleteId, 1);

        localStorage.setItem("containers", JSON.stringify(containers));

        confirmPopup.style.display = "none";

        location.reload();
    });
}


// Cancel popup
if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener("click", () => {

        deleteId = null;
        confirmPopup.style.display = "none";
    });
}


/* ==========================
   EDIT CONTAINER
========================== */

function editContainer(index) {

    let containers = JSON.parse(localStorage.getItem("containers")) || [];
    let c = containers[index];

    localStorage.setItem("editIndex", index);
    localStorage.setItem("editData", JSON.stringify(c));

    window.location.href = "add-container.html";
}


/* ==========================
   DATE FORMATTER
========================== */

function formatDate(dateString) {

    if (!dateString) return "—";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
