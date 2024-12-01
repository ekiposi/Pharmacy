 medications = JSON.parse(localStorage.getItem('medications')) || [];

 medicationSelectTemplate = document.querySelector('.medication-select');
 addSaleItemButton = document.getElementById('add-sale-item');
 salesItemsContainer = document.getElementById('sales-items');
 totalDisplay = document.getElementById('sales-total');
 salesForm = document.getElementById('sales-form');
 refreshButton = document.getElementById('refresh-button');

 populateMedicationSelect = (selectElement) => {
  let fragment = document.createDocumentFragment();
  medications.forEach((med, index) => {
    const expirationDate = new Date(med.expirationDate);
    const currentDate = new Date();
    if (expirationDate > currentDate) {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${med.name} - ${med.quantity} disponibles - ${med.price} GDES`;
      fragment.appendChild(option);
    }
  });
  selectElement.innerHTML = '<option value="">Choisir un médicament</option>';
  selectElement.appendChild(fragment);
};

 addSaleItem = () => {
  const saleItem = document.createElement('div');
  saleItem.classList.add('sales-item');
  saleItem.innerHTML = `
    <select class="medication-select">
      <option value="">Choisir un médicament</option>
    </select>
    <input type="number" class="sale-quantity" placeholder="Quantité" required>
    <button class="remove-sale-item">Supprimer</button>
    <p class="stock-warning" style="color: red; display: none;">Stock insuffisant pour cet article</p>
  `;
  salesItemsContainer.appendChild(saleItem);
  const newSelectElement = saleItem.querySelector('.medication-select');
  populateMedicationSelect(newSelectElement);
};

 calculateTotal = () => {
  let total = 0;
  const saleItems = salesItemsContainer.querySelectorAll('.sales-item');

  saleItems.forEach(item => {
    const medicationIndex = item.querySelector('.medication-select').value;
    const quantity = parseInt(item.querySelector('.sale-quantity').value, 10) || 0;
    const stockWarning = item.querySelector('.stock-warning');

    if (medicationIndex && quantity > 0) {
      const medication = medications[medicationIndex];
      const price = medication.price;
      total += price * quantity;

      if (quantity > medication.quantity) {
        stockWarning.style.display = 'block';
      } else {
        stockWarning.style.display = 'none';
      }
    }
  });

  totalDisplay.textContent = `Total : ${total} GDES`;
};

 removeSaleItem = (item) => {
  item.remove();
  calculateTotal();
};

salesForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const buyerName = document.getElementById('buyer-name').value;
  const buyerPhone = document.getElementById('buyer-phone').value;
  const buyerEmail = document.getElementById('buyer-email').value;
  const saleItems = salesItemsContainer.querySelectorAll('.sales-item');
  const itemsSold = [];
  let isFormValid = true;

  saleItems.forEach(item => {
    const medicationIndex = item.querySelector('.medication-select').value;
    const quantity = parseInt(item.querySelector('.sale-quantity').value, 10) || 0;

    if (medicationIndex && quantity > 0) {
      const medication = medications[medicationIndex];
      if (quantity > medication.quantity) {
        isFormValid = false;
      } else {
        itemsSold.push({
          name: medication.name,
          quantity,
          price: medication.price
        });
        medication.quantity -= quantity;
      }
    }
  });

  if (!isFormValid) {
    alert('Quantité insuffisante pour l’un des articles sélectionnés.');
    return;
  }

  localStorage.setItem('medications', JSON.stringify(medications));
  printReceipt(buyerName, buyerPhone, buyerEmail, itemsSold);
  salesForm.reset();
  salesItemsContainer.innerHTML = '';
  calculateTotal();
});

const printReceipt = (buyerName, buyerPhone, buyerEmail, itemsSold) => {
  const receiptContent = `
<div style="font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.4; width: 100%; max-width: 90mm; margin: 0 auto; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f7f7f7; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; margin-bottom: 15px;">
    <h2 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: bold;">CENTRE HOSPITALIER NOTRE DAME DE LA MERCI S.A - Pharma</h2>
    <p style="font-size: 10px; color: #7f8c8d; margin: 3px 0;">Adresse : 5, Rue Rivière en face du Rectorat de l'UEH</p>
    <p style="font-size: 10px; color: #7f8c8d; margin: 3px 0;">Email: <a href="mailto:pharmachndlm@gmail.com" style="color: #7f8c8d; text-decoration: none;">pharmachndlm@gmail.com</a></p>
    <p style="font-size: 10px; color: #7f8c8d; margin: 3px 0;">Téléphone: +509 2910-3131</p>
  </div>
  <div style="border-bottom: 2px solid black; margin-bottom: 10px;"></div>
  <p style="font-size: 10px; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  <p style="font-size: 10px; margin: 5px 0;"><strong>Nom de l'acheteur:</strong> ${buyerName}</p>
  <p style="font-size: 10px; margin: 5px 0;"><strong>Numéro de téléphone:</strong> ${buyerPhone}</p>
  <p style="font-size: 10px; margin: 5px 0;"><strong>Email:</strong> ${buyerEmail}</p>
  <div style="border-bottom: 2px solid black; margin: 10px 0;"></div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 4px 5px; font-size: 10px; background-color: black; color: white;">Médicament(s)</th>
        <th style="text-align: right; padding: 4px 5px; font-size: 10px; background-color: black; color: white;">Quantité(s)</th>
        <th style="text-align: right; padding: 4px 5px; font-size: 10px; background-color: black; color: white;">Prix unitaire</th>
        <th style="text-align: right; padding: 4px 5px; font-size: 10px; background-color: black; color: white;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsSold.map(item => `
        <tr>
          <td style="padding: 4px 5px; font-size: 10px; border-bottom: 1px solid #ddd; color: #333;">${item.name}</td>
          <td style="text-align: right; padding: 4px 5px; font-size: 10px; border-bottom: 1px solid #ddd; color: #333;">${item.quantity}</td>
          <td style="text-align: right; padding: 4px 5px; font-size: 10px; border-bottom: 1px solid #ddd; color: #333;">${item.price} GDES</td>
          <td style="text-align: right; padding: 4px 5px; font-size: 10px; border-bottom: 1px solid #ddd; color: #333;">${(item.quantity * item.price).toFixed(2)} GDES</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div style="border-top: 2px solid black; margin-top: 10px; padding-top: 5px;">
    <p style="text-align: right; font-size: 12px; font-weight: bold; color: black;">Total: ${itemsSold.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)} GDES</p>
  </div>
  <div style="border-top: 2px solid black; margin: 10px 0;"></div>
  <p style="text-align: center; font-size: 10px; margin-top: 10px; color: #777;">Merci pour votre achat ! Bon rétablissement à vous.</p>
  <p style="text-align: center; font-size: 10px; margin-top: 5px; color: black;">Le système a été conçu par NexGen Spark | Tél : +509 42 00 03 15 / +509 36 44 46 75</p>
</div>
  `;

  const printWindow = window.open('', '', 'height=600,width=300');  
  printWindow.document.write(receiptContent);
  printWindow.document.close();
  printWindow.print();
};

addSaleItemButton.addEventListener('click', addSaleItem);

salesItemsContainer.addEventListener('input', calculateTotal);

salesItemsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-sale-item')) {
    removeSaleItem(event.target.closest('.sales-item'));
  }
});

refreshButton.addEventListener('click', () => location.reload());

populateMedicationSelect(document.querySelector('.medication-select'));
calculateTotal();
