// Definição do primeiro elevador com o andar atual, ID de exibição e estado inicial da porta
let elevador1 = {
    andarAtual: 1,
    displayId: 'lift-1',
    portaAberta: true
}

// Definição do segundo elevador com o andar atual, ID de exibição e estado inicial da porta
let elevador2 = {
    andarAtual: 1,
    displayId: 'lift-2',
    portaAberta: true
}

// Função para chamar um elevador para um determinado andar
function chamarElevador(andar) {
    // Verifica qual elevador está mais próximo do andar chamado
    let verificaElevadorProx = procuraElevadorProximo(andar);

    // Move o elevador escolhido para o andar chamado
    if (verificaElevadorProx === elevador1) {
        moverElevador(elevador1, andar);
        botaoPressionado('button-image-' + andar, './img/botaoApertado.png');
        setTimeout(function () {
            console.log('executa')
            resetBotao('button-image-' + andar, './img/botaoNormal.png');
        }, 800);
    } else if (verificaElevadorProx === elevador2) {
        moverElevador(elevador2, andar);
    }
}

// Função para determinar qual elevador está mais próximo do andar chamado
function procuraElevadorProximo(andar) {
    let distance1 = Math.abs(elevador1.andarAtual - andar);
    let distance2 = Math.abs(elevador2.andarAtual - andar);

    return distance1 <= distance2 ? elevador1 : elevador2;
}

// Função para mover o elevador para um determinado andar
function moverElevador(elevador, andar) {
    console.log(`Elevador ${elevador.displayId} saindo do andar ${elevador.andarAtual} para ${andar}`);

    // Verifica se o elevador já está em movimento
    if (elevador.moving) {
        return $.Deferred().reject();
    }

    // Verifica se o andar chamado é válido
    if (andar < 1 || andar > 9) {
        return $.Deferred().reject();
    }

    // Abre a porta quando o elevador começa a se mover
    abrirPorta(elevador);

    // Marca o elevador como em movimento
    elevador.moving = true;

    // Animação de movimento vertical do elevador
    $(`#${elevador.displayId} .elevador`).animate({
        bottom: `${(andar - 1) * 50}px`
    }, {
        duration: 300 * Math.abs(elevador.andarAtual - andar),
        easing: 'linear',
        complete: function () {
            // Atualiza o andar atual do elevador
            elevador.andarAtual = andar;
            // Marca o elevador como parado
            elevador.moving = false;

            // Fecha a porta quando o elevador para
            fecharPorta(elevador);
        }
    }).delay(50);

    // Animação de movimento vertical da porta do elevador
    $(`#${elevador.displayId} .elevador > div`).animate({
        top: `${-425 + andar * 50}px`
    }, {
        duration: 300 * Math.abs(elevador.andarAtual - andar),
        easing: 'linear'
    }).delay(50);

    return $.Deferred().resolve();
}

// Função para atualizar a exibição do andar atual do elevador
function atualizaAndar(elevador) {
    document.getElementById(elevador.displayId).innerText = elevador.andarAtual;
}

// Função para alterar a imagem de um botão quando pressionado
function botaoPressionado(id, novaImg) {
    document.getElementById(id).src = novaImg;
}

// Função para redefinir a imagem de um botão
function resetBotao(id, img) {
    document.getElementById(id).src = img;
}

// Função para abrir a porta do elevador
function abrirPorta(elevador) {
    elevador.portaAberta = true;
    atualizarPorta(elevador);
}

// Função para fechar a porta do elevador
function fecharPorta(elevador) {
    elevador.portaAberta = false;
    atualizarPorta(elevador);
}

// Função para atualizar a exibição da porta do elevador
function atualizarPorta(elevador) {
    // Determina a imagem da porta com base no estado da porta
    var portaImage = elevador.portaAberta ? './img/portaFechada.png' : './img/portaAberta.png';

    // Atualiza a imagem da porta no HTML
    $(`#${elevador.displayId} .elevador-image`).attr('src', portaImage);
}
