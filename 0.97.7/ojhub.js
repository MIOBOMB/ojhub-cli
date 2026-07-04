// ГАЙД ПО МИНИФИКАЦИИ - _.$.id() это обычный док гет элембуид. innerMain() это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 * вызывается функция 'reStart()', которая вызывает '_.http.req()' но это мелочи, она назначает глобальные переменные GDPSes и Guides
 * если есть вход в аккаунт назначаются ещё и thisUser, myGdpses и myguides
 * после вызывается функция '_.link.get()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 * после выполнения '_.link.get()' хелпер готов к работе с клиентом
 * !!!: гайд писался к гдпс хелпер 1.8, формально обджект хаб это уже гдпс хелпер 2.1, так что он кардинально устарел
*/

/* Поясняю за некоторую легаси парашу - типы комментов и лайков
 * На сервере ошхаба комментарии и лайки определяются и хранятся в каналах в одной таблице, ниже приведен список какой у кого канал
 * тип контента               | лайки | комментарии | каналы | Ко-овнеры
 * Кемпы                      | 0     | 0           | 0      | 1
 * Обджект шоу                | 0     | 0           | 1      | 1
 * переводы                   | 0     | 0           | 2      | 1
 * Вики                       | 8     | -           | -1     | отдельная от soowners таблица wikisoowners
 * Страницы вики              | 7     | 2           | -2     | -
 * Форум посты                | 9     | 4           | -3     | -
 * вакансии                   | 11    | 5           | -5     | -
 * Новости                    | 2     | 3           | -      | -
 * комментарии к кемпам       | 1     | -           | -      | -
 * комментарии к шоу          | 1     | -           | -      | -
 * комментарии к новостям     | 5     | -           | -      | -
 * комментарии к страницам    | 6     | -           | -      | -
 * комментарии к форум постам | 10    | -           | -      | -
 * комментарии к вакансиям    | 12    | -           | -      | -
 * Ваш контент                | 13++  | 6++         | -      | 2++
*/


// #region базовые компоненты ошхаба, связанные с невхелпером
let 
captchaLoad = false,
//Slocal = new helperStorage('oschub'),
Slocal = new _.storage(localStorage, 'oschub'),

helperVapidPublic = 'BEcP_7U_yMSR7K0oqBHQAHDK5jl9d7zKsxtXn_n7gIUr547kWWtUg_wfBDBtUpGiOs2Lg5iq0Y-G7JUBprJzyYU',
helperCaptchaSiteKey = '6Ldrt0grAAAAAMdteG7pq6LZ1UYeMvkElvUV7Qhx',
globalWiki = 0,
wikiTemplates = {},
guideEditorFrame = 0, // используется только в редакторе гайдов чтобы можно было удалять разделы не по порядку
TimeOut = [null,null], // [0] для инпута, [1] для анимаций окон (регистрация и логин)
headerPhoneSwitcher = 0, // 0 - не нажимался, 1 - в профиле, 2 - в навигаторе
ProjectsChannel = 1;

if (Slocal.get('StaticUserData') === 'undefined')
	Slocal.set('StaticUserData', '')

let thisUser = Slocal.get('StaticUserData') ? JSON.parse(Slocal.get('StaticUserData')) : {
	username: 'Object Hub',
	ID: 0,
	role: 0,
	isActive: 0,
	hasAlarms: 0,
	resume: '',
	socials: '',
	token: '',
	cityData:false
},

