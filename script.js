document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://gypqpbnybmztoaclahdm.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cHFwYm55Ym16dG9hY2xhaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0ODUwNTYsImV4cCI6MjAzNzA2MTA1Nn0.x6FZzfQa33RsOQbGGwNx6NqwmHe7c-tCg0mxiCGenLo';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  const filterDateInput = document.getElementById('filter-date');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signupButton = document.getElementById('signup-btn');
  const loginButton = document.getElementById('login-btn');
  const logoutButton = document.getElementById('logout-btn');
  const contentDiv = document.getElementById('content');
  const homeDiv = document.getElementById('home');
  const dateInput = document.getElementById('date');
  const productNameInput = document.getElementById('product-name');
  const priceInput = document.getElementById('price');
  const quantityInput = document.getElementById('quantity');
  const addProductButton = document.getElementById('add-product');
  const productList = document.getElementById('product-list');
  let editingProductId = null;

  function showHome() {
    homeDiv.style.display = 'block';
    document.getElementById('auth').style.display = 'none';
    contentDiv.style.display = 'none';
  }

  function showAuth() {
    homeDiv.style.display = 'none';
    document.getElementById('auth').style.display = 'block';
    contentDiv.style.display = 'none';
  }

  function showContent() {
    homeDiv.style.display = 'none';
    document.getElementById('auth').style.display = 'none';
    contentDiv.style.display = 'block';
    logoutButton.style.display = 'block';
  }

  function hideContent() {
    showHome();
    logoutButton.style.display = 'none';
  }

  document.getElementById('signup').addEventListener('click', showAuth);
  document.getElementById('login').addEventListener('click', showAuth);

  if (signupButton) {
    signupButton.addEventListener('click', async () => {
      const email = emailInput?.value.trim();
      const password = passwordInput?.value;

      if (!email || !password) {
        alert('Veuillez entrer une adresse email et un mot de passe.');
        return;
      }

      const { user, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        console.error('Erreur lors de l\'inscription:', error.message);
        alert('Erreur lors de l\'inscription: ' + error.message);
      } else {
        console.log('Utilisateur inscrit:', user);
        alert('Utilisateur inscrit avec succès!');
        showAuth();
      }
    });
  }

  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      const email = emailInput?.value.trim();
      const password = passwordInput?.value;

      if (!email || !password) {
        alert('Veuillez entrer une adresse email et un mot de passe.');
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Erreur lors de la connexion:', error.message);
        alert('Erreur lors de la connexion: ' + error.message);
      } else {
        console.log('Utilisateur connecté:', data.user);
        alert('Utilisateur connecté avec succès!');
        showContent();
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error.message);
        alert('Erreur lors de la déconnexion: ' + error.message);
      } else {
        console.log('Utilisateur déconnecté');
        hideContent();
      }
    });
  }

  if (addProductButton) {
    addProductButton.addEventListener('click', async () => {
      const created_at = dateInput?.value;
      const productName = productNameInput?.value;
      const price = parseFloat(priceInput?.value);
      const quantity = parseInt(quantityInput?.value);

      if (!created_at || !productName || isNaN(price) || isNaN(quantity)) {
        alert('Veuillez entrer toutes les informations du produit.');
        return;
      }

      const table = 'products';

      if (editingProductId) {
        const { data, error } = await supabaseClient
          .from(table)
          .update({ created_at, name: productName, price, quantity })
          .eq('id', editingProductId);

        if (error) {
          console.error('Erreur lors de la mise à jour du produit:', error.message);
          alert('Erreur lors de la mise à jour du produit: ' + error.message);
        } else {
          console.log('Produit mis à jour:', data);
          alert('Produit mis à jour avec succès!');
          editingProductId = null;
        }
      } else {
        const { data, error } = await supabaseClient
          .from(table)
          .insert([{ created_at, name: productName, price, quantity }]);

        if (error) {
          console.error('Erreur lors de l\'ajout du produit:', error.message);
          alert('Erreur lors de l\'ajout du produit: ' + error.message);
        } else {
          console.log('Produit ajouté:', data);
          alert('Produit ajouté avec succès!');
        }
      }

      dateInput.value = '';
      productNameInput.value = '';
      priceInput.value = '';
      quantityInput.value = '';

      fetchProducts(); // Actualiser la liste des produits après ajout ou modification
    });
  }

  async function fetchProducts(filterDate = null) {
    let query = supabaseClient
      .from('products')
      .select('*');

    if (filterDate) {
      // Filtrer par date
      query = query.eq('created_at', filterDate);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error.message);
      return;
    }

    productList.innerHTML = '';

    products.forEach(product => {
      const date = new Date(product.created_at);
      const formattedDate = date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const card = document.createElement('div');
      card.className = `col-md-4 mb-4`;

      const cardContent = `
        <div class="card ${product.purchased ? 'purchased' : 'not-purchased'}">
          <div class="card-body">
            <h5 class="card-title">Nom du produit: ${product.name}</h5>
            <p class="card-text">Date: ${formattedDate}</p>
            <p class="card-text">Prix: ${product.price} F CFA</p>
            <p class="card-text">Quantité: ${product.quantity}</p>
            <p class="card-text">Statut: ${product.purchased ? 'Déjà acheté' : 'Non acheté'}</p>
            <button class="btn btn-primary edit-btn"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger delete-btn"><i class="fas fa-trash-alt"></i></button>
            <button class="btn ${product.purchased ? 'btn-success' : 'btn-warning'} purchased-btn"><i class="fas fa-shopping-cart"></i></button>
          </div>
        </div>
      `;

      card.innerHTML = cardContent;

      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');
      const purchasedBtn = card.querySelector('.purchased-btn');

      editBtn.addEventListener('click', () => {
        editingProductId = product.id;
        dateInput.value = product.created_at;
        productNameInput.value = product.name;
        priceInput.value = product.price;
        quantityInput.value = product.quantity;
        showContent();
      });

      deleteBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) {
          console.error('Erreur lors de la suppression du produit:', error.message);
          alert('Erreur lors de la suppression du produit: ' + error.message);
        } else {
          console.log('Produit supprimé');
          alert('Produit supprimé avec succès!');
          fetchProducts(); // Actualiser la liste des produits après suppression
        }
      });

      purchasedBtn.addEventListener('click', async () => {
        const purchased = !product.purchased;
        const { error } = await supabaseClient
          .from('products')
          .update({ purchased })
          .eq('id', product.id);

        if (error) {
          console.error('Erreur lors de la mise à jour du statut d\'achat:', error.message);
          alert('Erreur lors de la mise à jour du statut d\'achat: ' + error.message);
        } else {
          console.log('Statut d\'achat mis à jour');
          alert('Statut d\'achat mis à jour avec succès!');
          fetchProducts(); // Actualiser la liste des produits après modification du statut
        }
      });

      productList.appendChild(card);
    });
  }

  // Appeler fetchProducts avec la date filtrée
  filterDateInput.addEventListener('change', () => {
    const selectedDate = filterDateInput.value;
    fetchProducts(selectedDate); // Passer la date sélectionnée pour le filtrage
  });

  // Appeler fetchProducts sans date pour charger tous les produits au départ
  fetchProducts();
});
