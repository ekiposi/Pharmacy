window.onload = () => {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const salesTableBody = document.querySelector('#sales-report-table tbody');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const salesFilter = document.getElementById('sales-filter');

    // Function to render the sales table
    const renderTable = (data) => {
        salesTableBody.innerHTML = ''; // Clear previous content

        if (data.length === 0) {
            salesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucune donnée disponible</td></tr>';
            return;
        }

        data.forEach((sale) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.date}</td>
                <td>${sale.clientName}</td>
                <td>${sale.items.map(item => item.medication).join(', ')}</td>
                <td>${sale.items.map(item => item.quantity).join(', ')}</td>
                <td>${sale.items.map(item => `${item.price} GDES`).join(', ')}</td>
                <td>${sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} GDES</td>
            `;
            salesTableBody.appendChild(row);
        });
    };

    // Function to filter sales
    const filterSales = () => {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        const filter = salesFilter.value;

        const filteredSales = salesHistory.filter((sale) => {
            const saleDate = new Date(sale.date);

            // Check date range filter
            const withinDateRange =
                (!startDate || saleDate >= startDate) &&
                (!endDate || saleDate <= endDate);

            // Check sales filter (optional)
            if (filter === 'high') {
                return withinDateRange && sale.items.some(item => item.quantity > 50);
            } else if (filter === 'medium') {
                return withinDateRange && sale.items.some(item => item.quantity > 20 && item.quantity <= 50);
            } else if (filter === 'low') {
                return withinDateRange && sale.items.some(item => item.quantity <= 20);
            }

            return withinDateRange;
        });

        renderTable(filteredSales);
    };

    // Function to download table as PDF
    const downloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Rapport de Ventes - CHNDLM S.A - Pharma', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleString()}`, 105, 40, null, null, 'center');

        // Export the sales table to PDF
        doc.autoTable({
            html: '#sales-report-table',
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: [60, 141, 188] },
        });

        doc.save('rapport_de_ventes.pdf');
    };

    // Attach event listeners
    document.getElementById('filter-button').addEventListener('click', filterSales);
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);

    // Initial render
    renderTable(salesHistory);
};
