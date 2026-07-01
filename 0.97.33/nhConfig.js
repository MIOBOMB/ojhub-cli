let 
langList = ['RU', 'EN', 'UA'],
helperStrVer = '0.97.33',
currentLangVer = 13,
helperBuildNum = 133,
scritpsUrl = '/cli/'+helperStrVer,
ignoreCap = false,
renderBeta = false,
helperTitleText = renderBeta ? 'ojhub-BUILD'+helperBuildNum : 'Object Hub',
helperUrl = './'; // 'https://objecthub.xyz/',//'https://gdpshelper.xyz/',

$.link.ignore = true;
$.cfg.defaultTitle = helperTitleText;
$.cfg.errorWindowButtons.push(['RESTART', `reStart(1,{errID})`],['REPORT', `reportError({errID})`],['REMOVE USER+RESTART', `Slocal.set('User','');location.reload()`]);
basePage = ()=>{innerMain(pageMain(1));};
applyLanguage = (langStr)=>{
	return langStr
		.replace('+helperStrVer+', helperStrVer)
		.replace('+helperBuildNum+', helperBuildNum)
		.replace('+helperUrl+', helperUrl);
};
doLangSetup = (newData)=>{
	Slocal.set('Lang', newData);
	Slocal.set('LangVer', currentLangVer);
	$.langs.main = JSON.parse(applyLanguage(newData));
};
$.cfg.helperWindows = $id('windowsXP');
$.cfg.helperHider = $id('Professional');
windowButton = (text, func = '', style = '')=>{
	return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
};
let convertBytesToBigger = (bytes)=>{
	if (bytes < 1024)
		return bytes+' B';
	else if (bytes > 1024)
		return (bytes / 1024).toFixed(2)+ 'kB';
	else 
		return (bytes / 1048576).toFixed(2)+ 'mB';
};
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
			...$.cfg.defaultHeaders,
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
					console.info(convertBytesToBigger(XHR.response.length));
					servError = "\n\nADDR: "+url+"\n\nSERVER RESP:\n\n"+XHR.response;
					resolve(XHR.response);
				} else {
					servError = '';
					reject(new Error('Unknown error, code status '+XHR.status), XHR);
				}
			}
		};
		// .catch(e=>{console.error(e);$.err.handlePromise(e)});;
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
};
$.cfg.linkCommands = {
	en: ()=>        {replaceLang('EN',1)},
	ru: ()=>        {replaceLang('RU',1)},
	ua: ()=>        {replaceLang('UA',1)},
	de: ()=>        {replaceLang('DE',1)},
	dev: ()=>       {debugWindow()},
	deh: ()=>       {let i = debugWindow();subWindows.hide('DEVPANEL',i+'DEVPANEL');},
	dropcolor: ()=> {profilePage();clrEditPage();dropColorScheme();removeLink('dropcolor')},
	ignoreCap: ()=> {ignoreCap = true}
};
$.cfg.linkActions = {
	'': ()=>                 {innerMain(pageMain())},
	find: ()=>               {pageFind()},
	list: ()=>               {pageFind(0)},
	shows: ()=>              {pageFind(1)},
	wordle: (lang)=>         {wordleGame(lang)},

	camp: (campId)=>         {getCamp(campId)},
	show: (showId)=>         {getShow(showId)},
	pere: (pereId)=>         {getPere(pereId)},
	news: ()=>               {globalNews()},
	newsC: (postId)=>        {let d = postId.split('|');getNewsWithComments(d[0], d[1], d[2])},
	vacs: ()=>               {globalVacs()},
	VacsC: (postId)=>        {getVacsWithComments(postId)},
	newsList: (gdpsId)=>     {let d = gdpsId.split('|');helperNews(d[0], d[1])},
	special: ()=>            {innerMain(uvazuha())},
	about: ()=>              {innerMain(helperAbout())},

	profiles: (userId)=>     {otherProfile(userId,'pageFind(0)')},
	profCamps: (userId)=>    {otherProfile(userId,'pageFind(0)',otherCampsWindow)},
	profShows: (userId)=>    {otherProfile(userId,'pageFind(1)',otherShowsWindow)},
	profPeres: (userId)=>    {otherProfile(userId,'pageFind(2)',otherPeresWindow)},
	profWikis: (userId)=>    {otherProfile(userId,'pageFind(0)',otherWikisWindow)},

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
	binds: ()=>              {profilePage('');keyBindsCfg()},

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

if (location.search.includes('&test=')) {
	scritpsUrl = location.search.split('&test=')[1].split('&')[0] + '/'
}

let scrLoadVer = 16;

$.lazy.register(scritpsUrl + '/privateProf.js?ver='+scrLoadVer,[
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
	'alarmsWindow',  'GetAlarms',
	'profileDevices',
	'clrEditPage',
	'keyBindsCfg',
	'profilePage',
]);
$.lazy.register(scritpsUrl + '/devpanel.js?ver='+Date.now(),[
	'debugWindow'
]);
$.lazy.register(scritpsUrl + '/wikiControl.js?ver='+scrLoadVer,[
	'wikiControl',
	'editGuide'
]);
$.lazy.register(scritpsUrl + '/publicWiki.js?ver='+scrLoadVer,[
	'pageGuides',
	'getGuide',
]);
$.lazy.register(scritpsUrl + '/wordle.js?ver='+scrLoadVer,[
	'wordleGame'
]);

$.lazy.load(scritpsUrl + '/ojhub.js?ver='+scrLoadVer)
	.then(e=>{
		reStart();
	});
