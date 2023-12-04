// Chargement des transactions depuis le stockage local
let transactions = loadTransactionsFromLocal();

// Variable pour le graphique des transactions
let transactionChart;

// Appel initial des fonctions de mise à jour
updateTransactionsList();
updateBalance();
updateChart();
updateCategoryDropdown();

// Fonction pour ajouter une nouvelle transaction
function ajouterTransaction() {
    // Récupération des valeurs du formulaire
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    // Vérification de la validité de la description et du montant
    if (description !== '' && !isNaN(amount)) {
        // Création de l'objet transaction
        const transaction = {
            type: type,
            description: description,
            amount: amount,
            category: category
        };

        // Ajout de la transaction à la liste
        transactions.push(transaction);
        
        // Mise à jour de l'affichage
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

// Fonction pour supprimer une transaction
function supprimerTransaction(index) {
    transactions.splice(index, 1);
    updateTransactionsList();
    updateBalance();
    updateChart();
    saveDataToLocal();
    updateCategoryDropdown();
}

// Fonction pour réinitialiser toutes les transactions
function reinitialiser() {
    transactions = [];
    updateTransactionsList();
    updateBalance();
    updateChart();
    clearInputs();
    saveDataToLocal();
    updateCategoryDropdown();
}

// Fonction pour filtrer les transactions par catégorie
function filtrerTransactions() {
    const filterCategory = document.getElementById('filter').value;

    const filteredTransactions = transactions.filter(transaction => {
        const categoryCondition = filterCategory === 'all' || transaction.category === filterCategory;
        return categoryCondition;
    });

    updateTransactionsList(filteredTransactions);
    updateChart();
}

// Fonction pour mettre à jour la liste des transactions dans l'interface
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

// Fonction pour mettre à jour le graphique des transactions
function updateChart() {
    const chartCanvas = document.getElementById('transaction-chart');

    if (transactionChart) {
        // Mise à jour des données du graphique
        transactionChart.data.labels = transactions.map(transaction => transaction.description);
        transactionChart.data.datasets[0].data = transactions.map(transaction => transaction.balance);
        transactionChart.update();
    } else {
        // Création initiale du graphique
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

// Fonction pour mettre à jour le solde du budget
function updateBalance() {
    let runningBalance = 0;

    transactions.forEach((transaction, index) => {
        const transactionType = transaction.type;
        const transactionAmount = transaction.amount;

        // Calcul du solde en fonction du type de transaction
        if (transactionType === 'income') {
            runningBalance += transactionAmount;
        } else {
            runningBalance -= transactionAmount;
        }

        // Ajout du solde à chaque transaction
        transaction.balance = runningBalance;
    });

    // Mise à jour de l'affichage du solde
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

// Fonction pour effacer les champs du formulaire
function clearInputs() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = ''; // Vide la sélection de la catégorie
}

// Fonction pour sauvegarder les transactions dans le stockage local
function saveDataToLocal() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fonction pour charger les transactions depuis le stockage local
function loadTransactionsFromLocal() {
    const storedTransactions = localStorage.getItem('transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : [];
}

// Fonction pour mettre à jour le menu déroulant des catégories
function updateCategoryDropdown() {
    const categoryDropdown = document.getElementById('category');
    
    // Obtention des catégories uniques
    const uniqueCategories = [...new Set(['Salaire', 'Alimentation', 'Logement', 'Véhicule', ...transactions.map(transaction => transaction.category)])];

    categoryDropdown.innerHTML = '';

    // Création de l'option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Sélectionner une catégorie';
    categoryDropdown.appendChild(defaultOption);

    // Ajout des catégories au menu déroulant
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });

    // Mettez à jour également le filtre par catégorie
    const filterDropdown = document.getElementById('filter');
    filterDropdown.innerHTML = '';

    // Création de l'option "Toutes les catégories"
    const allFilterOption = document.createElement('option');
    allFilterOption.value = 'all';
    allFilterOption.textContent = 'Toutes les catégories';
    filterDropdown.appendChild(allFilterOption);

    // Ajout des catégories au filtre
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterDropdown.appendChild(option);
    });
}
