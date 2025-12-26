function calculateProfit(event) {
    event.preventDefault();

    const containerNo = document.getElementById("containerNo").value;
    const item = document.getElementById("item").value;
    const containerDate = document.getElementById("containerDate").value;

    const purchase = Number(document.getElementById("purchase").value);
    const shipping = Number(document.getElementById("shipping").value);
    const customs = Number(document.getElementById("customs").value);
    const selling = Number(document.getElementById("selling").value);

    // NEW FIELDS
    const bagsCount = Number(document.getElementById("bagsCount").value || 0);
    const weightPerBag = Number(document.getElementById("weightPerBag").value || 0);

    // CALCULATIONS
    const totalCost = purchase + shipping + customs;
    const profitLoss = selling - totalCost;

    const totalWeight = bagsCount * weightPerBag;     // NEW
    const costPerBag = bagsCount > 0 ? (totalCost / bagsCount) : 0; // NEW

    const containerData = {
        containerNo,
        item,
        date: containerDate,

        purchase,
        shipping,
        customs,
        selling,

        profitLoss,
        totalCost,

        // NEW DATA SAVED
        bagsCount,
        weightPerBag,
        totalWeight,
        costPerBag
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

const confirmPopup = document.getElementById("confirmPopup");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let deleteId = null;


/* ==========================
   DASHBOARD — SUMMARY STATS
========================== */

function updateDashboardStats() {

    const containers = JSON.parse(localStorage.getItem("containers")) || [];

    if (!document.getElementById("totalContainers")) return;

    let totalInvestment = 0;
    let totalSelling = 0;
    let totalWeight = 0;   // NEW

    containers.forEach(c => {

        const cost =
            Number(c.purchase || 0) +
            Number(c.shipping || 0) +
            Number(c.customs || 0);

        totalInvestment += cost;
        totalSelling += Number(c.selling || 0);
        totalWeight += Number(c.totalWeight || 0); // NEW
    });

    const netProfit = totalSelling - totalInvestment;

    document.getElementById("totalContainers").textContent = containers.length;
    document.getElementById("totalInvestment").textContent = "AED " + totalInvestment;

    document.getElementById("netProfit").textContent =
        (netProfit >= 0 ? "+ AED " : "- AED ") + Math.abs(netProfit);

    // OPTIONAL — if you want total weight on dashboard later
    if (document.getElementById("totalWeightDash")) {
        document.getElementById("totalWeightDash").textContent = totalWeight + " KG";
    }
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

        const row = document.createElement("tr");
        row.className = c.profitLoss >= 0 ? "row-profit" : "row-loss";

        row.innerHTML = `
            <td>${c.containerNo}</td>
            <td>${c.item}</td>
            <td>${formatDate(c.date)}</td>

            <td>${c.bagsCount || 0}</td>
            <td>${c.weightPerBag || 0} KG</td>
            <td>${c.totalWeight || 0} KG</td>

            <td>AED ${c.totalCost || 0}</td>
            <td>AED ${c.selling || 0}</td>

            <td>AED ${c.costPerBag?.toFixed(2) || 0}</td>

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
            rows[i].style.display = rowText.includes(filterValue) ? "" : "none";
        }
    });
});


/* ==========================
   DELETE POPUP
========================== */

function showDeletePopup(index) {

    deleteId = index;

    if (confirmPopup) {
        confirmPopup.style.display = "flex";
        return;
    }

    const ok = confirm("Delete this container?");

    if (ok) {
        let containers = JSON.parse(localStorage.getItem("containers")) || [];
        containers.splice(deleteId, 1);
        localStorage.setItem("containers", JSON.stringify(containers));
        location.reload();
    }
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
        let containers = JSON.parse(localStorage.getItem("containers")) || [];
        containers.splice(deleteId, 1);
        localStorage.setItem("containers", JSON.stringify(containers));
        confirmPopup.style.display = "none";
        location.reload();
    });
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
        deleteId = null;
        confirmPopup.style.display = "none";
    });
});


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
