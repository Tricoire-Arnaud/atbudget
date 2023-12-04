let transactions = loadTransactionsFromLocal();
let transactionChart;

// Appel initial des fonctions de mise à jour
updateTransactionsList();
updateBalance();
updateChart();
updateCategoryDropdown();

function ajouterTransaction() {
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (description !== '' && !isNaN(amount)) {
        const transaction = {
            type: type,
            description: description,
            amount: amount,
            category: category
        };

        transactions.push(transaction);
        updateTransactionsList();
        updateBalance();
        updateChart();
        saveDataToLocal();
        clearInputs();
        updateCategoryDropdown();
    } else {
        alert('Veuillez saisir une description et un montant valide.');
    }
}

function supprimerTransaction(index) {
    transactions.splice(index, 1);
    updateTransactionsList();
    updateBalance();
    updateChart();
    saveDataToLocal();
    updateCategoryDropdown();
}

function reinitialiser() {
    transactions = [];
    updateTransactionsList();
    updateBalance();
    updateChart();
    clearInputs();
    saveDataToLocal();
    updateCategoryDropdown();
}

function filtrerTransactions() {
    const filterCategory = document.getElementById('filter').value;

    const filteredTransactions = transactions.filter(transaction => {
        const categoryCondition = filterCategory === 'all' || transaction.category === filterCategory;
        return categoryCondition;
    });

    updateTransactionsList(filteredTransactions);
    updateChart();
}

function updateTransactionsList(transactionsList = transactions) {
    const transactionsListElement = document.getElementById('transactions-list');
    transactionsListElement.innerHTML = '';

    transactionsList.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                ${transaction.description} (${transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)} €)
                <span class="category">${transaction.category}</span>
            </div>
            <span class="actions">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="supprimerTransaction(${index})">✖</button>
            </span>
        `;
        transactionsListElement.appendChild(li);
    });
}
function updateChart() {
    const chartCanvas = document.getElementById('transaction-chart');

    if (transactionChart) {
        transactionChart.data.labels = transactions.map(transaction => transaction.description);
        transactionChart.data.datasets[0].data = transactions.map(transaction => transaction.balance);
        transactionChart.update();
    } else {
        transactionChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: transactions.map(transaction => transaction.description),
                datasets: [{
                    label: 'Solde du Budget',
                    data: transactions.map(transaction => transaction.balance),
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateBalance() {
    let runningBalance = 0;

    transactions.forEach((transaction, index) => {
        const transactionType = transaction.type;
        const transactionAmount = transaction.amount;

        if (transactionType === 'income') {
            runningBalance += transactionAmount;
        } else {
            runningBalance -= transactionAmount;
        }

        transaction.balance = runningBalance;
    });

    const balanceElement = document.getElementById('balance');

    balanceElement.classList.remove('text-success', 'text-warning', 'text-danger');

    if (runningBalance < 200 && runningBalance > 0) {
        balanceElement.classList.add('text-warning');
    } else if (runningBalance <= 0) {
        balanceElement.classList.add('text-danger');
    } else {
        balanceElement.classList.add('text-success');
    }

    balanceElement.textContent = runningBalance.toFixed(2) + ' €';
}

function clearInputs() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = ''; // Vide la sélection de la catégorie
}

function saveDataToLocal() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactionsFromLocal() {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
}

function updateCategoryDropdown() {
    const categoryDropdown = document.getElementById('category');
    const uniqueCategories = [...new Set(['Salaire', 'Alimentation', 'Logement', 'Véhicule', ...transactions.map(transaction => transaction.category)])];

    categoryDropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Sélectionner une catégorie';
    categoryDropdown.appendChild(defaultOption);

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });

    // Mettez à jour également le filtre par catégorie
    const filterDropdown = document.getElementById('filter');
    filterDropdown.innerHTML = '';

    const allFilterOption = document.createElement('option');
    allFilterOption.value = 'all';
    allFilterOption.textContent = 'Toutes les catégories';
    filterDropdown.appendChild(allFilterOption);

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterDropdown.appendChild(option);
    });
}