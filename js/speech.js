// ========== CONFIGURAÇÃO DA VOZ (Web Speech API) ==========
let voices = [];
let currentUtterance = null;

function carregarVozes() {
    voices = speechSynthesis.getVoices();
    const select = document.getElementById('voice-select');
    if (!select) return;

    select.innerHTML = '';

    const preferidas = voices.filter(v =>
        v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')
    );

    const lista = preferidas.length > 0 ? preferidas : voices;

    lista.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voices.indexOf(voice);
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.lang.includes('en-US') || voice.name.toLowerCase().includes('us')) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    if (select.options.length > 0 && !select.value) {
        select.selectedIndex = 0;
    }
}

speechSynthesis.onvoiceschanged = carregarVozes;
document.addEventListener('DOMContentLoaded', carregarVozes);

document.addEventListener('DOMContentLoaded', () => {
    const rate = document.getElementById('rate');
    const pitch = document.getElementById('pitch');
    if (rate) {
        rate.addEventListener('input', function () {
            const el = document.getElementById('rate-value');
            if (el) el.textContent = this.value;
        });
    }
    if (pitch) {
        pitch.addEventListener('input', function () {
            const el = document.getElementById('pitch-value');
            if (el) el.textContent = parseFloat(this.value).toFixed(1);
        });
    }

    const input = document.getElementById('texto-para-falar');
    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') falarTexto();
        });
    }
});

function falarTexto() {
    const input = document.getElementById('texto-para-falar');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) {
        atualizarStatus('Digite uma palavra ou frase primeiro!', false);
        return;
    }
    falar(texto);
}

function falarPalavra(texto) {
    const input = document.getElementById('texto-para-falar');
    if (input) input.value = texto;
    falar(texto);
}

function falar(texto) {
    speechSynthesis.cancel();

    if (!('speechSynthesis' in window)) {
        atualizarStatus('Seu navegador não suporta síntese de voz.', false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'en-US';

    const rateEl = document.getElementById('rate');
    const pitchEl = document.getElementById('pitch');
    utterance.rate = rateEl ? parseFloat(rateEl.value) : 0.9;
    utterance.pitch = pitchEl ? parseFloat(pitchEl.value) : 1.0;

    const select = document.getElementById('voice-select');
    if (select && voices[select.value]) {
        utterance.voice = voices[select.value];
    }

    const btn = document.getElementById('btn-falar');

    utterance.onstart = () => {
        atualizarStatus(`🔊 Falando: "${texto}"`, true);
        if (btn) btn.disabled = true;
    };

    utterance.onend = () => {
        atualizarStatus('Pronto para ouvir', false);
        if (btn) btn.disabled = false;
    };

    utterance.onerror = () => {
        atualizarStatus('Erro ao reproduzir. Tente outra voz.', false);
        if (btn) btn.disabled = false;
    };

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

function pararFala() {
    speechSynthesis.cancel();
    atualizarStatus('Áudio interrompido', false);
    const btn = document.getElementById('btn-falar');
    if (btn) btn.disabled = false;
}

function atualizarStatus(msg, falando) {
    const el = document.getElementById('status-audio');
    if (!el) return;
    el.textContent = msg;
    el.className = falando ? 'status-falando' : '';
}

function mostrarRespostas(id) {
    const el = document.getElementById(id || 'respostas');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function mostrarFraseColorida(id) {
    const el = document.getElementById(id || 'frase-colorida');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function responderQuiz(botao, correto) {
    const opcoes = botao.parentElement.querySelectorAll('.opcao');
    opcoes.forEach(o => {
        o.style.pointerEvents = 'none';
        if (o.dataset.correto === 'true') o.classList.add('correta');
    });
    if (!correto) botao.classList.add('errada');
}