urlEncoded = {'Content-type':'application/x-www-form-urlencoded'},
GDPSswitchChannel = (channel)=>{
	switch (parseInt(channel)) {
		case 0:
			return ['camp', 'Camp', 'c', myGdpses[0]];
		case 1:
			return ['show', 'Show', 's', myGdpses[1]];
		case 2:
			return ['pere', 'Pere', 'p', myGdpses[2]];
		case 3:
			return ['tele', 'Tele', 't', myGdpses[3]];
			
	}
},
GDPSgetChannel = (channel)=>{
	switch (channel) {
		case 'c':
			return myGdpses[0];
		case 's':
			return myGdpses[1];
		case 'p':
			return myGdpses[2];
		case 't':
			return myGdpses[3];
		
	}
},
helperSettings = {
	openGuidesInWindow: parseInt(Slocal.get('openGuidesInWindow')),
},
token = Slocal.get('User'); // токен юзера
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
		Fingerprint.generate(token) // если токен есть значит есть и юзер => генерируем девайс токен
			.then(fpData=>{
				LIKES.init();
				_.http.req('GET', `${nData[2]}loginT`)
					.then(data=>{
						//Loading(1);
						let serverResp = JSON.parse(data);
						if (Slocal.get('User')) {
							myGdpses = [{},{},{},{}];
							Object.keys(serverResp[1][0]).forEach(gdps=>{
								GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
							});
							myguides = [];
							myguides.push(serverResp[1][1]);
							yourWikies = serverResp[1][1];
							wikiesMini = [];
							Object.keys(yourWikies).forEach(el=>{
								wikiesMini.push(yourWikies[el].ID.toString());
							});
						}
						if (serverResp[0].token == 'false') {
							delete _.http.defaultHeaders['user-token'];
							return innerMain(deviceAddForm());
						}
						thisUser = serverResp[0];
						Slocal.set('StaticUserData', JSON.stringify(thisUser));
						helperIcon.href = 'https://objecthub.xyz/favicon.ico';
						let locationMain = location.search.split('&')[0],
							lastGdpses = serverResp[2],
							lastNews = serverResp[3],
							htmlGdpses = '',
							htmlNews = '';
						if (Object.keys(lastNews).length > 0)
							for (let g in lastGdpses) {
								let gdps = lastGdpses[g];
								htmlGdpses += FINDrenderMini(gdps.channel, [gdps]);
							}
						htmlGdpses += `<div class=framegdps style=display:block;width:300px;height:450px;align-content:center;text-align:center>`+
							`<h1${getTrans('T2-wantmore')}/h1>`+
							basicButton(getTrans('projects'), `pageFind(helperFindData[3])`)+
						`</div>`;
						mainPageCache.gdpses = htmlGdpses;
						if (Object.keys(lastNews).length > 0)
							for (let n in lastNews) {
								let news = lastNews[n];
								htmlNews += RenderNews([news],3);
							}
						htmlNews += `<div class=framegdps style=display:block;width:300px;height:350px;align-content:center;text-align:center>`+
							`<h1${getTrans('T2-wantmore')}/h1>`+
							basicButton(getTrans('news'), `globalNews()`)+
						`</div>`;
						mainPageCache.news = htmlNews;
						if (locationMain == '' || locationMain == '?') {
							innerGdpsPlace(htmlGdpses);
							innerComments(htmlNews);
						}
						rebootPageContent();
					})
					.catch(e=>{console.error(e);_.err.handleRejection(e)});
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
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
mainPageCache = {
	gdpses: '',
	news: ''
},
rebootPageContent = ()=>{
	let refreshPageUrls = [
		'addedCamps',
		'addedShows',
		'addedPeres',
		'addedWikis',
		'editCamp',
		'editShow',
		'editPere',
		'wikiControl',
		'addVacs',
		'editVacs',
		'vacans',
		'applies',
		'gdpsLog',
		'campOwn',
		'showOwn',
		'pereOwn',
		'wikiOwn',
	],
	compile = _.link.compile();
	if (_.$.id('profileWindow')) {
		_.link._i = true;
		_.link.get();
	}
	if (!_.link._i)
		refreshPageUrls.forEach(p=>{
			if (compile.includes(p)) {
				_.link._i = true;
				return _.link.get();
			}
		})
},



reportError = (errorId)=>{
	let text = encodeURIComponent(_.$.id('debugMega'+errorId).innerHTML);
	Loading();
	_.http.req('POST', `${nData[2]}reportGdps`, 'error='+text+'\\n\\n'+navigator.userAgent)
		.then(data=>{
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
baseApp = location.origin + location.pathname,
baseWay = baseApp+'server/'+helperBuildNum,
nodeServer = baseApp + 'api/v1',
nData = [
	nodeServer+'/content/',
	nodeServer+'/send/',
	nodeServer+'/',
	nodeServer+'/search/',
	nodeServer+'/delete/',
	nodeServer+'/user/',
	nodeServer+'/forum/',
	nodeServer+'/wiki/',
	nodeServer+'/vacans/',
	nodeServer+'/comms/',
	nodeServer+'/gdps/',
	nodeServer+'/news/',
	nodeServer+'/profile/',
],

sData = [
	baseWay+'/content/',
	baseWay+'/send/',
	baseWay+'/',
	baseWay+'/search/',
	baseWay+'/delete/',
	baseWay+'/user/',
	baseWay+'/forum/',
	baseWay+'/wiki/',
	baseWay+'/vacans/',
	baseWay+'/comms/',
	baseWay+'/gdps/',
	baseWay+'/news/',
	baseWay+'/profile/',
 ],

 formSdata = (API, type = '.php')=>{
	sData = [
		API+'/content/',
		API+'/send/',
		API+'/',
		API+'/search/',
		API+'/delete/',
		API+'/user/',
		API+'/forum/',
		API+'/wiki/',
		API+'/vacans/',
		API+'/comms/',
		API+'/gdps/',
		API+'/news/',
		API+'/profile/',
	]
	php = type;
},
php = '.php';
errInfo = 
	`LOCATION: ${location}\n`+
	`USERID: ${thisUser.ID}\n`;
let
// Главные html теги
	helperMain = _.$.id('1st'),
	helperIcon = link = _.$.q("link[rel~='icon']"),
	helperTitle = _.$.q('title'),
// #endregion
// #region компоненты
// #region микрокомпоненты
	emptyButton = (text = '', func = '', style = '', id = '', Class = '')=>{
		return `<button ${id ? 'id="'+id+'"' : ''}class="emptybtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
	},
	imageButton = (img = '', func = '', style = '', id = '', Class = '')=>{
		return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtnMini ${Class}" style="${style}" onclick="${func}"><img style=margin:0 width="24px" src="${img}"></button>`;
	},
	basicInput = (text = '', idAndName = '', style = '', Class = '', value = '')=>{
		let fullText = text == '' ? '>' : getTrans(text, 'input');
		return `<input ${idAndName ? `id="${idAndName}" name="${idAndName}"` : ''}class="framelabel ${Class}" ${value ? 'value="'+value+'"' : ''}style="${style}"${fullText}`;
	},
	radioInput = (id = '', name = '', isChecked = 0, otnerArgs)=>{
		return `<input id="${id}" name="${name}" type=radio ${otnerArgs} ${isChecked ? 'checked' : ''}>`;
	},
// #endregion

headerButton = (text, Class, oncl)=>{
	return `<button class="${Class}" onclick="${oncl}"${text}/button>`;
},
headerButtons = (switcherM = 0)=>{
	if (switcherM === 1) // if phone screen
		return headerButton(getTrans('main'),	'headbtn','switchMobileMain();innerMain(pageMain())')+
		headerButton(getTrans('projects'),		'headbtn','switchMobileMain();pageFind(helperFindData[3])')+
		headerButton(getTrans('news'),			'headbtn','switchMobileMain();globalNews()')+
		headerButton(getTrans('vacancies'),		'headbtn','switchMobileMain();globalVacs()')+
		headerButton(getTrans('guides09'),		'headbtn','switchMobileMain();pageWikiList()')+
		headerButton(getTrans('aboutHelper'),	'headbtn','switchMobileMain();innerMain(helperAbout())');

	return headerButton(getTrans('main'),	'headbtn','innerMain(pageMain())')+
	headerButton(getTrans('projects'),		'headbtn','pageFind(helperFindData[3])')+
	headerButton(getTrans('news'),			'headbtn','globalNews()')+
	headerButton(getTrans('vacancies'),		'headbtn','globalVacs()')+
	headerButton(getTrans('guides09'),		'headbtn','pageWikiList()')+
	headerButton(getTrans('aboutHelper'),	'headbtn','innerMain(helperAbout())');
},
headerImg = (link)=>{
	return `><img src=${helperUrl}imgs/${link}><`;
},
profileContentDiv = ()=>{
	return `<div style='display: flex; flex-direction: column; height:calc(100vh - 450px); overflow:auto' align=left>`;
},

basicButton = (text = '', func = '', style = '', id = '', Class = '')=>`<button ${id ? 'id="'+id+'"' :''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`,
windowButton = (text, func = '', style = '')=>`<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`,
gdpsAvatar = (img, w=128, h=128, rszConf=2)=>`<img loading=lazy onerror="console.warn('broken link ${img}');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(img)}" width=${w}px height=${h}px style="border-radius:calc(var(--def-border)*${rszConf})">`,
// gdpsBan = (ban, w=360, h=150)=>

renderTextOrTags = ()=>{
	let [inputs,value] = Slocal.get('ColorScheme').split('/')[1].split(',')[0].split(':'),
	checked = 0,
	doneInputs = '';
	inputs.split(';').forEach(inp=>{
		let isChecked = checked == value ? 1 : 0;
		doneInputs += radioInput(inp, inputs, isChecked, `value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
		checked++;
	});
	return doneInputs;
},
trtd = (name, value)=>{
	return	`<tr>`+
						`<td`+
							name+
						`/td>`+
						`<td>`+
							value+
						`</td>`+
					`</tr>`;
},

likeStyle = {
	like: 'filter:drop-shadow(0 0 4px #DFD3EB)',
	disl: 'filter:drop-shadow(0 0 4px #B12FE4)'
},
contentRender = function(
	preHtml = {
		ID: 0,
		title: '???',
		text: '???',
		likes: 0,
		GDPSdata: ['camp','getCamp']
	},
	date = 0,
	authorBtn = 1,
	likeType = 0,
	tags = '',
	specialButtons = 1,
	connectedWiki = 1,
	reportButton = '',
	joinData = '', // работает как кнопка назад в рендере новостей
	isComm = 1
 ) {
	let joinBtn = 
		`<a class=loginbtn href="join${php}?id=${preHtml.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;
	if (preHtml.links)
		if (typeof preHtml.links == 'object') {
			joinBtn = '';
			Object.keys(preHtml.links).forEach(l=>{
				joinBtn += `<a class=loginbtn target=_blank href="join${php}?id=${preHtml.ID}&type=${l}${joinData}">${l}</a>`;
			});
		};
	let html = `<div class=framegdps ${joinData ? `id=news${preHtml.ID}` : ''} ${isComm == 0 ? 'style="width:calc(100% - 40px)"' : ''}>`+
		(preHtml.img || tags ?
		gdpsAvatar(preHtml.img) : '')+
		`<h2 id=${preHtml.cType}title${preHtml.ID}>${preHtml.title}</h2>`+
		`<p style="margin:0">`+
		(authorBtn ?
			basicButton(`>${preHtml.gdpsTitle}<`, `${joinData}(${preHtml.gdpsId})`)+
			'- '+emptyButton(`>${preHtml.username}<`, `otherProfile(${preHtml.author},'${joinData}(${preHtml.gdpsId})')`)
		:
			`<span${getTrans('addedBy')}/span>:`+
			`<button onclick="otherProfile(${preHtml.author},'pageFind(0)')" style="background:0;border:0;color:var(--color-white)">${preHtml.username}</button>`
		)+
		`</p>`+
		(date ?
		`<p>${timeAgo(date)}</p>`
		: '')+
		(tags ?
		`<div class="flex-row">${tags}</div>`
		: '')+
		`<div id=${preHtml.cType}text${preHtml.ID}>${Markdown(preHtml.text)}</div>`+
		`<div style="margin-top:15px">`+
			(specialButtons ?
			joinBtn+
			`<button class="loginbtn" onclick="linkCopy('https://objecthub.xyz/?${preHtml.GDPSdata[0]}=${preHtml.ID}')"${getTrans('getLink')}/button>`
			: '')+
			(connectedWiki ?
			`<button class=loginbtn onclick="pageGuides(${connectedWiki},\`${preHtml.GDPSdata[1]}(${preHtml.ID},'${joinData}')\`)" style="margin-top:8px"${getTrans('openConnectedWiki')}/button>`
			: '')+
			`<div class="likezone">`+
				`<span class=likeplace id="likesCount${preHtml.ID}">${preHtml.likes[0]}</span>`+
				`<button ${preHtml.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${preHtml.ID},${likeType})" class=like id=like${preHtml.ID}></button>`+
				`<span class=likeplace id="dislsCount${preHtml.ID}">${preHtml.likes[1]}</span>`+
				`<button ${preHtml.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${preHtml.ID},${likeType})" class=dislike id=dislike${preHtml.ID}></button>`+
				(typeof preHtml.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${preHtml.ID}">${preHtml.likes[2]}</span>`+
				`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
				(isComm == 0 ?
				`<button class=loginbtn onclick=getNewsWithComments(${preHtml.ID},${preHtml.gdpsId},'${joinData}')${getTrans('comms')}/button>`
				: '')+
			`</div>`+
		`</div>`+
		(reportButton ?
		`<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
			`<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
		`</button>`
		: '')+
		(preHtml.canDel ? 
		imageButton(`${helperUrl}imgs/edit.svg`, `editNews(${preHtml.ID},${preHtml.gdpsId})`, `position:absolute;top:20px;right:64px`)+
		imageButton(`${helperUrl}imgs/trash.svg`, `deleteNews(${preHtml.ID},${isComm})`, `position:absolute;top:20px;right:20px`)
		: '')+
	`</div>`;
	return html;
},
contentRenderMinu = function(
	data,
	preHtml = [
		joinData,
		joinBtn,
		tagsOs,
		'width:300px;height:450px',/*size*/
		0,/*contentType*/
		0,/*liketype*/
	],
	renderAuthor = 1,
	renderDesc = 1,
	renderTags = 1,
	renderImage = 1
 ) {
	let imgClass = ['', ''],
	contentId = data.ID;
	if (renderImage == 1) {
		imgClass = ['FGDPSimg', 'FGDPSdemo']
	}

	let btnFuncs = [];

	switch (preHtml[4]) {
		case -3: 
			btnFuncs = ['getForumPost', 'openForum('+preHtml[0]+')', 'f', './?forumPost='];
			break;
		case -2:
			btnFuncs = ['getGuide', 'pageGuides()', 'g', './?wikiPage='];
			break;
		case -1:
			btnFuncs = ['pageGuides', 'pageWikiList()', 'w', './?wiki='];
			break;
		case 0:
			btnFuncs = ['getCamp', 'pageFind(0)', 'c', './?camp='];
			break;
		case 1:
			btnFuncs = ['getShow', 'pageFind(1)', 's', './?show='];
			break;
		case 2:
			btnFuncs = ['getPere', 'pageFind(2)', 'p', './?pere='];
			break;
		case 3:
			btnFuncs = ['getTele', 'pageFind(3)', 't', './?tele='];
			break;
	};
	if (data.mainWiki) {
		contentId = data.mainWiki;
		btnFuncs[0] = 'getGuide';
		preHtml[0] = data.ID;
	};
	data.isLiked = LIKES.get(preHtml[4], data.ID);

	let 
	banWidth = parseInt(preHtml[3].split(';')[0].split(':')[1]) + 16,
	banHeight = Math.round(banWidth * 0.4166),
	darkZoneMargin = banHeight - 60,
	html =
	`<div class="framegdps" styling="${btnFuncs[2]}${data.ID}" style="${preHtml[3]}">`+
		(renderImage ? `<div class=loh style="min-height:128px">` : '')+
			`<h2 style=width:290px${renderImage ? '' : ';margin-top:'+(banHeight - 35)+'px;position:inherit;z-index:1'}>${data.title}</h2>`+
			(renderAuthor ? `<p style="margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${data.author},'${btnFuncs[1]}')" style="background:0;border:0;color:var(--color-white)">${data.username}</button>`+
			`</p>` : '')+
			(renderImage ? gdpsAvatar(data.img)+
		`</div>` : '')+
		
		`<img loading=lazy class="${imgClass[0]}" id="guideimg" style=width:${banWidth}px;height:${banHeight}px src="${decodeURIComponent(data.ban)}" onerror="console.warn('broken link ${decodeURIComponent(data.ban)}');this.src='${helperUrl}imgs/hubemp.png'">`+
		`<div class="${imgClass[1]} gdpsalpha" styleng="${btnFuncs[2]}${data.ID}" style="width:${banWidth}px;height:60px;margin-top:${darkZoneMargin}px"></div>`+

		`<div style=position:absolute;bottom:0;width:100%>`+
			`<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
				`<span class=likeplace id="likesCount${data.ID}">${data.likes[0]}</span>`+
				`<button ${data.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${data.ID},${preHtml[5]})" class=like id="like${data.ID}"></button>`+
				`<span class=likeplace id="dislsCount${data.ID}">${data.likes[1]}</span>`+
				`<button ${data.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${data.ID},${preHtml[5]})" class=dislike id="dislike${data.ID}"></button>`+
				(typeof data.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${data.ID}">${data.likes[2]}</span>`+
				`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
			`</div>`+
			`<div class="btnszoneSearch" style=position:absolute;bottom:0;right:16px>`+
				preHtml[1]+
				`<a class=loginbtnGDPS href="${btnFuncs[3]}${data.ID}${preHtml[0] ? `.${preHtml[0]}` : ''}" style=margin-top:-2px;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="${btnFuncs[0]}(${contentId}${preHtml[0] ? `,'${preHtml[0]}'` : ''});event.preventDefault()"${getTrans('moreInfo')}/a>`+
			`</div>`+
		`</div>`+
		(renderDesc ? `<p ${renderImage ? 'class="FGDPStext absolute"' : ''} ${renderImage ? 'style="margin:0"' : ''}>${data.text}${data.text[120] === undefined ? '' : '...'}</p>` : '')+
		(renderTags ? `<div class="flex-row FGDPStags absolute">${preHtml[2]}</div>` : '')+
	`</div>`;
	return html;
},
openLink = (callback)=>{
	return false
},
contentPreload = (sendCommData = '', backFunc = '', renderNews = 1, renderBan = 1)=>{
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div id="insertable" class="gdps-forum"></div>`+
		`<div class=gdps-list-place id=GDPSesPlace></div>`+
		(renderBan ? 
		`<div class=imageBG>`+
			`<img id="imageBG" class=imageBG2>`+
		`</div>`
		: '')+
		`<div class="gdps-forum">`+
			(backFunc ?
			`<button class="loginbtn" onclick="${backFunc}"${getTrans('back')}/button>`
			: '')+
		`</div><br>`+
		`<div class=gdpsnewsalpha2 id=gdpsalpha style=z-index:-5></div>`+
		`<div style="flex-wrap:wrap" class=gdps-forum>`+
				(renderNews ? 
				`<div style=overflow:auto align=center class=adaptiveNews id="news"></div>`+
				`<div class=gdpsnewsalpha></div>`
				: `<div style=width:80vw>`)+
				`<div style=overflow:auto;flex:50%>`+
					contentSendCommForm(sendCommData)+
					`<div id="comments"></div>`+
				`</div>`+
			(renderNews ? '' : `</div>`)+
		`</div>`+
	`</div>`;
	innerMain(html);
},
contentSendCommForm = (sendCommData)=>{
	if (sendCommData != '' && thisUser.isActive === 1)
	 return `<div class="framecomm">`+
				`<input type="text" class="framelabel" id="text" style="width:calc(100% - 16px)" required minlength=10${getTrans('min10chars', 'input')}<br>`+
				`<button class="loginbtn" onclick="sendComm(${sendCommData})" id="commentBtn"${getTrans('commSend')}/button>`+
			`</div>`;
	return '';
},

Tags = [
	{
		'1': 'Camptag1',
		'2': 'Camptag2',
		'3': 'Camptag3',
		'4': 'Camptag4',
		'5': 'Camptag5',
		'6': 'Camptag6',
		'7': 'Camptag7',
		'8': 'Camptag8',
		'9': 'Camptag9',
		'10': 'Camptag10',
	},
	{
		'1': 'Showtag1',
		'2': 'Showtag2',
		'3': 'Showtag3',
		'4': 'Showtag4',
		'5': 'Showtag5',
		'6': 'Showtag6',
		'7': 'Showtag7',
		'8': 'Showtag8',
		'9': 'Showtag9',
	},
	{
		'1': 'Showtag1',
		'2': 'Showtag2',
		'3': 'Showtag3',
		'4': 'Showtag4',
		'5': 'Showtag5',
		'6': 'Showtag6',
		'7': 'Showtag7',
		'8': 'Showtag8',
		'9': 'Showtag9',
	},
	{
		'1': 'Teletag1',
		'2': 'Teletag2',
		'3': 'Teletag3',
		'4': 'Teletag4',
		'5': 'Teletag5',
		'6': 'Teletag6',
		'7': 'Teletag7',
		'8': 'Teletag8',
		'9': 'Teletag9',
	},
],
Os = [
	{
		'11': 'Camptag11',
		'12': 'Camptag12',
		'13': 'Camptag13',
		'14': 'Camptag14',
		'15': 'Camptag15',
	},
	{
		'12': 'Showtag12',
		'13': 'Showtag13',
		'14': 'Showtag14',
		'15': 'Showtag15',
	},
	{
		'12': 'Showtag12',
		'13': 'Showtag13',
		'14': 'Showtag14',
		'15': 'Showtag15',
	},
	{
		'12': 'Teletag12',
		'13': 'Teletag13',
		'14': 'Teletag14',
		'15': 'Teletag15',
	},
],
TagsVacs = {
	1:'Vacstag1',
	2:'Vacstag2',
	3:'Vacstag3',
	4:'Vacstag4',
	5:'Vacstag5',
	6:'Vacstag6',
	7:'Vacstag7',
	8:'Vacstag8',
	9:'Vacstag9',
	10:'Vacstag10',
},
toStringTAGS = (channel, tag)=>{ // используется для рендера, перемещена из региона рендера для более удобного добавления новых тегов
	let findArr = Object.assign({}, Tags[channel], Os[channel]);
	return findArr[tag];
},
toStringTagsVacs = (tag)=>{
	return TagsVacs[tag];
},

renderTagSearch = (Array, Class, ArrayId, elemId = '')=>{
	let tagName = Array[ArrayId],
	customId;
	if (elemId == '')
		customId = tagName;
	else 
		customId = elemId;
	return `<label class="tagUns" onclick="writeTag('${Class}',${ArrayId})" id=${customId}${getTrans(tagName)}/label>`;
},
renderTagAdding = (Array, Class, id, checked = '')=>{
	let tagName = Array[id];
	let html = `<input id=T${id} style=display:none name=${Class}[] type=checkbox${checked} value=${id}>`+
	`<label class=tagUns for=T${id} value=${id}${getTrans(tagName)}/label>`;
	return html;
},

// #endregion
// #region поиск + контент(открытие кемпов вики форумов и т д)

// две переменные ниже работают с функциями HELPERFIND_REGION
helperFindData = [0,[],[],1], // нулевой это метод поиска, первый просто теги, второй платформы, третий это канал

// переменные для кеша в поиске
	CacheFinds = [1,'','',1], // канал, кеш, строка поиска и страница

	// переменные для кеша в профилях
	myGdpses = [{},{},{}, {}],
	myguides = [],
	yourWikies = [],
	wikiesMini = [],

lastUsedProfile = "getCamp(45)", // переход в профиле
lastChannel = 0,

writeTag = (type,tag)=>{
	let INDEX = 1,
		elemId = 'Camptag';
	switch (type) {
		case 'camp':
			INDEX = 1;
			break;
		case 'caOS':
			INDEX = 2;
			break;
		case 'show':
			INDEX = 1;
			elemId = 'Showtag';
			break;
		case 'shOS':
			INDEX = 2;
			elemId = 'Showtag';
			break;
		case 'pere':
			INDEX = 1;
			elemId = 'Peretag';
			break;
		case 'peOS':
			INDEX = 2;
			elemId = 'Peretag';
			break;
		case 'tele':
			INDEX = 1;
			elemId = 'Teletag';
			break;
		case 'teOS':
			INDEX = 2;
			elemId = 'Teletag';
			break;
		case 'vacs':
			INDEX = 1;
			elemId = 'Vacstag';
			break;
	};
	if (!helperFindData[INDEX].includes(tag)) {
		_.$.id(elemId+tag).setAttribute('class','tagSel');
		helperFindData[INDEX].push(tag);
	} else {
		_.$.id(elemId+tag).setAttribute('class','tagUns');
		let tagPlace = helperFindData[INDEX].indexOf(tag);
		if (tagPlace !== -1) {
			helperFindData[INDEX].splice(tagPlace, 1);
		}
	}
	helperFindData[INDEX].sort((a,b)=>{return a-b});
	sendFinder();
},
setMethod = (Method)=>{
	_.$.id('method'+helperFindData[0]).setAttribute('class','tagPre');
	helperFindData[0] = Method;
	_.$.id('method'+helperFindData[0]).setAttribute('class','tagSel');
	sendFinder();
},
sendFinder = (page = 0, query = '')=>{
	if (_.$.id('nextGdps'))
		_.$.id('nextGdps').remove();

	if (query === '') {
		query = 'method='+helperFindData[0];
		let enteredName = _.$.id('gdpsNameInput').value;
		if (enteredName != '')
			query += '&name='+enteredName;
		if (helperFindData[1] !== null) {
			helperFindData[1].forEach(tag=>{
				query += '&tags[]='+tag;
			});

			helperFindData[2].forEach(os=>{
				query += '&os[]='+os;
			});
		}
	}
	lastChannel = helperFindData[3];

	Loading();
	_.http.req('GET', `${nData[3]}global?${query}&page=${page}&channel=${helperFindData[3]}`)
		.then(data=>{
			let GDPSES = JSON.parse(data),
				renderedData,
				page2 = page + 1,
				nextBtn = `sendFinder(${page2},'${query}')`,

				Count = Object.keys(GDPSES).length;
			switch (helperFindData[3]) {
				case -5:
					renderedData = renderVacancy(GDPSES);
					break;
				case -1:
					renderedData = renderWiki(GDPSES);
					break;
				case 0:
					renderedData = FINDrenderMini(0, GDPSES);
					break;
				case 1:
					renderedData = FINDrenderMini(1, GDPSES);
					break;
				case 2:
					renderedData = FINDrenderMini(2, GDPSES);
					break;
				case 3:
					renderedData = FINDrenderMini(3, GDPSES);
					break;
					
			}
			innerGdpsPlace(renderedData, page);
			CacheFinds[0] = helperFindData[3];
			console.log(renderedData);
			if (page == 0)
				CacheFinds[1] = renderedData;
			else 
				CacheFinds[1] += renderedData;
			CacheFinds[2] = query;
			CacheFinds[3] = page2;

			if (Count >= 9 && helperFindData[3] !== -1)
				innerGdpsPlace(insertBtn(nextBtn),-1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
modifyFindTags = (channel)=>{
	if (_.$.id(`tags${helperFindData[3]}`))
		_.$.id(`tags${helperFindData[3]}`).style.display = 'none';
	let actsCount = _.$.qa('[class=tagSel]').length - 1;
	_.$.qa('[class=tagSel]').forEach(el=>{
		if (actsCount == 0)
			return;
		actsCount--;
		el.classList.replace('tagSel', 'tagUns');
	});
	helperFindData[1] = [];
	helperFindData[2] = [];
	_.$.id('channel'+helperFindData[3]).setAttribute('class','tagPre');
	helperFindData[3] = channel;
	_.$.id('channel'+helperFindData[3]).setAttribute('class','tagSel');
	if (_.$.id(`tags${helperFindData[3]}`))
		_.$.id(`tags${helperFindData[3]}`).style.display = '';
	sendFinder();
},
helperComments = (postId, contentType, commPage = 0)=>{
	if (_.$.id('CnextGdps'))
		_.$.id('CnextGdps').remove();
	let dataForNextButton = `${postId},'${contentType}',${parseInt(commPage + 1)}`;
	Loading();
	_.http.req('GET', `${nData[9]}list?id=${postId}&type=${contentType}&page=${commPage}`)
		.then(data=>{
			let serverResp = JSON.parse(data);
			innerComments(renderComms(serverResp, contentType, dataForNextButton), 1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},

getFind = (channel, id, joinData = 0)=>{
	let tinyStr = 'c',
			smallString = 'camp',
			bigString = 'Camp',
			newsChannel = '.';
			switch (channel) {
				case 1:
					tinyStr = 's';
					smallString = 'show';
					bigString = 'Show';
					newsChannel = ',';
					break;
				case 2:
					tinyStr = 'p';
					smallString = 'pere';
					bigString = 'Pere';
					newsChannel = '/';
					break;
				case 3:
					tinyStr = 't';
					smallString = 'tele';
					bigString = 'Tele';
					newsChannel = '/';
					break;
				
			}
	lastUsedProfile = `getFind(${channel},${id})`;
	contentPreload(`${id},1,3`, 'pageFind('+channel+')');

	Loading();
	_.http.req('GET', `${nData[2]}gdps?id=${id}`)
		.then(data=>{
			if (data == '["NONE"]') {
				pageFind(channel);
				megaAlert('CONTENTISNULL');
				Loading(1);
				return false;
			}
			let serverResp = JSON.parse(data);
			_.link.set(smallString+'='+id, serverResp.gdps.title);
			let dataForNextButton = `${id},0,1`,
				isOwner = checkOwn(id, serverResp.gdps.author, 1),
				html = '';

			if (joinData !== 0)
				html = FINDrender(channel, serverResp, joinData);
			else 
				html = FINDrender(channel, serverResp);

			innerComments(renderComms(serverResp.comments, 0, dataForNextButton), 0);
			_.$.id('imageBG').src = decodeURIComponent(serverResp.gdps.ban);

			if (isOwner)
				_.$.id('news').insertAdjacentHTML('afterbegin', `<div class=framegdps style="width:calc(100% - 40px)">`+newsWindow(id,tinyStr)+`</div>`);
			_.$.id('news').innerHTML = basicButton(getTrans('newsList'), `helperNews('${id}${newsChannel}',${isOwner})`)+
				RenderNews(serverResp.news,2,'getCamp');
			if (Object.keys(serverResp.news).length > 10)
				_.$.id('news').insertAdjacentHTML('beforeend',insertBtn(`loadMoreNews(${id},'get${bigString}',1,2)`));
			
			_.$.id('insertable').innerHTML = html;
			setImgSize();
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
getCamp = (id, joinData = 0)=>{
	getFind(0,id,joinData);
},
getShow = (id, joinData = 0)=>{
	getFind(1,id,joinData);
},
getPere = (id, joinData = 0)=>{
	getFind(2,id,joinData);
},
getTele = (id, joinData = 0)=>{
	getFind(3,id,joinData);
},
loadMoreNews = (gdpsId, backFunc, page, renderType = 0)=>{
	if (_.$.id('nextGdps'))
		_.$.id('nextGdps').remove();
	Loading();
	_.http.req('GET', `${nData[10]}news?id=${gdpsId}&page=${page}`)
		.then(data=>{
			Loading(1);
			if (data !== '{}') {
				let parsedData = JSON.parse(data),
						html = RenderNews(parsedData,renderType,backFunc);
				page++;
				if (Object.keys(parsedData).length > 10)
					html += insertBtn(`loadMoreNews(${gdpsId},'${backFunc}',${page})`);
				if (_.$.id('news'))
					_.$.id('news').insertAdjacentHTML('beforeend',html);
				else 
					innerGdpsPlace(html, 1);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
loadGlobalNews = (page)=>{
	if (_.$.id('nextGdps'))
		_.$.id('nextGdps').remove();
	Loading();
	_.http.req('GET', `${nData[2]}news?page=${page}`)
		.then(data=>{
			Loading(1);
			if (data !== '{}') {
				let parsedData = JSON.parse(data),
						html = RenderNews(parsedData,0,'globalNews');
				page++;
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(insertBtn(`loadGlobalNews(${page})`), -1);
				if (_.$.id('news'))
					_.$.id('news').insertAdjacentHTML('beforeend',html);
				else 
					innerGdpsPlace(html, 1);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
gdpsNewsPage = (renderNazad = false, gdpsId = 0, backFunc = '')=>{
	let html = pHeader()+
	`<div style=height:60px></div>`+
	`<div id=helperContent>`+
		(renderNazad ? `<div class=gdps-forum>`+
			`<button data-trans="back" class=loginbtn onclick="${backFunc}(${parseInt(gdpsId)})"${getTrans('back')}/button><br>`+
		`</div>` : '')+
		`<div id=GDPSesPlace class=gdps-forum style=flex-direction:column;align-items:center></div>`+
	`</div>`;
	return html;
},
getNewsWithComments = (newsId, contentId = 0, backFuncPre = '', commBackFunc = '')=>{
	let backFunc = '';
	if (backFuncPre.length === 1) {
		switch (backFuncPre) {
			case '.':
				backFunc = 'getCamp';
				break;
			case ',':
				backFunc = 'getShow';
				break;
			case '/':
				backFunc = 'getPere';
				break;
			//FIXME:getTele про патч пжпж UwU
			case ';':
				backFunc = 'globalNews';
				break;
		}
	} else {
		backFunc = backFuncPre;
		switch (backFuncPre) {
			case 'getCamp':
				backFuncPre = '.';
				break;
			case 'getShow':
				backFuncPre = ',';
				break;
			case 'getPere':
				backFuncPre = '/';
				break;
			case 'globalNews':
				backFuncPre = ';';
				break;
		}
	}
	if (commBackFunc == '')
		commBackFunc = backFunc;

	lastUsedProfile = "getNewsWithComments("+newsId+","+contentId+")";
	contentPreload(`${newsId},3,5`, `${commBackFunc}(${contentId})`, 0, 0);

	Loading();
	_.http.req('GET', `${nData[11]}get?id=${newsId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				pageFind(0);
				megaAlert('CONTENTISNULL');
				Loading(1);
				return;
			}
			let serverResp = JSON.parse(data);
			_.link.set('news/comms='+newsId+'|'+contentId+'|'+backFuncPre, serverResp.gdps['n'+newsId].title);
			let dataForNextButton = `${newsId},3,1`,
				html = '';
				
			html = RenderNews(serverResp.gdps,1,backFunc,commBackFunc);

			innerComments(renderComms(serverResp.comments, 3, dataForNextButton), 0);
			_.$.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
getVacsWithComments = (vacId)=>{
	let commBackFunc = 'globalVacs';
	lastUsedProfile = "getVacsWithComments("+vacId+")";
	contentPreload(`${vacId},5,12`, `${commBackFunc}(${vacId})`, 0, 0);

	Loading();
	_.http.req('GET', `${nData[8]}get?id=${vacId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				globalVacs();
				megaAlert('CONTENTISNULL');
				Loading(1);
				return;
			}
			let serverResp = JSON.parse(data);
			_.link.set('VacsC/'+vacId, serverResp.gdps['v'+vacId].title);
			let dataForNextButton = `${vacId},3,1`,
				html = '';
				
			html = renderVacancy(serverResp.gdps,thisUser.role,'f');

			innerComments(renderComms(serverResp.comments, 5, dataForNextButton), 0);
			_.$.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
getWikis = (page)=>{
	if (_.$.id('nextGdps'))
		_.$.id('nextGdps').remove();

	Loading();
	_.http.req('GET', `${nData[2]}wiki?page=${page}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				page2 = page++,
				html = renderWiki(parsedData, page2);
			innerGdpsPlace(html,1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
// #endregion
// #region вставка в разные куски страницы, функция innerMain упомянута тут, за остальные поясню ниже
innerMain = (textContent, insertType = 0)=>{
	if (!location.search.includes('wiki'))
		_.$.D.documentElement.style = '';
	if (!helperMain) 
		return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
	if (insertType == 0) 
		helperMain.innerHTML = textContent;
	else if (insertType == 512)
		helperMain.insertAdjacentHTML('afterend', textContent);
	else 
		helperMain.insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = (textContent)=>{
	_.$.D.documentElement.style = '';
	if (_.$.id('profileWindow')) 
		_.$.id('profileWindow').innerHTML = textContent;
	else 
		return new Error('Cant find "profileWindow" element!');
},
// вставка контента в вики данные
innerWikiControl = (textContent, wikiId = '')=>{
	if (_.$.id('wikiControlP'+wikiId)) 
		_.$.id('wikiControlP'+wikiId).innerHTML = textContent;
	else 
		return new Error('Cant find "profileWindow" element!');
},
// вставка контента под рамкой поиска
innerGdpsPlace = (textContent, insertType = 0, otherId = '')=>{
	if (!_.$.id('GDPSesPlace')) 
		return new Error('Cant find "GDPSesPlace" element!');

	if (insertType == 0) // профили
		_.$.id('GDPSesPlace'+otherId).innerHTML = textContent;
	else if (insertType == 512)
		_.$.id('GDPSesPlace'+otherId).insertAdjacentHTML('beforebegin', textContent);
	else if (insertType == 511)
		_.$.id('GDPSesPlace'+otherId).insertAdjacentHTML('afterbegin', textContent);
	else if (insertType >= 1) // в поиске устарел
		_.$.id('GDPSesPlace'+otherId).insertAdjacentHTML('beforeend', textContent);
	else // в поиске но лучще это
		_.$.id('GDPSesPlace'+otherId).insertAdjacentHTML('afterend', textContent);
},
// вставка контента в рамку комментариев, прошу обратить внимание ибо у гдпсов она справа, а у гайдов и текстур заполняет весь экран
innerComments = (textContent, insertType = 0)=>{
	if (!_.$.id('comments')) 
		return new Error('Cant find "comments" element!');
	if (insertType == 0) // при рендере гдпса
		_.$.id('comments').innerHTML = textContent;
	else 
		// а эт вроде когда "показать больше"
		_.$.id('comments').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в рамку гайдов, как попало если что
innerGuides = (textContent, insertType = 0)=>{
	if (!_.$.id('guidesPlace')) 
		return new Error('Cant find "guidesPlace" element!');
	if (insertType == 0)
		_.$.id('guidesPlace').insertAdjacentHTML('beforeend',textContent);
	else 
		_.$.id('guidesPlace').insertAdjacentHTML('afterend',textContent);
},
// #endregion
// #region разные формы
sendRegisterForm = async (wId)=>{
	await Fingerprint.generate(fp === ''); // если токена нет то он пойдёт генерироваться
	let username = _.$.id('LGusername').value,
		password = _.$.id('LGpassword').value,
		email	= _.$.id('LGemail'	 ).value,
		reCAPdatas = _.$.D.getElementsByClassName('g-recaptcha-response'),
		reCAP = '';
	if (reCAPdatas.length)
		reCAP = reCAPdatas[reCAPdatas.length-1].value;
	if (!ignoreCap && !reCAP) {
		megaAlert('captchaDed');
		return;
	};
		Loading();
		_.http.req('POST', `${nData[5]}register`,
			`username=${username}&password=${password}&email=${email}&g-recaptcha-response=${reCAP}`+fp.urlDone, urlEncoded)
			.then(data=>{
				switch (data) {
					case '-1':
						megaAlert('loginClaimed');
						break;
					case '-2':
						megaAlert('captchaDed');
						break;
					case '-4':
						megaAlert('somethingWentWrong');
						break;
					default:
						let serverResp = JSON.parse(data);
						thisUser = serverResp[0];
						Slocal.set('StaticUserData', JSON.stringify(thisUser));
						myGdpses = [{},{},{}, {}];
						Object.keys(serverResp[1][0]).forEach(gdps=>{
							GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
						});
						myguides = [];
						myguides.push(serverResp[1][1]);
						token = thisUser.token;
						_.http.defaultHeaders['user-token'] = token;
						Slocal.set('User', token);
						thisUser.token = '';

						_.$.id('regBtn').remove();
						_.$.id('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

						if (_.$.id('regBtn2')) {
							_.$.id('regBtn2').innerHTML = getTrans('logout', 0);
							_.$.id('regBtn2').setAttribute('data-trans', 'logout');
							_.$.id('regBtn2').setAttribute('onclick', 'gLogout()');
						}
						if (_.$.id('btnLogin2')) {
							_.$.id('btnLogin2').innerHTML = thisUser.username;
							_.$.id('btnLogin2').removeAttribute('data-trans');
							_.$.id('btnLogin2').setAttribute('onclick', 'profilePage()');
						}
						profilePage();
						_.$.qa('[isloginwindow]').forEach(el=>{
							_.wins[el.id].close();
						});
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendLoginForm = async (wId)=>{
	await Fingerprint.generate(fp === ''); // если токена нет то он пойдёт генерироваться
	let username = _.$.id('LGusername').value,
		password = _.$.id('LGpassword').value,
		reCAPdatas = _.$.D.getElementsByClassName('g-recaptcha-response'),
		reCAP = '';
	if (reCAPdatas.length)
		reCAP = reCAPdatas[reCAPdatas.length-1].value;
	if (!ignoreCap && !reCAP) {
		megaAlert('captchaDed');
		return;
	};
		Loading();
		_.http.req('POST', `${nData[5]}login`,
			`username=${username}&password=${password}&g-recaptcha-response=${reCAP}`+fp.urlDone, urlEncoded)
			.then(data=>{
				Loading(1);
				switch (data) {
					case '-1':
						megaAlert('wrongPass');
						break;
					case '-2':
						megaAlert('accountEmpty');
						break;
					case '-3':
						megaAlert('captchaDed');
						break;
					default:
						let serverResp = JSON.parse(data);
						thisUser = serverResp[0];
						Slocal.set('StaticUserData', JSON.stringify(thisUser));
						myGdpses = [{},{},{}, {}];
						Object.keys(serverResp[1][0]).forEach(gdps=>{
							GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
						});
						myguides = [];
						myguides.push(serverResp[1][1]);
						token = thisUser.token;
						_.http.defaultHeaders['user-token'] = token;
						Slocal.set('User', token);
						thisUser.token = '';

						_.$.id('regBtn').remove();
						_.$.id('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

						if (_.$.id('regBtn2')) {
							_.$.id('regBtn2').innerHTML = getTrans('logout', 0);
							_.$.id('regBtn2').setAttribute('data-trans', 'logout');
							_.$.id('regBtn2').setAttribute('onclick', 'gLogout()');
						}
						if (_.$.id('btnLogin2')) {
							_.$.id('btnLogin2').innerHTML = thisUser.username;
							_.$.id('btnLogin2').removeAttribute('data-trans');
							_.$.id('btnLogin2').setAttribute('onclick', 'profilePage()');
						}
						profilePage();
						_.$.qa('[isloginwindow]').forEach(el=>{
							console.warn(el);
							_.wins[el.id].close();
						});
				}
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendDrop = ()=>{
	let email	= _.$.id('LGemail').value;
	Loading();
	helperRequest(
		`${sData[5]}drop${php}`,
		`email=${email}`
	)
		.then(()=>{
			Loading(1);
			if (thisUser.ID !== 0) {
				profilePage();
			} else {
				innerMain(pageMain());
			}
			megaAlert('needEmailVerify');
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
sendVerify = ()=>{
	let code	= _.$.id('LGcode').value;
	Loading();
	helperRequest(
		`${sData[5]}verify${php}`,
		`code=${code}`
	)
		.then(data=>{
			Loading(1);
			if (thisUser.ID == data) {
				thisUser.isActive = 1;
				profilePage();
			} else {
				innerMain(pageMain());
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
gLogout = ()=>{
	Loading();
	helperRequest(`${sData[5]}logout${php}`, `device=${fp.staticName}`)
		.then(()=>{
			Loading(1);
			thisUser = {
				username: '???',
				ID: 0,
				role: 0,
				isActive: 0,
				hasAlarms: 0,
				token: ''
			};
			Slocal.remove('User');
			Slocal.remove('StaticUserData');
			delete _.http.defaultHeaders['user-token'];
			token = undefined;
			innerMain(pageMain());
		});
},

sendComm = (id, channel, likeChannel)=>{
	if (thisUser.ID === 0)
		return;

	Loading();
	let dataForNextButton = `${id},'${channel}',1`,
		commText = _.$.id('text').value,
		data =
		'ide='	 + encodeURIComponent(id)
	+ '&type=' + encodeURIComponent(channel)
	+ '&text=' + encodeURIComponent(commText);
	_.http.req('POST', `${nData[9]}send`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			if (data == '-4') {
				megaAlert('commSizeFail');
				return;
			}
			let serverResp = JSON.parse(data);

			innerComments(renderComms(serverResp,channel,dataForNextButton), 0);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
editComm = (id, channel)=>{
	if (_.$.id('commEdit'+id) !== null)
		return;
	_.win.open('commEdit',
		`<textarea class=framelabel style=width:250px id=editText-C${id}>${_.$.id('commText'+id).textContent}</textarea><br>
		${basicButton(getTrans('commSend'), `modifyComm(${id},${channel})`)}`
	, 'commEdit'+id);
},
modifyComm = (id, channel)=>{
	let text = _.$.id('editText-C'+id).value,
			data = `id=${id}&type=${channel}&text=${text}`;
	Loading();
	_.http.req('POST', `${nData[9]}modify`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			_.wins[_.$.q(`[commEdit${id}]`).id].close();
			if (data == '-4') {
				megaAlert('commSizeFail');
				return;
			}
			if (data == '-3') {
				megaAlert('newsNone');
				return;
			}
			if (data != '')
				if (_.$.id('commText'+id))
					_.$.id('commText'+id).textContent = data;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
deleteComm = (id, channel)=>{
	Loading();
	_.http.req('GET', `${nData[9]}remove?ide=${id}&type=${channel}`)
		.then(data=>{
			if (data == '-1')
				return _.err.log('Access denied');
			_.$.id('comm'+data).remove();
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
editNews = (id, gdpsId)=>{
	if (_.$.id('newsEdit'+id) !== null)
		return;
	Loading();
	_.http.req('GET', `${nData[11]}get?id=${id}`)
		.then(data=>{
			Loading(1);
			let parsedData = JSON.parse(data),
					title = parsedData.gdps['n'+id].title,
					text = parsedData.gdps['n'+id].text.replaceAll('<br>', '\n');
			_.win.open('newsEdit',
				`<input class=framelabel style=width:250px id=editNews1-N${id} value="${title}"><br>
				<textarea class=framelabel style=width:250px id=editNews2-N${id}>${text}</textarea><br>
				${basicButton(getTrans('commSend'), `modifyNews(${id},${gdpsId})`)}`
			, 'newsEdit'+id);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	
},
modifyNews = (id, gdpsId)=>{
	let title = _.$.id('editNews1-N'+id).value,
			text = _.$.id('editNews2-N'+id).value,
			data = `id=${id}&gdps=${gdpsId}&title=${title}&text=${text}`;

	Loading();
	_.http.req('POST', `${nData[11]}edit`, data, urlEncoded)
		.then(data=>{
			Loading(1);
			_.wins[_.$.q(`[newsEdit${id}]`).id].close();
			if (data == '-3') {
				megaAlert('newsNone');
				return;
			}
			let parsedData = JSON.parse(data);
			let text = Markdown(parsedData[1]);
			if (data != '')
				if (_.$.id('news'+id)) {
					_.$.id('Ntitle'+id).textContent = parsedData[0];
					_.$.id('Ntext'+id).innerHTML = text;
				}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
deleteNews = (id, goBack)=>{
	Loading();
	_.http.req('GET', `${nData[11]}remove?ide=${id}`)
		.then(data=>{
			if (data == '-1')
				return _.err.log('Access denied');
			_.$.id('news'+data).remove();
			goBack ? history.back() : null;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
// #endregion
// #region публичные страницы
pHeader = ()=>{
	let regBtn = '',
		loginBtn = '',
		regBtnMobile = '',
		loginBtnMobile = '';

	if (thisUser.ID === 0) {
		regBtn = `<button id=regBtn class="emptybtn" onclick="registerPage()"${getTrans('register')}/button>`;
		loginBtn =
		`<button id=btnLogin style="margin-left:12px" class="emptybtn" onclick="loginPage()">`+
			`<span styllle=position:absolute;right:0;top:-8px${getTrans('login')}/span>`;
		regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="registerPage()"${getTrans('register')}/button>`;
		loginBtnMobile =
		`<button id=btnLogin2 class="loginbtn" onclick="loginPage()">`+
			`<span${getTrans('login')}/span>`;
	} else {
		regBtn = ``;
		loginBtn =
		`<button id=btnLogin styllle="position:relative;width:20px;height:16px;margin-left:20px" class="emptybtn" onclick="profilePage()">`+
			`<span styllle=position:absolute;right:0;top:-8px>${thisUser.username}</span>`;
		regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="gLogout()"${getTrans('logout')}/button>`;
		loginBtnMobile =
		`<button id=btnLogin2 styllle=position:relative class="loginbtn" onclick="profilePage();switchMobileMain()">`+
			`<span>${thisUser.username}</span>`;
	}

	// (thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')

	if (thisUser.hasAlarms == 1) {
		loginBtn += `<span style="position:absolute;top:-14px;right:-6px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
		loginBtnMobile += `<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
	}
	loginBtn += `</button>`;
	loginBtnMobile += `</button>`;

	let html =
	`<div class="header" id=helperMaster align="left">`+
		`<nodiv id=switchHtmlLang style=position:relative>`+
			`<button onclick="makeSwticher(0,'switchHtmlLang2', switchLangMenu(), 'switchHtmlLang', 'switchLangMenu')" style="width:40px" class="emptybtn">`+
				`<img src="${helperUrl}imgs/globe.svg" width=40px style="margin-bottom:-6px">`+
			`</button>`+ 
		`</nodiv>`+
		(renderBeta ? `<p style=opacity:50%;position:absolute;top:0;right:0;margin:64px data-trans="helperVer"${getTrans('helperVer')}/p>` : '')+
		`<div class=contentAdaptiveBig>`+
			headerButtons()+
			`<div style=position:absolute;right:8px;top:16px>`+
				`<nodiv id=switchHtmlLogin style=position:relative>`+
					regBtn+
					loginBtn+ // !ПОИСК! switchLogin = function
				`</nodiv>`+
			`</div>`+
		`</div>`+
		`<div class=contentAdaptiveSmall style=display:flex;flex-direction:row-reverse>`+
			`<button class="contentAdaptiveSmall loginbtn" onclick="switchMobileMain()">`+
				`<div style="transform:rotate(90deg)">|||</div>`+
			`</button>`+
		`</div>`+
	`</div>`+
	`<div class=frameprofile id=helperSecond style=display:none>`+
		headerButtons(1)+
		`<div style=height:33px></div>`+
		loginBtnMobile+
		regBtnMobile+
		`<p align=right${getTrans('helperVer')}/p>`+
	`</div>`;
	return html;
},
pageMain = (localIgnore = false)=>{
	let mainPlate = (h1, p, btns, img)=>{
		let text = [];
		if (!Array.isArray(p))
			text = `<p${getTrans(p)}/p>`;
		else {
			p.forEach(el=>{
				text.push(`<p${getTrans(el)}/p>`);
			})
			text = text.join('');
		}
		return `<div class=mainPlate style=width:330px;height:400px>`+
					`<h2 style="margin:6px 0 6px 0"${getTrans(h1)}/h2>`+
					text+
					`<div class=absolute style=bottom:8px;z-index:1>`+
						`<img style=margin:0 src="${helperUrl}imgs/${img}" width="144px"><br>`+
						btns+
					`</div>`+
				`</div>`;
	}
	if (!localIgnore)
		_.link.set('');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div style="background-color:var(--color-profile)">`+
			`<div class=contentAdaptiveFlexSmall style=position:relative;align-items:center;justify-content:center;overflow:hidden>`+
				basicButton(getTrans('finder-name'), `pageFind(helperFindData[3])`, `position:absolute;top:295px;left:calc(15% + 80px);z-index:3;font-size:calc(var(--def-font)*2);font-family:'Unbounded',system-ui;filter:drop-shadow(2px 2px 6px #000)`)+
				`<div class=textFly style=position:relative;width:35vw;height:370px;z-index:2;align-content:center>`+
					`<h3 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*2.5);color:#5E4877"${getTrans('T2-hi')}/h3>`+
					`<h1 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*4);font-weight:bold">`+
						`<span style=font-size:calc(var(--def-font)*4)${getTrans('ojhubname')}/span>`+
					`!</h1>`+
					`<h2 style="width:650px;margin:8px;filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*1.5)"${getTrans('hubMaster')}/h2>`+
				`</div>`+
				`<div style=position:relative;width:35vw;height:370px;z-index:1>`+
					`<img src="${helperUrl}imgs/grad.webp"  height=1000px style="position:absolute;right:-220px;top:-100px;transform:rotate(-3deg)">`+

					`<img src="${helperUrl}imgs/gem.webp"   loading=lazy height=322px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:420px;top:100px">`+
					`<img src="${helperUrl}imgs/gasi.webp"  loading=lazy height=348px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:270px;top:50px;transform:rotate(-3deg)">`+
					`<img src="${helperUrl}imgs/share.webp" loading=lazy height=424px style="filter:drop-shadow(2px 2px 8px #000);position:absolute;right:-20px;top:-11px;transform:rotate(0deg)">`+
				`</div>`+
			`</div>`+
			`<div class=contentAdaptiveSmall align=center style=position:relative;overflow:hidden>`+
				`<div class=textFly style=z-index:2>`+
					`<img src="${helperUrl}imgs/grad.webp"  height=1000px style="position:absolute;right:-180px;top:-100px;transform:rotate(-3deg)">`+
					`<h3 style="filter:drop-shadow(2px 2px 6px #000);margin:12px;font-size:calc(var(--def-font)*2.5);color:#5E4877"${getTrans('T2-hi')}/h3>`+
					`<h1 style="filter:drop-shadow(2px 2px 6px #000);margin:12px;font-size:calc(var(--def-font)*3);font-weight:bold">`+
						`<span style=font-size:calc(var(--def-font)*3)${getTrans('ojhubname')}/span>`+
					`!</h1>`+
					`<h2 style="filter:drop-shadow(2px 2px 6px #000);font-size:calc(var(--def-font)*1.25)"${getTrans('hubMaster')}/h2>`+
				`</div>`+
				basicButton(getTrans('finder-name'), `pageFind(helperFindData[3])`, `margin-top:24px;margin-bottom:48px;font-size:calc(var(--def-font)*2);font-family:'Unbounded',system-ui;filter:drop-shadow(2px 2px 6px #000)`)+
			`</div>`+
		`</div>`+
		`<div class=frameprofile style=margin-top:40px;background-color:var(--color-bg)>`+
			`<div align=center style=display:flex;flex-wrap:wrap;justify-content:center>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					mainPlate(
						'T2-promo1',
						['T2-promo2','T2-promo3'],
						basicButton(getTrans('searchCamps'), `pageFind(0)`)+
						basicButton(getTrans('searchShows'), `pageFind(1)`)+
						basicButton(getTrans('searchPeres'), `pageFind(2)`),
						'proj.svg'
					)+
					mainPlate(
						'T1-insertAbout',
						'T1-insertHelp',
						(thisUser.ID == 0 ? basicButton(getTrans('login'), 'loginPage()')+
							basicButton(getTrans('register'), 'registerPage()') : 
							basicButton(getTrans('yourProf'), 'profilePage()')
						)
						,
						'papka.svg'
					)+
				`</div>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					mainPlate(
						'T3-promo1',
						'T3-promo2',
						basicButton(getTrans('vacancies'), `globalVacs()`)+
						basicButton(getTrans('guides09'), `pageWikiList()`),
						'edin.svg'
					)+
					mainPlate(
						'T4-promo1',
						'T4-promo2',
						basicButton(getTrans('aboutHelper'), `innerMain(helperAbout())`),
						'abou.svg'
					)+
				`</div>`+
				`<div style=width:100%>`+
					`<h1${getTrans('projects')}/h1>`+
					`<div id=GDPSesPlace class=gdps-list-list>${mainPageCache.gdpses}</div>`+
					`<h1${getTrans('news')}/h1>`+
					`<div id=comments class=gdps-list-list>${mainPageCache.news}</div>`+
				`</div>`+
			`</div>`+
		`</div>`+
	`</div>`;
	return html;
},
pageFind = (channel = 1)=>{
	if (helperFindData[3] < 0) {
		helperFindData[3] = ProjectsChannel;
		channel = ProjectsChannel;
	}
	ProjectsChannel = channel;
	let tagsDiv = '',
		TagsStr = '',
		OsStr = '',
		tags = '',
		oss = '',
		customTag = '';
	for (let num in Tags) {
		switch (num) {
			case '0':
				TagsStr = 'camp';
				OsStr = 'caOS';
				break;
			case '1':
				TagsStr = 'show';
				OsStr = 'shOS';
				break;
			case '2':
				TagsStr = 'pere';
				OsStr = 'peOS';
				break;
			case '3':
				TagsStr = 'tele';
				OsStr = 'teOS';
				break;
		}
		for (let tag in Tags[num]) {
			if (num == 2) customTag = 'Peretag'+tag;
			else customTag = '';
			tags += renderTagSearch(Tags[num], TagsStr, tag, customTag);
		}
		for (let os in Os[num]) {
			if (num == 2) customTag = 'Peretag'+os;
			else customTag = '';
			oss += renderTagSearch(Os[num], OsStr, os, customTag);
		}
		tagsDiv += `<div id=tags${num} ${num != channel ? 'style=display:none' : ''}>`+
		`<h3 style=margin:0${getTrans('tags0'+num)}/h3><br>`+
			`<div style=display:flex;flex-wrap:wrap class=justifyCenterIfPcLeft>`+
				tags+
			`</div><br>`+
			`<h3 style=margin:0${getTrans('os0'+num)}/h3><br>`+
			`<div style=display:flex;flex-wrap:wrap class=justifyCenterIfPcLeft>`+
				oss+
			`</div>`+
		`</div>`;
		tags = '';
		oss = '';
	}
	helperFindData = [3,[],[],channel];
	_.link.set('find');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div class=mainFinder>`+
			`<div class=finder>`+
				`<div align=center class="frameprofile textCenterIfPcLeft" style=height:100%>`+
					`<h1 style="margin:0 0 var(--def-font) 0"${getTrans('finder-name')}/h1>`+
					`<h3 style=margin:0${getTrans('findByName')}/h3>`+
					`<input type=text id=gdpsNameInput class=framelabel style=width:250px;margin-top:8px${getTrans('findName', 'input')}<br><br>`+
					`<h3 style=margin:0${getTrans('finder-channel')}/h3><br>`+
					`<div style=display:flex;flex-wrap:wrap class="justifyCenterIfPcLeft widthBiggerIfPc">`+
						`<label onclick=modifyFindTags(0) id=channel0 class=${channel == 0 ? 'tagSel' : 'tagPre'}${getTrans('searchCamps')}/label>`+
						`<label onclick=modifyFindTags(1) id=channel1 class=${channel == 1 ? 'tagSel' : 'tagPre'}${getTrans('searchShows')}/label>`+
						`<label onclick=modifyFindTags(2) id=channel2 class=${channel == 2 ? 'tagSel' : 'tagPre'}${getTrans('searchPeres')}/label>`+
						`<label onclick=modifyFindTags(3) id=channel3 class=${channel == 3 ? 'tagSel' : 'tagPre'}${getTrans('searchTeles')}/label>`+
					`</div><br>`+

					tagsDiv+'<br>'+

					//`<label${getTrans('Text;Tags')}/label><br>`+
					//renderTextOrTags()+'<br><br>'+

				`</div>`+
			`</div>`+
			`<div class="finderMargin ">`+
				`<div class=justifyCenterIfPcLeft style=display:flex;flex-wrap:wrap;justify-content:center>`+
					`<label onclick=setMethod(3) id=method3 class=tagSel${getTrans('search1')}/label>`+
					`<label onclick=setMethod(0) id=method0 class=tagPre${getTrans('search4')}/label>`+
					`<label onclick=setMethod(1) id=method1 class=tagPre${getTrans('mostLike')}/label>`+
					`<label onclick=setMethod(2) id=method2 class=tagPre${getTrans('mostDisl')}/label>`+
				`</div>`+
				`<div class="gdps-list-place " id=GDPSesPlace style="margin-top:16px">`+
					CacheFinds[1]+
					insertBtn(`sendFinder(${CacheFinds[3]},'${CacheFinds[2]}')`)+
				`</div>`+
			`</div>`+
		`</div>`+
	`</div>`;
	innerMain(html);

	let startSearch = false;
	if (CacheFinds[1] == '')
		startSearch = true;
	if (channel !== CacheFinds[0])
		startSearch = true;

	if (startSearch)
		sendFinder();
},
pageWikiList = ()=>{
	helperFindData = [0,null,null,-1];
	_.link.set('Wikis');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div id=finder align=left class="frameprofile">`+
			`<h1 align=center>`+
				`<span${getTrans('guides09')}/span> `+
				(thisUser.ID !== 0 ? basicButton('>+<', `createWiki()`, 'font-size:calc(var(--def-font)*1.75);padding: 0 calc(var(--def-btn-size)*0.5);') : '')+
			`</h1>`+
			`<label${getTrans('findByName')}/label>:<br>`+
			`<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('wikiName', 'input')}<br><br>`+
		`</div>`+
		`<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
		`</div>`+
	`</div>`;
	innerMain(html);
	Loading();
	_.http.req('GET', `${nData[2]}wiki`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				html = renderWiki(parsedData);
			innerGdpsPlace(html);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
globalNews = ()=>{
	innerMain(gdpsNewsPage());
	Loading();
	_.http.req('GET', `${nData[2]}news?page=0`)
		.then(data => {
			_.link.set('news');
			Loading(1);
			if (data == '{}') {
				innerGdpsPlace(`<h1${getTrans('newsNone')}/h1>`, 1);
			} else {
				let parsedData = JSON.parse(data);
				innerGdpsPlace(RenderNews(parsedData,0,'globalNews'));
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(insertBtn(`loadGlobalNews(1)`), 1);
				let campsCount = myGdpses[0] ? Object.keys(myGdpses[0]).length : 0,
					showsCount = myGdpses[1] ? Object.keys(myGdpses[1]).length : 0,
					peresCount = myGdpses[2] ? Object.keys(myGdpses[2]).length : 0,
					telesCount = myGdpses[3] ? Object.keys(myGdpses[3]).length : 0,
					gdpssCount = campsCount + showsCount + peresCount + telesCount;
				if (gdpssCount !== 0)
					innerGdpsPlace(`<div class=framegdps>`+newsWindow()+`</div>`, 511);
			};
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
globalVacs = ()=>{
	let tags = '';
	for (let tag in TagsVacs) {
		tags += renderTagSearch(TagsVacs, 'vacs', tag, '');
	}
	helperFindData = [0,[],[],-5];
	_.link.set('vacs');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div style="height:60px"></div>`+
		`<div id=finder align=left class="frameprofile">`+
			`<h1${getTrans('finder-name')}/h1>`+
			`<label${getTrans('findByName')}/label>:<br>`+
			`<input type=text id=gdpsNameInput class=framelabel style=width:250px${getTrans('findName', 'input')}<br><br>`+

			`<div id=tags>`+
				`<label${getTrans('tags00')}/label>:<br>`+
				`<div style=display:flex;flex-wrap:wrap;justify-content:center>`+
					tags+
				`</div>`+
			`</div>`+

		`</div>`+
		`<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
		`</div>`+
	`</div>`;
	innerMain(html);
	Loading();
	_.http.req('GET', `${nData[2]}vacans?page=0`)
		.then(data => {
			Loading(1);
			let parsedData = JSON.parse(data);
			innerGdpsPlace(renderVacancy(parsedData));
			if (Object.keys(parsedData).length > 8)
				innerGdpsPlace(insertBtn(`sendFinder(1,'method=0')`), -1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
uvazuha = ()=>{
	_.link.set('special');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div align=center>`+
			`<h1${getTrans('ojhubname')}/h1>`+
			`<h2${getTrans('special00')}/h2>`+
			`<div class=frameguide align=left>`+
				`<p>DenisC -	 <span${getTrans('special01')}/span></p>`+
				`<p>Vustur -	<span ${getTrans('special03')}/span></p>`+
				`<p>MIOBOMB -	<span${getTrans('special04')}/span></p>`+
				`<p>Qundikus - <span${getTrans('special05')}/span></p>`+
				`<p>glorius -	<span${getTrans('special09')}/span></p>`+
				`<p>M41den -	<span ${getTrans('special10')}/span></p>`+
			`</div>`+
			`<h2${getTrans('special11')}/h2>`+
			`<div class=frameguide align=left>`+
				`<p>Ikotik -	 <span${getTrans('special12')}/span></p>`+
				`<p>Олег -		 <span${getTrans('special13')}/span></p>`+
				`<p>Шаре -		 <span${getTrans('special14')}/span></p>`+
				`<h2${getTrans('special08')}/h2>`+
				`<br><br>`+
			`</div>`+
		`</div>`+
	`</div>`;
	return html;
},
helperAbout = ()=>{
	_.link.set('about');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div class=frameprofile style=text-align:left>`+
			`<h1${getTrans('aboutHelper')}/h1>`+
			`<h2${getTrans('history01')}/h2>`+
			`<p${getTrans('history02')}/p>`+
			`<p${getTrans('history03')}/p>`+
			`<button class=loginbtn onclick="innerMain(uvazuha())"${getTrans('HLthanks')}/button>`+
			`<h2${getTrans('helperSocials')}/h2>`+
			`<a class=loginbtn href="https://t.me/objecthub" target=_blank${getTrans('helperTg')}/a> `+
			`<a class=loginbtn href="https://discord.gg/zetb62mqsS" target=_blank${getTrans('helperDs')}/a> `+
			basicButton(getTrans('news'),`helperNews('117/',${thisUser.role})`)+
			`</div>`+
		`</div>`+
	`</div>`;
	return html;
},
helperNews = (gdpsId, renderOwnButton = 0)=>{
	let backFunc = '',
			lastFunc = '',
			gdpsInt = parseInt(gdpsId),
			renderNazad = true;
	switch (gdpsId[gdpsId.length-1]) {
		case '.':
			backFunc = 'getCamp';
			lastFunc = '.';
			break;
		case ',':
			backFunc = 'getShow';
			lastFunc = ',';
			break;
		case '/':
			backFunc = 'getPere';
			lastFunc = '/';
			// renderNazad = false;
			break;
	}
	innerMain(gdpsNewsPage(renderNazad, gdpsId, backFunc));
	Loading();
	_.http.req('GET', `${nData[10]}news?id=${gdpsInt}`)
		.then(data=>{
			_.link.set('news/list='+gdpsId+'|'+renderOwnButton);
			Loading(1);
			if (data == '{}') {
				innerGdpsPlace(`<h1${getTrans('newsNone')}/h1>`, 1);
			} else {
				let parsedData = JSON.parse(data);
				innerGdpsPlace(RenderNews(parsedData,0,backFunc));
				if (Object.keys(parsedData).length > 10)
					innerGdpsPlace(insertBtn(`loadMoreNews(${gdpsInt},'${backFunc}',1)`), 1);
				if (parseInt(renderOwnButton))
					innerGdpsPlace(`<div class=framegdps>`+newsWindow(gdpsId)+`</div>`, 511);
			};
			console.log(renderOwnButton);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
setImgSize = ()=>{
	let offset = 0;
	if (window.innerWidth >= 700) { // large screen
		if (_.$.id('imageBG')) {
			_.$.id('imageBG').style = '';
			let alphaY = _.$.id('imageBG').getBoundingClientRect().height - 2;
			_.$.id('gdpsalpha').style = `z-index:-5;position:absolute;top:${alphaY}px`;
			return;
		}
	} else if(_.$.id('gdpsalpha')) { // small screen
		_.$.id('gdpsalpha').style = `z-index:-5`;
		offset = -6;
	}
	if (_.$.id('gdpsalpha') && _.$.id('imageBG')) {
		let darkElement = _.$.id('gdpsalpha').getBoundingClientRect(),
		imgposY = darkElement.y + offset,
		imgposX = imgposY * 2.4;

		
		_.$.id('imageBG').style.width = imgposX+'px';
		_.$.id('imageBG').style.height = imgposY+'px';
	}
},
BETA_fixImg = (url)=>{
	if (!renderBeta)
		return url;

	if (url.includes('./imgs/'))
		return `.${url}`;
	else 
		return url;
},
insertBtn = (lastUse, transText = 'showMore', useRemover = 1, group = '')=>{ // кнопка "показать больше"
	return `<div ${useRemover === 1 ? 'id='+group+'nextGdps ' : ''}class=gdps-helper align=center>`+
		`<button onclick="${lastUse}" class=loginbtn `+
		`style="font-size:calc(var(--def-font)*2);padding:4px 8px;margin:12px 0"${getTrans(transText)}/button>`+
	`</div>`;
},

deviceAddForm = ()=>{
	let html = pHeader()+
	`<div id=helperContent>`+
		`<form class="frameprofile" method=post onsubmit="return enterFormData(this,'deviceAdd${php}')">`+
			`<h1${getTrans('deviceNotTrust01')}/h1>`+
			`<p${getTrans('deviceNotTrust02')}/p>`+
			`<input type=hidden name=device value='${fp.staticName}'>`+
			`<input type=hidden name=deviceDynamic value='${fp.dynamic}'>`+
			`<input id=LGpassword class=framelabel maxlength=64 minlength=5 name=password type=password${getTrans('login02', 'input')}<br><br>`+
			`<input class=loginbtn type=submit${getTrans('submit', 'inputValue')}<br><br>`+
			`<input type=hidden name=device value="${fp.staticName}">`+
		`</form>`+
	`</div>`;
	return html;
},
otherProfile = (userId, backButton, innerHtnl = otherProfileMini)=>{
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div class=frameprofile style="margin:0;height:100%">`+
			`<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone()">`+
				`<div style="transform:rotate(90deg)">|||</div>`+
			`</button>`+
			`<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:15px;width:235px" align="left">`+
				`<button class=loginbtn onclick="otherProfileMini(${userId})"${getTrans('profile')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(0,${userId})"${getTrans('searchCamps')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(1,${userId})"${getTrans('searchShows')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(2,${userId})"${getTrans('searchPeres')}/button><br><br>`+
				`<button class=loginbtn onclick="otherWikisWindow(${userId})"${getTrans('guides09')}/button><br><br>`+
				`<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
			`</div>`+
			`<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
				`<button class=loginbtn onclick="otherProfileMini(${userId});profileSwitcherPhone()"${getTrans('profile')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(0,${userId});profileSwitcherPhone()"${getTrans('searchCamps')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(1,${userId});profileSwitcherPhone()"${getTrans('searchShows')}/button><br><br>`+
				`<button class=loginbtn onclick="otherFindsWindow(2,${userId});profileSwitcherPhone()"${getTrans('searchPeres')}/button><br><br>`+
				`<button class=loginbtn onclick="otherWikisWindow(${userId});profileSwitcherPhone()"${getTrans('guides09')}/button><br><br>`+
				`<br><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button>`+
			`</div>`+
			`<div class=profileMobileRightWindow id="profileWindow" align="left">`+
			`</div>`+
		`</div>`+
	`</div>`;
	innerMain(html);
	innerHtnl(userId);
},
// #endregion
// #region кнопки профиля (лист входов, удалить аларм и т д)
newsWindow = (contentId = 0, contentType = 'c')=>{
	let gdpses = '';
	if (contentId === 0) {
		gdpses = `<select style=width:90% class=framelabel name=gdps>`;
		for (let gdpsType in myGdpses)
			for (let gdpsKey in myGdpses[gdpsType]) {
				let Gdps = myGdpses[gdpsType][gdpsKey],
					Gid = Gdps.ID,
					Gch = GDPSswitchChannel(gdpsType)[2],
					newsTitle = Gdps.title;

				gdpses += `<option value=${Gch}${Gid}>${newsTitle}</option>`
			};
		gdpses += `</select><br>`;
	} else {
		gdpses = `<input type=hidden name=gdps value=${contentType}${contentId}>`;
	}
	let html = 
	`<div id=helperContentProfile>`+
		`<h1 id=blacktext${getTrans('newPost')}/h1>`+
		`<form method=post onsubmit="return enterFormData(this,'${nData[11]}add')">`+
			`<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
			`<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
			`<progress max=1 value=0 id=newsFileProg style=display:none></progress><br>`+
			`<input name=files id=newsFiles type=file multiple><br>`+
			gdpses+
			`<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
		`</form>`+
	`</div>`;
	return html;
},

// #endregion
// #region newHelper.js - окна
ADwrite = (userId = '')=>{
	let anonymusSend = `<p><input type=checkbox name=anonymus> Send as Object hub</p>`;
	_.win.open('writeAlarm', 
		`<h1>Write to support</h1>`+
		`<form onsubmit="return enterFormData(this,'${nData[5]}writeAlarm')">`+
			`<input name=windowId value={winId} type=hidden>`+
			`<input placeholder="userId (not username)" class=framelabel ${thisUser.role === 0 ? 'type=hidden value=0':'type=text value="'+userId+'"'} name=user><br>`+
			`<input placeholder=title class=framelabel name=title><br>`+
			`<textarea placeholder=text class=framelabel name=text></textarea><br>`+
			(thisUser.role !== 0 ? anonymusSend : '')+
			`<button onclick="_.wins['{winId}'].close()" class=loginbtn>close</button>`+
			`<input type=submit value=send class=loginbtn>`+
		`</form>`
	);
},
loginPage = ()=>{
	let id = _.win.open('logonWindow',
		`<h1${getTrans('login')}/h1>
		<input style=width:75%	id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login01', 'input')}<br><br>
		<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}
		<button class=emptybtn onclick=seePassword()>
			<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>
		</button><br><br>
		<div id={winId}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>
		<button style="width:calc(100% - 16px)" onclick="innerMain(dropWindow())" class="loginbtn"${getTrans('remindPass')}/button><br><br>
		<button style="width:calc(100% - 16px)" onclick="sendLoginForm('{winId}')" class="loginbtn"${getTrans('joinToGdps')}/button><br>
		<br><button style="width:calc(100% - 16px)" class="loginbtn" onclick="_.wins['{winId}'].close()"${getTrans('back')}/button>
		<p align=right${getTrans('helperVer')}/p>`
	, 'isloginwindow');
	if (!ignoreCap && !_.lazy.loaded['https://www.google.com/recaptcha/api.js']) {
		_.lazy.load('https://www.google.com/recaptcha/api.js')
			.then(()=>{
				let elemId = id+'cap';
				captchaLoad ? grecaptcha.render(elemId) : captchaLoad = true;
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
registerPage = ()=>{
	let id = _.win.open('logon2Window',
		`<h1${getTrans('register')}/h1>
		<input style=width:75% id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login06', 'input')}<br><br>
		<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}
		<button class=emptybtn onclick=seePassword()>
			<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>
		</button><br><br>
		<input style=width:75% id="LGemail" class="framelabel" required ${getTrans('login03', 'input')}<br><br>
		<div id={winId}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>
		<button style="width:calc(100% - 16px)" onclick="sendRegisterForm('{winId}')" class="loginbtn"${getTrans('register')}/button><br>
		<br><button style="width:calc(100% - 16px)" class="loginbtn" onclick="_.wins['{winId}'].close()"${getTrans('back')}/button>
		<p align=right${getTrans('helperVer')}/p>`
	, 'isloginwindow');
	if (!ignoreCap && !_.lazy.loaded['https://www.google.com/recaptcha/api.js']) {
		_.lazy.load('https://www.google.com/recaptcha/api.js')
			.then(()=>{
				let elemId = id+'cap';
				captchaLoad ? grecaptcha.render(elemId) : captchaLoad = true;
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
reportParser = (formObj, url)=>{
	let formData = _.form.read(formObj),
		parsedForm = new URLSearchParams(formData).toString();
	_.http.req('POST', url, parsedForm)
		.then(data=>{
			megaAlert('reported', 1000);
			_.wins[formData['windowId']].close();
			return false;
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	return false;
}
gdpsReport = (gdpsId)=>{
	_.win.open('REPform',
		`<h1${getTrans('report01')}/h1>
		<form id={winId}formREP onsubmit="return reportParser(this,'${nData[2]}reportGdps')">
			<input type=hidden value="{winId}" name=windowId>
			<input name=gdps value="${gdpsId}" type=hidden>
			<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report02', 'textarea')}/textarea><br>
			<button onclick="_.$.id('{winId}formREP').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
			<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}
		</form>`
	);
},
forumReport = (postId)=>{
	_.win.open('REPform2', 
		`<h1${getTrans('report01')}/h1>
		<form id={winId}formREP onsubmit="return reportParser(this,'${nData[2]}reportGdps')">
			<input type=hidden value="{winId}REPform2" name=windowId>
			<input name=gdps value="${postId}" type=hidden>
			<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report03', 'textarea')}/textarea><br>
			<button onclick="_.$.id('{winId}formREP').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
			<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}
		</form>`
	);
},
getConfInfo = (step = 0)=>{
	if (step == 0) {
		_.win.open('getLogin',
			`<form id={winId}formLINK method=post onsubmit="return false">
				<input class=framelabel id=LGpassword${getTrans('login02', 'input')}<br>
				<button onclick="_.$.id('{winId}formLINK').setAttribute('onsubmit','return false');_.wins['{winId}'].close()" class=loginbtn${getTrans('otmena')}/button>
				<button onclick=getConfInfo(1);_.wins[{winId}].close() class=loginbtn${getTrans('commSend')}/button>
			</form>`
		);
	} else {
		let password = _.$.id('LGpassword').value;
		Loading();
		helperRequest(`${sData[5]}getAccInfo${php}`, 'password='+password)
			.then(data=>{
				if (data == '-1') {
					megaAlert('wrongPass');
				} else {
					let parsedData = JSON.parse(data),
						html2 = `<span${getTrans('login06')}/span>: ${parsedData[0]}<br>
						<span${getTrans('login03')}/span>: ${parsedData[1]}<br><br>
						<button onclick="_.wins['{winId}'].close()" class=loginbtn${getTrans('back')}/button>`;			
						_.win.open('getLogin2', html2);
				}
				Loading(1);
			})
			.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	}
},
// #endregion
// #region свитчеры
makeSwticher = (switchType = 0, switcherElemId = '', switcherHTML = '', innerElementId = '', switcherName)=>{
	if (switchType === 0) 
		if (!_.$.id(switcherElemId))
			if (typeof innerElementId === 'string') {
				if (_.$.id(innerElementId))
					_.$.id(innerElementId).insertAdjacentHTML('beforeend', switcherHTML);
			} else 
				innerElementId.forEach(el => el == 'object' ? el.insertAdjacentHTML('beforeend', switcherHTML) : '');
		else
			_.$.id(switcherElemId).remove();
	else
		_.$.id(switcherElemId).remove();
	if (false)
		if (!_.$.id(switcherElemId)) // location.search.replace('?','').split('&').includes('switcher='+innerElementId)
			return swtichRemove(innerElementId);
		else 
			switchAdd(innerElementId);
},
switchScan = (name)=>{
	console.log(name);
	switch(name) {
		case 'switchHtmlLang':
			return makeSwticher(0,'switchHtmlLang2', switchLangMenu(), 'switchHtmlLang', 'switchLangMenu');
			break;
		case 'userSettings':
			return makeSwticher(0,'userSettings2', switchProfileSettings(), 'userSettings', 'switchProfileSettings');
			break;
		case 'userProjects':
			return makeSwticher(0,'userProjects2', switchProfileProjects(), 'userProjects', 'switchProfileProjects');
			break;
		case 'userSettingsPhone':
			return makeSwticher(0,'userSettings2', switchProfileSettings(), 'userSettingsPhone', 'switchProfileSettings');
			break;
		case 'userProjectsPhone':
			return makeSwticher(0,'userProjects2', switchProfileProjects(), 'userProjectsPhone', 'switchProfileProjects');
			break;
		default:
			return swtichRemove(name);
	}
},
switchAdd = (name)=>{
	_.link.add('switcher='+name);
	return false;
},
swtichRemove = (name)=>{
	_.link.remove('switcher='+name);
	return false;
},

switchLangMenu = ()=>{ // makeSwticher(0,'switchHtmlLang2', switchLangMenu(), 'switchHtmlLang', 'switchLangMenu')
	let preLang = '';
	langList.forEach(lang=>{
		preLang += 
		`<button onclick="_.lang.replace('${lang}').then(e=>doLangSetup(e));makeSwticher(1,'switchHtmlLang2')" style="width:40px;margin:2px" class="emptybtn">`+
			`<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
		`</button>`;
	});
	return `<div id=switchHtmlLang2 style="position:absolute;top:0px;left:48px;padding:8px;border:solid var(--color-black) 3px;border-radius:var(--def-border-small);background-color:rgba(255,255,255,.1);">`+
		preLang+
	`</div>`;
};
// #endregion
// #region девайс
class Fingerprint {
	static async generate(generateFp = '') {
		console.info('device token? '+!!generateFp);
		if (!generateFp)
			return {};
		// Постоянная часть (шифрованная строка)
		const staticName = await this.getPermanentFingerprint();

		// Временная часть (JSON строка для удобства)
		const dynamic = encodeURIComponent(JSON.stringify({
			userAgent: navigator.userAgent,
			viewport: `${window.innerWidth}x${window.innerHeight}`,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			languages: navigator.languages,
			timestamp: Date.now()
		}));

		let fpData = {
			staticName: staticName,
			dynamic: dynamic,
			urlDone: `&device=${staticName}&deviceDynamic=${dynamic}`,
			objDone: {
				device: staticName,
				deviceDynamic: dynamic
			}
		};
		_.http.defaultHeaders['device-static'] = staticName;
		fp = fpData;
		return fpData;
	}
	static async getPermanentFingerprint() {
		const components = {
			colorDepth: screen.colorDepth,
			pixelRatio: window.devicePixelRatio,
			hardwareConcurrency: navigator.hardwareConcurrency,
			deviceMemory: navigator.deviceMemory || 'unknown',
			canvas: await this.getCanvasFingerprint(),
			webgl: await this.getWebGLInfo(),
			fonts: await this.getFontsList()
		};

		const jsonString = JSON.stringify(components);
		const encoder = new TextEncoder();
		const data = encoder.encode(jsonString);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}
	static async getCanvasFingerprint() {
		const canvas = _.$.D.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 200;
		canvas.height = 50;
		
		ctx.textBaseline = 'top';
		ctx.font = '14px Arial';
		ctx.fillStyle = '#f60';
		ctx.fillRect(0, 0, 200, 50);
		ctx.fillStyle = '#069';
		ctx.fillText('Fingerprint @' + navigator.hardwareConcurrency, 2, 2);

		const canvas2dValue = canvas.toDataURL().substring(0, 100);
		
		canvas.width = 0;
		canvas.height = 0;
		if (canvas.parentNode)
			canvas.parentNode.removeChild(canvas);
		
		return canvas2dValue;
	}
	static async getWebGLInfo() {
		try {
			const canvas = _.$.D.createElement('canvas');
			const gl = canvas.getContext('webgl');
			if (!gl) return 'no-webgl';
			
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
		} catch {
			return 'error';
		}
	}
	static async getFontsList() {
		const fonts = ['Arial', 'Times', 'Courier'];
		const available = [];
		
		for (const font of fonts) {
			if (await this.checkFont(font)) available.push(font);
		}
		
		return available;
	}
	static checkFont(font) {
		return new Promise(resolve => {
			const canvas = _.$.D.createElement("canvas");
			const context = canvas.getContext("2d");
			const text = "mmmmmmmmmmlli";
			
			context.font = "50px monospace";
			const width1 = context.measureText(text).width;
			
			context.font = `50px "${font}", monospace`;
			const width2 = context.measureText(text).width;
			
			const isFontAvailable = (width1 !== width2);
			
			canvas.width = 0;
			canvas.height = 0;
			if (canvas.parentNode)
				canvas.parentNode.removeChild(canvas);
			
			resolve(isFontAvailable);
		});
	}
}
let fp = '',
// #endregion
// #region новые клиентские лайки
/* ДЛЯ НАЧАЛА стоит сказат как оно работает
 * Из-за легаси модели гдпс хелпера доставшейся ошхабу по наследству у нас нет как таковой логики в сервисе лайков. -1 это лайк а просто 1 дизлайк, почему? так удобнее удалять лайки! (это кстати помогло ошхабу очень быстро реализовать возможность удаления лайков, ну а на хелпере оно не прижилось)
 * Здесь вы увидете обычную прослойку для получения лайков из внешнего хранилища, ибо это внешнее ультракомпактное хранилище было сделано великим DenisC
*/
LIKES = {
	// каждый ключ объекта - канал, каждый канал содержит массив где минусовое число лайк а плюсовое дизлайк
	data: {
		// некоторых классов тут нет так как они будут удалены из ошхаба в ближайшем обновлении, как пример форумы, и страницы вики ибо там оно не будет нужно (максимум комменты но оно не имеет никакого отношения к сервису лайков)
		"p": new Set(),
		"c": new Set(),
		"n": new Set(),
		"g": new Set(),
		"w": new Set(),
		"f": new Set(),
		"v": new Set(),
	},
	chIdToStr: {
		0:	'p',
		1:	'c',
		2:	'n',
		3:	'c',
		4:	'c',
		5:	'c',
		6:	'c',
		7:	'g',
		8:	'w',
		9:	'f',
		10:	'c',
		11:	'v',
		12:	'c',
	},
	transform(ch) {
		if (ch == -3)
			return 'f';
		if (ch == -2)
			return 'g';
		if (ch == -1)
			return 'w';
		if (ch >= 0)
			return 'p';
		return ch;
	},
	get(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		if (set.has(id))
			return 1;
		if (set.has(-id))
			return -1;
		return 0;
	},
	checker(ch, preId, type) { // -1 like, 1 disl
		console.log(ch)
		let channel = this.chIdToStr[ch.toString()],
			set = this.data[channel],
			id = Math.abs(preId),
			hasL = set.has(-id),
			hasD = set.has(id);

		console.log(hasL, hasD);

		if (hasL || hasD)
			return this.remove(channel, id);
		if (type === 1)
			this.dislAdd(channel, id);
		else 
			this.likeAdd(channel, id);

		console.log(set.has(-id), set.has(id));

	},
	likeAdd(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(id);
		set.add(-id);
	},
	dislAdd(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(-id);
		set.add(id);
	},
	remove(ch, preId) {
		let channel = this.transform(ch),
			set = this.data[channel],
			id = Math.abs(preId);
		set.delete(id);
		set.delete(-id);
	},
	push(channel, ids) {
		let set = this.data[channel];
		set.clear();
		for (let id of ids)
			set.add(id);
	},
	init() {
		if (!token)
			return false;
		_.http.req('GET', `${nData[2]}likesT`).then(data=>{
			let parsedData = JSON.parse(data);
			console.log(parsedData)
			for (let i in parsedData)
				LIKES.push(i, parsedData[i]);
			return this.data;
		})
	}
},
sendLike = (id, channel, isComm = 0)=>{
	if (thisUser.ID === 0)
		return megaAlert('needLogin');

	Loading();
	_.http.req('POST', `${nData[2]}like?ide=${id}&type=${channel}`)
		.then(data=>{
			let likeValue = JSON.parse(data),
				likePlace = 'likesCount',
				dislPlace = 'dislsCount',
				prefix = '';
			if (isComm) 
				prefix = 'Comm';
			_.$.id(likePlace + prefix + id).textContent = likeValue[0];
			_.$.id(dislPlace + prefix + id).textContent = likeValue[1];
			
			repaintLikeButton(id, isComm, 1);
			LIKES.checker(channel, id, -1)
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
sendDislike = (id, channel, isComm = 0)=>{
	if (thisUser.ID === 0)
		return megaAlert('needLogin');

	Loading();
	_.http.req('POST', `${nData[2]}dislike?ide=${id}&type=${channel}`)
		.then(data=>{
			let likeValue = JSON.parse(data),
				likePlace = 'likesCount',
				dislPlace = 'dislsCount',
				prefix = '';
			if (isComm) 
				prefix = 'Comm';
			_.$.id(likePlace + prefix + id).textContent = likeValue[0];
			_.$.id(dislPlace + prefix + id).textContent = likeValue[1];
			
			repaintLikeButton(id, isComm, -1);
			LIKES.checker(channel, id, 1)
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});
},
repaintLikeButton = (id, isComm, liketype = 0)=>{
	let like = 'like'+id,
		disl = 'dislike'+id;
	if (isComm) {
		like = 'likeComm'+id;
		disl = 'dislikeComm'+id;
	}
	let likeElem = _.$.id(like),
		dislElem = _.$.id(disl);

	if (likeElem.style.filter == '' && dislElem.style.filter == '') {
		if (liketype == -1) {
			dislElem.setAttribute('style', likeStyle.disl);
		} else {
			likeElem.setAttribute('style', likeStyle.like);
		}
		return;
	}
	if (likeElem.style.filter != '') {
		likeElem.setAttribute('style', '');
	}
	if (dislElem.style.filter != '') {
		dislElem.setAttribute('style', '');
	}
},
// #endregion
// #region уведомления!

pushSubscribe = async ()=>{
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		console.warn('push не поддерживается этим браузером');
		return false;
	}

	const reg = await navigator.serviceWorker.register('/sw.js');
	await navigator.serviceWorker.ready;

	let sub = await reg.pushManager.getSubscription();

	if (!sub) {
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') {
			Slocal.set('Push', '-1');
			return false;
		}

		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: pushUrlBase64ToUint8Array(helperVapidPublic)
		});
	}

	return pushSendToServer(sub);
},
pushSendToServer = async (sub)=>{
	let j = sub.toJSON(),
		data = `endpoint=${encodeURIComponent(j.endpoint)}&`+
				`p256dh=${encodeURIComponent(j.keys.p256dh)}&`+
				`auth=${encodeURIComponent(j.keys.auth)}`,
		res = await _.http.req('POST', '/v1/sub.php', data);

	if (res !== '1') {
		console.error('push: не удалось сохранить подписку', res);
		return false;
	}

	return true;
},
pushUrlBase64ToUint8Array = (base64String)=>{
	const padding = '='.repeat((4 - base64String.length % 4) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
},
// #endregion
// #region рендер контента (шоу, кемпы)

FINDrenderMini = (channel, parsedData, joinData = '')=>{
	let html = '',
		Count = 0,
		preHtml = [],
		gdpsData = null,
		TagsLocal = null,
		renderJoinLink = null,
		tagsOs = '';

	for (let Id in parsedData) {
		Count++;
		tagsOs = '';
		if (Count == 9)
			return html;

		gdpsData = parsedData[Id];
		
		if (JSON.parse(gdpsData.tags) != null && JSON.parse(gdpsData.os) != null) {
			TagsLocal = JSON.parse(gdpsData.tags).concat(JSON.parse(gdpsData.os));
			TagsLocal.forEach(function(tag){
				tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
			});
		}
		renderJoinLink = gdpsData.freejoin;

		renderJoinLink = '';//renderJoinLink ? '' : `<a class="loginbtnGDPS" href="join${php}?id=${gdpsData.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;

		preHtml = [joinData, renderJoinLink, tagsOs, 'width:300px;height:450px', channel, 0];
		html += contentRenderMinu(gdpsData, preHtml);
	}
	return html;
},
renderWiki = (parsedData, page = 0)=>{
	page++;
	let html = '',
		Count =	0,
		preHtml = [],
		gdpsData = null;

	for (let Id in parsedData) {
		Count++;
		if (Count == 9) {
			innerGdpsPlace(insertBtn(`getWikis(${page})`),-1);
			return html;
		}

		gdpsData = parsedData[Id];

		preHtml = ['', '', '', 'width:300px;height:350px', -1, 8];
		html += contentRenderMinu(gdpsData, preHtml, 0, 1, 0, 0);
	}
	return html;
},

FINDrender = (channel, parsedData, joinData = '')=>{
	let html = '',
		gdpsData = parsedData.gdps,
		TagsLocal = JSON.parse(gdpsData.tags),
		os = JSON.parse(gdpsData.os),
		tagsOs = '';

	switch (channel) {
		case 0:
			gdpsData.GDPSdata = ['camp','getCamp'];
			break;
		case 1:
			gdpsData.GDPSdata = ['show','getShow'];
			break;
		case 2:
			gdpsData.GDPSdata = ['pere','getPere'];
			break;
		case 3:
			gdpsData.GDPSdata = ['tele','getTele'];
			break;
	}
	gdpsData.isLiked = LIKES.get('p', gdpsData.ID);

	tagsOs += '<div class="flex-row">';
	if (TagsLocal != null)
		TagsLocal.forEach(tag=>{
			tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
		});
	tagsOs += '</div>'+'<div class="flex-row">';
	if (os != null)
		os.forEach(tag=>{
			tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
		});
	tagsOs += '</div>';
	

	html += contentRender(gdpsData, 0, 0, 0, tagsOs, 1, gdpsData.wiki, gdpsData.ID, joinData);
	return html;
},
RenderNews = (data, isComm = 0, backFunc = 'getCamp', commBackFunc = '')=>{
	console.warn('renderNews Comm => '+isComm);
	if (commBackFunc == '')
		commBackFunc = backFunc;
	let html = '',
		html2 = '',
		Count = 0,
		
		gData = null,
		gdpsData = null,
		miniRenderMode = '';

	let myCampsIds = [];
	for (let gdpsType in myGdpses)
		for (let gdpsKey in myGdpses[gdpsType]) 
			if (thisUser.ID == myGdpses[gdpsType][gdpsKey].author) 
				myCampsIds.push(myGdpses[gdpsType][gdpsKey].ID);

	for (let ide in data)	{
		Count++;
		if (Count == 11) 
			return html2;

		html = '';
		gData = data[ide];
		if (Array.isArray(gData))
			gdpsData = {
				ID: gData[0],
				title: gData[1],
				text: gData[2],
				author: gData[3],
				username: gData[4],
				gdpsId: gData[5],
				gdpsTitle: gData[6],
				date: gData[7],
				likes: gData[8],
				isLiked: gData[9]
			};
		else 
			gdpsData = gData;
		gdpsData.isLiked = LIKES.get('n', ide.slice(1));

		gdpsData.canDel = false;
		if (thisUser.ID == gdpsData.author || myCampsIds.includes(gdpsData.gdpsId) || thisUser.role > 0) {
			gdpsData.canDel = true;
		}

		switch (gdpsData.gdpsId[0]) {
			case 'c':
				backFunc = 'getCamp';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 's':
				backFunc = 'getShow';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 'p':
				backFunc = 'getPere';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
			case 't':
				backFunc = 'getTele';
				gdpsData.gdpsId = parseInt(gdpsData.gdpsId.slice(1));
				break;
		}
		let widthCfg = [
			'',
			'',
			'style="width:calc(100% - 40px)"',
			'style="width:300px;height:350px"'
		],
		text = '';
		if (isComm == 3)
			if (gdpsData.text.length > 150)
				text = Markdown(gdpsData.text.slice(0,150).trimEnd())+'...'
			else 
				text = Markdown(gdpsData.text.trimEnd())
		else 
			text = Markdown(gdpsData.text.trimEnd())

		html += `<div style=display:flex id=news${gdpsData.ID}>`+
		(isComm == 0 ? gdpsAvatar(gdpsData.gdpsImg,64,64,1) : '')+
		`<div class=framegdps ${widthCfg[isComm]}>`+
			`<h2 id=Ntitle${gdpsData.ID}>${gdpsData.title}</h2>`+
			`<p style="margin:0">`+
				`<button class=loginbtn onclick="${backFunc}('${gdpsData.gdpsId}')">${gdpsData.gdpsTitle}</button>`+
				`- <button class=emptybtn onclick="otherProfile(${gdpsData.author},'${backFunc}${gdpsData.gdpsId})')">${gdpsData.username}</button>`+
			`</p>`+
			`<p>${timeAgo(gdpsData.date)}</p>`+
			`<p id=Ntext${gdpsData.ID}>${text}</p>`+
			`<div>${gdpsData.hasFile == '' ? '' : `<img loading=lazy class=newsImage src=${helperUrl}imgs/customnews/${gdpsData.ID}.${gdpsData.hasFile}>`}</div>`+
			`<div style="margin-top:15px">`+
				`<div class="likezone">`+
					`<span class=likeplace id="likesCount${gdpsData.ID}">${gdpsData.likes[0]}</span>`+
					`<button ${gdpsData.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${gdpsData.ID},2)" class=like id=like${gdpsData.ID}></button>`+
					`<span class=likeplace id="dislsCount${gdpsData.ID}">${gdpsData.likes[1]}</span>`+
					`<button ${gdpsData.isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${gdpsData.ID},2)" class=dislike id=dislike${gdpsData.ID}></button>`+
					`<span class=likeplace id="commsCount${gdpsData.ID}">${gdpsData.likes[2]}</span>`+
					`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`+
					(isComm != 1 ?
					`<button class=loginbtn onclick=getNewsWithComments(${gdpsData.ID},${gdpsData.gdpsId},'${backFunc}','${commBackFunc}')${getTrans('comms')}/button>`
					: '')+
				`</div>`+
			`</div>`+
			// `<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
			//	`<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
			// `</button>`+
			(gdpsData.canDel ? 
			imageButton(`${helperUrl}imgs/edit.svg`, `editNews(${gdpsData.ID},${gdpsData.gdpsId})`, `position:absolute;top:20px;right:64px`)+
			imageButton(`${helperUrl}imgs/trash.svg`, `deleteNews(${gdpsData.ID},${isComm})`, `position:absolute;top:20px;right:20px`)
			: '')+
		`</div>`+
	`</div>`;
		html2 = html2 + html;
	};
	if (html2 == '')
		return `<h1 class=contentAdaptiveBig${getTrans('newsNoneReal')}/h1>`;
	return html2;
},
renderVacancy = (parsedData, isAdmin = thisUser.role,renderMethod = 'm')=>{
	let html = '',
		Count = 0,
		TagsLocal = [],
		tagsOs = '',
		adminButtons = '',
		applyBtn = '',
		title = '',
		text = '';

	for (let longId in parsedData) {
		let id = longId.slice(1);
		tagsOs = '';
		Count++;
		if (Count == 9)
			return html;

		gdpsData = parsedData[longId];
		gdpsData.isLiked = LIKES.get('v', gdpsData.ID);

		title = gdpsData.title;
		text = gdpsData.text;
		if (renderMethod == 'm')
			if (text[120])
				text += '...';
		if (gdpsData.tags && JSON.parse(gdpsData.tags) != null) {
			TagsLocal = JSON.parse(gdpsData.tags);
			TagsLocal.forEach(function(tag){
				tagsOs += `<div class="tag"${getTrans(toStringTagsVacs(tag))}/div>`;
			});
		}

		if (typeof isAdmin == 'number') {
			title += ` -`+basicButton(`>${gdpsData.gTitle}<`, `get${GDPSswitchChannel(gdpsData.gChannel)[1]}(${gdpsData.gId})`);
		}
			if (isAdmin == true) 
				adminButtons = 
					imageButton(`${helperUrl}imgs/trash.svg`, `removeVacPre(${id},${gdpsData.gId})`, 'position:absolute;top:8px;right:8px')+
					imageButton(`${helperUrl}imgs/edit.svg`, `editVacs(${gdpsData.gChannel},${gdpsData.gId},${id})`, 'position:absolute;top:8px;right:52px');

		let applyBtnStyle = 'margin:0;border-radius:0;margin-bottom:2px';
		if (renderMethod != 'm')
			applyBtnStyle = '';

		if (isAdmin == 1)
			applyBtn = basicButton(getTrans('vacResponses'), `vacResponses(${gdpsData.gChannel},${gdpsData.gId},${id})`, applyBtnStyle);
		else if (!gdpsData.isApplied) 
			applyBtn = basicButton(getTrans('vacRespond'), `vacRespond(${longId.slice(1)})`, applyBtnStyle, 'a'+id);
		else 
			applyBtn = basicButton(getTrans('vacResponded'), `vacUnrespond(${longId.slice(1)},${gdpsData.isApplied})`, applyBtnStyle, 'a'+id);

		html +=
		`<div class=framegdpsOld id=${longId} ${renderMethod == 'm' || renderMethod == 'a' ? 'style=width:330px;height:450px' : ''}>`+
			`<h2>${title}`+'</h2>'+
			(isAdmin ? adminButtons : '')+
			`<p>${text}</p>`+
			`<div ${renderMethod == 'm' || renderMethod == 'a' ? 'class=absolute' : ''} style=bottom:4px>`+
				(renderMethod == 'f' ?
					`<div class="flex-row">`+
						tagsOs+
					`</div>`
					:
					`<div class="flex-row FGDPStags absolute" style=width:100%;bottom:64px>`+
						tagsOs+
					`</div>`
				)+
				(renderMethod == 'a' ? 
				'' :
				`<div class="likezone" style=margin-left:-4px;margin-bottom:2px>`+
					`<span class=likeplace id="likesCount${id}">${gdpsData.likes[0]}</span>`+
					`<button ${gdpsData.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${id},11)" class=like id="like${id}"></button>`+
					`<span class=likeplace id="dislsCount${id}">${gdpsData.likes[1]}</span>`+
					`<button ${gdpsData.isLiked == 1 ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${id},11)" class=dislike id="dislike${id}"></button>`+
					(typeof gdpsData.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${id}">${gdpsData.likes[2]}</span>`+
					`<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
				`</div>`
				)+
				(renderMethod != 'm' ?
					`<div class="btnszoneSearch" style=position:absolute;bottom:10px;right:18px>`+
						applyBtn+
					`</div>`
					:
					`<div class="btnszoneSearch" style=position:absolute;bottom:0;right:4px>`+
						applyBtn+
						`<button class=loginbtnGDPS style=margin:0;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="getVacsWithComments(${id})"${getTrans('comms')}/button>`+
					`</div>`
				)+
			`</div>`+
		`</div>`;
	}
	return html;
},
vacRespond = (vacId)=>{
	Loading();
	_.http.req('GET', `${nData[8]}apply?id=${vacId}`)
		.then(aplId=>{
			Loading(1);
			megaAlert('reported');
			let applyBtn = _.$.id('a'+vacId);
			if (applyBtn) {
				applyBtn.setAttribute('data-trans', 'vacResponded');
				applyBtn.setAttribute('onclick', `vacUnrespond(${vacId},${aplId})`);
				applyBtn.textContent = getTrans('vacResponded',0);
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
vacUnrespond = (vacId, aplId)=>{
	Loading();
	_.http.req('GET', `${nData[8]}unapply?id=${aplId}&vacId=${vacId}`)
		.then(data=>{
			Loading(1);
			megaAlert('otmena');
			let applyBtn = _.$.id('a'+vacId);
			if (applyBtn) {
				applyBtn.setAttribute('data-trans', 'vacRespond');
				applyBtn.setAttribute('onclick', `vacRespond(${vacId})`);
				applyBtn.textContent = getTrans('vacRespond',0);
			}
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
renderApplies = (parsedData, backFunc, gdpsId)=>{
	let html = '',
		Count = 0,
		tagsOs = '';

	for (let Id in parsedData) {
		Count++;
		tagsOs = '';
		if (Count == 11)
			return html;

		gdpsData = parsedData[Id];
		
		html +=
		`<div class=framegdpsOld id=${Id} style=width:300px;height:450px>`+
			`<h2>${gdpsData.username} <span style=opacity:50%>userId: ${gdpsData.userId}</span></h2>`+
			`<span>${timeAgo(gdpsData.date)}</span>`+
			`<p>${gdpsData.resume.replaceAll('\\n','<br>')}</p>`+
			imageButton(`${helperUrl}imgs/trash.svg`, `removeAplPre(${Id.slice(1)},${gdpsId})`, 'position:absolute;top:8px;right:8px')+
			`<div class="flex-row FGDPStags absolute" style=bottom:4px>`+
				basicButton(getTrans('profile'), `otherProfile(${gdpsData.userId},'${backFunc}')`)+
			`</div>`+
		`</div>`;
	}
	return html;
},

renderComms = (parsedData, channel = 0, dataForNextButton = '')=>{
	let commcount = 0,
		html = '',
		htmlFull = '',
		delBtn = '',
		likeChannel = 0,

		gdpsData = null,
		id = null,
		username = null,
		commText = null,
		userId = null,
		userrole = null,
		likes = null,
		date = null,
		isLiked = null,
		nameColor = null;

	switch (channel) {
		case 0:
		case 1:
			likeChannel = 3;
			break;
		case 2:
			likeChannel = 6;
			break;
		case 3:
			likeChannel = 5;
			break;
		case 4:
			likeChannel = 10;
			break;
		case 5:
			likeChannel = 12;
			break;
	}

	for (let ide in parsedData) {
		if (commcount == 10) {
			htmlFull = htmlFull + insertBtn(`helperComments(${dataForNextButton})`, 'showMore', 1, 'C');
			return htmlFull;
		};
		commcount++;

		gdpsData = parsedData[ide];
		id = gdpsData[0];
		username = gdpsData[1];
		commText = gdpsData[2];
		userId = gdpsData[3];
		userrole = gdpsData[4];
		likes = gdpsData[5];
		date = gdpsData[6];
		isLiked = LIKES.get('c', id);
		switch (userrole) {
			case 0:
				nameColor = 'var(--color-white)';
				break;
			case 1:
				nameColor = 'greenyellow';
				break;
			case 2:
				nameColor = 'yellow';
				break;
			case 3:
				nameColor = '#ffcc22';
				break;
		}

		delBtn = 
		imageButton(`${helperUrl}imgs/edit.svg`, `editComm(${id},${channel})`, `position:absolute;top:20px;right:20px`)+
		imageButton(`${helperUrl}imgs/trash.svg`, `deleteComm(${id},${channel})`, `position:absolute;top:20px;right:64px`);
		
		html = 
		`<div class="framecomm" id=comm${id}>`+
			`<button style="border:none;background:none;margin:0;font-size:calc(var(--def-font)*2);color:${nameColor}"`+
			`onclick="otherProfile(${userId},lastUsedProfile)">${username}</button>`+
			`<p style="margin:0">${timeAgo(date)}</p>`+
			`<p id=commText${id}>${commText}</p>`+
			`<div class="likezone">`+
				`<span class=likeplace id="likesCountComm${id}">${likes[0]}</span>`+
				`<button ${isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${id},${likeChannel},1)" class=like id=likeComm${id}></button>`+
				`<span class=likeplace id="dislsCountComm${id}">${likes[1]}</span>`+
				`<button ${isLiked == 1	? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${id},${likeChannel},1)" class=dislike id=dislikeComm${id}></button>`+
			`</div>`+
			(thisUser.ID == userId || thisUser.role > 0 ? delBtn : '')+
		`</div>`;

		htmlFull = htmlFull + html;

		html = '';
	};
	if (htmlFull == '')
		return `<h1${getTrans('commsNone')}/h1>`;
	return htmlFull;
},
timeAgo = (timestamp)=>{
	let timeDiff = Math.floor((Date.now() / 1000) - timestamp);

	if (timeDiff < 60) {
		return timeDiff + getTrans('timeAgo01', 0);
	} else if (timeDiff < 3600) {
		let Minutes = Math.floor(timeDiff / 60),
			Seconds = timeDiff % 60;
		return Minutes + getTrans('timeAgo02', 0) + Seconds + getTrans('timeAgo03', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 86400) {
		let Hours = Math.floor(timeDiff / 3600),
			Minutes = Math.floor((timeDiff % 3600) / 60);
		return Hours + getTrans('timeAgo04', 0) + Minutes + getTrans('timeAgo05', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 604800) {
		let Days = Math.floor(timeDiff / 86400),
			Hours = Math.floor((timeDiff % 86400) / 3600);
		return Days + getTrans('timeAgo06', 0) + Hours + getTrans('timeAgo07', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 2592000) {
		let Weeks = Math.floor(timeDiff / 604800),
			Days = Math.floor((timeDiff % 604800) / 86400);
		return Weeks + getTrans('timeAgo08', 0) + Days + getTrans('timeAgo09', 0) + getTrans('timeAgo13', 0);
	} else if (timeDiff < 31536000) {
		let Months = Math.floor(timeDiff / 2592000),
			Weeks = Math.floor((timeDiff % 2592000) / 604800);
		return Months + getTrans('timeAgo10', 0) + Weeks + getTrans('timeAgo11', 0) + getTrans('timeAgo13', 0);
	} else {
		return getTrans('timeAgo12', 0);
	};
},
// #endregion
// #region прочий хлам
Loading = (stop = 0, customImg = 'src=https://objecthub.xyz/imgs/load.svg')=>{
	if (stop == 0)
		_.$.D.body.insertAdjacentHTML('beforeend',
			`<div class=ALERT id=TheLoadElem style=position:fixed;top:20%;left:50%>`+
				`<img class=Loading ${customImg}>`+
			`</div>`
		);
	else 
		if (_.$.id('TheLoadElem'))
			_.$.id('TheLoadElem').remove();
	return stop;
},

checkWikiOwn = (id)=>{
	if (wikiesMini.includes(id.toString()))
		return true;
	return false;
},

seePassword = ()=>{
	if (_.$.id('LGpassword').type == 'password') {
		_.$.id('LGpassword').type = 'text';
		_.$.id('LGbtn').src = helperUrl+'imgs/PSsee.svg';
	} else {
		_.$.id('LGpassword').type = 'password';
		_.$.id('LGbtn').src = helperUrl+'imgs/PShide.svg';
	}
},

profileSwitcherPhone = ()=>{
	let
	profileNavPhone = _.$.id('phoneSelectorSmall'),
	profileContent = _.$.id('helperContentProfile');

	if (headerPhoneSwitcher !== 1) {
		headerPhoneSwitcher = 1;
		profileNavPhone.style.display = 'grid';
		profileContent.style.display = 'none';
	} else {
		headerPhoneSwitcher = 0;
		profileNavPhone.style.display = 'none';
		profileContent.style.display = 'block';
	}
},
switchMobileMain = ()=>{
	let 
	helperNavPhone = _.$.id('helperSecond'),
	pageContent = _.$.id('helperContent');

	if (headerPhoneSwitcher !== 2) {
		headerPhoneSwitcher = 2;
		helperNavPhone.style.display = 'grid';
		pageContent.style.display = 'none';
	} else {
		if (_.$.id('phoneSelectorSmall') && _.$.id('phoneSelectorSmall').style.display === 'grid' && headerPhoneSwitcher !== 0) {
			headerPhoneSwitcher = 1;
			helperNavPhone.style.display = 'none';
			pageContent.style.display = 'block';
		} else {
			headerPhoneSwitcher = 0;
			helperNavPhone.style.display = 'none';
			pageContent.style.display = 'block';
		}
	}
},

linkCopy = (string)=>{
	navigator.clipboard.writeText(string)
		.then(()=>{})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
	megaAlert('copied');
},
megaAlert = (text, waitTime = 3000)=>{
	let doneText = '';
	if (!Array.isArray(text))
		doneText = getTrans(text);
	else {
		doneText = `>${text.map(el=>`<span${getTrans(el)}/span>`).join(' ')}<`;
	}
	if (text.startsWith('![]'))
		text = `<img src=${text.slice(3)}>`;
	innerMain(`<div class=ALERT id=alert style=top:20%;left:50%><h1${doneText}/h1></div>`,512);
	setTimeout(()=>{
		if (_.$.id('alert'))
			_.$.id('alert').remove();
	}, waitTime);
	return false;
},
megaAlert2 = (text, waitTime = 3000)=>{
	let doneText = '';
	if (!Array.isArray(text))
		doneText = text;
	else {
		doneText = `>${text.map(el=>`<span>${el}</span>`).join(' ')}<`;
	}
	if (text.startsWith('![]'))
		text = `<img src=${text.slice(3)}>`;
	innerMain(`<div class=ALERT id=alert style=top:20%;left:50%><h1>${doneText}</h1></div>`,512);
	setTimeout(()=>{
		if (_.$.id('alert'))
			_.$.id('alert').remove();
	}, waitTime);
	return false;
},



enterFormData = (form, sendPlace)=>{
	let FORMDATA = new FormData(form);
	params = '';

	let postHasFiles = false;
	for (let [key, value] of FORMDATA.entries()) {
		if (value instanceof File) {
			postHasFiles = true;
			break;
		}
	}
	//if (!postHasFiles)
	//	params = new URLSearchParams(FORMDATA).toString();
	//else 
		params = FORMDATA;

	Loading();
	_.http.req('POST', sendPlace, params)
	.then(data=>{
		if (sendPlace.indexOf('?') !== -1)
			sendPlace = sendPlace.split('?')[0];
		let parsedData = '';
		Loading(1);
		switch (sendPlace) {

			case sData[1]+'forumPost'+php:
				parsedData = JSON.parse(data);
				getForumPost(parsedData[0],parsedData[1]);
				_.wins[_.$.q('[forumpost]').id].close();
				break;
			case `${nData[11]}add`:
				const funcs = {
					'p': getPere,
					't': getTele,
					's': getShow,
					'c': getCamp,
				},
				gId = FORMDATA.get('gdps');
				funcs[gId[0]](gId.slice(1));
				break;
			case `${nData[5]}writeAlarm`:
				_.wins[FORMDATA.get('windowId')].close();
				break;
			case `${nData[2]}reportGdps`:
				megaAlert('reported', 1000);
				_.wins[FORMDATA.get('windowId')].close();
				break;
			case sData[1]+'newGuide'+php:
				getGuide(data, FORMDATA.get('wikiId'));
				break;
			case `${nData[7]}editGuide`:
				getGuide(data, FORMDATA.get('wikiId'));
				break;
			case sData[1]+'newWiki'+php:
				parsedData = JSON.parse(data);
				yourWikies['w'+parsedData.ID] = parsedData;
				profilePage('');wikiControl(parsedData.ID);
				break;
			case sData[1]+'editWiki'+php:
				parsedData = JSON.parse(data);
				yourWikies['w'+parsedData.ID] = parsedData;
				profilePage('');wikiControl(parsedData.ID);
				break;
			case `${nData[8]}add`:
				getVacancies(FORMDATA.get('channel'),FORMDATA.get('id'));
				break;
			case `${nData[8]}edit`:
				if (_.$.id('profileWindow')) 
					getVacancies(FORMDATA.get('channel'),FORMDATA.get('gdpsId'));
				else {
					_.wins[_.$.q('[vaceditadm]')?.id].close();
					globalVacs();
				}
				break;
			default:
				console.log(sendPlace);
				if (data == '-1')
					return megaAlert('wrongPass');
				let serverResp = JSON.parse(data);
				thisUser = serverResp[0];
				Slocal.set('StaticUserData', JSON.stringify(thisUser));
				myGdpses = [{},{},{}, {}];
				Object.keys(serverResp[1][0]).forEach(gdps=>{
					GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
				});
				myguides = [];
				myguides.push(serverResp[1][1]);
				yourWikies = serverResp[1][1];
				wikiesMini = [];
				Object.keys(yourWikies).forEach(el=>{
					wikiesMini.push(yourWikies[el].ID.toString());
				});
				profilePage();
		};
		return false;
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});;

	return false;
},



updateFileSize = (value)=>{
	_.$.id('fileSize').setAttribute('value', value);
	_.$.id('fileSizeInt').innerHTML = value;
},

checkOwn = (contentId, userId, type)=>{
	console.log(contentId+' '+userId+' '+type);

	if (userId === thisUser.ID) {
		console.log('fullowner');
		return 2;
	}

	if (type === 1) {
		let myCampsIds = [];

		for (let gdpsKey in myGdpses[0]) {
			myCampsIds.push(myGdpses[0][gdpsKey].ID);
			console.log(myGdpses[0][gdpsKey]);
		};
		console.log(myCampsIds);
		console.log(`${myCampsIds}.includes(${contentId})`);
		if (myCampsIds.includes(contentId)) {
			console.log('particalOwner');
			return 1;
		}
	}
	if (type === 2) {
		let myShowsIds = [];

		for (let gdpsKey in myGdpses[1]) {
			myShowsIds.push(myGdpses[1][gdpsKey].ID);
			console.log(myGdpses[1][gdpsKey]);
		};
		console.log(myShowsIds);
		console.log(`${myShowsIds}.includes(${contentId})`);
		if (myShowsIds.includes(contentId)) {
			console.log('particalOwner');
			return 1;
		}
	}
	console.log('fullfalse');
	return 0;
},

returnAllProjects = ()=>{
	let AllProjects = [];
	for (let gdpsType in myGdpses)
		for (let gdpsKey in myGdpses[gdpsType])
			AllProjects.push(myGdpses[gdpsType][gdpsKey]);
	return AllProjects;
},
returnAllWikies = ()=>{
	let AllWikies = [];
	for (let wikiId in yourWikies)
		AllWikies.push(yourWikies[wikiId]);
	return AllWikies;
},

// #endregion
// #region викифункции

Markdown = (mdText)=>{
	mdText = mdText.replace(/\\(.)/g, (match, char) => 
		'\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
	);

	mdText = mdText.replace(/\{\{([^}|]+)(?:\|([^}]*))?\}\}/g, (match, templateName, argsStr) => {
		try {
			templateName = templateName.trim();
			
			let templateFunction = wikiTemplates[globalWiki]?.[templateName] || 
														 wikiTemplates[0]?.[templateName];
			
			if (!templateFunction)
				return `<div class="template-missing">Шаблон "${templateName}" не найден</div>`;

			let providedArgs = argsStr ? argsStr.split('|').map(arg => arg.trim()) : [];
			
			console.log(templateName, templateFunction, providedArgs);

			return templateFunction(...providedArgs);			
		} catch (error) {
			return `<div class="template-error">Ошибка в шаблоне: ${error.message}</div>`;
		}
	});

	mdText = mdText.replace(/(.*)<$/, '$1')
	.replaceAll(/^##### (.*?)\s*#*$/gm, '<h5>$1</h5>')
	.replaceAll(/^#### (.*?)\s*#*$/gm, '<h4>$1</h4>')
	.replaceAll(/^### (.*?)\s*#*$/gm, '<h3>$1</h3>')
	.replaceAll(/^## (.*?)\s*#*$/gm, '<h2>$1</h2>')
	.replaceAll(/^# (.*?)\s*#*$/gm, '<h1>$1</h1>')	

	.replaceAll(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')

	.replaceAll(/^\>\> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
	.replaceAll(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')

	.replaceAll(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img style=max-width:100% alt="$1" src="$2" $3 />')
	.replaceAll(/!\[(.*?)\]\((.*?)\)/gm, '<img style=max-width:100% alt="$1" src="$2" />')
	.replaceAll(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')

	.replaceAll(/\<http(.*)\>/gm, '<a href="http$1">http$1</a>')
	.replaceAll(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
	.replaceAll(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
	.replaceAll(/\[(.*?)\]\{(.*?)\}/gm, '<a onclick="getCurrentGuideByTag(\'$2\')">$1</a>')

	.replaceAll(/^[\*|+|-]. (.*)/gm, '<ul><li>$1</li></ul>' ).replaceAll(/<\/ul\>\n<ul\>/g, '\n' )
	.replaceAll(/^\d. (.*)/gm, '<ol><li>$1</li></ol>' ).replaceAll(/<\/ol\>\n<ol\>/g, '\n' )

	.replaceAll(/\*\*(.*)\*\*/gm, '<b>$1</b>')
	.replaceAll(/\*(.*)\*/gm, '<em>$1</em>')
	.replaceAll(/\_\_(.*)\_\_/gm, '<u>$1</u>')
	.replaceAll(/\_(.*)\_/gm, '<em>$1</em>')
	.replaceAll(/~~(.*)~~/gm, '<del>$1</del>')
	.replaceAll(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')

	.replaceAll(/ +\n/g, '\n<br/>')
	.replaceAll(/\n\s*\n/g, '\n<p>\n');
	//.replaceAll(/^\t(.*)/gm, '<pre><code>$1</code></pre>' )
	//.replaceAll(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>')


	// first, handle syntax for code-block
	mdText = mdText
		.replaceAll(/\r\n/g, '\n')
		.replaceAll(/\r<br>/g, '\n')
		.replaceAll(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>' )
		.replaceAll(/\n```*(.*?)\n([\s\S]*?)\n```/g, '<pre><code title="$1">$2</code></pre>' );


	// split by "pre>", skip for code-block and process normal text
	var mdHTML = '';
	var mdCode = mdText.split( 'pre>');

	for (var i=0; i<mdCode.length; i++) {
		if ( mdCode[i].substr(-2) == '</' ) {
			mdHTML += '<pre>' + mdCode[i] + 'pre>';
		} else {
			if (mdCode[i].substr(-1) == '<')
				mdHTML += mdCode[i].substr(0,mdCode[i].length-1);
			else 
				mdHTML += mdCode[i];
		}
	}

	mdHTML = mdHTML.replaceAll("\n", '<br>')

	.replaceAll(/``(.*?)``/gm, '<code>$1</code>' )
	.replaceAll(/`(.*?)`/gm, '<code>$1</code>' );

	mdHTML = mdHTML.replace(/\\u[0-9a-fA-F]{4}/g, m => 
		String.fromCharCode(parseInt(m.slice(2), 16))
	);

	return mdHTML.trim();
},
// #endregion
// #region страницы в профилях
toStringRole = (id)=>{
	switch (id) {
		case 0: return getTrans('role00', 0);
		case 1: return getTrans('role01', 0);
		case 2: return getTrans('role02', 0);
		case 3: return getTrans('role03', 0);
	};
},
dropWindow = ()=>{
	_.$.qa('[isloginwindow]').forEach(el=>{
		_.wins[el.id].close();
	});
	_.link.set('drop');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div class="frameprofile" style="width:10vw%">`+
			`<h1${getTrans('passReset')}/h1>`+
			`<input id="LGemail" class="framelabel" required ${getTrans('login05', 'input')}<br><br>`+
			`<button class=loginbtn onclick="sendDrop()"${getTrans('submit')}/button><br><br>`+
			`<button class=loginbtn onclick="profilePage()"${getTrans('back')}/button>`+
		`</div>`+
	`</div>`;
	return html;
},
verifyWindow = ()=>{
	_.$.qa('[isloginwindow]').forEach(el=>{
		_.wins[el.id].close();
	});
	_.link.set('verify');
	let html = pHeader()+
	`<div id=helperContent>`+
		`<div class="frameprofile" style="width:10vw%">`+
			`<h1${getTrans('enterCode2')}/h1>`+
			`<input id="LGcode" class="framelabel" required ${getTrans('enterCode3', 'input')}<br><br>`+
			`<button class=loginbtn onclick="sendVerify()"${getTrans('submit')}/button><br><br>`+
			`<button class=loginbtn onclick="profilePage()"${getTrans('back')}/button>`+
		`</div>`+
	`</div>`;
	return html;
},
otherProfileMini = (userId)=>{
	Loading();
	_.http.req('GET', `${nData[2]}profile?id=${userId}`)
	.then(data=>{
		let userData = JSON.parse(data);
		_.link.set('profiles='+userId, userData.username);
		let accStatus = userData.isActive ? getTrans('isActive') : getTrans('isNotact'),
			html = 
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('profile')}/span> ${userData.username}</h1>`+
			`<p><span${getTrans('profName')}/span>: ${userData.username}</p>`+
			`<p><span${getTrans('profSocials')}/span>: `+
				`<p${userData.socials == '' ? '' : ' class=framegdpsOld style="width:calc(100% - 40px)"'}>${userData.socials.replaceAll('\\n','<br>')}</p>`+
			`</p>`+
			`<p><span${getTrans('profResume')}/span>: `+
				`<p${userData.resume == '' ? '' : ' class=framegdpsOld style="width:calc(100% - 40px)"'}>${userData.resume.replaceAll('\\n','<br>')}</p>`+
			`</p>`+
			`<p><span${getTrans('profId')}/span>: ${userData.ID}</p>`+
			`<p><span${getTrans('profRole')}/span>: ${toStringRole(userData.role)}</p>`+
			`<p><span${getTrans('notProfAccs')}/span> ${userData.username} <span${accStatus}/span></p>`+
		`</div>`;
		innerProfile(html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
otherFindsWindow = (channel, userId)=>{
	let [smallString, bigString] = GDPSswitchChannel(channel);
	_.link.set('profiles/'+smallString+'s='+userId);
	Loading();
	_.http.req('GET', `${nData[12]}gdpses?id=${userId}&type=${channel}`)
	.then(data=>{
		let parsedData = JSON.parse(data),
			gdpses = "";
		parsedData.forEach(gdps=>{
			if (typeof(gdps) == 'object') {
				gdpses+=FINDrenderInProfile(channel, gdps);
			};
		});
		let html =
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('search'+bigString+'s')}/span> ${parsedData[0]}</h1><br>`+
			profileContentDiv()+
				gdpses+
			`</div>`+
		`</div>`;
		innerProfile(html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
otherCampsWindow = (userId)=>{
	otherFindsWindow(0, userId);
},
otherShowsWindow = (userId)=>{
	otherFindsWindow(1, userId);
},
otherPeresWindow = (userId)=>{
	otherFindsWindow(2, userId);
},
otherWikisWindow = (userId)=>{
	_.link.set('profiles/wikis='+userId);
	Loading();
	_.http.req('GET', `${nData[12]}wikis?id=${userId}`)
	.then(data=>{
		let parsedData = JSON.parse(data),
			gdpses = "";
		parsedData.forEach(gdps=>{
			if (typeof(gdps) == 'object') {
				gdpses+=WIKIrenderInProfile(gdps);
			}
		});
		let html =
		`<div id=helperContentProfile>`+
			`<h1><span${getTrans('guides09')}/span> ${parsedData[0]}</h1><br>`+
			profileContentDiv()+
				gdpses+
			`</div>`+
		`</div>`;
		innerProfile(html);
		Loading(1);
	})
	.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
FINDrenderInProfile = (channel, parsedData)=>{
	let html = '',
		Count = 0,

		gdpsData = null,
		thisId = null,
		title = null,
		description = null,
		userId = null,
		username = null,
		pictureLink = null,
		isWeeklyData = ['',''],
		[smallString, bigString] = GDPSswitchChannel(channel);

	for (let Id in parsedData) {
		Count++;
		if (Count == 9)
			return html;

		gdpsData = parsedData[Id];
		thisId = gdpsData.ID;
		title = gdpsData.title;
		description = gdpsData.text.split('\n').join('</p><p>');
		userId = gdpsData.author;
		username = gdpsData.username;
		pictureLink = gdpsData.img;

		isWeeklyData = ['',''];

		html += 
		`<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${thisId}">`+
			`${isWeeklyData[1]}`+
			`<h2 style="display:inline;margin-right:4px">${title}</h2>`+
			`<p style="display:inline;margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${userId},'pageFind(${channel})')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
			`</p>`+
			`<div style="min-height:64px">`+
				`<img onerror="console.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p>${description}${description[120] === undefined ? '' : '...'}</p>`+
				basicButton(getTrans('openGdps'), `get${bigString}(${thisId})`)+
			`</div>`+
		`</div>`;
	};
	return html;
},
WIKIrenderInProfile = (parsedData)=>{
	let html = '',

		gdpsData = null,
		id = null,
		guidTitle = null,
		userId = null,
		username = null,
		guidImg = null;

	for (let Id in parsedData) {

		gdpsData = parsedData[Id];
		id = gdpsData.ID;
		guidTitle = gdpsData.title;
		guidText = gdpsData.text.split('\n').join('</p><p>');
		userId = gdpsData.author;
		username = gdpsData.username;
		guidImg = gdpsData.ban;
		
		html += 
		`<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${id}">`+
			`<h2 style="display:inline;margin-right:4px">${guidTitle}</h2>`+
			`<p style="display:inline;margin:0">`+
				`<span${getTrans('addedBy')}/span>:`+
				`<button onclick="otherProfile(${userId},'pageWikiList()')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
			`</p>`+
			`<div style="min-height:64px">`+
				`<img onerror="console.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(guidImg)}" width=64px height=64px style="border-radius:calc(var(--def-border-small)*1.5)">`+
				`<p>${guidText}</p>`+
				basicButton(getTrans('openGdps'), `pageGuides(${id})`)+
			`</div>`+
		`</div>`;
	};
	return html;
},
// #endregion
// #region кастомхелпер
cssRoot = _.$.D.body.style,
colorGenerator = ()=>{
	let [Sizes, Radios] = Slocal.get('ColorScheme').split('/');

	Sizes.split(',').forEach(siz=>{
		let [name,val] = siz.split('|');

		val += 'px';

		let SlocalName = 'Size' + name,
		CSSname = '--def-'+name.toLowerCase();
		setColor(CSSname, val, SlocalName);
		Slocal.set(name, val);
	});
	Radios.split(',').forEach(rad=>{
		renderSwitch(rad);
	});
	return [Sizes, Radios];
},
setColor = (name, value, SlocalValue = '')=>{
	cssRoot.setProperty(name, value);
	if (SlocalValue)
		Slocal.set(SlocalValue, value);
},
wikiApplyColor = (colorStr)=>{
	let colors = colorStr.split(','),
	colorScheme = colorStr.split(',').reduce((obj, pair) => {
		const [key, value] = pair.split('|');
		obj[key] = value;
		return obj;
	}, {});
	colors.forEach(col=>{
		let color = col.split('|'),
		nameLover = '--color-'+color[0].toLowerCase();

		if (nameLover.includes('-alpha'))
			color[1] += '99';
		setColorAlt(nameLover, color[1]);
	});
	return colorScheme;
},
setColorAlt = (name, value)=>{
	_.$.D.documentElement.style.setProperty(name, value);
},
renderSwitch = (value, set = 0)=>{
	let [Sizes, Radios] = Slocal.get('ColorScheme').split('/'),
	moreRadios = Radios.split(',');
	switch (true) {
		case value.startsWith('Text;Tags:'):
			moreRadios[0] = value;
			if (value.slice(-1) == 0) {
				setColor('--rr-tags', '100%');
				setColor('--rr-text', '0%');
			} else {
				setColor('--rr-tags', '0%');
				setColor('--rr-text', '100%');
			}
			break;
		case value.startsWith('guidFull;guidWindow:'):
			moreRadios[1] = value;
			Slocal.set('openGuidesInWindow', value.slice(-1));
			helperSettings.openGuidesInWindow = parseInt(value.slice(-1));
			break;
	}
	if (set)
		Slocal.set('ColorScheme', Sizes+'/'+moreRadios.join(','));
},
dropColorScheme = ()=>{
	let colorScheme =
		`Font|16,`+
		`Btn-size|16,`+
		`Text-indent|16,`+
		`Border-small|8,`+
		`Border|12,`+
		`Border-large|30/`+
		
		`Text;Tags:0,`+
		`guidFull;guidWindow:0`;
	Slocal.set('ColorScheme', colorScheme);

	colorGenerator();
};

if (Slocal.get('ColorVer') < 7 || !Slocal.get('ColorVer')) {
	Slocal.set('ColorVer',		 7);
	dropColorScheme();
};
colorGenerator();
// #endregion
// #region предстартовые проверки

let createBasicError = type=>{
	if (type == 0)
		_.$.D.body = null;
	else if (type == 1) {
		Loading();
		_.http.req(`${nData[2]}curl`)
			.then(data=>{
				JSON.parse(data);
				Loading(1);
			})
	}
};

window.addEventListener('input', e=>{
	if (e.target.type !== 'text')
		return;
	if (!location.search.startsWith('?find') && !location.search.startsWith('?Wikis') && !location.search.startsWith('?vacs'))
		return;
	clearTimeout(TimeOut[0]);
	TimeOut[0] = setTimeout(()=>{
		sendFinder();
	}, 300);
});

window.addEventListener('beforeunload', e=>{
	if (Object.keys(_.wins).length)
		e.preventDefault();
});

// #region Tampermonkey
if (!Slocal.get('Hotkeys'))
	Slocal.set('Hotkeys', `// global key
let mainHotkey = 'ControlLeft + AltLeft'

_.hotkeys

// my profile
.on(
	mainHotkey + ' + KeyQ',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage('');
		innerProfile(gProfileMini());
	}
)
// my camps
.on(
	mainHotkey + ' + KeyC',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage('');
		findsWindow(0);
	}
)

// my shows
.on(
	mainHotkey + ' + KeyS',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage('');
		findsWindow(1);
	}
)
// my dubs
.on(
	mainHotkey + ' + KeyD',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage('');
		findsWindow(2);
	}
)
// new post
.on(
	mainHotkey + ' + KeyN',
	()=>{
		innerProfile(newsWindow())
	}
)
// my wikis
.on(
	mainHotkey + ' + KeyW',
	()=>{
		if (!!_.$.id('profileWindow')) profilePage('');
		wikisWindow();
	}
)`)
new Function(Slocal.get('Hotkeys'))();
// #endregion 

window.addEventListener('resize', setImgSize);
// #endregion
// #region команды
let patchUrl = ()=>{
	if (_.$.q('[shell]'))
		return;
	let cmds = [];
	for (let i in _.link.commands)
		cmds.push(i);
	_.win.open('urls',
		`
		<p>Commands list:<br>
		${cmds.join(', ')}
		</p>
		<input class=framelabel id=shell value=${location.search}>
		<button class=loginbtn onclick="history.replaceState(null,null,_.$.id('shell').value);_.link.get();_.$.id('shell').value=location.search" >run</button>
		`
	, 'shell');
},
lsEdit = ()=>{
	let html = `<button onclick=lsSave() class=loginbtn>save</button>
		<div style=height:400px><table>`;
		banList = ['length','key','getItem','setItem','removeItem','clear'];
	for (let a in localStorage)
		if (!banList.includes(a))
			html +=
				`<tr>
					<td>${a}:<td>
					<td><textarea data-local="${a}" class=framelabel>${localStorage[a]}</textarea></td>
				</tr>`;
	html += `</table></div>`;
	_.win.open('lsedit',
		html
	);
},
lsSave = ()=>{
	let elems = _.$.qa('[data-local]');
	console.log(elems);
	for (let a of elems)
		localStorage.setItem(a.dataset.local, a.value);
},
lsClear = ()=>{
	let banList = ['length','key','getItem','setItem','removeItem','clear','oschubUser'];
	for (let a in localStorage)
		if (!banList.includes(a))
			localStorage.removeItem(a);
	_.link.remove('lsClear');
},

loader = ()=>{
	_.link.set('loader')
	let ver = (v, date='', desc='')=>`<tr>
		<td>${basicButton(`>${v}<`,`(document.cookie='cli_ver=${v};path=/;max-age=${60*60*24*365}');location.search='${_.link.compile().join('&').slice(6)}'`)}</td>
		<td>${date}</td>
		<td>${desc}</td>
	</tr>`;
	return `<div style=display:flex;justify-content:center;align-items:center;min-height:100vh;flex-direction:column>
		<h1>OJHUB LOADER v1.00</h1>`+
		`<table border=1 class=frameprofile>
			<tr><td>${basicButton('>latest<',`(document.cookie='cli_ver=;path=/;max-age=0');location.search='${_.link.compile().join('&').slice(6)}'`)}</td></tr>${
			ver('0.97.6', '15 Jun 2026', 'current latest')+
			ver('0.97.5', '10 Jun 2026', 'rev. 1')
		}</table>`+
	`</div>`
};
// #endregion

reStart();
