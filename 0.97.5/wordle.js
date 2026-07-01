let 
wordLenResult = 0,
wordleLine = 0,
wordleColumn = 0,
wordPre = [],
wordleLang = '',
wordleTexts = {
    RU: {
        hi: 'WODRLE OSC (RU)',
        lose: 'паражение! :(',
        win: 'Победа!!!!!!',
        kbChars: ['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'],
        check: 'sendbtn >Проверить<',
    },
    EN: {
        hi: 'WODRLE OSC (EN)',
        lose: 'lost! :(',
        win: 'Win!!!!!!',
        kbChars: ['qwertyuiop','asdfghjkl','zxcvbnm'],
        check: 'sendbtn >Check<',
    },
};
wordleGame = (lang = 'RU')=>{
	_.link.set('wordle='+lang);
    wordleLang = lang;
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div align=center>`+
			`<h1>${wordleTexts[wordleLang].hi} ${basicButton('>?<', ``, 'font-size:calc(var(--def-font)*1.75);padding: 0 calc(var(--def-btn-size)*0.5);')}</h1>`+
			`<div id=wordleGame>`+
			`</div>`+
		`</div>`+
	`</div>`;
	innerMain(html);
	initGame();
};
putAWord = (char = '')=>{
	if (wordLenResult <= wordleColumn || wordleLine == 7)
		return;
	wordPre[wordleColumn] = char;

	let elem = _.$.id(`l${wordleLine}c${wordleColumn}`);
	elem.textContent = char;
	++wordleColumn;
	if (wordLenResult != wordleColumn)
		_.$.id(`l${wordleLine}c${wordleColumn}`).textContent = '|';
	else 
		_.$.q('[sendbtn]').style.background = '';
};
clearWord = ()=>{
	if (wordleColumn == 0 || wordleLine == 7)
		return;
	_.$.q('[sendbtn]').style.background = 'var(--color-profile)';
	if (wordLenResult == wordleColumn) {
		--wordleColumn;
		_.$.id(`l${wordleLine}c${wordleColumn}`).textContent = '|';
		return;
	}

	delete wordPre[wordleColumn];
	let elem = _.$.id(`l${wordleLine}c${wordleColumn}`);
	--wordleColumn;
	elem.textContent = '';
	_.$.id(`l${wordleLine}c${wordleColumn}`).textContent = '|';
};
sendWord = ()=>{
	if (wordleLine == 7)
		return;
	if (wordLenResult != wordleColumn)
		return megaAlert2('А слово где?');
	Loading();
	helperRequest(`${sData[2]}wordle${wordleLang}${php}`, `word=${wordPre.join('')}`)
		.then(data=>{
			Loading(1);
			_.$.q('[sendbtn]').style.background = 'var(--color-profile)';
			let wordParsed = data.split('');

			for (let i = 0; i < wordParsed.length; i++) {
				let char = _.$.id(`l${wordleLine}c${i}`);
				if (wordParsed[i] == 2) {
					char.style.background = 'var(--color-light)';
					char.style.border = 'solid var(--color-light) 2px'
					_.$.id(char.textContent).style.background = 'var(--color-light)';
				    _.$.id(char.textContent).style.border = 'solid var(--color-light) 2px';
					continue;
				}
				if (wordParsed[i] == 1) {
					char.style.background = 'var(--color-window)';
					char.style.border = 'solid var(--color-window) 2px'
					_.$.id(char.textContent).style.background = 'var(--color-window)';
				    _.$.id(char.textContent).style.border = 'solid var(--color-window) 2px';
					continue;
				}
				_.$.id(char.textContent).style.background = 'var(--color-bg)';
				_.$.id(char.textContent).style.border = 'solid var(--color-white) 2px';
			}

			if (!data.includes('0') && !data.includes('1')) {
				wordleLine = 7;
				megaAlert2(wordleTexts[wordleLang].win);
				return;
			}
			wordleLine++;
			wordleColumn = 0;

			if (wordleLine < 6) {
				_.$.id(`l${wordleLine}c${wordleColumn}`).textContent = '|';
				return;
			}
			megaAlert2(wordleTexts[wordleLang].lose);
			wordleLine = 7;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;

},
initGame = ()=>{
	Loading();
	helperRequest(`${sData[2]}wordle${wordleLang}${php}`)
		.then(data=>{
			Loading(1);
			let gameElement = _.$.id('wordleGame'),
				attempts = 6;
			wordLenResult = parseInt(data);

			let html = '',
				html2 = '';
			for (let l = 0; l < attempts; l++) {
				html2 = '<div style=display:flex;width:fit-content>';
				for (let c = 0; c < wordLenResult; c++) {
					html2 += `<div id=l${l}c${c} class=wordleInput></div>`;//basicInput('', `l${l}c${c}`, inputStyle);
				}
				html2 += '</div>';
				html += html2;
			}

			let kbChars = wordleTexts[wordleLang].kbChars;
			html += '<div class=wordleBtnsArr>';
			for (let l = 0; l < kbChars.length; l++) {
				html2 = '<div class=wordleBtns>';
				for (let c = 0; c < kbChars[l].length; c++) {
					let char = kbChars[l][c];
					html2 += basicButton(`>${char}<`, `putAWord('${char}')`, 'border:solid var(--color-profile) 2px;background:var(--color-profile)', char, 'wordleBtn');
				}
				if (l == 2)
					html2 += basicButton('><=<', 'clearWord()', 'background:var(--color-profile);padding:calc(var(--def-btn-size)*0.8) calc(var(--def-btn-size)*0.5)', '', 'wordleBtn');
				html2 += '</div>';
				if (l == 2)
					html2 += '<div class=wordleBtns>'+basicButton(wordleTexts[wordleLang].check, 'sendWord()', 'background:var(--color-profile)', '', 'wordleBtn')+'</div>';
				html += html2;
			}
			html += '</div>';

			gameElement.insertAdjacentHTML('beforeend', html);
			_.$.id(`l${wordleLine}c${wordleColumn}`).textContent = '|';
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
};