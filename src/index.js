import axios from 'axios';
import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreButton = document.querySelector('.load-more');
let currentPage = 1;

loadMoreButton.style.display = 'none';

loadMoreButton.addEventListener('click', async function () {
  currentPage++;
  await performImageSearch();
});

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  currentPage = 1; // Zresetowanie numeru strony po wysłaniu nowego zapytania
  clearGallery(); // Wyczyszczenie galerii z poprzednich wyników wyszukiwania
  await performImageSearch();
});

async function performImageSearch() {
  const searchQuery = form.elements['searchQuery'].value.trim();

  Notiflix.Notify.init();
  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '43747926-83b320918c877c3a4a391463e',
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    const imageData = response.data.hits;
    const totalHits = response.data.totalHits; // Pobranie całkowitej liczby obrazków

    if (imageData.length === 0) {
      clearGallery();
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    renderGallery(imageData);

    if (currentPage === 1) {
      loadMoreButton.style.display = 'block';
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`); // Pokazanie powiadomienia po pierwszym żądaniu
    }

    // Płynne przewijanie strony po wywołaniu żądania
    smoothScroll();
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}

function clearGallery() {
  gallery.innerHTML = '';
}

function renderGallery(images) {
  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');

    const likes = document.createElement('p');
    likes.classList.add('info-item');
    likes.innerHTML = `<b>Likes:</b> ${image.likes}`;

    const views = document.createElement('p');
    views.classList.add('info-item');
    views.innerHTML = `<b>Views:</b> ${image.views}`;

    const comments = document.createElement('p');
    comments.classList.add('info-item');
    comments.innerHTML = `<b>Comments:</b> ${image.comments}`;

    const downloads = document.createElement('p');
    downloads.classList.add('info-item');
    downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;

    info.appendChild(likes);
    info.appendChild(views);
    info.appendChild(comments);
    info.appendChild(downloads);

    card.appendChild(img);
    card.appendChild(info);

    gallery.appendChild(card);
  });
}

function smoothScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
