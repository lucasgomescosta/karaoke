import type { Song } from '../types/song';

/**
 * Músicas com letras sincronizadas para karaokê.
 *
 * pitchHz = frequência de referência aproximada da melodia naquela linha.
 * Os tempos (startTime/endTime) são em segundos, sincronizados com o vídeo do YouTube.
 *
 * Para adicionar novas músicas:
 * 1. Encontre um vídeo de karaokê no YouTube
 * 2. Anote os tempos de cada linha da letra
 * 3. Opcionalmente, adicione o pitchHz da nota principal de cada linha
 */

export const songs: Song[] = [
  {
    id: '1',
    title: 'Evidências',
    artist: 'Chitãozinho & Xororó',
    youtubeVideoId: 'ePjtnSPFWK8',
    lyrics: [
      // Verso 1
      { id: 1,  text: 'Quando eu digo que deixei de te amar',   startTime: 30, endTime: 35, pitchHz: 220 },
      { id: 2,  text: 'É porque eu te amo',                     startTime: 35, endTime: 38, pitchHz: 247 },
      { id: 3,  text: 'Quando eu digo que não quero mais você',  startTime: 38, endTime: 43, pitchHz: 220 },
      { id: 4,  text: 'É porque eu te quero',                   startTime: 43, endTime: 46, pitchHz: 247 },
      // Verso 2
      { id: 5,  text: 'Eu tenho medo de te dar meu coração',    startTime: 47, endTime: 52, pitchHz: 262 },
      { id: 6,  text: 'E confessar que eu estou em tuas mãos',  startTime: 52, endTime: 56, pitchHz: 262 },
      { id: 7,  text: 'Mas não posso imaginar',                 startTime: 57, endTime: 60, pitchHz: 294 },
      { id: 8,  text: 'O que vai ser de mim',                   startTime: 60, endTime: 63, pitchHz: 330 },
      { id: 9,  text: 'Se eu te perder um dia',                 startTime: 63, endTime: 67, pitchHz: 294 },
      // Verso 3
      { id: 10, text: 'Eu me afasto e me defendo de você',      startTime: 68, endTime: 73, pitchHz: 220 },
      { id: 11, text: 'Mas depois me entrego',                  startTime: 73, endTime: 76, pitchHz: 247 },
      { id: 12, text: 'Faço tipo, falo coisas que eu não sou',  startTime: 76, endTime: 81, pitchHz: 220 },
      { id: 13, text: 'Mas depois eu nego',                     startTime: 81, endTime: 84, pitchHz: 247 },
      // Pré-refrão
      { id: 14, text: 'Mas a verdade',                          startTime: 85, endTime: 87, pitchHz: 262 },
      { id: 15, text: 'É que eu sou louco por você',            startTime: 87, endTime: 91, pitchHz: 294 },
      { id: 16, text: 'E tenho medo de pensar em te perder',    startTime: 91, endTime: 96, pitchHz: 330 },
      { id: 17, text: 'Eu preciso aceitar que não dá mais',      startTime: 96, endTime: 100, pitchHz: 294 },
      { id: 18, text: 'Pra separar as nossas vidas',            startTime: 100, endTime: 104, pitchHz: 262 },
      // Refrão
      { id: 19, text: 'E nessa loucura de dizer que não te quero', startTime: 105, endTime: 110, pitchHz: 330 },
      { id: 20, text: 'Vou negando as aparências',              startTime: 110, endTime: 113, pitchHz: 349 },
      { id: 21, text: 'Disfarçando as evidências',              startTime: 113, endTime: 117, pitchHz: 330 },
      { id: 22, text: 'Mas pra que viver fingindo',             startTime: 117, endTime: 121, pitchHz: 294 },
      { id: 23, text: 'Se eu não posso enganar meu coração?',   startTime: 121, endTime: 126, pitchHz: 262 },
      { id: 24, text: 'Eu sei que te amo!',                     startTime: 126, endTime: 131, pitchHz: 330 },
      // Ponte
      { id: 25, text: 'Chega de mentiras',                     startTime: 132, endTime: 135, pitchHz: 349 },
      { id: 26, text: 'De negar o meu desejo',                 startTime: 135, endTime: 139, pitchHz: 330 },
      { id: 27, text: 'Eu te quero mais que tudo',             startTime: 139, endTime: 143, pitchHz: 392 },
      { id: 28, text: 'Eu preciso do seu beijo',               startTime: 143, endTime: 147, pitchHz: 349 },
      { id: 29, text: 'Eu entrego a minha vida',               startTime: 147, endTime: 151, pitchHz: 330 },
      { id: 30, text: 'Pra você fazer o que quiser de mim',    startTime: 151, endTime: 157, pitchHz: 294 },
      { id: 31, text: 'Só quero ouvir você dizer que sim!',    startTime: 157, endTime: 163, pitchHz: 330 },
      // Final
      { id: 32, text: 'Diz que é verdade, que tem saudade',    startTime: 164, endTime: 170, pitchHz: 349 },
      { id: 33, text: 'Que ainda você pensa muito em mim',     startTime: 170, endTime: 175, pitchHz: 330 },
      { id: 34, text: 'Diz que é verdade, que tem saudade',    startTime: 176, endTime: 182, pitchHz: 349 },
      { id: 35, text: 'Que ainda você quer viver pra mim',     startTime: 182, endTime: 188, pitchHz: 330 },
    ],
  },
  {
    id: '2',
    title: 'Trem-Bala',
    artist: 'Ana Vilela',
    youtubeVideoId: 'sKuimApGjyo',
    lyrics: [
      { id: 1,  text: 'Não é sobre ter',                        startTime: 15, endTime: 18, pitchHz: 262 },
      { id: 2,  text: 'Todas as pessoas do mundo pra si',       startTime: 18, endTime: 22, pitchHz: 294 },
      { id: 3,  text: 'É sobre saber',                          startTime: 22, endTime: 24, pitchHz: 262 },
      { id: 4,  text: 'Que em algum lugar alguém zela por ti',  startTime: 24, endTime: 29, pitchHz: 294 },
      { id: 5,  text: 'É sobre cantar',                         startTime: 29, endTime: 32, pitchHz: 330 },
      { id: 6,  text: 'E poder escutar mais do que a melodia',  startTime: 32, endTime: 37, pitchHz: 349 },
      { id: 7,  text: 'É sobre dançar',                         startTime: 37, endTime: 40, pitchHz: 330 },
      { id: 8,  text: 'Na chuva de vida que cai sobre nós',     startTime: 40, endTime: 45, pitchHz: 294 },
      { id: 9,  text: 'É saber se sentir infinito',             startTime: 46, endTime: 50, pitchHz: 262 },
      { id: 10, text: 'Num universo tão vasto e bonito',        startTime: 50, endTime: 55, pitchHz: 294 },
      { id: 11, text: 'É saber sonhar',                         startTime: 55, endTime: 58, pitchHz: 330 },
      { id: 12, text: 'E então fazer valer a pena cada verso',  startTime: 58, endTime: 63, pitchHz: 349 },
      { id: 13, text: 'Daquele poema que nunca ninguém leu',    startTime: 63, endTime: 68, pitchHz: 330 },
      // Refrão
      { id: 14, text: 'Não é sobre chegar no topo do mundo',    startTime: 69, endTime: 74, pitchHz: 392 },
      { id: 15, text: 'E saber que venceu',                     startTime: 74, endTime: 77, pitchHz: 349 },
      { id: 16, text: 'É sobre escalar e sentir',               startTime: 77, endTime: 81, pitchHz: 330 },
      { id: 17, text: 'Que o caminho te fortaleceu',             startTime: 81, endTime: 85, pitchHz: 349 },
      { id: 18, text: 'Não é sobre estar no topo do mundo,',    startTime: 85, endTime: 90, pitchHz: 392 },
      { id: 19, text: 'E saber que venceu',                     startTime: 90, endTime: 93, pitchHz: 349 },
      { id: 20, text: 'É sobre escalar e sentir',               startTime: 93, endTime: 97, pitchHz: 330 },
      { id: 21, text: 'Que o caminho te fortaleceu',             startTime: 97, endTime: 101, pitchHz: 349 },
      // Verso 2
      { id: 22, text: 'Não é sobre ter',                        startTime: 103, endTime: 106, pitchHz: 262 },
      { id: 23, text: 'Todas as coisas que você quer ter',      startTime: 106, endTime: 111, pitchHz: 294 },
      { id: 24, text: 'É sobre você olhar para o lado',         startTime: 111, endTime: 115, pitchHz: 262 },
      { id: 25, text: 'E ver o que você pode fazer por quem precisa', startTime: 115, endTime: 122, pitchHz: 294 },
      // Refrão final
      { id: 26, text: 'A vida é trem-bala, parceiro',            startTime: 123, endTime: 128, pitchHz: 392 },
      { id: 27, text: 'E a gente é só passageiro prestes a partir', startTime: 128, endTime: 134, pitchHz: 349 },
      { id: 28, text: 'A vida é trem-bala, parceiro',            startTime: 135, endTime: 140, pitchHz: 392 },
      { id: 29, text: 'E a gente é só passageiro prestes a partir', startTime: 140, endTime: 146, pitchHz: 349 },
      { id: 30, text: 'Lá lá lá lá lá lá lá lá',               startTime: 147, endTime: 153, pitchHz: 330 },
    ],
  },
];