Intl.newHelper('_');

// 1.8 polyfill
getTrans = (i,render='text')=>{
	let text=_.lang.from(i),
	dT=_.lang.attr,
	m={
		text:		(d,t)=>`${d}=${i}>${t}<`,
		textBtn:	(d,t)=>`${d}=${i}>${t}`,
		inputValue:	(d,t)=>`${d}=${i} value="${t}">`,
		input:		(d,t)=>`${d}=${i} placeholder="${t}">`,
		textarea:	(d,t)=>`${d}=${i} placeholder="${t}"><`,
		img:		(d,t)=>`${d}=${i} src="${t}"`,
	};
	if (text== null || text== '')
		text=i;
	let f=m[render] || (e=>{});
	return f(dT,text) || text;
}
// 2.0 polyfill
_.$ = {
	D: document,
	id: i=>					document.getElementById(i),
	q: (i,p=document)=>		p.querySelector(i),
	qa: (i,p=document)=>	p.querySelectorAll(i),

	on: (el,ev,fn,opts)=>	el.addEventListener(ev,fn,opts),
	off: (el,ev,fn,opts)=>	el.removeEventListener(ev,fn,opts),

	cliRect: e=>			e.getBoundingClientRect(), // сокращение чтобы не писать 25+ символов
}

toastsErorrsLol = new _.toast(
	'errors',
	_.$.id('alerts'),
	3000,
	`class=framegdpsOld style="width:fit-content;border:solid var(--color-window) 1px;border-radius:var(--def-border-small)"`,
	'ANIM-create',
	'ANIM-stop'
);
toastsErorrsLol.generateDOM = (wId,content) => `<div>
	${emptyButton('>'+content+'<', `toastsErorrsLol.close('{winId}')`, 'margin:-8px;padding:8px')}
</div>`.replace(/\{winId\}/g,wId);

_.win.manager = _.$.id('windowsXP');
_.win.hider = _.$.id('Professional');

_.win.winAttrs = `class="upperWindow frameprofile ANIM-create2"`;
_.win.dragAttrs = `class=underWindow`;
_.win.renameAttrs = `class=framelabel style=padding:0;border:none;border-radius:0`;
_.win.btnAttrs = `class=emptybtn style="padding:2px;color:var(--color-window)"`;
_.win.hiderAttrs = `class=loginbtn `;

_.win.animOpen = 'ANIM-create2';
_.win.animClose = 'ANIM-stop2';
_.win.animHide = 'ANIM-hide2';
_.win.animShow = 'ANIM-recreate2';
_.win.animFullOn = 'ANIM-full2';
_.win.animFullOff = 'ANIM-unfull2';

let 
langList = ['RU', 'EN', 'UA'],
helperStrVer = '0.97.7',
currentLangVer = 13,
helperBuildNum = 133,
scritpsUrl = '/cli/'+helperStrVer,
ignoreCap = false,
renderBeta = true,
helperTitleText = renderBeta ? 'ojhub-BUILD'+helperBuildNum : 'Object Hub',
helperUrl = './', // 'https://objecthub.xyz/',//'https://gdpshelper.xyz/',
doLangSetup = (data)=>{
	let newData = _.lang.parse(data);
	if (typeof newData === 'string') {
		newData = JSON.parse(newData);
	}
	Slocal.set('Lang', data);
	Slocal.set('LangVer', currentLangVer);
	_.lang.main = newData;
	return newData;
};

_.lang.addr = `${scritpsUrl}/langs/`;
_.lang.vars = {
	'helperStrVer':helperStrVer,
	'helperBuildNum':helperBuildNum,
	'helperUrl':helperUrl
};

