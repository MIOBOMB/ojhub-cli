/*
 * Helper Framework 2.0
 * Author: MIOBOMB (2023-2026)
 * Last patch: newHelper.js 2.1.8
 *
 * Ужасный, глобальный, монолитный, но при этом
 * настолько быстрый что вы не поверите.
 *
 * Является надстройкой к newHelper.js, которая позволяет
 * сразу начать писать любое spa. 
 * Например на базе этого кода основан
 * GDPS Helper 1.7 и Object Hub 0.91
 * ^^^ факт про мои сайиы выше условный.
 *     Реальный HF 2.0 родился из склеивания паттернов
 *     Object Hub (HF 2.1) и GDPS Helper (HF 1.7-1.9),
 *     благо их кодовые базы крайне схожиe
 */

Intl.newHelper();

_.link.actions = {
	'':	()=>innerMain(pageMain()),
};
_.link.commands = {
	'lsClear':	()=>lsClear(),
};
_.lang.addr = `./langs/`;

_.win.manager = _.$.id('windowsXP');
_.win.hider = _.$.id('Professional');

let windowBtns = [
	['COPY ERROR',   `navigator.clipboard.writeText(_.$.id('errText{errID}').innerText)`],
	['FULL RESTART', `location.reload()`],
	['RESTART', `reStart(1,{errID})`],
	['REMOVE USER+RESTART', `Slocal.set('User','');location.reload()`],
	['CLEAR ALL APP DATA', `lsClear();console.log(localStorage);reStart(1)`]
];
_.err.init();
_.err.print = (errID, errText, addr = '')=>{
	console.log(errText)
	let buttonErr = (i, clck)=>`<button style=background-color:#333 onclick="${clck}">${i}</button> `,
		buttons = windowBtns.map(btn=>buttonErr(btn[0], btn[1]?.replace('{errID}', errID))).join(''),
		html = `<div id=debug${errID} data-win="{winId}">
				<p align=center>DEBUG INFO</p>
				ERROR<br>
					<pre style=width:100%;white-space:pre-line id=debugMega${errID}></pre>
				<br><br>
				<center id=windows${errID}>
				</center>
			</div>`;
	let winId = _.win.open('debug'+errID,
		html
	, `iserror style=width:300px;height:350px`);
	_.$.id('debugMega'+errID).textContent = `LOCATION: ${location}\n`+errText+`\n`+
	(addr === '' ? '' : `\n${addr}`);
	_.$.id('windows'+errID).innerHTML = buttons;
};

let 
captchaLoad = false,
Slocal = new _.storage(localStorage, 'helper'),

helperCaptchaSiteKey = '???';

if (Slocal.get('StaticUserData') === 'undefined')
	Slocal.set('StaticUserData', '')

let thisUser = Slocal.get('StaticUserData') ? JSON.parse(Slocal.get('StaticUserData')) : {
	username: 'Helper Framework',
	ID: 0,
	role: 0,
	isActive: 0,
	token: '',
	cityData:false
},

baseApp = 'http://localhost/api',
sData = [
	baseApp+'/'
],

token = Slocal.get('User');
if (token) 
	_.http.defaultHeaders['user-token'] = token;

let reStart = (drop = 0, errId = 0)=>{
	let errElem = _.$.id('debug'+errId);
	if (errElem) {
		delete _.err.errors[errId];
		_.wins[errElem.dataset['win']].close();
	}
	innerMain('');
	let helperInit = ()=>{
		_.link.get();
		_.http.req('GET', `${sData[0]}loginT`)
			.then(data=>{
				let serverResp = JSON.parse(data);
				if (Slocal.get('User')) {
					myGdpses = [{},{},{},{}];
					Object.keys(serverResp[1][0]).forEach(gdps=>{
						GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
					});
				}
				if (serverResp[0].token == 'false')
					delete _.http.defaultHeaders['user-token'];
				thisUser = serverResp[0];
				Slocal.set('StaticUserData', JSON.stringify(thisUser));
				helperIcon.href = 'https://objecthub.xyz/favicon.ico';
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});
		if (drop !== 0) {
			_.link._i = true;
			_.lang.replace('RU').then(e=>_.lang.main = doLangSetup(e));
		}
	};

	if (parseInt(Slocal.get('LangVer')) !== currentLangVer) {
		let lang = 'EN';
		if (navigator.languages.includes('ru'))
			lang = 'RU';
		_.lang.load(lang)
			.then(d=>{
				console.log(d);
				doLangSetup(d);
				helperInit(drop);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});
	} else {
		doLangSetup(Slocal.get('Lang'));
		//_.lang.main = JSON.parse(_.lang.parse(Slocal.get('Lang')));
		helperInit(drop);
	}
},

helperMain = document.getElementById('helperRoot'),
innerMain = (textContent, insertType = 0)=>{
	if (!helperMain) 
		return new Error('Cant find main helper ("helperRoot") element! Maybe you broken helperApp?');
	if (insertType == 0) 
		helperMain.innerHTML = textContent;
	else if (insertType == 512)
		helperMain.insertAdjacentHTML('afterend', textContent);
	else 
		helperMain.insertAdjacentHTML('beforeend', textContent);
},
pHeader = ()=>{
	let html =
	`<div class="header" id=helperMaster align="left">`+
		// your content goes here
	`</div>`;
	return html;
},
pageMain = (localIgnore = false)=>{
	if (!localIgnore)
		_.link.set('');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div>`+
			`<h1>Helper App!</h1>`+
		`</div>`+
	`</div>`;
	return html;
},
lsClear = ()=>{
	let banList = ['length','key','getItem','setItem','removeItem','clear','helperUser'];
	for (let a in localStorage)
		if (!banList.includes(a))
			localStorage.removeItem(a);
	_.link.remove('lsClear');
}
