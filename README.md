# Ammo Accumulator

questi sono ifile corrispondenti a delle carte e il loro retro e e dalle tessere che indicano i punti e dal loro retro. Queste sono le regole del gioco corrispondente non crerae il sito che ti mando altri file: THE GUN GAME — Regolamento Ufficiale

1. Obiettivo del Gioco

Accumulare più munizioni possibili superando in astuzia l'avversario. L'obiettivo è riempire il maggior numero di Caricatori (ciascun caricatore contiene 6 colpi). Ogni colpo ottenuto equivale a 1 punto/proiettile. Chi completa più caricatori entro la fine del mazzo di pesca vince la partita... a meno che non si venga eliminati prima da The Gun!

2. Componenti e Preparazione

Il Mazzo di Carte (52 carte totali):

50 carte numerate da 1 a 6.

2 carte speciali The Gun.

Mano Iniziale: Ogni giocatore riceve 3 carte private (coperte agli occhi dell'avversario, ma consultabili da chi le possiede). Il resto forma il mazzo di pesca da 46 carte al centro del tavolo.

Indicatori Caricatore: Ogni giocatore traccia i propri colpi accumulati (da 1 a 6). Una volta raggiunti 6 colpi, il caricatore si considera completato e blindato (valore 1 Punto Vittoria) e si inizia a riempire un nuovo caricatore da zero.

Nota di Salvaguardia: Non è mai possibile scendere sotto lo 0 del caricatore che si sta attualmente riempiendo. I colpi del caricatore corrente possono essere persi, ma i caricatori già completati in precedenza sono al sicuro e non possono mai essere intaccati.

3. Svolgimento del Turno (Round di Scommessa)

A ogni round, i due giocatori scelgono 1 carta dalla propria mano e la posizionano coperta sul tavolo. Prima di rivelarla, devono dichiarare ad alta voce la propria intenzione (Scommessa):

"Vincere" (giocare la carta di valore più alto).

"Perdere" (giocare la carta di valore più basso).

I giocatori rivelano la carta simultaneamente. In base all'esito delle scommesse, si applicano le seguenti risoluzioni:

Risoluzione delle Scommesse

Dichiari di VINCERE e VINCI:

Aggiungi al tuo caricatore un numero di colpi pari al valore della tua carta (es. giochi un 5 e vinci \rightarrow guadagni 5 colpi).

Dichiari di PERDERE e PERDI:

Guadagni 1 colpo nel tuo caricatore per la giocata tattica.

Dichiari di VINCERE e PERDI:

Fallimento totale! Perdi tutti i colpi presenti nel caricatore che stai attualmente riempiendo (il caricatore torna a 0 colpi).

Dichiari di PERDERE e VINCI:

Hai calcolato male i rischi! Subisci una penalità pari alla differenza tra la tua carta e quella dell'avversario (es. giochi 6 dichiarando di perdere, l'avversario gioca 4 \rightarrow 6 - 4 = 2 colpi persi dal tuo caricatoreattuale).

4. Pareggio delle Carte Numerate

Se i due giocatori rivelano due carte con lo stesso identico valore (es. 4 contro 4):

Nessun vincitore né perdente: Il round è annullato. Nessuno guadagna né perde colpi, indipendentemente dalle scommesse dichiarate.

Reinserimento nel Mazzo: Le due carte giocate vengono rimesse nel mazzo di pesca, che viene subito mescolato.

Priorità di Pesca (Regola del Continuo): L'ordine di pesca non cambia e non si tira a sorte. Chi ha pescato per primo nell'ultimo round valido (l'ultimo round in cui c'è stato un vincitore) pesca di nuovo per primo.

5. Carta Speciale: THE GUN (Eliminazione Diretta)

Nel mazzo sono presenti 2 carte The Gun. Chi ne ha una in mano può scegliere di giocarla al posto di una carta numerata standard.

Chi gioca The Gun dichiara o scrive in segreto un numero da 1 a 6 (la camera di scoppio che contiene il proiettile).

L'avversario deve difendersi giocando una delle 3 carte che ha in mano.

Esito:

Se il numero della carta giocata dall'avversario COINCIDE con il numero segreto: K.O. Istantaneo! L'avversario viene colpito e perde immediatamente l'intera partita, indipendentemente da quanti caricatori aveva accumulato fino a quel momento.

Se il numero NON coincide: L'avversario schiva il proiettile e si salva. Nessun danno subito.

Dopo l'uso, la carta The Gun viene scartata definitivamente dal gioco e non torna mai nel mazzo. Chi l'ha usata pesca subito una nuova carta dal mazzo per riportare la propria mano a 3 carte.

6. Fine del Round, Scarto e Pesca

Gestione dello Scarto: Le carte numerate giocate in round con un vincitore e le carte The Gun usate vengono scartate. Solo le carte del pareggio rientrano nel mazzo.

Ordine di Pesca Standard:

Chi ha vinto la mano (indipendentemente da cosa avesse scommesso) ha il diritto di pescare per primo una carta dal mazzo.

Il secondo giocatore pesca successivamente per riportare la mano a 3 carte.

In caso di pareggio, si applica la regola del punto 4 (pesca per primo chi ha pescato per primo nell'ultimo turno vinto).

7. Fine della Partita e Vittoria

La partita termina in due casi:

Per Eliminazione Istantanea: Un giocatore viene colpito da The Gun (vittoria immediata dell'attaccante).

Per Esaurimento del Mazzo: Quando il mazzo di pesca si svuota del tutto, la partita finisce e si procede al calcolo dei punteggi:

Vincitore Principale: Vince chi ha completato il maggior numero di Caricatori completi.

In caso di Parità di Caricatori: Si controllano i colpi accumulati nel caricatore incompleto attuale; vince chi è più avanti (chi ha più colpi).

Parità Assoluta: Se due giocatori hanno lo stesso identico numero di caricatori completi e lo stesso identico numero di colpi nel caricatore corrente, la partita finisce in Parità.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://the-gun-game.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/978f94fc-98ad-4368-b329-44c40802d320).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