let windowBtns = [
	['COPY ERROR',   `navigator.clipboard.writeText(_.$.id('errText{errID}').innerText)`],
	['FULL RESTART', `location.reload()`],
	['RESTART', `reStart(1,{errID})`],
	['REPORT', `reportError({errID})`],
	['REMOVE USER+RESTART', `Slocal.set('User','');location.reload()`],
	['CLEAR ALL APP DATA', `lsClear();dropColorScheme();console.log(localStorage);reStart(1)`]
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

_.link.defTitle = helperTitleText;
_.link.basePage = ()=>{innerMain(pageMain(1));};
_.link.commands = {
	en: ()=>        {_.lang.replace('EN',1)},
	ru: ()=>        {_.lang.replace('RU',1)},
	ua: ()=>        {_.lang.replace('UA',1)},
	de: ()=>        {_.lang.replace('DE',1)},
	dev: ()=>       {debugWindow()},
	deh: async ()=> {let i = await debugWindow();if(i)i.hide()},
	dropcolor: ()=> {profilePage();clrEditPage();dropColorScheme();removeLink('dropcolor')},
	ignoreCap: ()=> {ignoreCap = true},
	error: ()=>     {_.err.print(0, "HMMM");_.link.remove('error')},
	shell: ()=>     patchUrl(),
	lsEdit:()=>     lsEdit(),
	lsClear: ()=>   lsClear()
};

_.link.actions = {

	'': ()=>                 {innerMain(pageMain())},
	loader: ()=>             {innerMain(loader())},
	find: ()=>               {pageFind()},
	list: ()=>               {pageFind(0)},
	shows: ()=>              {pageFind(1)},
	wordle: (lang)=>         {wordleGame(lang)},

	camp: (campId)=>         {getCamp(campId)},
	show: (showId)=>         {getShow(showId)},
	pere: (pereId)=>         {getPere(pereId)},
	tele: (teleId)=>         {getTele(teleId)},
	news: ()=>               {globalNews()},
	'news/': {
		'': ()=>             {globalNews()},
		// FIXME: перевести на новое поведение роутера
		comms: (postId)=>    {let d = postId.split('|');getNewsWithComments(d[0], d[1], d[2])},
		list: (gdpsId)=>     {let d = gdpsId.split('|');helperNews(d[0], d[1])},
	},
	vacs: ()=>               {globalVacs()},
	'VacsC/': {
		':p': (...pId)=>     {getVacsWithComments(pId)},
	},
	special: ()=>            {innerMain(uvazuha())},
	about: ()=>              {innerMain(helperAbout())},

	profiles: (userId)=>     {otherProfile(userId,'pageFind(0)')},
	'profiles/': {
		'': (userId)=>       {otherProfile(userId,'pageFind(0)')},
		camps: (userId)=>    {otherProfile(userId,'pageFind(0)',otherCampsWindow)},
		shows: (userId)=>    {otherProfile(userId,'pageFind(1)',otherShowsWindow)},
		peres: (userId)=>    {otherProfile(userId,'pageFind(2)',otherPeresWindow)},
		wikis: (userId)=>    {otherProfile(userId,'pageFind(0)',otherWikisWindow)},
	},

	drop: ()=>               {innerMain(dropWindow())},
	verify: ()=>             {innerMain(verifyWindow())},
	profile: ()=>            {profilePage()},
	addedCamps: ()=>         {profilePage('');findsWindow(0)},
	addedShows: ()=>         {profilePage('');findsWindow(1)},
	addedPeres: ()=>         {profilePage('');findsWindow(2)},
	addedWikis: ()=>         {profilePage('');wikisWindow()},
	addCamp: ()=>            {profilePage('');addFind(0)},
	editCamp: (campId)=>     {profilePage('');editFind(0, campId)},
	addShow: ()=>            {profilePage('');addFind(1)},
	editShow: (showId)=>     {profilePage('');editFind(1, showId)},
	addPere: ()=>            {profilePage('');addFind(2)},
	editPere: (pereId)=>     {profilePage('');editFind(2, pereId)},
	devices: ()=>            {profilePage('');profileDevices()},
	alarms: ()=>             {profilePage('');alarmsWindow();GetAlarms()},
	color: ()=>              {profilePage('');clrEditPage()},
	binds: ()=>              {profilePage('');keyBindsCfg2()},
	hotkeys: ()=>            {profilePage('');keyBindsCfg2()},

	Wikis: ()=>              {pageWikiList()},
	wikis: ()=>              {pageWikiList()},
	wiki: (wikiId)=>         {pageGuides(wikiId)},
	wikiPage: (guidId)=>     {let data = guidId.split('.');getGuide(data[0],data[1])},

	wikiNew: ()=>            {createWiki(1)},
	wikiControl: (wikiId)=>  {profilePage('');wikiControl(wikiId)},
	//wikiEditor: (wikiId)=>   {profilePage('');getGuidesAdmin(wikiId)},
	//wikiFiles: (wikiId)=>    {profilePage('');wikiLoadFiles(wikiId)},
	//wikiTemplates: (wikiId)=>{profilePage('');wikiLoadTemplates(wikiId)},
	//wikiPageNew: (wikiId)=>  {createGuide(wikiId,1)},
	//wikiPageEdit: (guidId)=> {let data = guidId.split('.');editGuide(data[0],data[1],1)},
	
	addVacs: (projId)=>      {let d = projId.split('|');profilePage(addVacs(d[0],d[1]));},
	editVacs: (projId)=>     {let d = projId.split('|');profilePage('');editVacs(d[0],d[1],d[2])},
	vacans: (projId)=>       {let d = projId.split('|');profilePage('');getVacancies(d[0],d[1])},
	applies: (projId)=>      {let d = projId.split('|');profilePage('');vacResponses(d[0],d[1],d[2])},

	forum: (foruId)=>        {openForum(foruId)},
	forumPost: (forum)=>     {let data = forum.split('.');getForumPost(data[0],data[1])},

	gdpsLog: (gdpsId)=>      {profilePage('');getJoinLog(gdpsId)},
	campOwn: (campId)=>      {profilePage('');coownersMenu(campId,0)},
	showOwn: (showId)=>      {profilePage('');coownersMenu(showId,1)},
	pereOwn: (pereId)=>      {profilePage('');coownersMenu(pereId,2)},
	wikiOwn: (wikiId)=>      {profilePage('');coownersMenu(wikiId,-1)},
};

windowButton = (text, func = '', style = '')=>{
	return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
};
// 1.7 polyfill
helperRequest = (url, data, headers = {}, fileUploadProgressElement = false)=>{
	return new Promise((resolve, reject)=>{
		if (url === false) {
			resolve(data);
			console.log(data);
		}
		let XHR = new XMLHttpRequest(),
				METHOD = 'GET';
		if (data !== false) {
			if (Slocal.get('User')) {
				METHOD = 'POST';
				if (data !== undefined) 
					if (typeof(data) !== 'object')
						data += `&token=${token}&device=${fp.staticName}`;
					else {
						data.append('token', token);
						data.append('device', fp.staticName);
					}
				else 
					data = `token=${token}&device=${fp.staticName}`;
			} else if (data !== undefined)
				METHOD = 'POST';
		}

		XHR.open(METHOD, url);

		if (typeof(data) !== 'object') {
			XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
		let allHeaders = {
			//..._.http.defaultHeaders,
			...headers
		};
		for (let header in allHeaders)
			XHR.setRequestHeader(header, allHeaders[header]);

		if (fileUploadProgressElement != false)
			XHR.upload.onprogress = (e) => {
				if (e.lengthComputable) {
					let percentage = (e.loaded / e.total);
					fileUploadProgressElement.setAttribute('value', percentage);
				}
			};

		XHR.onreadystatechange = ()=>{
			if (XHR.readyState === 4 ) {
				if (XHR.status === 200) {
					servError = "\n\nADDR: "+url+"\n\nSERVER RESP:\n\n"+XHR.response;
					resolve(XHR.response);
				} else {
					servError = '';
					reject(new Error('Unknown error, code status '+XHR.status), XHR);
				}
			}
		};
		// .catch(e=>{console.error(e);_.err.handleRejection(e)});;
		XHR.onerror = ()=>{
			servError = '';
			reject(new Error('Network error'), XHR);
		};

		if (data !== undefined) {
			XHR.send(data);
		} else {
			XHR.send();
		};
	});
}

if (location.search.includes('&test=')) {
	scritpsUrl = location.search.split('&test=')[1].split('&')[0] + '/'
}

let scrLoadVer = Date.now();//8;

_.lazy.register(scritpsUrl + '/privateProf.js?ver='+scrLoadVer,[
	'addFind',
	'editFind',
	'getJoinLog',
	'addVacs',
	'editVacs',
	'getVacancies',
	'vacResponses',
	'createWiki',
	'findsWindow',
	'wikisWindow',
	'alarmsWindow',		'GetAlarms',
	'profileDevices',
	'clrEditPage',
	'keyBindsCfg',		'keyBindsCfg2',
	'profilePage',
]);
_.lazy.register(scritpsUrl + '/devpanel.js?ver='+scrLoadVer,[
	'debugWindow'
]);
_.lazy.register(scritpsUrl + '/wikiControl.js?ver='+scrLoadVer,[
	'wikiControl',
	'editGuide'
]);
_.lazy.register(scritpsUrl + '/publicWiki.js?ver='+scrLoadVer,[
	'pageGuides',
	'getGuide',
]);
_.lazy.register(scritpsUrl + '/wordle.js?ver='+scrLoadVer,[
	'wordleGame'
]);
_.lazy.register(scritpsUrl + '/wordle2.js?ver='+scrLoadVer,[
	'wordle.trolleybus.games.init'
]);

/*
_.lazy.load(scritpsUrl + '/ojhub.js?ver='+scrLoadVer)
	.then(e=>{
		reStart();
	});
_.lazy.load(scritpsUrl + '/cur.js?ver='+scrLoadVer)
	.then(e=>{
		_.curs = curFabric(_);
	});
	*/
