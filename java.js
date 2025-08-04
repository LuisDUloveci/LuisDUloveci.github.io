let modo = "morseParaTexto";

const morseParaTexto = {
  '.-': 'A', '-...': 'B', '-.-.': 'C',
  '-..': 'D', '.': 'E', '..-.': 'F',
  '--.': 'G', '....': 'H', '..': 'I',
  '.---': 'J', '-.-': 'K', '.-..': 'L',
  '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R',
  '...': 'S', '-': 'T', '..-': 'U',
  '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z',
  '-----': '0', '.----': '1', '..---': '2',
  '...--': '3', '....-': '4', '.....': '5',
  '-....': '6', '--...': '7', '---..': '8',
  '----.': '9',
  '/': ' '
};

const textoParaMorse = Object.entries(morseParaTexto).reduce((obj, [morse, letra]) => {
  obj[letra] = morse;
  return obj;
}, {});

function traduzir() {
  const entrada = document.getElementById("morseInput").innerText.trim();
  let resultado = "";

  if (modo === "morseParaTexto") {
    let palavras = entrada.split(/\s{3,}| \/ /g);
    resultado = palavras.map(palavra => {
      let letras = palavra.split(" ");
      return letras.map(s => morseParaTexto[s] || '?').join('');
    }).join(' ');
  } else {
    resultado = entrada.toUpperCase().split('').map(c => {
      if (c === ' ') return '/';
      return textoParaMorse[c] || '?';
    }).join(' ');
  }
  document.getElementById("morseOutput").innerText = resultado;
}

function alternarModo() {
  if (modo === "morseParaTexto") {
    modo = "textoParaMorse";
    document.querySelector("button[onclick='alternarModo()']").innerText = "Alternar para Morse → Texto";
    document.getElementById("modoAtual").innerHTML = "<strong>Modo atual:</strong> Texto → Morse";
  } else {
    modo = "morseParaTexto";
    document.querySelector("button[onclick='alternarModo()']").innerText = "Alternar para Texto → Morse";
    document.getElementById("modoAtual").innerHTML = "<strong>Modo atual:</strong> Morse → Texto";
  }
  document.getElementById("morseInput").innerText = "";
  document.getElementById("morseOutput").innerText = "";
}

function mostrarInfo() {
  document.getElementById("mainEditor").style.display = "none";
  document.getElementById("infoSection").style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltar() {
  document.getElementById("infoSection").style.display = "none";
  document.getElementById("mainEditor").style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// CLIQUE PARA MORSE

let morsePorClique = "";
let cliqueInicio = null;
let timerEspaco = null;

// som agudo realista de código morse
let ctx = null;
let oscillator = null;
let gainNode = null;

function iniciarSom(frequencia) {
  try {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    ctx = new AudioContext();
    oscillator = ctx.createOscillator();
    gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequencia;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(1, ctx.currentTime);

    oscillator.start();
  } catch (e) {
    console.error(e);
  }
}

function pararSom() {
  if (!ctx || !oscillator || !gainNode) return;

  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  oscillator.stop(ctx.currentTime + 0.05);
  oscillator.onended = () => {
    ctx.close();
    ctx = null;
    oscillator = null;
    gainNode = null;
  };
}

function tocarPonto() {
  gerarSom(1000, 100); // som curto e agudo
}

function tocarTraco() {
  gerarSom(1000, 300); // som longo e agudo
}

function iniciarClique() {
  cliqueInicio = Date.now();
  if (timerEspaco) {
    clearTimeout(timerEspaco);
    timerEspaco = null;
  }
  iniciarSom(1000);  // Inicia som AGORA
}

function finalizarClique() {
  if (!cliqueInicio) return;
  let duracao = Date.now() - cliqueInicio;
  cliqueInicio = null;

  pararSom();

  if (duracao < 300) {
    morsePorClique += '.';
  } else {
    morsePorClique += '-';
  }

  // NÃO adiciona espaço aqui, espera o timeout pra decidir o espaço

  document.getElementById("morseViaClique").innerText = "Morse: " + morsePorClique;
  traduzirPorClique();

  if (timerEspaco) clearTimeout(timerEspaco);

  // Depois de 1 segundo sem clique, adiciona espaço de letra (se não tiver espaço já)
  timerEspaco = setTimeout(() => {
    // Se o último caractere não for espaço, adiciona um espaço
    if (!morsePorClique.endsWith(' ')) {
      morsePorClique += ' ';
      document.getElementById("morseViaClique").innerText = "Morse: " + morsePorClique;
      traduzirPorClique();
    }
  }, 1000);

  //Suporte a espaço de palavra (3 espaços) após pausa maior, pode usar outro timer maior
  setTimeout(() => {
    if (!morsePorClique.endsWith('  ')) {
      morsePorClique += ' '; // adiciona 2 espaços extras = 3 espaços no total
      document.getElementById("morseViaClique").innerText = "Morse: " + morsePorClique;
      traduzirPorClique();
    }
  }, 4000);
}


function traduzirPorClique() {
  let entrada = morsePorClique.trim();
  if (entrada.length === 0) {
    document.getElementById("traducaoClique").innerText = "Tradução: ";
    return;
  }

  let palavras = entrada.split(/\s{3,}/);
  let resultado = palavras.map(palavra => {
    let letras = palavra.trim().split(/\s+/);
    return letras.map(codigo => morseParaTexto[codigo] || '?').join('');
  }).join(' ');

  document.getElementById("traducaoClique").innerText = "Tradução: " + resultado;
}

function limparClique() {
  morsePorClique = "";
  document.getElementById("morseViaClique").innerText = "Morse: ";
  document.getElementById("traducaoClique").innerText = "Tradução: ";
  if (timerEspaco) {
    clearTimeout(timerEspaco);
    timerEspaco = null;
  }
}
