const fileInput = document.getElementById('fileInput');
const soundList = document.getElementById('soundList');

const DB_NAME = 'soundboardDB';
const STORE_NAME = 'sounds';

let db;

// Abre ou cria o banco IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject("Erro ao abrir IndexedDB");

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
  });
}

// Adiciona um som ao banco
function saveSound(name, blob) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ name, blob });

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Erro ao salvar som");
  });
}

// Busca todos os sons do banco
function getAllSounds() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao buscar sons");
  });
}

// Remove som do banco
function deleteSound(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Erro ao deletar som");
  });
}

// Cria visualmente o botão de som
function createSoundItem({ id, name, blob }) {
  const audioURL = URL.createObjectURL(blob);
  const audio = new Audio(audioURL);
  audio.preload = "auto";

  const container = document.createElement('div');
  container.classList.add('audio-item');

  const button = document.createElement('button');
  button.innerHTML = `▶️ ${name}`;
  button.classList.add('sound-button');

  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.step = 0.01;
  volumeSlider.value = 1;
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
  });

  let isPlaying = false;
  button.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      isPlaying = false;
      button.innerHTML = `▶️ ${name}`;
    } else {
      audio.play();
      isPlaying = true;
      button.innerHTML = `⏸️ ${name}`;
    }
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    button.innerHTML = `▶️ ${name}`;
  });

  container.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const confirmDelete = confirm(`Remover "${name}" do soundboard?`);
    if (confirmDelete) {
      container.remove();
      deleteSound(id);
    }
  });

  container.appendChild(button);
  container.appendChild(volumeSlider);
  soundList.appendChild(container);
}

// Quando o usuário carrega novos arquivos
fileInput.addEventListener('change', async (event) => {
  const files = event.target.files;

  for (let file of files) {
    if (file.type === "audio/mpeg") {
      let customName = prompt(`Digite o nome para "${file.name}"`, file.name.replace(".mp3", ""));
      if (!customName) customName = file.name.replace(".mp3", "");

      const blob = file;
      await saveSound(customName, blob);

      // Recarrega tudo pra garantir consistência
      soundList.innerHTML = '';
      const sounds = await getAllSounds();
      sounds.forEach(createSoundItem);
    }
  }

  fileInput.value = ''; // limpa para permitir mesmo nome depois
});

// Inicializa tudo
(async () => {
  await openDB();
  const sounds = await getAllSounds();
  sounds.forEach(createSoundItem);
})();

/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
} 

document.querySelectorAll('.sidenav a[data-theme]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const theme = this.getAttribute('data-theme');

    // Remove temas antigos
    document.body.classList.remove('theme-default', 'theme-gay', 'theme-asexual','theme-aromantic', 'theme-bisexual', 'theme-lesbian', 'theme-enby');

    // Aplica o novo
    document.body.classList.add('theme-' + theme);

    // Fecha o menu
    closeNav();
  });
});
