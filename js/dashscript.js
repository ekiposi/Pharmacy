let medications = JSON.parse(localStorage.getItem('medications')) || [];
let editingIndex = -1;

const medicationForm = document.getElementById("add-medication-form");
const medicationTable = document.querySelector("#medication-table tbody");
const medicationListContainer = document.getElementById('medication-list');
const totalStockValueCell = document.getElementById('total-stock-value');
const footerRow = document.getElementById('footer-row');
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const expiredFilter = document.getElementById("expired-filter");
const lowStockFilter = document.getElementById("low-stock-filter");

const formatCurrency = (value) => {
    return value.toLocaleString('fr-FR') + ' GDES';
};

const showMedicationForm = (index = -1) => {
    const formTitle = document.getElementById("form-title");
    if (index === -1) {
        formTitle.innerText = "Ajouter Médicament";
        medicationForm.reset();
        editingIndex = -1;
    } else {
        formTitle.innerText = "Modifier Médicament";
        const medication = medications[index];
        document.getElementById("med-name").value = medication.name;
        document.getElementById("med-quantity").value = medication.quantity;
        document.getElementById("med-price").value = medication.price;
        document.getElementById("med-expiration").value = medication.expirationDate;
        document.getElementById("med-category").value = medication.category;
        editingIndex = index;
    }
    document.getElementById("medication-form").classList.toggle("hidden");
};

const addMedication = (medication) => {
    // Vérification si le médicament existe déjà
    if (medications.some((med, index) =>
        med.name.toLowerCase() === medication.name.toLowerCase() && index !== editingIndex)) {
        alert("Ce Médicament existe déjà.");
        return;
    }

    // Vérification de la catégorie obligatoire
    if (!medication.category) {
        alert("La catégorie des médicaments est obligatoire.");
        return;
    }

    const expirationDate = new Date(medication.expirationDate);
    const currentDate = new Date();
    medication.isExpired = expirationDate <= currentDate;
    medication.isLowStock = parseInt(medication.quantity) < 8;

    // Ajouter ou modifier le médicament
    if (editingIndex === -1) {
        medications.push(medication);
    } else {
        medications[editingIndex] = medication;
        editingIndex = -1;
    }

    // Sauvegarde des médicaments dans localStorage
    localStorage.setItem("medications", JSON.stringify(medications));

    // Rafraîchissement des affichages
    renderFilteredTable();
    generateMedicationReport();
    document.getElementById("medication-form").classList.add("hidden"); // Masque le formulaire après ajout ou modification
};

const deleteMedication = (index) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
        medications.splice(index, 1);
        localStorage.setItem("medications", JSON.stringify(medications));
        renderFilteredTable();
        generateMedicationReport();
    }
};

const renderFilteredTable = () => {
    const searchValue = searchBar.value.toLowerCase();
    const filterCategory = categoryFilter.value;
    const showExpired = expiredFilter.checked;
    const showLowStock = lowStockFilter.checked;

    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchValue) &&
        (!filterCategory || med.category === filterCategory) &&
        (!showExpired || med.isExpired) &&
        (!showLowStock || med.isLowStock)
    );

    medicationTable.innerHTML = "";
    filteredMedications.forEach((med, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${med.name}</td>
            <td>${med.quantity}</td>
            <td>${formatCurrency(med.price)}</td>
            <td>${med.expirationDate}</td>
            <td>${med.category}</td>
            <td>${med.isExpired ? 'Oui' : 'Non'}</td>
            <td>${med.isLowStock ? 'Oui' : 'Non'}</td>
            <td>
                ${med.isExpired ? '' : `<button onclick="showMedicationForm(${index})">Modifier</button>`}
                <button onclick="deleteMedication(${index})">Supprimer</button>
            </td>
        `;
        medicationTable.appendChild(row);
    });
};

const generateMedicationReport = () => {
    let totalStockValue = 0;
    let fragment = document.createDocumentFragment();

    medications.forEach((med) => {
        const row = document.createElement('tr');
        row.classList.add('medication-row');

        const medicationNameCell = document.createElement('td');
        medicationNameCell.textContent = med.name;

        const quantityCell = document.createElement('td');
        quantityCell.textContent = med.quantity;

        const priceCell = document.createElement('td');
        priceCell.textContent = formatCurrency(med.price);

        const totalValueCell = document.createElement('td');
        const stockValue = med.quantity * med.price;
        totalValueCell.textContent = formatCurrency(stockValue);

        row.appendChild(medicationNameCell);
        row.appendChild(quantityCell);
        row.appendChild(priceCell);
        row.appendChild(totalValueCell);

        fragment.appendChild(row);
        totalStockValue += stockValue;
    });

    medicationListContainer.innerHTML = '';
    medicationListContainer.appendChild(fragment);
    totalStockValueCell.textContent = formatCurrency(totalStockValue);
};

document.getElementById("add-medication").addEventListener("click", () => showMedicationForm());
medicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("med-name").value;
    const quantity = document.getElementById("med-quantity").value;
    const price = document.getElementById("med-price").value;
    const expirationDate = document.getElementById("med-expiration").value;
    const category = document.getElementById("med-category").value;

    if (!name || !quantity || !price || !expirationDate || !category) {
        alert("Tous les champs sont obligatoires !");
        return;
    }

    const medication = { name, quantity, price, expirationDate, category };
    addMedication(medication);
});

searchBar.addEventListener("input", () => {
    renderFilteredTable();
});
categoryFilter.addEventListener("change", renderFilteredTable);
expiredFilter.addEventListener("change", renderFilteredTable);
lowStockFilter.addEventListener("change", renderFilteredTable);

// Initialisation de l'affichage
renderFilteredTable();
generateMedicationReport();
