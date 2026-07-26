// ГАЙД ПО МИНИФИКАЦИИ - getElement() это обычный док гет элембуид. innerMain() это заменить весь контект внутри div id=1st

/* порядок запуска хелпера (жс):
 * вызывается функция 'reStart()', которая вызывает 'helperRequest()' но это мелочи, она назначает глобальные переменные GDPSes и Guides
 * если есть вход в аккаунт назначаются ещё и thisUser, myGdpses и myguides
 * после вызывается функция 'getLink()', которая берёт в урл всё после '?' и прогоняя через себя вызывает нужные функции (например '?guides' закинет в гайды, или '?gdps=45' откроет гдпс с айди 45)
 * после выполнения 'getLink()' хелпер готов к работе с клиентом
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
 * Новости                    | 2     | 3           | -      | -
 * комментарии к кемпам       | 1     | -           | -      | -
 * комментарии к шоу          | 1     | -           | -      | -
 * комментарии к новостям     | 5     | -           | -      | -
 * комментарии к страницам    | 6     | -           | -      | -
 * комментарии к форум постам | 10    | -           | -      | -
 * Ваш контент                | 11++  | 5++         | -      | 2++
 * 
 * !!! Типы лайков комментов прописываются через костыли в renderComms() чтобы не возникало неожиданного поведения, учтите это если реально хотите на основе newHelper.js делать сайт
 * а ещё лучше сделайте один общий тип для всех комментов чтобы не мучать себя
*/

let getElement = (i)=>{
  if (!document.getElementById(i))
    Consoles.warn('Cant find element with "'+i+'" id!');
  return document.getElementById(i);
},
querySelect = (i)=>{
  if (!document.querySelector(i))
    Consoles.warn('Cant find element by "'+i+'" querySelector!');
  return document.querySelector(i);
},
querySelectAll = (i)=>{
  if (!document.querySelectorAll(i))
    Consoles.warn('Cant find element by "'+i+'" querySelector!');
  return document.querySelectorAll(i);
},

// #region базовые опции гдпс хелпера
ignoreCap = false,
renderBeta = false,
logAll = false,
captchaLoad = false,
techName = 'oschub096',
helperUrl = './',//'https://objecthub.xyz/',//'https://gdpshelper.xyz/',
Slocal = {
  get: (name)=>       {return localStorage.getItem(techName+name)},
  set: (name, value)=>{return localStorage.setItem(techName+name, value)},
  remove: (name)=>    {return localStorage.removeItem(techName+name)},
},
Consoles = {
  error: (data)=>  {logAll ? console.error(data) : null},
  log: (data)=>    {logAll ? console.log(data) : null},
  warn: (data)=>   {logAll ? console.warn(data) : null},
  time: (data)=>   {logAll ? console.time(data) : null},
  timeEnd: data=>{logAll ? console.timeEnd(data) : null},
},
scripts = [],

helperSettings = {
  openGuidesInWindow: parseInt(Slocal.get('openGuidesInWindow')),
},

helperBuildNum = 117,
urlBuildNum = 133,//117
helperStrVer = '0.96.3',
helperTitleText = renderBeta ? 'ojhub-BUILD'+helperBuildNum : 'Object Hub',
currentLangVer = 9,
helperCaptchaSiteKey = '6Ldrt0grAAAAAMdteG7pq6LZ1UYeMvkElvUV7Qhx',

// Главные html теги
  helperMain = getElement('1st'),
  helperWindows = getElement('windowsXP'),
  helperHider = getElement('Professional'),
  helperIcon = link = querySelect("link[rel~='icon']"),
  helperTitle = querySelect('title'),

curlJoin = 'https://objecthub.xyz/',
baseApp = location.origin + location.pathname,

sData = [
  baseApp+'server/'+urlBuildNum+'/content/',
  baseApp+'server/'+urlBuildNum+'/send/',
  baseApp+'server/'+urlBuildNum+'/',
  baseApp+'server/'+urlBuildNum+'/search/',
  baseApp+'server/'+urlBuildNum+'/delete/',
  baseApp+'server/'+urlBuildNum+'/user/',
  baseApp+'server/'+urlBuildNum+'/forum/',
  baseApp+'server/'+urlBuildNum+'/wiki/',
 ],

 formSdata = (API)=>{
  sData = [
    baseApp+'server/'+API+'/content/',
    baseApp+'server/'+API+'/send/',
    baseApp+'server/'+API+'/',
    baseApp+'server/'+API+'/search/',
    baseApp+'server/'+API+'/delete/',
    baseApp+'server/'+API+'/user/',
    baseApp+'server/'+API+'/forum/',
    baseApp+'server/'+API+'/wiki/',
  ]
},
php = '.php',

windowsCount = 0,
guideEditorFrame = 0, // используется только в редакторе гайдов чтобы можно было удалять разделы не по порядку

errorService = {
  errors: {},
  errorCount: 0, // используется в returnError()
  errorPositionX: 24,
  errorPositionY: 60,
},

token = Slocal.get('User'), // токен юзера

globalWiki = 0,

thisUser = {
  username: 'Object Hub',
  ID: 0,
  role: 0,
  isActive: 0,
  hasAlarms: 0,
  token: '',
  cityData:false
},

mainLang = '', // язык, хотя вроде очевидно
servError = "\n\nADDR: \n\nSERVER RESP:\n\nxhr.response", // если 'helperRequest' вернёт ошибку, она будет записана сюда и отображена через 'returnError()'


TimeOut = [null,null], // [0] для инпута, [1] для анимаций окон (регистрация и логин)

headerPhoneSwitcher = 0, //0 - не нажимался, 1 - в профиле, 2 - в навигаторе
ProjectsChannel = 0,

// универсальная функция для запросов на сервер
helperRequest = (url, data, headers = '', fileUploadProgressElement = false)=>{
  let logElement = getElement('helperRequest');
  if (logElement)
    logElement.insertAdjacentHTML('beforeend',`${url}`);
  return new Promise((resolve, reject)=>{
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
    if (logElement)
      logElement.insertAdjacentHTML('beforeend',data);

    if (typeof(data) !== 'object') {
      XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    Consoles.log(headers);
    if (headers !== '')
      for (let header in headers) {
        XHR.setRequestHeader(header, headers[header]);
        Consoles.log(header, headers[header]);
      }

    if (fileUploadProgressElement != false)
      XHR.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          let percentage = (e.loaded / e.total);
          fileUploadProgressElement.setAttribute('value', percentage);
        }
      };

    XHR.onreadystatechange = ()=>{
      if (logElement)
        logElement.insertAdjacentHTML('beforeend',`\n${XHR.status}`);
      if (XHR.readyState === 4 ) {
        if (XHR.status === 200) {
          servError = "\n\nADDR: "+url+"\n\nSERVER RESP:\n\n"+XHR.response;
          resolve(XHR.response);
          if (logElement)
            logElement.insertAdjacentHTML('beforeend',`\n${XHR.response}\n\n`);
        } else {
          servError = '';
          reject(new Error('Unknown error, code status '+XHR.status), XHR);
        }
      }
    };
    // .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
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
},
// отображение ошибок у 'helperRequest', переменная errorService.errorCount нужна чтобы считать ошибки
returnError = (err, addr = '')=>{
  Consoles.error(err, addr);
  errorService.errorCount++;
  if (errorService.errorCount === 1) {
    document.body.insertAdjacentHTML('beforeend',
      `<div id=errorBoxCount style=z-index:5;position:fixed;bottom:50px;left:50px;background-color:rgba(0,0,0,.5);padding:12px;border-radius:calc(var(--def-border-large)*1.5)>`+
        `<span id=errorCount style=position:absolute;right:10px;top:10px>1</span>`+
        `<button class=emptybtn onclick="for (let errId in errorService.errors) {if (!getElement('debug'+errId))renderError(errId,errorService.errors[errId])}">`+
          `<img src=${helperUrl}imgs/err.svg width=48px height=48px>`+
        `</button>`+
      `</div>`
    )
  } else {
    getElement('errorCount').innerHTML = errorService.errorCount;
  }
  renderError(errorService.errorCount, err, addr);
  errorService.errors[errorService.errorCount] = err+addr;
  if (getElement('TheLoadElem'))
    getElement('TheLoadElem').remove();
},
renderError = (errID, errText, serverAddress = '')=>{
  let errInfo = 
  `LOCATION: ${location}\n`+
  `USERID: ${thisUser.ID}\n`;

  function buttonErr(innerHtml, onclick) {
    return `<button style=background-color:#333 onclick="${onclick}">`+
          innerHtml+
        `</button> `
  }

  openWindow('debug'+errID,
    `<div id=debug${errID}>`+
      `<p align=center style=margin:0>DEBUG INFO</p>`+
      `ERROR<br>`+
      `<div style=background-color:#000;overflow-y:auto;max-height:200px>`+
        `<pre style=width:100%;white-space:pre-line id=debugMega${errID}></pre>`+
      `</div>`+
      `<br><br>`+
      `<center>`+
        buttonErr('COPY ERROR', `linkCopy(getElement('debugMega${errID}').innerText)`)+
        buttonErr('REPORT', `reportError(${errID})`)+
        buttonErr('RESTART', `reStart(1,${errID})`)+
        buttonErr('FULL RESTART', `location.reload()`)+
        buttonErr('REMOVE USER+RESTART', `Slocal.set('User','');location.reload()`)+
      `</center>`+
    `</div>`
  , `iserror style=top:${errorService.errorPositionY}px;left:${errorService.errorPositionX}px`);
  getElement('debugMega'+errID).innerText = errInfo+errText+`\n`+
  (serverAddress === '' ? '' : `\n${serverAddress}\n`);
  errorService.errorPositionY = errorService.errorPositionY + 24;
  if (errorService.errorPositionY > (innerHeight - 125))
    errorService.errorPositionY = 60;
  errorService.errorPositionX = errorService.errorPositionX + 24;
  if (errorService.errorPositionX > (innerWidth - 250))
    errorService.errorPositionX = 24;
},
reportError = (errorId)=>{
  let text = encodeURIComponent(getElement('debugMega'+errorId).innerHTML);
  Loading();
  helperRequest(`${sData[2]}reportError${php}`, 'error='+text+'\\n\\n'+navigator.userAgent)
    .then(data=>{
      Loading(1);
      if (errorId !== 0) {
        if (getElement('debug'+errorId))
          closeWindow(getElement('debug'+errorId).parentElement.parentElement.id);
        errorService.errors[errorId] = errorService.errors[errorService.errorCount];
        delete errorService.errors[errorService.errorCount];
        errorService.errorCount--;
        if (errorService.errorCount === 0) {
          getElement('errorBoxCount').remove();
        } else {
          getElement('errorCount').innerHTML = errorService.errorCount;
        }
      }   
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
linkActions = {
  '': ()=>                 {innerMain(pageMain())},
  find: (channel)=>        {pageFind(parseInt(channel))},
  list: ()=>               {pageFind(0)},
  shows: ()=>              {pageFind(1)},

  camp: (campId)=>         {getCamp(campId)},
  show: (showId)=>         {getShow(showId)},
  pere: (pereId)=>         {getPere(pereId)},
  news: ()=>               {globalNews()},
  newsC: (postId)=>        {getNewsWithComments(postId.split('|')[0], postId.split('|')[1], postId.split('|')[2])},
  newsList: (gdpsId)=>     {helperNews(gdpsId.split('|')[0], gdpsId.split('|')[1])},
  special: ()=>            {innerMain(uvazuha())},
  about: ()=>              {innerMain(helperAbout())},

  drop: ()=>               {innerMain(dropWindow())},
  verify: ()=>             {innerMain(verifyWindow())},
  profile: ()=>            {innerMain(profilePage())},
  addedCamps: ()=>         {innerMain(profilePage(findsWindow(0)))},
  addedShows: ()=>         {innerMain(profilePage(findsWindow(1)))},
  addedPeres: ()=>         {innerMain(profilePage(findsWindow(2)))},
  addedWikis: ()=>         {innerMain(profilePage(wikisWindow()))},
  addCamp: ()=>            {innerMain(profilePage(addFind(0)))},
  editCamp: (campId)=>     {innerMain(profilePage(''));editFind(0, campId)},
  addShow: ()=>            {innerMain(profilePage(addFind(1)))},
  editShow: (showId)=>     {innerMain(profilePage(''));editFind(1, showId)},
  addPere: ()=>            {innerMain(profilePage(addFind(2)))},
  editPere: (pereId)=>     {innerMain(profilePage(''));editFind(2, pereId)},
  devices: ()=>            {innerMain(profilePage(''));profileDevices()},
  alarms: ()=>             {innerMain(profilePage(alarmsWindow()));GetAlarms()},
  profiles: (userId)=>     {otherProfile(userId,'pageFind(0)')},
  profCamps: (userId)=>    {otherProfile(userId,'pageFind(0)',otherCampsWindow)},
  profShows: (userId)=>    {otherProfile(userId,'pageFind(1)',otherShowsWindow)},
  profPeres: (userId)=>    {otherProfile(userId,'pageFind(2)',otherPeresWindow)},
  profWikis: (userId)=>    {otherProfile(userId,'pageFind(0)',otherWikisWindow)},
  color: ()=>              {innerMain(profilePage());clrEditPage()},

  wikis: ()=>              {pageWikiList()},
  wiki: (wikiId)=>         {pageGuides(wikiId)},
  wikiNew: ()=>            {createWiki(1)},
  wikiEdit: (wikiId)=>     {editWiki(wikiId,1)},
  wikiEditor: (wikiId)=>   {innerMain(profilePage(''));getGuidesAdmin(wikiId)},
  wikiFiles: (wikiId)=>    {innerMain(profilePage(''));wikiLoadFiles(wikiId)},
  wikiPage: (guidId)=>     {getGuide(guidId.split('.')[0],guidId.split('.')[1])},
  wikiPageNew: (wikiId)=>  {createGuide(wikiId,1)},
  wikiPageEdit: (guidId)=> {editGuide(guidId.split('.')[0],guidId.split('.')[1],1)},

  forum: (foruId)=>        {openForum(foruId)},
  forumPost: (forum)=>     {getForumPost(forum.split('.')[0],forum.split('.')[1])},

  gdpsLog: (gdpsId)=>      {innerMain(profilePage(''));getJoinLog(gdpsId)},
  campOwn: (campId)=>      {innerMain(profilePage(''));coownersMenu(campId,0)},
  ShowOwn: (showId)=>      {innerMain(profilePage(''));coownersMenu(showId,1)},
  wikiOwn: (wikiId)=>      {innerMain(profilePage(''));coownersMenu(wikiId,-1)},
},
linkCommands = {
  en: ()=>        {translateReplaceLang('EN',1)},
  ru: ()=>        {translateReplaceLang('RU',1)},
  ua: ()=>        {translateReplaceLang('UA',1)},
  jj: ()=>        {translateReplaceLang('JJ',1)},
  dev: ()=>       {debugWindow()},
  deh: ()=>       {debugWindow();hideWindow('DEVPANEL','0DEVPANEL');querySelect('[devpanel]').classList.replace('ANIM-create2','ANIM-hide2')},
  dropcolor: ()=> {innerMain(profilePage());clrEditPage();dropColorScheme();removeLink('dropcolor')},
},
setLink = (val, pageTitle = helperTitleText)=>{
  if (!ignore) {
    let link = location.search.replace('?','').split('&');
    link[0] = val;
    link = link.join('&');
    history.pushState(null, null, '?'+link);
    if (pageTitle)
      helperTitle.innerHTML = pageTitle;
  }
  ignore = false;
},
addLink = (val)=>{
  let link = location.search.replace('?','').split('&');
  if (!link.includes(val)) {
    link.push(val);
    link = link.join('&');
    history.pushState(null, null, '?'+link);
  }
},
removeLink = (val)=>{
  let link = location.search.replace('?','').split('&');
  if (link.includes(val)) {
    link.splice(link.indexOf(val), 1);
    link = link.join('&');
    history.pushState(null, null, '?'+link);
  }
},
getLink = (string = window.location.search)=>{
  let params = string
    .replace('?','')
    .split('&')
    .reduce(
      (command,param)=>{
        let [key, value] = param.split('=');
        command[decodeURIComponent(key)] = decodeURIComponent(value);
        return command;
      },
      {}
    ),
    isFirst = true;
  console.log(params);

  for (let KEY in params) {
    let VALUE = params[KEY];
    if (typeof KEY !== 'undefined') {
      if (typeof VALUE === 'undefined') {
        VALUE = thisUser.ID;
      };
      try {
        if (isFirst)
          if (linkActions[KEY])
            linkActions[KEY](VALUE);
          else 
            linkCommands[KEY](VALUE);
        else 
          linkCommands[KEY](VALUE);
      } catch (e) {
        if (e.message == 'TypeError: linkActions[KEY] is not a function') {
          console.error(e);getPromiseErrorPos(e);;
          //returnError("?"+KEY+"="+VALUE+' is broken link!');
        }
        if (isFirst)
          innerMain(pageMain(1));
      }
    };
    isFirst = false;
  };
},
getLinkLegacy = (string = window.location.search)=>{ // Функция из GDPS Helper, устаревшая и замененная с хеша[#] на поисковые параметры[?]
  let params = string
    .replace('#','')
    .split('&')
    .reduce(
      (p,e)=>{
        let a = e.split('=');
        p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      },
      {}
    );
  Consoles.log(params);

  for (let KEY in params) {
    let VALUE = params[KEY];
    if (typeof KEY !== 'undefined') {
      if (typeof VALUE === 'undefined') {
        VALUE = thisUser.ID;
      };
      try {
        linkActions[KEY](VALUE);
      } catch (e) {
        returnError("#"+KEY+"="+VALUE+' is broken link!');
        innerMain(pageMain());
      }
    };
  };
},


reStart = (drop = 0, errorId = 0)=>{
  if (errorId !== 0) {
    if (getElement('debug'+errorId))
      closeWindow(getElement('debug'+errorId).parentElement.parentElement.id);
    errorService.errors[errorId] = errorService.errors[errorService.errorCount];
    delete errorService.errors[errorService.errorCount];
    errorService.errorCount--;
    if (errorService.errorCount === 0) {
      getElement('errorBoxCount').remove();
    } else {
      getElement('errorCount').innerHTML = errorService.errorCount;
    }
  }

  innerMain('');
  // убрать комментарии на случай если ваше приложение на newHelper будет использовать php-сессии или что то похожее
  // let token = Slocal.get('User'),
  // postData = token ? 'token='+token : '';
  Loading(0,0);
  let helperInit = ()=>{
    Fingerprint.generate(token) // если токен есть значит есть и юзер => генерируем девайс токен
    .then(fpData=>{
      helperRequest(sData[2]+'loginT'+php)
        .then(data=>{
          Loading(1);
          let serverResp = JSON.parse(data);
          if (Slocal.get('User')) {
            thisUser = serverResp[0];
            myGdpses = [{},{},{}];
            Object.keys(serverResp[1][0]).forEach(gdps=>{
              GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
            })
            myguides = [];
            myguides.push(serverResp[1][1]);
            yourWikies = serverResp[1][1];
            wikiesMini = [];
            Object.keys(yourWikies).forEach(el=>{
              //wikiesMini.push(yourWikies[el][0].toString());
              wikiesMini.push(el.slice(1));
            });
          }
          if (thisUser.token == 'false') {
            thisUser.ID = 0;
            return innerMain(deviceAddForm());
          }
          getLink();
          helperIcon.href = 'https://objecthub.xyz/favicon.ico';
          if (Slocal.get('BetaRead') == null)
            makeBetaAlert();
        })
        .catch(e=>{console.error(e);getPromiseErrorPos(e)});
    });
    if (drop !== 0) {
      ignore = true;
      translateReplaceLang('RU');
    }
  };
  if (parseInt(Slocal.get('LangVer')) !== currentLangVer) {
    let lang = 'EN';
    if (navigator.languages.includes('ru-RU'))
      lang = 'RU';
    loadLanguage(lang)
      .then(()=>{
        helperInit();
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});
  } else {
    mainLang = JSON.parse(applyLanguage(Slocal.get('Lang')));
    helperInit();
  }
},


GDPSswitchChannel = (channel)=>{
  switch (channel) {
    case 0:
      return ['camp', 'Camp', 'c', myGdpses[0]];
    case 1:
      return ['show', 'Show', 's', myGdpses[1]];
    case 2:
      return ['pere', 'Pere', 'p', myGdpses[2]];
    default:
      return ['camp', 'Camp', 'c', myGdpses[0]];
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
    default:
      return myGdpses[0];
  }
},
// #endregion
// #region компоненты
// #region микрокомпоненты

windowButton = (text, func = '', style = '')=>{
  return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
},
basicButton = (text = '', func = '', style = '', id = '', Class = '')=>{
  return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
},
emptyButton = (text = '', func = '', style = '', id = '', Class = '')=>{
  return `<button ${id ? 'id="'+id+'"' : ''}class="emptybtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
},
basicInput = (text = '', idAndName = '', style = '', Class = '')=>{
  return `<input ${idAndName ? `id="${idAndName}" name="${idAndName}"` : ''}class="framelabel ${Class}" style="${style}"${getTrans(text, 'input')}`;
},
radioInput = (id = '', name = '', isChecked = 0, otnerArgs)=>{
  return `<input id="${id}" name="${name}" type=radio ${otnerArgs} ${isChecked ? 'checked' : ''}>`;
},

// #endregion

headerButton = (text, Class, oncl)=>{
  return `<button class="${Class}" onclick="${oncl}"${text}/button>`;
},
headerImg = (link)=>{
  return `><img src=${helperUrl}imgs/${link}><`;
},
headerButtons = (switcherM = 0)=>{
  if (switcherM === 1) // if phone screen
    return headerButton(getTrans('main'),'headbtn','switchMobileMain();innerMain(pageMain())')+
    headerButton(getTrans('finder-name'),'headbtn','pageFind(helperFindData[3]);switchMobileMain()')+
    headerButton(getTrans('news')       ,'headbtn','switchMobileMain();globalNews()')+
    headerButton(getTrans('guides09')   ,'headbtn','pageWikiList();switchMobileMain()')+
    headerButton(getTrans('aboutHelper'),'headbtn','innerMain(helperAbout());switchMobileMain()');

  return headerButton(getTrans('main'),'headbtn','innerMain(pageMain())')+
  headerButton(getTrans('finder-name'),'headbtn','pageFind(helperFindData[3])')+
  headerButton(getTrans('news')       ,'headbtn','globalNews()')+
  headerButton(getTrans('guides09')   ,'headbtn','pageWikiList()')+
  headerButton(getTrans('aboutHelper'),'headbtn','innerMain(helperAbout())');
},
profileContentDiv = ()=>{
  return `<div style='display: flex; flex-direction: column; height:calc(100vh - 450px); overflow:auto' align=left>`;
},

renderTextOrTags = ()=>{
  let [inputs,value] = Slocal.get('ColorScheme').split('/')[2].split(',')[0].split(':'),
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
  return  `<tr>`+
            `<td`+
              name+
            `/td>`+
            `<td>`+
              value+
            `</td>`+
          `</tr>`;
},

likeStyle = {
  like: 'filter:drop-shadow(0 0 4px #FFFFFF)',
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
    `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(preHtml.img)}" width=128px height=128px style="border-radius:calc(var(--def-border)*2)">`
    : '')+
    `<h2 id=${preHtml.cType}title${preHtml.ID}>${preHtml.title}</h2>`+
    `<p style="margin:0">`+
    (authorBtn ?
      `<button class=loginbtn onclick="${joinData}(${preHtml.gdpsId})">${preHtml.gdpsTitle}</button>`+
      `- <button class=emptybtn onclick="otherProfile(${preHtml.author},'${joinData}(${preHtml.gdpsId})')">${preHtml.username}</button>`
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
        `<button ${preHtml.isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${preHtml.ID},${likeType})" class=dislike id=dislike${preHtml.ID}></button>`+
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
    `<button onclick="editNews(${preHtml.ID},${preHtml.gdpsId})" style="position:absolute;top:20px;right:64px;padding:2px 4px" class="loginbtn">`+
      `<img style=margin:0 width=24px src="${helperUrl}imgs/edit.svg">`+
    `</button>`+
    `<button onclick="deleteNews(${preHtml.ID},${isComm})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img style=margin:0 width=24px src="${helperUrl}imgs/trash.svg">`+
    `</button>`
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
      btnFuncs = ['getForumPost', 'openForum('+preHtml[0]+')', 'f'];
      break;
    case -2:
      btnFuncs = ['getGuide', 'pageGuides()', 'g'];
      break;
    case -1:
      btnFuncs = ['pageGuides', 'pageWikiList()', 'w'];
      break;
    case 0:
      btnFuncs = ['getCamp', 'pageFind(0)', 'c'];
      break;
    case 1:
      btnFuncs = ['getShow', 'pageFind(1)', 's'];
      break;
    case 2:
      btnFuncs = ['getPere', 'pageFind(2)', 'p'];
      break;
  };
  if (data.mainWiki) {
    contentId = data.mainWiki;
    btnFuncs[0] = 'getGuide';
    preHtml[0] = data.ID;
  };

  let 
  banWidth = parseInt(preHtml[3].split(';')[0].split(':')[1]) + 16,
  banHeight = Math.round(banWidth * 0.4166),
  darkZoneMargin = banHeight - 60,
  html =
  `<div class="framegdps" styling="${btnFuncs[2]}${data.ID}" style="${preHtml[3]}">`+
    (renderImage ? `<div class=loh style="min-height:128px">` : '')+
      `<h2 style=width:290px${renderImage ? '' : ';margin-top:'+(banHeight - 35)+'px;position:inherit;z-index:1'}>${data.title}`+(data.language ? `<img class=FGDPSimg style=margin-left:4px src="${helperUrl}imgs/${data.language}.png">` : '')+`</h2>`+
      (renderAuthor ? `<p style="margin:0">`+
        `<span${getTrans('addedBy')}/span>:`+
        `<button onclick="otherProfile(${data.author},'${btnFuncs[1]}')" style="background:0;border:0;color:var(--color-white)">${data.username}</button>`+
      `</p>` : '')+
      (renderImage ? `<img onerror="Consoles.warn('broken link ${decodeURIComponent(data.img)}');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(data.img)}" width=128px height=128px style="border-radius:calc(var(--def-border)*2)">`+
    `</div>` : '')+
    
    `<img class="${imgClass[0]}" id="guideimg" style=width:${banWidth}px;height:${banHeight}px src="${decodeURIComponent(data.ban)}" onerror="Consoles.warn('broken link ${decodeURIComponent(data.ban)}');this.src='${helperUrl}imgs/hubemp.png'">`+
    `<div class="${imgClass[1]} gdpsalpha" styleng="${btnFuncs[2]}${data.ID}" style="width:${banWidth}px;height:60px;margin-top:${darkZoneMargin}px"></div>`+

    `<div style=position:absolute;bottom:0;width:100%>`+
      `<div class="likezone" style=margin-left:-4px;margin-bottom:6px>`+
        `<span class=likeplace id="likesCount${data.ID}">${data.likes[0]}</span>`+
        `<button ${data.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${data.ID},${preHtml[5]})" class=like id="like${data.ID}"></button>`+
        `<span class=likeplace id="dislsCount${data.ID}">${data.likes[1]}</span>`+
        `<button ${data.isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${data.ID},${preHtml[5]})" class=dislike id="dislike${data.ID}"></button>`+
        (typeof data.likes[2] === 'undefined' ? '' : `<span class=likeplace id="commsCount${data.ID}">${data.likes[2]}</span>`+
        `<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`)+
      `</div>`+
      `<div class="btnszoneSearch" style=position:absolute;bottom:0;right:16px>`+
        preHtml[1]+
        `<button class=loginbtnGDPS style=margin-top:-2px;border-bottom-right-radius:calc(var(--def-border)*1.5) onclick="${btnFuncs[0]}(${contentId}${preHtml[0] ? `,'${preHtml[0]}'` : ''})"${getTrans('moreInfo')}/button>`+
      `</div>`+
    `</div>`+
    (renderDesc ? `<p ${renderImage ? 'class="FGDPStext absolute"' : ''} ${renderImage ? 'style="margin:0"' : ''}>${data.text}${data.text[120] === undefined ? '' : '...'}</p>` : '')+
    (renderTags ? `<div class="flex-row FGDPStags absolute">${preHtml[2]}</div>` : '')+
  `</div>`;
  return html;
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
],
toStringTAGS = (channel, tag)=>{ // используется для рендера, перемещена из региона рендера для более удобного добавления новых тегов
  let findArr = Object.assign({}, Tags[channel], Os[channel]);
  return findArr[tag];
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
helperFindData = [0,[],[],0],// нулевой это метод поиска, первый просто теги, второй платформы, третий это канал

// переменные для кеша в поиске
  CacheFinds = [0,'','',1], // канал, кеш, строка поиска и страница

  // переменные для кеша в профилях
  myGdpses = [{},{},{}],
  myguides = [],
  yourWikies = [],
  wikiesMini = [],

ignore = false, // работает с функцией 'setLink', если true то сохранение состояния в истории вкладок не будет

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
  };
  if (!helperFindData[INDEX].includes(tag)) {
    getElement(elemId+tag).setAttribute('class','tagSel');
    helperFindData[INDEX].push(tag);
  } else {
    getElement(elemId+tag).setAttribute('class','tagUns');
    let tagPlace = helperFindData[INDEX].indexOf(tag);
    if (tagPlace !== -1) {
      helperFindData[INDEX].splice(tagPlace, 1);
    }
  }
  helperFindData[INDEX].sort((a,b)=>{return a-b});
  sendFinder();
},
setMethod = (Method)=>{
  getElement('method'+helperFindData[0]).setAttribute('class','tagPre');
  helperFindData[0] = Method;
  getElement('method'+helperFindData[0]).setAttribute('class','tagSel');
  sendFinder();
},
sendFinder = (page = 0, query = '')=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  if (query === '') {
    query = 'method='+helperFindData[0];
    let enteredName = getElement('gdpsNameInput').value;
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
  helperRequest(`${sData[3]}new${php}?${query}&page=${page}&channel=${helperFindData[3]}`)
    .then(data=>{
      let GDPSES = JSON.parse(data),
        renderedData,
        page2 = page + 1,
        nextBtn = `sendFinder(${page2},'${query}')`,

        Count = Object.keys(GDPSES).length;
      switch (helperFindData[3]) {
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
      }
      innerGdpsPlace(renderedData, page)
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
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
modifyFindTags = (channel)=>{
  getElement(`tags${helperFindData[3]}`).style.display = 'none';
  let actsCount = querySelectAll('[class=tagSel]').length - 1;
  querySelectAll('[class=tagSel]').forEach(el=>{
    console.log(actsCount)
    if (actsCount == 0)
      return;
    actsCount--;
    el.classList.replace('tagSel', 'tagUns');
  });
  helperFindData[1] = [];
  helperFindData[2] = [];
  helperFindData[3] = channel;
  getElement(`tags${helperFindData[3]}`).style.display = '';
  sendFinder();
},
helperComments = (postId, contentType, commPage = 0)=>{
  getElement('nextGdps').remove();
  let dataForNextButton = `${postId},'${contentType}',${parseInt(commPage + 1)}`;
  Loading();
  helperRequest(`${sData[0]}fetchComms${php}?id=${postId}&type=${contentType}&page=${commPage}`)
    .then(data=>{
      let serverResp = JSON.parse(data);
      innerComments(renderComms(serverResp, contentType, dataForNextButton), 1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},

getFind = (channel, id, joinData = 0)=>{
  let tinyStr = 'c',
      smallString = 'camp',
      bigString = 'Camp';
      switch (channel) {
        case 1:
          tinyStr = 's';
          smallString = 'show';
          bigString = 'Show';
          break;
        case 2:
          tinyStr = 'p';
          smallString = 'pere';
          bigString = 'Pere';
          break;
      }
  setLink(smallString+'='+id);
  lastUsedProfile = `getFind(${channel},${id})`;
  contentPreload(`${id},1`, 'pageFind('+channel+')');

  Loading();
  helperRequest(`${sData[0]}camp${php}?id=${id}`)
    .then(data=>{
      if (data == '["NONE"]') {
        pageFind(channel);
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let dataForNextButton = `${id},0,1`,
        serverResp = JSON.parse(data),
        isOwner = checkOwn(id, serverResp.gdps.author, 1),
        html = '';

      if (joinData !== 0)
        html = FINDrender(channel, serverResp, joinData);
      else 
        html = FINDrender(channel, serverResp);

      innerComments(renderComms(serverResp.comments, 0, dataForNextButton), 0);
      getElement('imageBG').src = decodeURIComponent(serverResp.gdps.ban);

      getElement('news').innerHTML = basicButton(getTrans('newsList'), `helperNews('${id}.',${isOwner})`)+
        RenderNews(serverResp.news,2,'getCamp');
      if (isOwner)
        getElement('news').insertAdjacentHTML('afterbegin', `<div class=framegdps style="width:calc(100% - 40px)">`+newsWindow(id,tinyStr)+`</div>`);
      if (Object.keys(serverResp.news).length > 10)
        getElement('news').insertAdjacentHTML('beforeend',insertBtn(`loadMoreNews(${id},'get${bigString}',1)`));
      
      getElement('insertable').innerHTML = html;
      setImgSize();
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
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
loadMoreNews = (gdpsId, backFunc, page)=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();
  Loading();
  helperRequest(`${sData[0]}news${php}?id=${gdpsId}&page=${page}`)
    .then(data=>{
      Loading(1);
      if (data !== '{}') {
        let parsedData = JSON.parse(data),
            html = RenderNews(parsedData,0,backFunc);
        page++;
        if (Object.keys(parsedData).length > 10)
          html += insertBtn(`loadMoreNews(${gdpsId},'${backFunc}',${page})`);
        if (getElement('news'))
          getElement('news').insertAdjacentHTML('beforeend',html);
        else 
          innerGdpsPlace(html, 1);
      };
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
loadGlobalNews = (page)=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();
  Loading();
  helperRequest(`${sData[0]}newsAll${php}?page=${page}`)
    .then(data=>{
      Loading(1);
      if (data !== '{}') {
        let parsedData = JSON.parse(data),
            html = RenderNews(parsedData,0,'globalNews');
        page++;
        if (Object.keys(parsedData).length > 10)
          html += insertBtn(`loadGlobalNews(${page})`);
        if (getElement('news'))
          getElement('news').insertAdjacentHTML('beforeend',html);
        else 
          innerGdpsPlace(html, 1);
      };
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
gdpsNewsPage = (renderNazad = false, gdpsId = 0, backFunc = '')=>{
  let html = pHeader()+
  `<div id=helperContent>`+
    (renderNazad ? `<div class=gdps-forum>`+
      `<button data-trans="back" class=loginbtn onclick="${backFunc}(${gdpsId})"${getTrans('back')}/button><br>`+
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
        backFunc = 'helperNews';
        break;
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
      case 'helperNews':
        backFuncPre = '/';
        break;
      case 'globalNews':
        backFuncPre = ';';
        break;
    }
  }
  if (commBackFunc == '')
    commBackFunc = backFunc;

  setLink('newsC='+newsId+'|'+contentId+'|'+backFuncPre);
  lastUsedProfile = "getNewsWithComments("+newsId+","+contentId+")";
  contentPreload(`${newsId},3`, `${commBackFunc}(${contentId})`, 0, 0);

  Loading();
  helperRequest(`${sData[0]}newsC${php}?id=${newsId}`)
    .then(data=>{
      if (data == '["NONE"]') {
        pageFind(0);
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let dataForNextButton = `${newsId},3,1`,
        serverResp = JSON.parse(data),
        html = '';
        
      html = RenderNews(serverResp.gdps,1,backFunc,commBackFunc);

      innerComments(renderComms(serverResp.comments, 3, dataForNextButton), 0);
      getElement('insertable').innerHTML = html;
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getGuides = (wikiId, page)=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  Loading();
  helperRequest(`${sData[7]}getGuides${php}?wiki=${wikiId}&page=${page}`)
    .then(data=>{
      let parsedData = JSON.parse(data),
        page2 = page++,
        html = renderGuideMini(parsedData, page2);
      innerGdpsPlace(html,1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getWikis = (page)=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  Loading();
  helperRequest(`${sData[7]}getWikis${php}?page=${page}`)
    .then(data=>{
      let parsedData = JSON.parse(data),
        page2 = page++,
        html = renderWiki(parsedData, page2);
      innerGdpsPlace(html,1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getGuide = (id, wikiId = 0)=>{
  globalWiki = wikiId;
  let html = pHeader()+
    `<div id=helperContent>`+
      `<h1 id=title></h1>`+
      `<div id=texts></div>`+
      `<div id=innerEDIT class=gdps-forum><button class=loginbtn onclick="pageGuides(${wikiId})"${getTrans('back')}/button></div>`+
      `<div align=center style="margin:8px">`+
        contentSendCommForm(id+',2')+
        `<div id=comments>`+
        `</div>`+
      `</div>`+
    `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getGuide${php}?id=${id}&wiki=${wikiId}`)
    .then(data=>{
      if (data == '["NONE"]') {
        gGuides();
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      setLink('wikiPage='+id+'.'+wikiId);
      let parsedData = JSON.parse(data),
        guideinfo = parsedData['guideinfo'],
        guidedata = parsedData['guidedata'],
        comments = parsedData['comments'],
        html = '';
      getElement('title').innerHTML = guideinfo[1];
      if (guideinfo[3])
        getElement('title').insertAdjacentHTML('afterend', guideinfo[2]);

      guidedata.forEach((div)=>{
        let content = '';
        switch (div[0]) {
          case 'MediaRender':
            content = MediaRender(div[1]);
            break;
          case 'wikiText':
            content = wikiText(div[1]);
            break;
          default :
          case 'Markdown':
            content = Markdown(div[1]);
            break;
        }
        html +=
        `<div class=frameguide>`+
          //`<h2>${div[0]}</h2>`+
          content+
        `</div><br>`;
      });
      html += guideinfo[2];

      getElement('texts').innerHTML = html;

      getElement('comments')
        .insertAdjacentHTML('beforeend',
          renderComms(comments,2,`${id},2,1`)
        );
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getCurrentGuideByTag = (guideId)=>{
  getGuide(guideId, globalWiki);
},
openForum = (forumId)=>{
  contentPreload('', '', 0, 0);
  Loading();
  helperRequest(`${sData[6]}getPosts${php}?id=${forumId}`)
    .then(data=>{
      setLink('forum='+forumId);
      Loading(1);

      let parsedData = JSON.parse(data),
        html = forumRenderMini(parsedData);

      innerGdpsPlace(html);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getForumPost = (forumId, postId)=>{
  contentPreload(`${postId},4`, `openForum(${forumId})`, 0, 0);

  Loading();
  helperRequest(`${sData[6]}getPost${php}?id=${postId}`)
    .then(data=>{
      if (data == '["NONE"]') {
        pageFind(0);
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      setLink('forumPost='+forumId+'.'+postId);
      let dataForNextButton = `${postId},4,1`,
        serverResp = JSON.parse(data),
        html = '';

      html = forumRender(serverResp.post);

      innerComments(renderComms(serverResp.comments, 4, dataForNextButton), 0);
      getElement('insertable').innerHTML = html;
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
// #endregion
// #region перевод "Налету", пожалуйста, не трогайте то что есть, я уже не помню за что какое значение отвечает
translateData = {
},
langList = ['RU', 'EN', 'UA', 'JJ'],
getTrans = (id, renderType = 'text')=>{
  let getText = mainLang[id],
      prefix =  ` data-trans="${id}"`;
  if (getText == undefined)
    if (renderType == 512) {
      getText = id;
      prefix = '';
    } else {
      getText = `<code>getTrans('${id}','${renderType}')</code>`;
      prefix = '';
    }
  if (id == '')
    getText = '';
  try {
    switch (renderType) {
      case 512:           return `${prefix}>${getText}<`;
      case 'text':        return `${prefix}>${getText}<`;
      case 'textButton':  return `${prefix}>${getText}`;
      case 'input':       return `${prefix} placeholder="${getText}">`;
      case 'inputValue':  return `${prefix} value="${getText}">`;
      case 'textarea':    return `${prefix} placeholder="${getText}"><`;
      case 'img':         return `${prefix} src="${getText}"`;
      default:            return getText;
    }
  } catch (err) {
    returnError(err);
    return id;
  }
},
translateReplaceLang = (lang)=>{
  loadLanguage(lang)
    .then(data=>{
      console.time(this);
      let dataTrans = querySelectAll('[data-trans]');
      for (let el of dataTrans) {
        let key = el.getAttribute('data-trans');
      
        switch (el.tagName) {
          case 'IMG':
            el.setAttribute('src', mainLang[key]);
            break;
          case 'INPUT':
          case 'TEXTAREA':
            el.setAttribute('placeholder', mainLang[key]);
            break;
          default:
            el.innerHTML = mainLang[key];
        }
      }
      console.timeEnd(this);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});
},
applyLanguage = (langStr)=>{
  return langStr
    .replace('+helperStrVer+', helperStrVer)
    .replace('+helperBuildNum+', helperBuildNum)
    .replace('+helperUrl+', helperUrl);
},
loadLanguage = (name, autosetup = true)=>{
  return new Promise((resolve, reject)=>{
    Loading(0,0);
    //helperRequest(`${sData[2]}languages/${name}.json`, false, {'Cache-Control':'no-cache, no-store, max-age=0'})
    helperRequest(`/cli/${helperStrVer}/langs/${name}.json`, false, {'Cache-Control':'no-cache, no-store, max-age=0'})
      .then(data=>{

        let newData = data

        if (autosetup) {
          Slocal.set('Lang', newData);
          Slocal.set('LangVer', currentLangVer);
          mainLang = JSON.parse(applyLanguage(newData));
        }
        resolve(newData);
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e);reject(e)});
  })
};
// #endregion
//#region девайс
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
		//_.http.defaultHeaders['device-static'] = staticName;
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
		const canvas = document.createElement('canvas');
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
			const canvas = document.createElement("canvas");
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
// #region вставка в разные куски страницы, функция innerMain упомянута тут, за остальные поясню ниже
innerMain = (textContent, insertType = 0)=>{
  if (!helperMain) 
    return new Error('Cant find main helper ("1st") element! Maybe you broken helperApp?');
  if (insertType == 0) 
    helperMain.innerHTML = textContent;
  else 
    helperMain.insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в правую половину окна профилей, для телефонов замена всего экрана
innerProfile = (textContent)=>{
  if (getElement('profileWindow')) 
    getElement('profileWindow').innerHTML = textContent;
  else 
    return new Error('Cant find "profileWindow" element!');
},
// вставка контента под рамкой поиска
innerGdpsPlace = (textContent, insertType = 0, otherId = '')=>{
  if (!getElement('GDPSesPlace')) 
    return new Error('Cant find "GDPSesPlace" element!');

  if (insertType == 0) // профили
    getElement('GDPSesPlace'+otherId).innerHTML = textContent;
  else if (insertType == 512)
    getElement('GDPSesPlace'+otherId).insertAdjacentHTML('beforebegin', textContent);
  else if (insertType == 511)
    getElement('GDPSesPlace'+otherId).insertAdjacentHTML('afterbegin', textContent);
  else if (insertType >= 1) // в поиске устарел
    getElement('GDPSesPlace'+otherId).insertAdjacentHTML('beforeend', textContent);
  else // в поиске но лучще это
    getElement('GDPSesPlace'+otherId).insertAdjacentHTML('afterend', textContent);
},
// вставка контента в рамку комментариев, прошу обратить внимание ибо у гдпсов она справа, а у гайдов и текстур заполняет весь экран
innerComments = (textContent, insertType = 0)=>{
  if (!getElement('comments')) 
    return new Error('Cant find "comments" element!');
  if (insertType == 0) // при рендере гдпса
    getElement('comments').innerHTML = textContent;
  else 
    // а эт вроде когда "показать больше"
    getElement('comments').insertAdjacentHTML('beforeend', textContent);
},
// вставка контента в рамку гайдов, как попало если что
innerGuides = (textContent, insertType = 0)=>{
  if (!getElement('guidesPlace')) 
    return new Error('Cant find "guidesPlace" element!');
  if (insertType == 0)
    getElement('guidesPlace').insertAdjacentHTML('beforeend',textContent);
  else 
    getElement('guidesPlace').insertAdjacentHTML('afterend',textContent);
},
// #endregion
// #region разные формы
sendRegisterForm = (wId)=>{
  let username = getElement('LGusername').value,
    password = getElement('LGpassword').value,
    email  = getElement('LGemail'   ).value,
    reCAPdatas = document.getElementsByClassName('g-recaptcha-response');
    reCAP = reCAPdatas[reCAPdatas.length-1].value;
    //hcaptcha = getElement(wId+'cap').getAttribute('data-hcaptcha-response');
  if (reCAP || ignoreCap) {
    Loading();
    helperRequest(
      `${sData[5]}register${php}`,
      `username=${username}&password=${password}&email=${email}`+
      `&g-recaptcha-response=${reCAP}`
    )
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
            myGdpses = [{},{},{}];
            Object.keys(serverResp[1][0]).forEach(gdps=>{
              GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
            })
            myguides = [];
            myguides.push(serverResp[1][1]);
            token = thisUser.token;
            Slocal.set('User', token);
            thisUser.token = '';

            getElement('regBtn').remove();
            getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

            if (getElement('regBtn2')) {
              getElement('regBtn2').innerHTML = getTrans('logout', 0);
              getElement('regBtn2').setAttribute('data-trans', 'logout');
              getElement('regBtn2').setAttribute('onclick', 'gLogout()');
            }
            if (getElement('btnLogin2')) {
              getElement('btnLogin2').innerHTML = thisUser.username;
              getElement('btnLogin2').removeAttribute('data-trans');
              getElement('btnLogin2').setAttribute('onclick', 'innerMain(profilePage())');
            }
            innerMain(profilePage());
            querySelectAll('[isloginwindow]').forEach(el=>{
              closeWindow(el.id);
            });
        }
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  } else {
    megaAlert('captchaDed');
  };
},
sendLoginForm = (wId)=>{
  let username = getElement('LGusername').value,
    password = getElement('LGpassword').value,
    reCAPdatas = document.getElementsByClassName('g-recaptcha-response');
    reCAP = reCAPdatas[reCAPdatas.length-1].value;
    //hcaptcha = getElement(wId+'cap').getAttribute('data-hcaptcha-response');
  if (reCAP || ignoreCap) {
    Loading();
    helperRequest(
      `${sData[5]}login${php}`,
      `username=${username}&password=${password}`+
      `&g-recaptcha-response=${reCAP}`
    )
      .then(data=>{
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
            myGdpses = [{},{},{}];
            Object.keys(serverResp[1][0]).forEach(gdps=>{
              GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
            })
            myguides = [];
            myguides.push(serverResp[1][1]);
            token = thisUser.token;
            Slocal.set('User', token);
            thisUser.token = '';

            getElement('regBtn').remove();
            getElement('btnLogin').innerHTML = `<span style="position:absolute;right:0;top:-8px">${thisUser.username}</span>`;

            if (getElement('regBtn2')) {
              getElement('regBtn2').innerHTML = getTrans('logout', 0);
              getElement('regBtn2').setAttribute('data-trans', 'logout');
              getElement('regBtn2').setAttribute('onclick', 'gLogout()');
            }
            if (getElement('btnLogin2')) {
              getElement('btnLogin2').innerHTML = thisUser.username;
              getElement('btnLogin2').removeAttribute('data-trans');
              getElement('btnLogin2').setAttribute('onclick', 'innerMain(profilePage())');
            }
            innerMain(profilePage());
            querySelectAll('[isloginwindow]').forEach(el=>{
              closeWindow(el.id);
            });
        }
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  } else {
    megaAlert('captchaDed');
  };
},
sendDrop = ()=>{
  let email  = getElement('LGemail').value;
  Loading();
  helperRequest(
    `${sData[5]}drop${php}`,
    `email=${email}`
  )
    .then(()=>{
      Loading(1);
      if (thisUser.ID !== 0) {
        innerMain(profilePage());
      } else {
        innerMain(pageMain());
      }
      megaAlert('needEmailVerify');
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
sendVerify = ()=>{
  let code  = getElement('LGcode').value;
  Loading();
  helperRequest(
    `${sData[5]}verify${php}`,
    `code=${code}`
  )
    .then(data=>{
      Loading(1);
      if (thisUser.ID == data) {
        thisUser.isActive = 1;
        innerMain(profilePage());
      } else {
        innerMain(pageMain());
      }
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
gLogout = ()=>{
  Loading();
  helperRequest(`${sData[5]}logout${php}`)
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
      token = undefined;
      innerMain(pageMain());
    });
},

editNickPre = ()=>{
  getElement('newNick').innerHTML =
  `<input class="framelabel" id=newNick2${getTrans('newNick', 'input')}`+
  `<button onclick="editNick()" class=loginbtn${getTrans('edit')}/button>`;
},
editNick = ()=>{
  let newNick = getElement('newNick2').value;
  helperRequest(`${sData[5]}setNickname${php}?name=${newNick}`)
    .then(data=>{
      let timename = thisUser.username.slice();
      thisUser.username = data;
      for (let gdpsType in myGdpses)
        for (let gdpsKey in myGdpses[gdpsType]) 
          if (myGdpses[gdpsType][gdpsKey].userName == timename) 
            myGdpses[gdpsType][gdpsKey].userName = data;

      // потом сделать во всех гдпсах и текстурах
      getElement('oldNick').innerHTML = data;
      getElement('newNick').innerHTML = '';
    })
},

sendLike = (id, channel, isComm = 0)=>{
  if (thisUser.ID === 0)
    return megaAlert('needLogin');

  Loading();
  let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
  helperRequest(`${sData[1]}like${php}`, data)
    .then(data=>{
      let likeValue = JSON.parse(data),
      likePlace = 'likesCount',
      dislPlace = 'dislsCount',
      prefix = '';
      if (isComm) 
        prefix = 'Comm';
      getElement(likePlace + prefix + id).textContent = likeValue[0];
      getElement(dislPlace + prefix + id).textContent = likeValue[1];
      
      repaintLikeButton(id, isComm, 1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});
},
sendDislike = (id, channel, isComm = 0)=>{
  if (thisUser.ID === 0)
    return megaAlert('needLogin');

  Loading();
  let data = 'ide=' + encodeURIComponent(id) + '&type=' + encodeURIComponent(channel);
  helperRequest(`${sData[1]}dislike${php}`, data)
    .then(data=>{
      let likeValue = JSON.parse(data),
      likePlace = 'likesCount',
      dislPlace = 'dislsCount',
      prefix = '';
      if (isComm) 
        prefix = 'Comm';
      getElement(likePlace + prefix + id).textContent = likeValue[0];
      getElement(dislPlace + prefix + id).textContent = likeValue[1];
      
      repaintLikeButton(id, isComm, -1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});
},
repaintLikeButton = (id, isComm, liketype = 0)=>{
  let like = 'like'+id,
      disl = 'dislike'+id;
  if (isComm) {
    like = 'likeComm'+id;
    disl = 'dislikeComm'+id;
  }

  let likeElem = getElement(like),
      dislElem = getElement(disl);

  if (likeElem.style.filter == '' && dislElem.style.filter == '') {
    if (liketype == -1)
      dislElem.setAttribute('style', likeStyle.disl);
    else 
      likeElem.setAttribute('style', likeStyle.like);
    return;
  }
  if (likeElem.style.filter != '')
    likeElem.setAttribute('style', '');
  if (dislElem.style.filter != '')
    dislElem.setAttribute('style', '');
},
sendComm = (id, channel)=>{
  if (thisUser.ID === 0)
    return;

  Loading();
  let dataForNextButton = `${id},'${channel}',1`,
    commText = getElement('text').value,
    data =
    'ide='   + encodeURIComponent(id)
  + '&type=' + encodeURIComponent(channel)
  + '&text=' + encodeURIComponent(commText);
  helperRequest(`${sData[1]}comment${php}`, data)
    .then(data=>{
      Loading(1);
      if (data == '-4') {
        megaAlert('commSizeFail');
        return;
      }
      let serverResp = JSON.parse(data);

      innerComments(renderComms(serverResp,channel,dataForNextButton), 0);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
editComm = (id, channel)=>{
  if (getElement('commEdit'+id) !== null)
    return;
  openWindow('commEdit',
    `<textarea class=framelabel style=width:250px id=editText-C${id}>${getElement('commText'+id).textContent}</textarea><br>`+
    basicButton(getTrans('commSend'), `modifyComm(${id},${channel})`)
  , 'commEdit'+id);
},
modifyComm = (id, channel)=>{
  let text = getElement('editText-C'+id).value,
      data = `id=${id}&type=${channel}&text=${text}`;
  Loading();
  helperRequest(`${sData[1]}commentModify${php}`, data)
    .then(data=>{
      Loading(1);
      closeWindow(querySelect(`[commEdit${id}]`).id);
      if (data == '-4') {
        megaAlert('commSizeFail');
        return;
      }
      if (data == '-3') {
        megaAlert('newsNone');
        return;
      }
      if (data != '')
        if (getElement('commText'+id))
          getElement('commText'+id).textContent = data;
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
deleteComm = (id, channel)=>{
  Loading();
  helperRequest(`${sData[4]}comment${php}?ide=${id}&type=${channel}`)
    .then(data=>{
      if (data == '-1')
        return returnError('Access denied');
      getElement('comm'+data).remove();
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
editNews = (id, gdpsId)=>{
  if (getElement('newsEdit'+id) !== null)
    return;
  Loading();
  helperRequest(`${sData[0]}newsC${php}?id=${id}`)
    .then(data=>{
      Loading(1);
      let parsedData = JSON.parse(data),
          title = parsedData.gdps['n'+id].title,
          text = parsedData.gdps['n'+id].text.replaceAll('<br>', '\n');
      openWindow('newsEdit',
        `<input class=framelabel style=width:250px id=editNews1-N${id} value="${title}"><br>`+
        `<textarea class=framelabel style=width:250px id=editNews2-N${id}>${text}</textarea><br>`+
        basicButton(getTrans('commSend'), `modifyNews(${id},${gdpsId})`)
      , 'newsEdit'+id);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  
},
modifyNews = (id, gdpsId)=>{
  let title = getElement('editNews1-N'+id).value,
      text = getElement('editNews2-N'+id).value,
      data = `id=${id}&gdps=${gdpsId}&title=${title}&text=${text}`;
  console.log(title, text);

  Loading();
  helperRequest(`${sData[1]}newsModify${php}`, data)
    .then(data=>{
      Loading(1);
      closeWindow(querySelect(`[newsEdit${id}]`).id);
      if (data == '-3') {
        megaAlert('newsNone');
        return;
      }
      let parsedData = JSON.parse(data);
      let text = Markdown(parsedData[1]);
      if (data != '')
        if (getElement('news'+id)) {
          getElement('Ntitle'+id).textContent = parsedData[0];
          getElement('Ntext'+id).innerHTML = text;
        }
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
deleteNews = (id, goBack)=>{
  Loading();
  helperRequest(`${sData[4]}newsPost${php}?ide=${id}`)
    .then(data=>{
      if (data == '-1')
        return returnError('Access denied');
      getElement('news'+data).remove();
      goBack ? history.back() : null;
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
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
    `<button id=btnLogin style="margin-left:12px" class="emptybtn" onclick="switchLogin(32,'')">`+
      `<span styllle=position:absolute;right:0;top:-8px${getTrans('login')}/span>`;
    regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="registerPage()"${getTrans('register')}/button>`;
    loginBtnMobile =
    `<button id=btnLogin2 class="loginbtn" onclick="loginPage()">`+
      `<span${getTrans('login')}/span>`;
  } else {
    regBtn = ``;
    loginBtn =
    `<button id=btnLogin styllle="position:relative;width:20px;height:16px;margin-left:20px" class="emptybtn" onclick="switchLogin(32,'')">`+
      `<span styllle=position:absolute;right:0;top:-8px>${thisUser.username}</span>`;
    regBtnMobile = `<button id=regBtn2 class="loginbtn" onclick="gLogout()"${getTrans('logout')}/button>`;
    loginBtnMobile =
    `<button id=btnLogin2 styllle=position:relative class="loginbtn" onclick="innerMain(profilePage());switchMobileMain()">`+
      `<span>${thisUser.username}</span>`;
  }

  // (thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')

  if (thisUser.hasAlarms === 1) {
    loginBtn += `<span style="position:absolute;top:-14px;right:-6px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
    loginBtnMobile += `<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>`;
  }
  loginBtn += `</button>`;
  loginBtnMobile += `</button>`;

  let html =
  `<div class="header" id=helperMaster align="left">`+
    `<nodiv id=switchHtmlLang style=position:relative>`+
      `<button onclick="switchLang()" style="width:40px" class="emptybtn">`+
        `<img data-trans="src" src="${helperUrl}${mainLang.src}" width=40px style="padding-bottom:6px;margin-top:6px">`+
      `</button>`+ // !ПОИСК! switchLang = function
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
pageMain = (ignore = false)=>{
  if (!ignore)
    setLink('');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div style="background-color:var(--color-profile)">`+
      `<div class=contentAdaptiveFlexSmall style=position:relative;align-items:center;justify-content:center;overflow:hidden>`+
        `<div style=position:relative;width:35vw;height:415px;z-index:2>`+
          `<p style="width:500px;margin:8px;text-shadow: 0px 0px 16px var(--color-black);font-size:calc(var(--def-font)*2.5);color:var(--color-light)"${getTrans('T2-hi')}/p>`+
          `<h1 style="width:500px;margin:8px;text-shadow: 0px 0px 16px var(--color-light);font-size:calc(var(--def-font)*5)"${getTrans('ojhubname')}/h1>`+
          `<h2 style="width:500px;margin:8px;text-shadow: 0px 0px 16px var(--color-black);font-size:calc(var(--def-font)*2)"${getTrans('hubMaster')}/h2>`+
        `</div>`+
        `<div style=position:relative;width:35vw;height:415px;z-index:1>`+
          `<img src="${helperUrl}imgs/gem.png" height=272px style="position:absolute;right:260px;top:170px">`+
          `<img src="${helperUrl}imgs/gasi.png" height=298px style="position:absolute;right:170px;top:120px;transform:rotate(-3deg)">`+
          `<img src="${helperUrl}imgs/share.png" height=384px style="position:absolute;right:-70px;top:31px;transform:rotate(0deg)">`+
        `</div>`+
        `<img src="${helperUrl}imgs/hubbig.png" style="position:absolute;left:10vw;width:40vw;top:calc(210px - 20vw);opacity:20%">`+
        //`<div style=height:450px></div>`+
      `</div>`+
      `<div class=contentAdaptiveSmall align=center style=position:relative;overflow:hidden>`+
        `<div style=z-index:2>`+
          `<h2 style="text-shadow: 0px 0px 16px var(--color-black);margin:8px;color:var(--color-main)"${getTrans('T2-hi')}/h2>`+
          `<h1 style="text-shadow: 0px 0px 16px var(--color-light);margin:8px"${getTrans('ojhubname')}/h1>`+
          `<p style="text-shadow: 0px 0px 16px var(--color-black)"${getTrans('hubMaster')}/p>`+
        `</div>`+
        `<img src="${helperUrl}imgs/hubbig.png" style="position:absolute;left:30vw;width:40vw;top:calc(110px - 20vw);opacity:20%">`+
      `</div>`+
    `</div>`+
    `<div class=frameprofile style="margin-top:40px">`+
      `<div align=center style=display:flex;flex-wrap:wrap;justify-content:center>`+
        `<div class=mainPlate>`+
          `<div class=contentAdaptiveBig id=doom >`+
            `<img onclick=playDoom() height=300px style=transform:scale(-1,1) src="${helperUrl}imgs/gasi.png">`+
          `</div>`+
          `<div class=framegdpsOld align=left style=text-align:left;position:relative;overflow:hidden>`+
            `<h2 style=margin-bottom:2px${getTrans('T2-promo1')}/h2>`+
            `<p style=font-size:var(--def-font);max-width:500px${getTrans('T2-promo2')}/p>`+
            `<p style=font-size:var(--def-font);opacity:75%;max-width:500px${getTrans('T2-promo3')}/p>`+
            `<div class=absolute style=bottom:8px>`+
              basicButton(getTrans('searchCamps'), `pageFind(0)`)+
              basicButton(getTrans('searchShows'), `pageFind(1)`)+
            `</div>`+
            `<img style=margin:0;position:absolute;top:-30px;right:20px;opacity:20% src=${helperUrl}imgs/gdpsnew.svg width=400px>`+
          `</div>`+
        `</div>`+
        `<div class=mainPlate>`+
          `<div class=framegdpsOld align=right style=text-align:right;position:relative;overflow:hidden>`+
            `<h2 style=margin-bottom:2px${getTrans('T1-insertAbout')}/h2>`+
            `<p style=font-size:var(--def-font);max-width:500px;display:inline-block${getTrans('T1-insertHelp')}/p>`+
            `<div class=absolute style=bottom:8px>`+
              basicButton(getTrans('login'), (thisUser.ID == 0 ? 'loginPage()' : 'innerMain(profilePage())'))+
              basicButton(getTrans('register'), (thisUser.ID == 0 ? 'registerPage()' : 'innerMain(profilePage())'))+
            `</div>`+
            `<img style=margin:0;position:absolute;top:-20px;left:20px;opacity:20% src=${helperUrl}imgs/folder.svg width=400px>`+
          `</div>`+
          `<img class=contentAdaptiveBig height=300px src="${helperUrl}imgs/gem.png">`+
        `</div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
playDoom = ()=>{
  getElement('doom').style.padding = '4vh';
  getElement('doom').innerHTML = `<video style=width:260px autoplay src=\"${helperUrl}build2000.mp4\"></video>`; // вау вы нашли пасхалку
},
pageFind = (channel)=>{
  if (helperFindData[3] == -1) {
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
    }
    for (let tag in Tags[num]) {
      if (num == 2)
        customTag = 'Peretag'+tag;
      tags += renderTagSearch(Tags[num], TagsStr, tag, customTag);
    }
    for (let os in Os[num]) {
      if (num == 2)
        customTag = 'Peretag'+os;
      oss += renderTagSearch(Os[num], OsStr, os, customTag);
    }
    tagsDiv += `<div id=tags${num} ${num != channel ? 'style=display:none' : ''}>`+
    `<label${getTrans('tags0'+num)}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        tags+
      `</div>`+
      `<label${getTrans('os0'+num)}/label>:<br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        oss+
      `</div>`+
    `</div>`;
    tags = '';
    oss = '';
  }
  helperFindData = [3,[],[],channel];
  setLink('find='+channel);
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center style=color:var(--color-white);margin-bottom:10px${getTrans('ojhubname')}/h1>`+
    `<div id=finder align=left class="frameprofile">`+
      `<h1${getTrans('finder-name')}/h1>`+
      `<p${getTrans('finder-channel')}/p>`+
      `<span${getTrans('searchCamps')}/span> ${radioInput('campRadio', 'channel', channel == 0, `onchange="modifyFindTags(0)"`)}<br>`+
      `<span${getTrans('searchShows')}/span> ${radioInput('showRadio', 'channel', channel == 1, `onchange="modifyFindTags(1)"`)}<br>`+
      `<span${getTrans('searchPeres')}/span> ${radioInput('pereRadio', 'channel', channel == 2, `onchange="modifyFindTags(2)"`)}<br><br>`+
      `<label${getTrans('findByName')}/label>:<br>`+
      `<input type=text id=gdpsNameInput class=framelabel style=width:250px${getTrans('findName', 'input')}<br><br>`+

      tagsDiv+

      `<label${getTrans('Text;Tags')}/label><br>`+
      renderTextOrTags()+'<br>'+

      `<label${getTrans('otherSort')}/label><br>`+
      `<div style=display:flex;flex-wrap:wrap>`+
        `<label onclick=setMethod(3) id=method3 class=tagSel${getTrans('search1')}/label>`+
        `<label onclick=setMethod(0) id=method0 class=tagPre${getTrans('search4')}/label>`+
        `<label onclick=setMethod(1) id=method1 class=tagPre${getTrans('mostLike')}/label>`+
        `<label onclick=setMethod(2) id=method2 class=tagPre${getTrans('mostDisl')}/label>`+
      `</div>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
      CacheFinds[1]+
    `</div>`+
    insertBtn(`sendFinder(${CacheFinds[3]},'${CacheFinds[2]}')`)+
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
  setLink('wikis');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center style=color:var(--color-white);margin-bottom:10px${getTrans('ojhubname')}/h1>`+
    `<div id=finder align=left class="frameprofile">`+
      `<h1 align=center>`+
        `<span${getTrans('guides09')}/span>`+
        (thisUser.ID !== 0 ? ' <button class=loginbtn onclick="createWiki()">+</button>' : '')+
      `</h1>`+
      `<label${getTrans('findByName')}/label>:<br>`+
      `<input type=text id=gdpsNameInput class=framelabel style=width:190px${getTrans('wikiName', 'input')}<br><br>`+
    `</div>`+
    `<div class=gdps-list-place id=GDPSesPlace style="margin-top:35px">`+
    `</div>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getWikis${php}`)
    .then(data=>{
      let parsedData = JSON.parse(data),
        html = renderWiki(parsedData);
      innerGdpsPlace(html);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
pageGuides = (wiki, backButton = '')=>{
  if (backButton !== '')
    backButton = `<div class=gdps-forum><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button></div>`;

  if (typeof(wiki) === 'undefined')
    return pageWikiList();
  setLink('wiki='+wiki);
  globalWiki = wiki;
  let html = pHeader()+
  `<div id=helperContent>`+
    `<h1 align=center>`+
      `<span id=wikiName></span>`+
      ` <span${getTrans('guides09')}/span>`+
      (checkWikiOwn(wiki) ? ' <button class=loginbtn onclick="createGuide('+wiki+')">+</button>' : '')+
    `</h1>`+
    backButton+
    `<div class=gdps-list-place id=GDPSesPlace>`+
    `</div>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[7]}getWiki${php}?wiki=${wiki}`)
    .then(data=>{
      let parsedData = JSON.parse(data),
        html = renderGuideMini(parsedData);
      innerGdpsPlace(html);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
globalNews = ()=>{
  innerMain(gdpsNewsPage());
  Loading();
  helperRequest(`${sData[0]}newsAll${php}?page=0`)
    .then(data => {
      setLink('news');
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
            gdpssCount = campsCount + showsCount + peresCount;
        if (gdpssCount !== 0)
          innerGdpsPlace(`<div class=framegdps>`+newsWindow()+`</div>`, 511);
      };
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
uvazuha = ()=>{
  setLink('special');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div align=center>`+
      `<h1${getTrans('ojhubname')}/h1>`+
      `<h2${getTrans('special00')}/h2>`+
      `<div class=frameguide align=left>`+
        `<p>DenisC -   <span${getTrans('special01')}/span></p>`+
        `<p>Vustur -  <span ${getTrans('special03')}/span></p>`+
        `<p>MIOBOMB -  <span${getTrans('special04')}/span></p>`+
        `<p>Qundikus - <span${getTrans('special05')}/span></p>`+
        `<p>glorius -  <span${getTrans('special09')}/span></p>`+
        `<p>M41den -  <span ${getTrans('special10')}/span></p>`+
      `</div>`+
      `<h2${getTrans('special11')}/h2>`+
      `<div class=frameguide align=left>`+
        `<p>Ikotik -   <span${getTrans('special12')}/span></p>`+
        `<p>Олег -     <span${getTrans('special13')}/span></p>`+
        `<h2${getTrans('special08')}/h2>`+
        `<br><br>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
helperAbout = ()=>{
  setLink('about');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style=text-align:left>`+
      `<h1${getTrans('aboutHelper')}/h1>`+
      `<h2${getTrans('history01')}/h2>`+
      `<p${getTrans('history02')}/p>`+
      `<p${getTrans('history03')}/p>`+
      `<button class=loginbtn onclick="innerMain(uvazuha())"${getTrans('HLthanks')}/button>`+
      `<h2${getTrans('helperSocials')}/h2>`+
      `<a class=loginbtn href="https://discord.gg/zetb62mqsS" target=_blank${getTrans('helperDs')}/a> `+
      `<a class=loginbtn href="https://t.me/objecthub" target=_blank${getTrans('helperTg')}/a> `+
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
      backFunc = 'helperNews';
      lastFunc = '/';
      renderNazad = false;
      break;
  }
  innerMain(gdpsNewsPage(renderNazad, gdpsId, backFunc));
  Loading();
  helperRequest(`${sData[0]}news${php}?id=${gdpsInt}`)
    .then(data=>{
      setLink('newsList='+gdpsId+'|'+renderOwnButton);
      Loading(1);
      if (data == '{}') {
        innerGdpsPlace(`<h1${getTrans('newsNone')}/h1>`, 1);
      } else {
        let parsedData = JSON.parse(data.replaceAll('s117','117'));
        innerGdpsPlace(RenderNews(parsedData,0,backFunc));
        if (Object.keys(parsedData).length > 10)
          innerGdpsPlace(insertBtn(`loadMoreNews(${gdpsInt},'${backFunc}',1)`), 1);
        if (parseInt(renderOwnButton))
          innerGdpsPlace(`<div class=framegdps>`+newsWindow(gdpsId)+`</div>`, 511);
      };
      Consoles.log(renderOwnButton);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
setImgSize = ()=>{
  let offset = 0;
  if (window.innerWidth >= 700) { // large screen
    if (getElement('imageBG')) {
      getElement('imageBG').style = '';
      let alphaY = getElement('imageBG').getBoundingClientRect().height - 2;
      getElement('gdpsalpha').style = `z-index:-5;position:absolute;top:${alphaY}px`;
      return;
    }
  } else if(getElement('gdpsalpha')) { // small screen
    getElement('gdpsalpha').style = `z-index:-5`;
    offset = -6;
  }
  if (getElement('gdpsalpha')) {
    let darkElement = getElement('gdpsalpha').getBoundingClientRect(),
    imgposY = darkElement.y + offset,
    imgposX = imgposY * 2.4;

    getElement('imageBG').style.width = imgposX+'px';
    getElement('imageBG').style.height = imgposY+'px';
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
    `<div style="display:flex; flex-wrap:wrap">`+
      (renderNews ? 
      `<div style=overflow:auto align=center class=adaptiveNews id="news"></div>`+
      `<div class=gdpsnewsalpha></div>`
      : '')+
      `<div style=overflow:auto;flex:50%>`+
        contentSendCommForm(sendCommData)+
        `<div id="comments"></div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  innerMain(html);
},
insertBtn = (lastUse, transText = 'showMore', useRemover = 1)=>{// кнопка "показать больше"
  return `<div ${useRemover === 1 ? 'id=nextGdps ' : ''}class=gdps-helper align=center>`+
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
      `<input id=LGpassword class=framelabel maxlength=64 minlength=5 name=password type=password${getTrans('login02', 'input')}<br><br>`+
      `<input class=loginbtn type=submit${getTrans('submit', 'inputValue')}<br><br>`+
    `</form>`+
  `</div>`;
  return html;
},
profilePage = (innerHtnl = gProfileMini())=>{
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class=frameprofile style="margin:0;height:100%">`+
      `<button style="position:absolute;top:80px;right:5px" class="contentAdaptiveSmall loginbtn" onclick="profileSwitcherPhone()">`+
        `<div style="transform:rotate(90deg)">|||</div>`+
      `</button>`+
      `<div id="phoneSelector" class=contentAdaptiveBig style="position:absolute;top:15px;width:235px" align="left">`+
        `<button class=loginbtn onclick="innerProfile(gProfileMini())"${getTrans('profile')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(alarmsWindow());GetAlarms()" style=position:relative${getTrans('Alarms', 'textButton')}`+
        (thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
        `</button><br><br>`+
        `<button class=loginbtn onclick="profileDevices()"${getTrans('devices')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(0))"${getTrans('yourCamps')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(1))"${getTrans('yourShows')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(2))"${getTrans('yourPeres')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile(wikisWindow())"${getTrans('yourWikis')}/button><br><br>`+
        `<button class=loginbtn onclick="innerProfile();clrEditPage()"${getTrans('settings000')}/button><br><br>`+
      `</div>`+
      `<div id="phoneSelectorSmall" class=contentAdaptiveSmall style=display:none>`+
        `<button class=loginbtn onclick="innerProfile(gProfileMini());profileSwitcherPhone()"${getTrans('profile')}/button>`+
        `<button class=loginbtn onclick="innerProfile(alarmsWindow());profileSwitcherPhone();GetAlarms()" style=position:relative${getTrans('Alarms', 'textButton')}`+
        (thisUser.hasAlarms == 1 ? '<span style="position:absolute;top:-4px;right:-4px;border:solid red 5px;border-radius:var(--def-border-small)"></span>' : '')+
        `</button>`+
        `<button class=loginbtn onclick="profileDevices();profileSwitcherPhone()"${getTrans('devices')}/button>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(0));profileSwitcherPhone()"${getTrans('yourCamps')}/button>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(1));profileSwitcherPhone()"${getTrans('yourShows')}/button>`+
        `<button class=loginbtn onclick="innerProfile(findsWindow(2));profileSwitcherPhone()"${getTrans('yourPeres')}/button>`+
        `<button class=loginbtn onclick="innerProfile(wikisWindow());profileSwitcherPhone()"${getTrans('yourWikis')}/button>`+
        `<button class=loginbtn onclick="innerProfile();clrEditPage();profileSwitcherPhone()"${getTrans('settings000')}/button>`+
      `</div>`+
      `<div class=profileMobileRightWindow id="profileWindow" align="left">`+
        innerHtnl+
      `</div>`+
      `<p align=right${getTrans('helperVer')}/p>`+
    `</div>`+
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

removeAlarm = (id)=>{
  Loading();
  helperRequest(`${sData[1]}deleteAlarm${php}?id=${id}`)
  .then(()=>{
    getElement('btn'+id).remove();
    getElement('fullAlarm').remove();
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
JEedit = (gdpsId)=>{
  Loading();
  helperRequest(`${sData[1]}setj${php}?id=${gdpsId}`)
    .then(data=>{
      if (data == '-2')
        return returnError('Access denied');
      getElement('JE'+gdpsId).innerHTML = getTrans(data, 0);
      Loading(1);
    });
},
ballsUp = (gdpsId, type = 'g')=>{
  Loading();
  helperRequest(`${sData[1]}bump${php}?id=${gdpsId}`)
    .then(data=>{
      if (data == 'no') 
        return getElement('BL'+gdpsId).innerHTML = getTrans('campunckecked', 0);
      let pData = JSON.parse(data),
        canBump;
      if (pData[2] > 0) {
        canBump = `<span${getTrans('isBL')}/span>`;
      } else {
        canBump = `<span${getTrans('wait1')}/span>${Math.abs(pData[2])}<span${getTrans('wait2')}/wait>`;
        if (pData[2] == -7200) {
          megaAlert('bumped');
          myGdpses[ProjectsChannel][gdpsId].points = pData[0];
        }
      }
      getElement('BL'+gdpsId).innerHTML = canBump;
      Loading(1);
    });
},
coownersMenu = (id, contentType)=>{
  Loading();
  helperRequest(`${sData[0]}getOwners${php}?id=${id}&type=${contentType}`)
    .then(data=>{
      switch (contentType) {
        case 1: setLink('campOwn='+id); break;
        case 2: setLink('showOwn='+id); break;
        case 3: setLink('wikiOwn='+id); break;
        
      }
      let parsedData = JSON.parse(data),
        html = 
      `<div id=helperContentProfile>`+
        `<div>`+
          `<h1><span${getTrans('coowners')}/span> ${parsedData[0]}</h1>`+
          `<table id=comments>`+
            `<tr>`+
              `<td${getTrans('profName')}/td>`+
              `<td${getTrans('delete')}/td>`+
            `</tr>`;

      parsedData[1].forEach(arrat=>{
        html +=
            `<tr id=perm${arrat[1]}>`+
              `<td>`+
                arrat[0]+
              `</td>`+
              `<td>`+
                `<button class=loginbtn onclick="deleteOwner(${id},${contentType},${arrat[1]})"${getTrans('delete')}/button>`+
              `</td>`+
            `</tr>`;
      });

      html += 
          `</table><br><br>`+
          `<input style="width:120px" id="addown" class="framelabel"${getTrans('idOrName', 'input')}`+
          `<button class="loginbtn" onclick="ownersAdd(${id},${contentType})">+</button>`+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
ownersAdd = (id, contentType)=>{
  let userData = getElement('addown').value;
  Loading();
  helperRequest(`${sData[1]}permAdd${php}?gdps=${id}&type=${contentType}&user=${userData}`)
    .then(data=>{
      if (data == '-2')
        return returnError('Access denied');
      let parsedData = JSON.parse(data),
        html =
        `<tr id=perm${parsedData[1]}>`+
          `<td>`+
          parsedData[0]+
          `</td>`+
          `<td>`+
            `<button class=loginbtn onclick="deleteOwner(${id},${contentType},${parsedData[1]})"${getTrans('delete')}/button>`+
          `</td>`+
        `</tr>`;
      innerComments(html, 1);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
deleteOwner = (contentId, contentType, userId)=>{
  Loading();
  helperRequest(`${sData[1]}perm${php}?gdps=${contentId}&type=${contentType}&id=${userId}`)
    .then(data=>{
      if (data == '-2')
        return returnError('Access denied');
      getElement('perm'+userId).remove();
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getJoinLog = (gdpsId)=>{ // legacy
  Loading();
  helperRequest(`${sData[0]}getJoinLog${php}?id=${gdpsId}`)
    .then(data=>{
      setLink('gdpsLog='+gdpsId);
      let parsedData = JSON.parse(data),
        html = 
      `<div id=helperContentProfile>`+
        `<div>`+
          `<h1><span${getTrans('joinsTo')}/span> ${parsedData[0][0]}</h1>`+
          `<table>`;
      parsedData.forEach(arrat=>{
        if (arrat[1] !== 'Microwave') {
          html +=
            `<tr>`+
              `<td>`+
                arrat[0]+
              `</td>`+
              `<td>`+
                timeAgo(arrat[1])+
              `</td>`+
              `<td>`+
                arrat[2]+
              `</td>`+
            `</tr>`;
        }
      });
      html += 
          `</table>`+
        `</div>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
mediaselector = (id, inputtype)=>{
  let fileTrans = '';
  if (id === 'img')
    fileTrans = 'Picture01';
  else 
    fileTrans = 'Picture02';

  if (inputtype === 'toimg') {
    getElement('mediaselector'+id).innerHTML = 
    `<input type=text class=framelabel name=${id} style=width:40%${getTrans('campInput04', 'input')}`+
    `<button class=loginbtn onclick="mediaselector('${id}','tofile')"${getTrans('campInput07')}/button>`;
  } else {
    getElement('mediaselector'+id).innerHTML = 
    `<input type=file class=framelabel name=${id} style=width:40%>`+
    `<button class=loginbtn onclick="mediaselector('${id}','toimg')"${getTrans('campInput08')}/button>`+
    `<br><span style=opacity:50%${getTrans(fileTrans)}/span>`;
  }
},
generateSocialNetworks = (HTMelement, editModeValue = '')=>{
  if (querySelectAll(`[socialnetwork=${HTMelement.value}]`).length == 0)
    switch (HTMelement.value) {
      case 'telegram':
        innerGdpsPlace(
          socialNetwork('telegram', editModeValue)
        ,1);
        break;
      case 'youtube':
        innerGdpsPlace(
          socialNetwork('youtube', editModeValue)
        ,1);
        break;
      default:
      case 'discord':
        innerGdpsPlace(
          socialNetwork('discord', editModeValue)
        ,1);
        break;
    }
},
socialNetwork = (type, value)=>{
  return `<div style=display:flex>`+
    `<input type=hidden name=links[] value="${type}">`+
    `<input class=framelabel type=text name=links[] socialnetwork=${type} value="${value}" style=width:100% required placeholder=${type}>`+
    `<button class=loginbtn onclick=this.parentElement.remove()>-</buttin>`+
  `</div>`;
},
tryAddShow = ()=>{
  let links = document.getElementsByName('links[]').length,
      tags = querySelectAll('[name="tags[]"]:checked').length,
      os = querySelectAll('[name="os[]"]:checked').length;
  Consoles.log(links);
  if (links === 0) {
    megaAlert('linkRequired');
    return false;
  }
  Consoles.log(tags, os);
  if (tags === 0 || os === 0) {
    megaAlert('tagsRequired');
    return false;
  }
  return true;
},
addFind = (channel)=>{
  let smallString = 'camp',
      bigString = 'Camp',
      tags = '',
      oss = '',
      langs = '';
      switch (channel) {
        case 1:
          smallString = 'show';
          bigString = 'Show';
          break;
        case 2:
          smallString = 'pere';
          bigString = 'Pere';
          break;
      }
  for (let tag in Tags[channel]) {
    tags += renderTagAdding(Tags[channel], 'tags', tag);
  }
  for (let os in Os[channel]) {
    oss += renderTagAdding(Os[channel], 'os', os);
  }
  langList.forEach(lang=>{
    langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
  });
  setLink('add'+bigString);
  let html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('add'+bigString)}/h1>`+
    `<form method=POST enctype="multipart/form-data" action='${smallString}Add${php}' onsubmit="if (tryAddShow()) return enterFormData(this,'${smallString}Add${php}');else return false;">`+
      `<label${getTrans('add'+bigString+'01')}/label><br><input class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+
      `<label${getTrans('add'+bigString+'02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans(smallString+'Input02', 'textarea')}/textarea><br>`+
      `<label${getTrans('add'+bigString+'03')}/label><br>`+
      `<div id=GDPSesPlace></div>`+
      `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
        `<option selected disabled hidden${getTrans('add'+bigString+'03a')}/option>`+

        `<option value=youtube>youtube</option>`+
        `<option value=discord>discord</option>`+
        `<option value=telegram>telegram</option>`+
      `</select><br>`+

      `<label${getTrans('gdpsLang00')}/label><br>`+
      `<select id="langs" class="framelabel" name="language" required>`+
        langs+
      `</select><br><br>`+

      `<h2${getTrans(smallString+'Input06')}/h2>`+
      `<label${getTrans('add'+bigString+'04')}/label><br>`+
      `<div id=mediaselectorimg>`+
        `<input class=framelabel type=text name=img style=width:40%${getTrans(smallString+'Input04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans(smallString+'Input07')}/button>`+
      `</div><br>`+
      `<label${getTrans('add'+bigString+'07')}/label><br>`+
      `<div id=mediaselectorban>`+
        `<input class=framelabel type=text name=ban style=width:40%${getTrans(smallString+'Input04', 'input')}`+
        `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans(smallString+'Input07')}/button>`+
      `</div><br><br>`+

      `<label${getTrans('add'+bigString+'05')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        tags+
      `</div><br>`+
      `<label${getTrans('add'+bigString+'06')}/label><br>`+
      `<div style="display:flex;flex-wrap:wrap">`+
        oss+
      `</div><br><br>`+
      `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('add'+bigString, 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},
editFind = (channel, gdpsId)=>{
  Loading();
  let html = ``,
      smallString = 'camp',
      bigString = 'Camp';
      switch (channel) {
        case 1:
          smallString = 'show';
          bigString = 'Show';
          break;
        case 2:
          smallString = 'pere';
          bigString = 'Pere';
          break;
      }
  helperRequest(`${sData[1]}${smallString}Edit${php}?id=${gdpsId}`)
  .then (data=>{
    setLink('edit'+bigString+'='+gdpsId);
    let parsedData = JSON.parse(data),
      title = parsedData[0],
      description = parsedData[1],
      links = parsedData[2];
    if (links.startsWith('{'))
      links = JSON.parse(parsedData[2]);
    let 
      image = parsedData[3],
      banner = parsedData[4],
      TagsLocal = JSON.parse(parsedData[5]),
      os = JSON.parse(parsedData[6]),
      tags = TagsLocal.concat(os),
      lang = parsedData[7],
      fileWarning = '',
      tagss = '',
      oss = '',
      linksStr = '',
      langs = '';
    for (let tag in Tags[channel]) {
      console.log(tag);
      let checked = tags.includes(tag) ? ' checked' : '';
      tagss += renderTagAdding(Tags[channel], 'tags', tag, checked);
    }
    for (let os in Os[channel]) {
      let checked = tags.includes(os) ? ' checked' : '';
      oss += renderTagAdding(Os[channel], 'os', os, checked);
    }
    langList.forEach(lang=>{
      langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
    });
    if (typeof links === 'object')
      for (let link in links) {
        linksStr += socialNetwork(link, links[link]);
      }
    else 
      linksStr += socialNetwork('youtube', links);

    if (image.includes('./imgs/customuser/') || banner.includes('./imgs/customuser/'))
      fileWarning = 'fileWarning';

    html = 
    `<div id=helperContentProfile>`+
      `<h1${getTrans('edit'+bigString)}/h1>`+
      `<form method=POST enctype="multipart/form-data" action='${smallString}Edit${php}' onsubmit="return enterFormData(this,'${smallString}Edit${php}?id=${gdpsId}')">`+
        `<label${getTrans('add'+bigString+'01')}/label><br><input value="${title}" class=framelabel type=text name=title style=width:100% required${getTrans(smallString+'Input01', 'input')}<br>`+
        `<label${getTrans('add'+bigString+'02')}/label><br><textarea class=framelabel name=description style=width:100% required${getTrans(smallString+'Input02', 'input')}${description}</textarea><br>`+
        `<label${getTrans('add'+bigString+'03')}/label><br>`+
        `<div id=GDPSesPlace>`+
          linksStr+
        `</div>`+
        `<select id=framesSelector class=framelabel required onchange=generateSocialNetworks(this)>`+
          `<option selected disabled hidden${getTrans('add'+bigString+'03a')}/option>`+

          `<option value=youtube>youtube</option>`+
          `<option value=discord>discord</option>`+
          `<option value=telegram>telegram</option>`+
        `</select><br>`+
        
        `<label${getTrans('gdpsLang00')}/label><br>`+
        `<select id="langs" class="framelabel" name="language" required>`+
          langs+
        `</select><br><br>`+

        `<h2${getTrans(smallString+'Input06')}/h2>`+
        (fileWarning ? `<p${getTrans('fileWarning')}/p>` : '')+
        `<label${getTrans('add'+bigString+'04')}/label><br>`+
        `<div id=mediaselectorimg>`+
          `<input value="${image}" class=framelabel type=text name=img style=width:40%${getTrans(smallString+'Input04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('img','tofile')"${getTrans(smallString+'Input07')}/button>`+
        `</div><br>`+
        `<label${getTrans('add'+bigString+'07')}/label><br>`+
        `<div id=mediaselectorban>`+
          `<input value="${banner}" class=framelabel type=text name=ban style=width:40%${getTrans(smallString+'Input04', 'input')}`+
          `<button class=loginbtn onclick="mediaselector('ban','tofile')"${getTrans(smallString+'Input07')}/button>`+
        `</div><br><br>`+
    
        `<label${getTrans('add'+bigString+'05')}/label><br>`+        
        `<div style="display:flex;flex-wrap:wrap">`+
          tagss+
        `</div><br>`+
        `<label${getTrans('add'+bigString+'06')}/label><br>`+
        `<div style="display:flex;flex-wrap:wrap">`+
          oss+
        `</div><br><br>`+
        `<input formenctype="multipart/form-data" type=submit class=loginbtn${getTrans('edit'+bigString, 'inputValue')}<br>`+
        `<p${getTrans('after'+bigString)}/p><br>`+
      `</form>`+
    `</div>`;
    innerProfile(html);
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
createWiki = (backpage = 0)=>{
  setLink('wikiNew');
  let langs = '';
  langList.forEach(lang=>{
    langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
  });
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(wikisWindow()))` : `pageWikiList()`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'newWiki${php}')">`+
      `<input name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        langs+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<textarea name=text style=width:100%;height:240px class=guidInp style=width:210px${getTrans('textInput02', 'textarea')}/textarea><br>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
},
editWiki = (wikiId, backpage = 0)=>{
  let langs = '';
  langList.forEach(lang=>{
    langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
  });
  let html = pHeader()+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(wikisWindow()))` : `pageWikiList()`}"${getTrans('otmena')}/button><br>`+
    `<form id=GDPSesPlace style=padding:8px method=post onsubmit="return enterFormData(this,'editWiki${php}?id=${wikiId}')">`+
      `<input data-trans="guides02" name=title class=guidInp id=title style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs" class="framelabel" name="language" required>`+
        langs+
      `</select><br>`+
      `<input name=img class=guidInp id=img${getTrans('guides05', 'input')}`+
      `<textarea id=text name=text style=width:100%;height:240px class=guidInp style=width:210px ${getTrans('textInput02', 'textarea')}/textarea><br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  innerMain(html);
  Loading();
  helperRequest(`${sData[1]}editWiki${php}?id=${wikiId}`)
    .then(data=>{
      if (data == '["NONE"]') {
        p(profilePage());
        megaAlert('CONTENTISNULL');
        Loading(1);
        return;
      }
      let parsedData = JSON.parse(data);
      setLink('wikiEdit='+wikiId);
      getElement('title').value = parsedData.title;
      getElement('text').value = parsedData.text;
      getElement('img').value = parsedData.ban;
      if (querySelect(`[value=${parsedData.language}]`))
        querySelect(`[value=${parsedData.language}]`).setAttribute('selected', ' ');
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},

// #region гайдфреймы ака таблицы и блоки

generateGuideframe = (guideId, HTMelement)=>{
  switch (HTMelement.value) {
    case 'MediaRender':
      newGuideFrame(guideId, guideEditorFrame, ['MediaRender', ''], getTrans('MediaRender', 'input'));
      break;
    case 'wikiText':
      newGuideFrame(guideId, guideEditorFrame, ['wikiText', ''], getTrans('wikiText', 'input'));
      break;
    default:
    case 'Markdown':
      newGuideFrame(guideId, guideEditorFrame, ['Markdown', ''], getTrans('Markdown', 'input'));
      break;
  }
},
newGuideFrame = (guideId, id = 0, customContent = null, textAreaHelp = '')=>{
  if (textAreaHelp == '')
    textAreaHelp = getTrans(customContent[0], 'input');
  let html =
  `<div class=frameguide id=frame${guideId}-${id} style=position:relative>`+
    `<input name=subtitle[] ${customContent !== null ? `value="${customContent[0]}"` : ''} type=hidden style=width:100%;font-size:calc(var(--def-font)*1.5)${getTrans('guides06', 'input')}<br>`+
    `<button style="position:absolute;top:20px;right:20px;padding:2px 4px"`+`
     class=loginbtn onclick="removeGuide(${guideId},${id})" type=button>`+
      `<img style="margin:0" width="24px" src="${helperUrl}imgs/trash.svg">`+
    `</button>`+
    `<textarea name=subtext[] class=guidInp style=width:100%;height:240px${textAreaHelp}${customContent !== null ? customContent[1] : ''}</textarea>`+
  `</div><br>`;

  getElement('frames'+guideId).insertAdjacentHTML('beforeend', html);
  getElement('framesSelector'+guideId).selectedIndex = 0;
  guideEditorFrame++;
  return html;
},
removeGuide = (guideId, id)=>{
  getElement('frame'+guideId+'-'+id).remove();
},

// #endregion

createGuide = (wikiId, backpage = 0)=>{
  let langs = '';
  langList.forEach(lang=>{
    langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
  });
  let guidWin = helperSettings.openGuidesInWindow,
      html = (guidWin === 0 ? pHeader() : '')+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    (guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(''));getGuidesAdmin(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
    `<form id=GDPSesPlace${windowsCount} style=padding:8px method=post onsubmit="return enterFormData(this,'newGuide${php}')">`+
      `<input name=title class=guidInp id=title${windowsCount} style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs${windowsCount}" class="framelabel" name="language" required>`+
        langs+
      `</select><br>`+
      `<input name=img class=guidInp id=img${windowsCount}${getTrans('guides05', 'input')}`+
      `<div id=frames${windowsCount}>`+
      `</div>`+
      //`<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
      `<select id=framesSelector${windowsCount} class=framelabel name=language required onchange=generateGuideframe(${windowsCount},this)>`+
        `<option selected disabled hidden${getTrans('guides03')}/option>`+

        `<option value=Markdown>Markdown</option>`+
        `<option value=wikiText>wikiText</option>`+
        `<option value=MediaRender>MediaRender</option>`+
      `</select><br>`+
      `<input name=aftertext class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  if (guidWin)
    openWindow('guidesEditor',html,'style=min-height:200px');
  else {
    innerMain(html,0,windowsCount);
    setLink('wikiPageNew='+wikiId);
  }
},
editGuide = (guideId, wikiId, backpage = 0)=>{
  let langs = '';
  langList.forEach(lang=>{
    langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
  });
  let guidWin = helperSettings.openGuidesInWindow,
      html = (guidWin === 0 ? pHeader() : '')+
  `<div id=helperContentProfile>`+
    `<h1${getTrans('guides01')}/h1>`+
    (guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `innerMain(profilePage(''));getGuidesAdmin(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
    `<form id=GDPSesPlace${guideId} style=padding:8px method=post onsubmit="return enterFormData(this,'editGuide${php}?id=${guideId}')">`+
      `<input name=title class=guidInp id=title${guideId} style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
      `<label${getTrans('gdpsLang00')}/label> `+
      `<select id="langs${guideId}" class="framelabel" name="language" required>`+
        langs+
      `</select><br>`+
      `<input name=img class=guidInp id=img${guideId}${getTrans('guides05', 'input')}`+
      `<div id=frames${guideId}>`+
      `</div>`+
      //`<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
      `<select id="framesSelector${guideId}" class="framelabel" name="language" required onchange=generateGuideframe(${guideId},this)>`+
        `<option selected disabled hidden${getTrans('guides03')}/option>`+

        `<option value=Markdown>Markdown</option>`+
        `<option value=wikiText>wikiText</option>`+
        `<option value=MediaRender>MediaRender</option>`+
      `</select><br>`+
      `<input name=aftertext id=aftertext${guideId} class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
      `<input type=hidden value=${wikiId} name=wikiId>`+
      `<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
    `</form>`+
  `</div>`;
  if (!guidWin)
    innerMain(html,0,guideId);
  Loading();
  helperRequest(`${sData[1]}editGuide${php}?id=${guideId}`)
  .then(data=>{
    if (data == '["NONE"]') {
      p(profilePage());
      megaAlert('CONTENTISNULL');
      Loading(1);
      return;
    }
    if (!guidWin)
      setLink('wikiPageEdit='+guideId+'.'+wikiId);
    else 
      openWindow('guidesEditor',html,'style=min-height:200px');
    let parsedData = JSON.parse(data),
      guideinfo = parsedData['guideinfo'];

    getElement('title'+guideId).value = guideinfo[1];
    getElement('aftertext'+guideId).value = guideinfo[2];
    querySelect(`[value=${guideinfo[3]}]`).setAttribute('selected', '');
    getElement('img'+guideId).value = guideinfo[4];
    
    let guidedata = parsedData['guidedata'];
    innerGdpsPlace(`<input name=guidId value=${guideId} type=hidden>`,1);
    guideEditorFrame = 1;
    guidedata.forEach(guid=>{
      newGuideFrame(guideId, guideEditorFrame, guid);
    });
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},

// #endregion
// #region компоненты newHelper.js
openWindow = (windowName, htmlContent, customAttrs = '')=>{
  let windowId = windowsCount+windowName,
  html =
  `<div class="upperWindow frameprofile ANIM-create2" id=${windowId} ${customAttrs}>`+
    `<div id=RSZb-${windowId} style=cursor:n-resize;position:absolute;width:100%;height:6px;bottom:-1px;left:-1px></div>`+
    `<div id=RSZl-${windowId} style=cursor:w-resize;position:absolute;width:6px;height:100%;left:-1px;top:-1px></div>`+
    `<div id=RSZr-${windowId} style=cursor:e-resize;position:absolute;width:6px;height:100%;right:-1px;top:-1px></div>`+
    `<div id=RSZt-${windowId} style=cursor:s-resize;position:absolute;width:100%;height:6px;top:-5px;left:-1px></div>`+
    `<div id=RSZtl-${windowId} style=cursor:nw-resize;position:absolute;width:6px;height:6px;top:-5px;left:-1px></div>`+
    `<div id=RSZtr-${windowId} style=cursor:ne-resize;position:absolute;width:6px;height:6px;top:-5px;right:-1px></div>`+
    `<div id=RSZbl-${windowId} style=cursor:sw-resize;position:absolute;width:6px;height:6px;bottom:-1px;left:-1px></div>`+
    `<div id=RSZbr-${windowId} style=cursor:se-resize;position:absolute;width:6px;height:6px;bottom:-1px;right:-1px></div>`+
    `<div align=right class=underWindow clicktime=0 ondblclick=switchWindowFullMode('${windowId}') id=DRAGGER${windowId}>`+
      `<div style=position:absolute;left:2px${getTrans('WINDOW-'+windowName,512)}/div>`+
      windowButton('–', `hideWindow('${windowName}','${windowId}')`, `font-weight:bold`)+
      windowButton('X', `closeWindow('${windowId}')`, `font-weight:bold`)+
    `</div>`+
    `<div id=content-${windowId} style=overflow:auto;max-width:100%;max-height:100%>`+
      htmlContent+
    `</div>`+
  `</div>`;
  helperWindows.insertAdjacentHTML('beforeend', html);

  let Window = getElement(windowId);
  if (!customAttrs.includes('top')) {
    Window.style.top = Window.offsetTop - (Window.offsetHeight / 2) + 'px';
    Window.style.left = Window.offsetLeft - (Window.offsetWidth / 2) + 'px';
  }

  Window.onanimationend = ()=>{
    Window.classList.remove('ANIM-create2');
    Window.onanimationend = null;
  };
  initDragger(windowName);
  initResizer(windowName);
  return windowsCount++;
},
switchWindowFullMode = (windowId)=>{
  let subWindow = getElement(windowId),
  dragger = getElement('DRAGGER'+windowId);

  if (subWindow.classList.contains('ANIM-fullhide2'))
    subWindow.classList.remove('ANIM-fullhide2');
  if (subWindow.classList.contains('ANIM-full2')) {
    subWindow.classList.remove('ANIM-full2');
    subWindow.classList.add('ANIM-unfull2');
    subWindow.onanimationend = ()=>{
      subWindow.classList.remove('ANIM-unfull2');
      initDragger(windowId,'');    
      subWindow.onanimationend = null;
    }
  } else {
    dragger.onmousedown = null;
    dragger.ontouchstart = null;
    subWindow.style.height = (subWindow.offsetHeight - 50) + 'px';
    subWindow.style.width = (subWindow.offsetWidth - 50) + 'px';
    subWindow.classList.add('ANIM-full2');
    subWindow.onanimationend = ()=>{
      dragger.onmousedown = null;
      dragger.ontouchstart = null;
      subWindow.onanimationend = null;
    }
  }
},
initDragger = (windowName, customWinCount = windowsCount)=>{
  let Window = getElement(customWinCount+windowName),
    pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0,
  startDrag = e=>{
    let target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      if ('ontouchstart' in window) {
        stopDrag(e);
        return;
      }
      return;
    }
    if (Date.now() - target.getAttribute('clicktime') < 500)
      switchWindowFullMode(Window.id);
    target.setAttribute('clicktime', Date.now());

    helperWindows.appendChild(Window);

    e.preventDefault();
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;

    pos3 = clientX;
    pos4 = clientY;

    document.onmouseup = stopDrag;
    document.ontouchend = stopDrag;

    document.onmousemove = draggerMove;
    document.ontouchmove = draggerMove;
  },

  draggerMove = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.top = (Window.offsetTop - pos2) + "px";
    Window.style.left = (Window.offsetLeft - pos1) + "px";
  },

  stopDrag = ()=>{
    document.onmouseup = null;
    document.ontouchend = null;

    document.onmousemove = null;
    document.ontouchmove = null;
  };

  let draggerElement = getElement(`DRAGGER${Window.id}`);

  draggerElement.onmousedown = startDrag;
  draggerElement.ontouchstart = startDrag;
},
initResizer = (windowName)=>{
  let Window = getElement(windowsCount+windowName),
    pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, padding = 50,

  startResize = e=>{
    let target = e.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      if ('ontouchstart' in window) {
        stopResize(e);
        return;
      }
      return;
    }

    helperWindows.appendChild(Window);

    e.preventDefault();
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos3 = clientX;
    pos4 = clientY;
    
    document.onmouseup = stopResize;
    document.ontouchend = stopResize;

    switch (target.id[3]) {
      case 't':
        if (target.id[4] !== '-') {
          if (target.id[4] == 'l') {
            document.onmousemove = resizeMoveTL;
            document.ontouchmove = resizeMoveTL;
          } else {
            document.onmousemove = resizeMoveTR;
            document.ontouchmove = resizeMoveTR;
          }
          break;
        }
        document.onmousemove = resizeMoveT;
        document.ontouchmove = resizeMoveT;
        break;
      case 'b':
        if (target.id[4] !== '-') {
          if (target.id[4] == 'l') {
            document.onmousemove = resizeMoveBL;
            document.ontouchmove = resizeMoveBL;
          } else {
            document.onmousemove = resizeMoveBR;
            document.ontouchmove = resizeMoveBR;
          }
          break;
        }
        document.onmousemove = resizeMoveB;
        document.ontouchmove = resizeMoveB;
        break;
      case 'l':
        document.onmousemove = resizeMoveL;
        document.ontouchmove = resizeMoveL;
        break;
      case 'r':
        document.onmousemove = resizeMoveR;
        document.ontouchmove = resizeMoveR;
        break;
    }
  },

  resizeMoveB = e=>{
    e.preventDefault();
    
    let clientY = e.clientY || e.touches[0].clientY;
    
    pos2 = pos4 - clientY;
    pos4 = clientY;

    Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
  },

  resizeMoveT = e=>{
    e.preventDefault();
    
    let clientY = e.clientY || e.touches[0].clientY;
    
    pos2 = pos4 - clientY;
    pos4 = clientY;

    Window.style.top = (Window.offsetTop - pos2) + "px";
    Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
  },

  resizeMoveL = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX;
    
    pos1 = pos3 - clientX;
    pos3 = clientX;

    Window.style.left = (Window.offsetLeft - pos1) + "px";
    Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
  },

  resizeMoveR = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX;
    
    pos1 = pos3 - clientX;
    pos3 = clientX;

    Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
  },

  resizeMoveTL = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.top = (Window.offsetTop - pos2) + "px";
    Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
    Window.style.left = (Window.offsetLeft - pos1) + "px";
    Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
  },

  resizeMoveTR = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.top = (Window.offsetTop - pos2) + "px";
    Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
    Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
  },

  resizeMoveBL = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
    Window.style.left = (Window.offsetLeft - pos1) + "px";
    Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
  },

  resizeMoveBR = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
    Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
  },

  resizeMove = e=>{
    e.preventDefault();
    
    let clientX = e.clientX || e.touches[0].clientX,
        clientY = e.clientY || e.touches[0].clientY;
    
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
    Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
  },

  stopResize = ()=>{
    document.onmouseup = null;
    document.ontouchend = null;

    document.onmousemove = null;
    document.ontouchmove = null;
  };

  let resizerElementT = getElement(`RSZt-${Window.id}`),
      resizerElementB = getElement(`RSZb-${Window.id}`),
      resizerElementL = getElement(`RSZl-${Window.id}`),
      resizerElementR = getElement(`RSZr-${Window.id}`),
      resizerElementTL = getElement(`RSZtl-${Window.id}`),
      resizerElementTR = getElement(`RSZtr-${Window.id}`),
      resizerElementBL = getElement(`RSZbl-${Window.id}`),
      resizerElementBR = getElement(`RSZbr-${Window.id}`);

      resizerElementT.onmousedown = startResize;
      resizerElementT.ontouchstart = startResize;
      resizerElementB.onmousedown = startResize;
      resizerElementB.ontouchstart = startResize;
      resizerElementL.onmousedown = startResize;
      resizerElementL.ontouchstart = startResize;
      resizerElementR.onmousedown = startResize;
      resizerElementR.ontouchstart = startResize;
      resizerElementTL.onmousedown = startResize;
      resizerElementTL.ontouchstart = startResize;
      resizerElementTR.onmousedown = startResize;
      resizerElementTR.ontouchstart = startResize;
      resizerElementBL.onmousedown = startResize;
      resizerElementBL.ontouchstart = startResize;
      resizerElementBR.onmousedown = startResize;
  resizerElementBR.ontouchstart = startResize;
},
closeWindow = (windowName)=>{
  let Window = getElement(windowName);
  if (Window)
    if (!Window.classList.contains('ANIM-full2'))
      Window.classList.add('ANIM-stop2');
    else {
      Window.classList.remove('ANIM-full2');
      Window.classList.add('ANIM-unfullstop2');
    }
  if (Window.classList.contains('ANIM-fullhide2'))
    Window.classList.remove('ANIM-fullhide2');

  Window.onanimationend = ()=>{
    Window.remove();
  };
},
hideWindow = (windowName, windowId)=>{
  let Window = getElement(windowId),
      animName = 'ANIM-hide2';
  if (Window.classList.contains('ANIM-fullhide2'))
    Window.classList.remove('ANIM-fullhide2');
  if (Window.classList.contains('ANIM-full2')) {
    Window.classList.remove('ANIM-full2');
    animName = 'ANIM-unfullhide2';
  }
  if (Window)
    Window.classList.add(animName);

  Window.onanimationend = ()=>{
    Window.style.display = 'none';
    if (animName != 'ANIM-unfullhide2')
      Window.classList.remove(animName);
    helperHider.insertAdjacentHTML('beforeend', basicButton(`${getTrans('WINDOW-'+windowName,512)}`, `unhideWindow('${windowId}')`, ``, `hider${windowId}`));
    Window.onanimationend = null;
  };
},
unhideWindow = (windowName)=>{
  let Window = getElement(windowName),
    hider = getElement('hider'+windowName);
  if (Window) {
    if (!Window.classList.contains('ANIM-unfullhide2'))
      Window.classList.add('ANIM-recreate2');
    else {
      Window.classList.remove('ANIM-unfullhide2');
      Window.classList.add('ANIM-fullhide2');
      Window.classList.add('ANIM-full2');
    }
    Window.style.display = '';
  }
  if (hider)
    hider.remove();

  Window.onanimationend = ()=>{
    if (!Window.classList.contains('ANIM-fullhide2'))
      Window.classList.remove('ANIM-recreate2');
    else {
      //Window.classList.remove('ANIM-fullhide2');
    }
    Window.onanimationend = null;
  };
},

ADwrite = (userId = '')=>{
  let anonymusSend = `<p><input type=checkbox name=anonymus> Send as Object hub</p>`;
  openWindow('writeAlarm', 
    `<h1>Write to support</h1>`+
    `<form onsubmit="return enterFormData(this,'writeAlarm${sData[8]}')">`+
      `<input name=windowId value=${windowsCount} type=hidden>`+
      `<input placeholder="userId (not username)" class=framelabel ${thisUser.role === 0 ? 'type=hidden value=0':'type=text value="'+userId+'"'} name=user><br>`+
      `<input placeholder=title class=framelabel name=title><br>`+
      `<textarea placeholder=text class=framelabel name=text></textarea><br>`+
      (thisUser.role !== 0 ? anonymusSend : '')+
      `<button onclick="closeWindow('${windowsCount}writeAlarm')" class=loginbtn>close</button>`+
      `<input type=submit value=send class=loginbtn>`+
    `</form>`
  );
},
loginPage = ()=>{
  let id = openWindow('logonWindow',
    `<h1${getTrans('login')}/h1>`+
    `<input style=width:75%  id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login01', 'input')}<br><br>`+
    `<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}`+
    `<button class=emptybtn onclick=seePassword()>`+
      `<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>`+
    `</button><br><br>`+
    `<div id=${windowsCount}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>`+
    `<button style=width:100% onclick="innerMain(dropWindow())" class="loginbtn"${getTrans('remindPass')}/button><br><br>`+
    `<button style=width:100% onclick="sendLoginForm(${windowsCount})" class="loginbtn"${getTrans('joinToGdps')}/button><br>`+
    `<br><button style=width:100% class="loginbtn" onclick="closeWindow('${windowsCount}logonWindow')"${getTrans('back')}/button>`+
    `<p align=right${getTrans('helperVer')}/p>`
  , 'isloginwindow');
  loadScript('https://www.google.com/recaptcha/api.js', function(id){captchaLoad ? grecaptcha.render(id) : captchaLoad = true}, id+'cap');
},
registerPage = ()=>{
  let id = openWindow('logon2Window',
    `<h1${getTrans('register')}/h1>`+
    `<input style=width:75% id="LGusername" class="framelabel" maxlength="32" minlength="3" type="text"${getTrans('login06', 'input')}<br><br>`+
    `<input style=width:75%;margin-left:20px id="LGpassword" class="framelabel" maxlength="64" minlength="5" type="password"${getTrans('login02', 'input')}`+
    `<button class=emptybtn onclick=seePassword()>`+
      `<img style=margin:-12px;margin-left:0 id=LGbtn src=${helperUrl}imgs/PShide.svg width=32px>`+
    `</button><br><br>`+
    `<input style=width:75% id="LGemail" class="framelabel" required ${getTrans('login03', 'input')}<br><br>`+
    `<div id=${windowsCount}cap class=g-recaptcha data-sitekey=${helperCaptchaSiteKey}></div>`+
    `<button style=width:100% onclick="sendRegisterForm(${windowsCount})" class="loginbtn"${getTrans('register')}/button><br>`+
    `<br><button style=width:100% class="loginbtn" onclick="closeWindow('${windowsCount}logon2Window')"${getTrans('back')}/button>`+
    `<p align=right${getTrans('helperVer')}/p>`
  , 'isloginwindow');
  loadScript('https://www.google.com/recaptcha/api.js', function(id){captchaLoad ? grecaptcha.render(id) : captchaLoad = true}, id+'cap');
},
loadScript = (url, callback = function(){}, args = '')=>{
  if (scripts.includes(url) == false) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = ()=>{
      scripts.push(url);
      callback(args);
    };
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else 
    callback(args);
},
gdpsReport = (gdpsId)=>{
  openWindow('REPform',
    `<h1${getTrans('report01')}/h1>`+
    `<form id=${windowsCount}formREP onsubmit="return enterFormData(this,'report${php}')">`+
      `<input type=hidden value="${windowsCount}REPform" name=windowId>`+
      `<input name=gdps value="${gdpsId}" type=hidden>`+
      `<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report02', 'textarea')}/textarea><br>`+
      `<button onclick="getElement('${windowsCount}formREP').setAttribute('onsubmit','return false');closeWindow('${windowsCount}REPform')" class=loginbtn${getTrans('otmena')}/button>`+
      `<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
    `</form>`
  );
},
forumReport = (postId)=>{
  openWindow('REPform2', 
    `<h1${getTrans('report01')}/h1>`+
    `<form id=${windowsCount}formREP onsubmit="return enterFormData(this,'report${php}')">`+
      `<input type=hidden value="${windowsCount}REPform2" name=windowId>`+
      `<input name=gdps value="${postId}" type=hidden>`+
      `<textarea style="width:250px;height:100px" class=framelabel name=text${getTrans('report03', 'textarea')}/textarea><br>`+
      `<button onclick="getElement('${windowsCount}formREP').setAttribute('onsubmit','return false');closeWindow('${windowsCount}REPform2')" class=loginbtn${getTrans('otmena')}/button>`+
      `<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
    `</form>`
  );
},
createForum = (forumId, step = 0)=>{
  if (step == 0) {
    openWindow('forumAlert',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<p style=min-width:180px${getTrans('forumAlert')}/p><br>`+
        `<button onclick=createForum(${forumId},1);closeWindow('${windowsCount}forumAlert') class=loginbtn${getTrans('yes')}/button>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}forumAlert')" class=loginbtn${getTrans('no')}/button>`+
      `</form>`
    )
  } else {
    Loading();
    helperRequest(`${sData[6]}create${php}`, `id=${forumId}`)
      .then(data=>{
        Loading(1);
        openForum(data);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  }
},
getConfInfo = (step = 0)=>{
  if (step == 0) {
    openWindow('getLogin',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=LGpassword${getTrans('login02', 'input')}<br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}getLogin')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=getConfInfo(1);closeWindow('${windowsCount}getLogin') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    );
  } else {
    let password = getElement('LGpassword').value;
    Loading();
    helperRequest(`${sData[5]}getAccInfo${php}`, 'password='+password)
      .then(data=>{
        if (data == '-1') {
          megaAlert('wrongPass');
        } else {
          let parsedData = JSON.parse(data),
            html2 = `<span${getTrans('login06')}/span>: ${parsedData[0]}<br>`+
            `<span${getTrans('login03')}/span>: ${parsedData[1]}<br><br>`+
            `<button onclick="closeWindow('${windowsCount}getLogin2')" class=loginbtn${getTrans('back')}/button>`;      
            openWindow('getLogin2', html2);
        }
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  }
},
connectContent = (wikiId, step = 0)=>{
  if (step == 0) {
    openWindow('contentToWiki', 
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=contentId placeholder="ContentId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}contentToWiki')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=connectContent(${wikiId},1);closeWindow('${windowsCount}contentToWiki') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let id = getElement('contentId').value;
    Loading();
    helperRequest(`${sData[3]}conntectContent${php}`, `id=${id}&connectTo=${wikiId}`)
      .then(data=>{
        if (data == 0) {
          if (id == 0) {
            id = myguides[0]['w'+wikiId].wiki;
            myguides[0]['w'+wikiId].wiki = 0;
            if (myGdpses[ProjectsChannel][id])
              myGdpses[ProjectsChannel][id].wiki = 0;
            profilePage();
          } else {
            if (myGdpses[ProjectsChannel][id])
              myGdpses[ProjectsChannel][id].wiki = 0;
            getFind(ProjectsChannel, id);
          }
        } else {
          if (id == 0) {
            id = myguides[0]['w'+wikiId].wiki;
            myguides[0]['w'+wikiId].wiki = 0;
            if (myGdpses[ProjectsChannel][id])
              myGdpses[ProjectsChannel][id].wiki = 0;
            profilePage();
          } else {
            if (myGdpses[ProjectsChannel][id])
              myGdpses[ProjectsChannel][id].wiki = 0;
            getFind(ProjectsChannel, id);
          }
        }
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  }
},
connectWiki = (contentId, type = 'c', step = 0)=>{
  if (step == 0) {
    openWindow('wikiToContent',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=wikiId placeholder="WikiId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}wikiToContent')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=connectWiki(${contentId},'${type}',1);closeWindow('${windowsCount}wikiToContent') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let id = getElement('wikiId').value;
    Loading();
    helperRequest(`${sData[3]}conntectWiki${php}`, `id=${id}&connectTo=${contentId}`)
      .then(data=>{
        if (data == 0) {
          if (id == 0) {
            id = myGdpses[ProjectsChannel][contentId].wiki;
            myGdpses[ProjectsChannel][contentId].wiki = 0;
            if (myguides[0]['w'+id])
              myguides[0]['w'+id].wiki = 0;
            profilePage();
          } else {
            myGdpses[ProjectsChannel][contentId].wiki = id;
            myguides[0]['w'+id].wiki = contentId;
            getCamp(contentId);
          }
        } else {
          if (id == 0) {
            id = myGdpses[ProjectsChannel][contentId].wiki;
            myGdpses[ProjectsChannel][contentId].wiki = 0;
            if (myguides[0]['w'+id])
              myguides[0]['w'+id].wiki = 0;
            profilePage();
          } else {
            myGdpses[ProjectsChannel][contentId].wiki = id;
            myguides[0]['w'+id].wiki = contentId;
            getShow(contentId);
          }
        }
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  }
},
setMainWiki = (contentId, guideId, step = 0)=>{
  if (step == 0) {
    if (getElement('wikiId'))
      return;
    openWindow('setMainPage',
      `<form id=${windowsCount}formLINK method=post onsubmit="return false">`+
        `<input class=framelabel id=wikiId value=${guideId} placeholder="WikiId"><br>`+
        `<button onclick="getElement('${windowsCount}formLINK').setAttribute('onsubmit','return false');closeWindow('${windowsCount}setMainPage')" class=loginbtn${getTrans('otmena')}/button>`+
        `<button onclick=setMainWiki(${contentId},${guideId},1);closeWindow('${windowsCount}setMainPage') class=loginbtn${getTrans('commSend')}/button>`+
      `</form>`
    )
  } else {
    let guideId = getElement('wikiId').value;
    Loading();
    helperRequest(`${sData[1]}setMainWiki${php}`, `wiki=${contentId}&guide=${guideId}`)
      .then(data=>{
        getGuide(data,contentId);
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  }
},
uploadFilesWindow = (wikiId)=>{
  openWindow('uploadFiles',
    `<h1${getTrans('fileUplo')}/h1>`+
    `<form id=${windowsCount}formFile onsubmit="return uploadFiles(this,${wikiId},${windowsCount})">`+
      `<input class=framelabel name=title id=${windowsCount}title${getTrans('fileTitle','input')}<br>`+
      `<progress max=1 value=0 id=${windowsCount}fileProg style=display:none></progress><br>`+
      `<input name=files id=${windowsCount}files type=file multiple><br>`+
      basicButton(getTrans('otmena'), `getElement('${windowsCount}formFile').setAttribute('onsubmit','return false');closeWindow('${windowsCount}uploadFiles')`)+
      `<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
    `</form>`
  );
},
deleteFileWindow = (wikiId, fileTitle)=>{
  openWindow('deleteFile',
    `<p${getTrans('fileSure')}/p>`+
    basicButton(getTrans('yes'), `deleteFile(${wikiId},'${fileTitle}',${windowsCount})`)+
    basicButton(getTrans('no'), `closeWindow('${windowsCount}deleteFile')`)
  );
},
setupLangFromDevpanel = async ()=>{
  let file = getElement('FILELANG').files[0],
      text = await file.text();

  text = applyLanguage(text);

  console.log(file.name);
  console.log(text);
  mainLang = JSON.parse(text);
  getLink();
},
removeDevice = (type, deviceId, isCurrent = '')=>{
  console.log(type, querySelect(`[device${deviceId}]`))
  if (type === 0) {
    if (!querySelect(`[device${deviceId}]`))
      return openWindow('removeDevice',
        `<p${getTrans('removeDevice'+isCurrent)}/p>`+
        basicButton(getTrans('yes'), `removeDevice(1,${deviceId},'${isCurrent}')`)+
        basicButton(getTrans('no'), `closeWindow('${windowsCount}removeDevice')`),
      ` device${deviceId} `);
    else return false;
  }
  if (isCurrent == 'Current') {
    if (querySelect(`[device${deviceId}]`))
      closeWindow(querySelect(`[device${deviceId}]`).id);
    return gLogout();
  }
    helperRequest(`${sData[5]}removeDevice${php}`, `id=${deviceId}`)
      .then(()=>{
        Loading(1);
        getElement('device'+deviceId).remove();
        if (querySelect(`[device${deviceId}]`))
          closeWindow(querySelect(`[device${deviceId}]`).id);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
debugWindow = ()=>{
  if (querySelect('[devpanel]') !== null)
    return;
  function checkbox(variable, code) {
    return `<input type=checkbox ${variable ? 'checked' : ''} onchange="${code}">`;
  }
  function option(value) {
    return `<option style=color:black value=${value}>${value}</option>`;
  }
  function radio(name, value) {
    return `<input type=radio name=${name} value=${value}>`;
  }
  function input(id) {
    return `<input style=color:black id=${id}>`;
  }
  function devBtn(text, func) {
    return `<button style=color:black onclick="${func}">${text}</button>`;
  }
  if (!location.search.includes('deh'))
    addLink('dev');
  openWindow('DEVPANEL',
    `<h2>newHelper.js 2.0 BUILD ${helperBuildNum} ver ${helperStrVer}</h2>`+
    `<p>COUNTRY: ${thisUser.cityData}</p>`+
    `<p>UPLOAD LANG PACKET</p>`+
    `<div style=background:black;text-align:left>`+
      `<input type=file id=FILELANG><br>`+
      devBtn('GOLANG', `setupLangFromDevpanel()`)+
    `</div>`+
    `<p>MAIN VARIABLES</p>`+
    `<div style=background:black;text-align:left>`+
      `ignoreCap ${checkbox(ignoreCap, 'ignoreCap=this.checked')}<br>`+
      `renderBeta ${checkbox(renderBeta, 'renderBeta=this.checked')}<br>`+
      `logAll ${checkbox(logAll, 'logAll=this.checked')}<br>`+
      //`API-ver <input value=${helperBuildNum} style=color:black onchange=formSdata(this.value)>`+
      `API-ver <select style=color:black onchange=formSdata(this.value)>`+
        option(133)+
      `</select><br>`+
      devBtn('CLOSE ALL ERRORS', `querySelectAll('[iserror]').forEach(el=>{closeWindow(el.id);});`)+'<br><br>'+
    `</div>`+
    `<p>OPEN CONTENT</p>`+
    `<div style=background:black;text-align:left>`+
      `getCamp ${radio('openFunc','getCamp')}<br>`+
      `getShow ${radio('openFunc','getShow')}<br>`+
      `pageGuides ${radio('openFunc','pageGuides')}<br>`+
      `otherProfile ${radio('openFunc','otherProfile')}<br>`+

      `ID ${input('openFuncID')}<br>`+
      devBtn('GO', "eval(`${querySelect('[name=openFunc]:checked').value}(${getElement('openFuncID').value})`)")+
    `</div>`+
    `<p>REQUESTS LOG</p>`+
    `<div style=background:black>`+
      `<pre style=text-align:left id=helperRequest></pre>`+
    `</div>`,
  'devpanel style=width:500px;height:600px');
},
// #endregion
// #region рендер контента (шоу, кемпы)

FINDrenderMini = (channel, parsedData, joinData = '')=>{
  let html = '',
    Count = 0,
    preHtml = [],
    gdpsData = null,
    Tags = null,
    renderJoinLink = null,
    tagsOs = '';

  for (let Id in parsedData) {
    Count++;
    tagsOs = '';
    if (Count == 9)
      return html;

    gdpsData = parsedData[Id];
    
    if (JSON.parse(gdpsData.tags) != null && JSON.parse(gdpsData.os) != null) {
      Tags = JSON.parse(gdpsData.tags).concat(JSON.parse(gdpsData.os));
      Tags.forEach(function(tag){
        tagsOs += `<div class="tag"${getTrans(toStringTAGS(channel, tag))}/div>`;
      });
    }
    renderJoinLink = gdpsData.freejoin;

    renderJoinLink = renderJoinLink ? '' : `<a class="loginbtnGDPS" href="join${php}?id=${gdpsData.ID}${joinData}" target=_blank${getTrans('joinToGdps')}/a>`;

    preHtml = [joinData, renderJoinLink, tagsOs, 'width:300px;height:450px', channel, 0];
    html += contentRenderMinu(gdpsData, preHtml);
  }
  return html;
},
renderWiki = (parsedData, page = 0)=>{
  page++;
  let html = '',
    Count =  0,
    preHtml = [],
    gdpsData = null;

  for (let Id in parsedData) {
    Count++;
    if (Count == 9) {
      innerGdpsPlace(insertBtn(`getWikis(${page})`),-1);
      return html;
    }

    gdpsData = parsedData[Id];

    preHtml = ['', '', '', 'width:300px;height:290px', -1, 8];
    html += contentRenderMinu(gdpsData, preHtml, 0, 1, 0, 0);
  }
  return html;
},
renderGuideMini = (parsedData, page = 0)=>{
  page++;
  let html = '',
    Count = 0,
    preHtml = [],

    gdpsData = null;

  for (let Id in parsedData) {
    let guid = parsedData[Id];
	  console.log(typeof guid)
	Count++;
	if (!Array.isArray(guid)) {
		if (guid.ID != 0)
			innerGdpsPlace(insertBtn('openForum('+guid.ID+')', 'forumHas', 0),512);
		getElement('wikiName').innerHTML = guid.title;
		continue;
	}
    if (Count == 5) {
      innerGdpsPlace(insertBtn(`getGuides(${globalWiki},${page})`),-1);
      return html;
    }

    gdpsData = {
      ID: guid[0],
      title: guid[1],
      language: guid[2],
      likes: guid[4],
      ban: guid[5],
      isLiked: guid[7]
    };

    preHtml = [globalWiki, '', '', 'width:250px;height:200px', -2, 7];
    html += contentRenderMinu(gdpsData, preHtml, 0, 0, 0, 0);
  }
  return html;
},
forumRenderMini = (parsedData, page = 0)=>{
  page++;
  let html = '',
    Count = 0,
    preHtml = [],
    gdpsData = null;

  for (let Id in parsedData) {
    let guid = parsedData[Id];
    if (typeof guid !== 'object' && typeof guid === 'string') {
      getElement('insertable').innerHTML = '<h1>'+guid+'</h1>';
      continue;
    }
    Count++;
    if (Count == 5) {
      innerGdpsPlace(insertBtn(`getForumPosts(${forumId},${page})`),-1);
      return html;
    }

    gdpsData = {
      ID: guid[0],
      username: guid[2],
      author: guid[3],
      title: guid[4],
      text: guid[5],
      likes: guid[7],
      isLiked: guid[8]
    };

    preHtml = [guid[1], '', '', 'width:300px;height:290px', -3, 9];
    html += contentRenderMinu(gdpsData, preHtml, 1, 1, 0, 0);
  }
  return html;
},

FINDrender = (channel, parsedData, joinData = '')=>{
  let html = '',
    gdpsData = parsedData.gdps,
    Tags = JSON.parse(gdpsData.tags),
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
  }

  tagsOs += '<div class="flex-row">';
  if (Tags != null)
    Tags.forEach(tag=>{
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
forumRender = (post)=>{
  let html = '',
    gdpsData = {
      postId: post[0],
      forumId: post[1],
      username: post[2],
      author: post[3],
      title: post[4],
      text: post[5],
      date: post[6],
      likes: post[7],
      isLiked: post[8]
    };

  html += contentRender(gdpsData, gdpsData.date, 0, 9, '', 0, 0, gdpsData.ID, '');
  return html;
},
RenderNews = (data, isComm = 0, backFunc = 'getCamp', commBackFunc = '')=>{
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

  for (let ide in data)  {
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

    }

    html += `<div class=framegdps id=news${gdpsData.ID} ${isComm == 2 ? 'style="width:calc(100% - 40px)"' : ''}>`+
    `<h2 id=Ntitle${gdpsData.ID}>${gdpsData.title}</h2>`+
    `<p style="margin:0">`+
      `<button class=loginbtn onclick="${backFunc}('${gdpsData.gdpsId}')">${gdpsData.gdpsTitle}</button>`+
      `- <button class=emptybtn onclick="otherProfile(${gdpsData.author},'${backFunc}${gdpsData.gdpsId})')">${gdpsData.username}</button>`+
    `</p>`+
    `<p>${timeAgo(gdpsData.date)}</p>`+
    `<div id=Ntext${gdpsData.ID}>${Markdown(gdpsData.text)}</div>`+
    `<div style="margin-top:15px">`+
      `<div class="likezone">`+
        `<span class=likeplace id="likesCount${gdpsData.ID}">${gdpsData.likes[0]}</span>`+
        `<button ${gdpsData.isLiked == -1 ? `style="${likeStyle.like}"` : ''} onclick="sendLike(${gdpsData.ID},2)" class=like id=like${gdpsData.ID}></button>`+
        `<span class=likeplace id="dislsCount${gdpsData.ID}">${gdpsData.likes[1]}</span>`+
        `<button ${gdpsData.isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${gdpsData.ID},2)" class=dislike id=dislike${gdpsData.ID}></button>`+
        `<span class=likeplace id="commsCount${gdpsData.ID}">${gdpsData.likes[2]}</span>`+
        `<img width=30px height=30px style=margin:0 src=${helperUrl}imgs/comm.svg>`+
        (isComm != 1 ?
        `<button class=loginbtn onclick=getNewsWithComments(${gdpsData.ID},${gdpsData.gdpsId},'${backFunc}','${commBackFunc}')${getTrans('comms')}/button>`
        : '')+
      `</div>`+
    `</div>`+
    //`<button onclick="gdpsReport(${reportButton})" style="position:absolute;bottom:20px;right:20px;padding:2px 4px" class="loginbtn">`+
    //  `<img src=${helperUrl}imgs/flag.svg width=16px style=margin:0>`+
    //`</button>`+
    (gdpsData.canDel ? 
    `<button onclick="editNews(${gdpsData.ID},${gdpsData.gdpsId})" style="position:absolute;top:20px;right:64px;padding:2px 4px" class="loginbtn">`+
      `<img style=margin:0 width=24px src="${helperUrl}imgs/edit.svg">`+
    `</button>`+
    `<button onclick="deleteNews(${gdpsData.ID},${isComm})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img style=margin:0 width=24px src="${helperUrl}imgs/trash.svg">`+
    `</button>`
    : '')+
  `</div>`;
    html2 = html2 + html;
  };
  if (html2 == '')
    return `<h1 class=contentAdaptiveBig${getTrans('newsNoneReal')}/h1>`;
  return html2;
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
  }

  for (let ide in parsedData) {
    if (commcount == 10) {
      htmlFull = htmlFull + insertBtn(`helperComments(${dataForNextButton})`);
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
    isLiked = gdpsData[7];
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
    `<button onclick="deleteComm(${id},${channel})" style="position:absolute;top:20px;right:20px;padding:2px 4px" class="loginbtn">`+
      `<img width=24px src="${helperUrl}imgs/trash.svg">`+
    `</button>`+
    `<button onclick="editComm(${id},${channel})" style="position:absolute;top:20px;right:64px;padding:2px 4px" class="loginbtn">`+
      `<img width=24px src="${helperUrl}imgs/edit.svg">`+
    `</button>`;
    
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
        `<button ${isLiked == 1  ? `style="${likeStyle.disl}"` : ''} onclick="sendDislike(${id},${likeChannel},1)" class=dislike id=dislikeComm${id}></button>`+
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
uploadPost = (forumId)=>{
  let html = 
  `<div id=helperContentProfile>`+
    `<h1 id=blacktext${getTrans('newPost')}/h1>`+
    `<form method=post onsubmit="return enterFormData(this,'forumPost${php}')">`+
      `<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
      `<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
      `<input type=hidden name=forumId value=${forumId}>`+
      `<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},

makeBetaAlert = ()=>{
  helperMain.insertAdjacentHTML('afterend',
    `<div class=ALERT id=BETAalert style=position:absolute;top:20%;left:50%><h1>BETA!</h1>`+
      `<p>Спешим вам сообщить что это бета версия сайта, а это значит что есть вероятность что мы внезапно удалим все аккаунты или сделаем что то похожее чтобы приблизить вас к выходу релиза сайта.</p>`+
      `<p>Пожалуйста, сообщайте о любых найденных багах и недочётах на наш дискорд сервер!</p><br>`+
      `<button style=background-color:#333 onclick="Slocal.set('BetaRead',1);getElement('BETAalert').remove()">Понятно</button>`+
    `</div>`
  );
},

checkWikiOwn = (id)=>{
  if (wikiesMini.includes(id.toString()))
    return true;
  return false;
},

seePassword = ()=>{
  if (getElement('LGpassword').type == 'password') {
    getElement('LGpassword').type = 'text';
    getElement('LGbtn').src = helperUrl+'imgs/PSsee.svg';
  } else {
    getElement('LGpassword').type = 'password';
    getElement('LGbtn').src = helperUrl+'imgs/PShide.svg';
  }
},

Markdown = (mdText)=>{
  // first, handle syntax for code-block
  mdText = mdText.replaceAll(/\r\n/g, '\n');
  mdText = mdText.replaceAll(/\r<br>/g, '\n');
  mdText = mdText.replaceAll(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>' );
  mdText = mdText.replaceAll(/\n``\` *(.*?)\n([\s\S]*?)\n``\`/g, '<pre><code title="$1">$2</code></pre>' );

  // split by "pre>", skip for code-block and process normal text
  var mdHTML = '';
  var mdCode = mdText.split( 'pre>');

  for (var i=0; i<mdCode.length; i++) {
    if ( mdCode[i].substr(-2) == '</' ) {
      mdHTML += '<pre>' + mdCode[i] + 'pre>';
    } else {
      mdHTML += mdCode[i].replace(/(.*)<$/, '$1')
      .replaceAll(/^##### (.*?)\s*#*$/gm, '<h5>$1</h5>')
      .replaceAll(/^#### (.*?)\s*#*$/gm, '<h4>$1</h4>')
      .replaceAll(/^### (.*?)\s*#*$/gm, '<h3>$1</h3>')
      .replaceAll(/^## (.*?)\s*#*$/gm, '<h2>$1</h2>')
      .replaceAll(/^# (.*?)\s*#*$/gm, '<h1>$1</h1>')  

      .replaceAll(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')  

      .replaceAll(/``(.*?)``/gm, '<code>$1</code>' )
      .replaceAll(/`(.*?)`/gm, '<code>$1</code>' )

      .replaceAll(/^\>\> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
      .replaceAll(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')

      .replaceAll(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img style=max-width:100% alt="$1" src="$2" $3 />')
      .replaceAll(/!\[(.*?)\]\((.*?)\)/gm, '<img style=max-width:100% alt="$1" src="$2" />')
      .replaceAll(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')

      .replaceAll(/\<http(.*)\>/gm, '<a href="http$1">http$1</a>')
      .replaceAll(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
      .replaceAll(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
      .replaceAll(/\[(.*?)\]\{(.*?)\}/gm, '<a onclick="getCurrentGuideByTag(\'$2\')">$1</a>')

      .replaceAll(/^[\*|+|-][ |.](.*)/gm, '<ul><li>$1</li></ul>' ).replace(/<\/ul\>\n<ul\>/g, '\n' )
      .replaceAll(/^\d[ |.](.*)/gm, '<ol><li>$1</li></ol>' ).replace(/<\/ol\>\n<ol\>/g, '\n' )

      .replaceAll(/\*\*(.*)\*\*/gm, '<b>$1</b>')
      .replaceAll(/\*(.*)\*/gm, '<em>$1</em>')
      .replaceAll(/\_\_(.*)\_\_/gm, '<u>$1</u>')
      .replaceAll(/\_(.*)\_/gm, '<em>$1</em>')
      .replaceAll(/~~(.*)~~/gm, '<del>$1</del>')
      .replaceAll(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')

      .replaceAll(/ +\n/g, '\n<br/>')
      .replaceAll(/\n\s*\n/g, '\n<p>\n')
      .replaceAll(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>')
      .replaceAll(/^\t(.*)/gm, '<pre><code>$1</code></pre>' );
    }  
  }
  mdHTML = mdHTML.replaceAll("\n", '<br>');
  return mdHTML.trim();
},
MediaRender = (comicText)=>{
  let comicArray = comicText.split('\n'),
  comicArr = {};

  if (comicArray.length <= 1)
    return `<div class=comicImage><img style=max-width:100% src=${comicText}></div>`;

  for (let i = 0; i < comicArray.length; i++) {
    comicArr['p'+i] = `<div class=comicImage id=p${i}><img style=max-width:100%;max-height:80vh src=${comicArray[i]}></div> `;
  };
  Consoles.log(JSON.stringify(comicArr));
  let comicStrPre = '';
  
  JSON.stringify(Object.keys(comicArr).forEach(i=>{
    comicStrPre += comicArr[i];
  }));
  
  let comicStr = `<div style=display:none>${comicStrPre}</div>`,
  html = 
  
  `<div style=display:flex;flex-wrap:wrap;height:80vh>`+
    `<div class=backPage style=flex:10%>`+
      emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)><</div><', `setPage('p0')`, 'width:100%;height:100%', 'backPage')+
    `</div>`+
    `<div align=center style=flex:80%;align-content:center id=pagePlace>`+
      comicArr['p0']+
    `</div>`+
    `<div class=nextPage style=flex:10%>`+
      emptyButton('><div align=center style=font-size:calc(var(--def-font)*2)>></div><', `setPage('p1')`, 'width:100%;height:100%', 'nextPage')+
    `</div>`+
  `</div>`+
  `<h1 class=gdps-list-place id=pageNum>1</h1>`+
  comicStr;
  return html;
},
setPage = (pageId)=>{
  getElement('pagePlace').innerHTML = getElement(pageId).innerHTML;

  // логика кнопок, я хз как её насрал!!
  let pageNum = parseInt(pageId.slice(1)),
      pagePre = pageNum - 1,
      pageNxt = pageNum + 1;

  getElement('pageNum').innerHTML = pageNxt;
  if (getElement('p'+pagePre))
    getElement('backPage').setAttribute('onclick', `setPage('p${pagePre}')`);
  if (getElement('p'+pageNxt))
    getElement('nextPage').setAttribute('onclick', `setPage('p${pageNxt}')`);
},
wikiText = (wikitext)=>{
    if (!wikitext) return '';

    // Обработка заголовков (==, ===, ====)
    let html = wikitext
        .replaceAll(/====(.+?)====/g, '<h4>$1</h4>')
        .replaceAll(/===(.+?)===/g, '<h3>$1</h3>')
        .replaceAll(/==(.+?)==/g, '<h2>$1</h2>')

    // Жирный, курсив и комбинации (''', '')
        .replaceAll(/&#039;&#039;&#039;&#039;&#039;(.+?)&#039;&#039;&#039;&#039;&#039;/g, '<strong><em>$1</em></strong>')
        .replaceAll(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<strong>$1</strong>')
        .replaceAll(/&#039;&#039;(.+?)&#039;&#039;/g, '<em>$1</em>')
        .replaceAll(/'''''(.+?)'''''/g, '<strong><em>$1</em></strong>')
        .replaceAll(/'''(.+?)'''/g, '<strong>$1</strong>')
        .replaceAll(/''(.+?)''/g, '<em>$1</em>')

    // Списки (#, *)
        .replaceAll(/^##\s*(.+)$/gm, '<ol>$1</ol>')  // Нумерованные
        .replaceAll(/^\*\*\s*(.+)$/gm, '<ul>$1</ul>') // Маркированные
        .replaceAll(/^#\s*(.+)$/gm, '<li>$1</li>')  // Нумерованные
        .replaceAll(/^\*\s*(.+)$/gm, '<li>$1</li>') // Маркированные

    // Ссылки ([[Статья]] или [[Статья|Текст]])
        .replaceAll(/\[\[([^|\]]+?)\]\]/g, '<a onclick="getCurrentGuideByTag(\'$1\')">$1</a>')
        .replaceAll(/\[\[([^|\]]+?)\|(.+?)\]\]/g, '<a onclick="getCurrentGuideByTag(\'$1\')">$2</a>')

    // Внешние ссылки ([https://example.com Текст])
        .replaceAll(/\[(https?:\/\/[^\s]+)\]/g, '<a href="$1">$1</a>')
        .replaceAll(/\[(https?:\/\/[^\s]+)\s(.+?)\]/g, '<a href="$1">$2</a>');

    // Таблицы ({| ... |})
  html = html.replace(/\{\|([\s\S]+?)\|\}/g, function(match, tableContent){
    const rows = tableContent.split('|-').filter(row=>row.trim());
    let tableHtml = '<table border="1">';
    rows.forEach(row=>{
      tableHtml += '<tr>';
      const cells = row.split('|').filter(cell=>cell.trim());
      cells.forEach(cell=>{
        if (cell.trim().startsWith('!')) {
          tableHtml += `<th>${cell.replace('!', '').trim()}</th>`;
        } else {
          tableHtml += `<td>${cell.trim()}</td>`;
        }
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';
    return tableHtml;
  });

    // Обёртка списков в <ul>/<ol>
    html = html.replace(/(<li>.*<\/li>)+/g, match=>{
        return match.includes('#') 
            ? `<ol>${match}</ol>` 
            : `<ul>${match}</ul>`;
    });

    // Переносы строк -> <br> (опционально)
    html = html.replace(/\n/g, '<br>');

    return html;
},

switchLangMenu = ()=>{
  let preLang = '';
  langList.forEach(lang=>{
    preLang += 
    `<button onclick="switchLang('${lang}')" style="width:40px;margin:2px" class="emptybtn">`+
      `<img src="${helperUrl}imgs/${lang}.png" width=40px style="padding-bottom:6px">`+
    `</button>`;
  });
  return `<div id=switchHtmlLang2 style="position:absolute;top:0px;left:48px;padding:8px;border:solid var(--color-black) 3px;border-radius:var(--def-border-small);background-color:rgba(255,255,255,.1);">`+
    preLang+
  `</div>`;
},
switchLang = (lang = 32)=>{
  if (lang === 32) {
    if (!getElement('switchHtmlLang2')) {
      getElement('switchHtmlLang').insertAdjacentHTML('beforeend', switchLangMenu());
    } else {
      getElement('switchHtmlLang2').remove();
    }
  } else {
    translateReplaceLang(lang);
    getElement('switchHtmlLang2').remove()
  }
},

switchLoginMenu = (predrop)=>{
  if (thisUser.ID === 0) {
    loginPage();
    return '';
  }
  if (predrop === 'predrop')
    predrop = '';
  let preLang = '';
  preLang +=
  `<button style="width:80px" class="emptybtn" onclick="${predrop}innerMain(profilePage())">`+
    `<span${getTrans('profile')}/span>`+
  `</button>`+
  `<button style="width:80px" class="emptybtn" onclick="${predrop}gLogout()">`+
    `<span${getTrans('logout')}/span>`+
  `</button>`;
  return `<div id=switchHtmlLogin2 style="position:absolute; bottom:-55px; right:0px; padding:8px; border:solid var(--color-black) 3px;border-radius:var(--def-border-small); background-color:rgba(255,255,255,.1);">`+
    preLang+
  `</div>`;
},
switchLogin = (lang = 32, predrop = '')=>{
  if (lang === 32) {
    if (!getElement('switchHtmlLogin2')) {
      getElement('switchHtmlLogin').insertAdjacentHTML('beforeend', switchLoginMenu(predrop))
    } else {
      getElement('switchHtmlLogin2').remove()
    }
  } else {
    getElement('switchHtmlLogin2').remove()
  }
},
profileSwitcherPhone = ()=>{
  let
  profileNavPhone = getElement('phoneSelectorSmall'),
  profileContent = getElement('helperContentProfile');

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
  helperNavPhone = getElement('helperSecond'),
  pageContent = getElement('helperContent');

  if (headerPhoneSwitcher !== 2) {
    headerPhoneSwitcher = 2;
    helperNavPhone.style.display = 'grid';
    pageContent.style.display = 'none';
  } else {
    if (getElement('phoneSelectorSmall') && getElement('phoneSelectorSmall').style.display === 'grid' && headerPhoneSwitcher !== 0) {
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

Loading = (stop = 0, ignoreLang = 1)=>{
  if (stop == 0)
    document.body.insertAdjacentHTML('beforeend',
      `<div class=ALERT id=TheLoadElem style=position:fixed;top:20%;left:50%>`+
        `<img class=Loading${ignoreLang ? getTrans('loading...','img') : ' src=https://objecthub.xyz/imgs/load.svg'}>`+
      `</div>`
    );
  else 
    if (getElement('TheLoadElem'))
      getElement('TheLoadElem').remove();
  return stop;
},
linkCopy = (string)=>{
  navigator.clipboard.writeText(string)
    .then(()=>{})
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  megaAlert('copied');
},
megaAlert = (text, waitTime = 3000)=>{
  innerMain(`<div class=ALERT id=alert style=top:20%;left:50%><h1${getTrans(text)}/h1></div>`,1);
  setTimeout(()=>{
    if (getElement('alert'))
      getElement('alert').remove();
  }, waitTime);
},

enterFormData = (form, sendPlace)=>{
  let FORMDATA = new FormData(form);
  params = '';

  switch (sendPlace) {
    case 'newsPost'+php:
      if (FORMDATA.get('gdps').startsWith('s')) {
        FORMDATA.append('type', 1);
        FORMDATA.set('gdps', parseInt(FORMDATA.get('gdps').slice(1)));
      } else if (FORMDATA.get('gdps').startsWith('c')) {
        FORMDATA.append('type', 0);
        FORMDATA.set('gdps', parseInt(FORMDATA.get('gdps').slice(1)));
      } else {
        FORMDATA.append('type', 0);
        FORMDATA.set('gdps', parseInt(FORMDATA.get('gdps').slice(1)));
      }
      break;
  }

  let postHasFiles = false;
  for (let [key, value] of FORMDATA.entries()) {
    if (value instanceof File) {
      postHasFiles = true;
      break;
    }
  }
  if (!postHasFiles)
    params = new URLSearchParams(FORMDATA).toString();
  else 
    params = FORMDATA;

  Loading();
  helperRequest(`${sData[1]}${sendPlace}`, params)
  .then(data=>{
    if (sendPlace.indexOf('?') !== -1)
      sendPlace = sendPlace.split('?')[0];
    Loading(1);
    switch (sendPlace) {
      case 'forumPost'+php:
        let parsedData = JSON.parse(data);
        getForumPost(parsedData[0],parsedData[1]);
        break;
      case 'newsPost'+php:
        if (FORMDATA.get('type') == 1)
          getShow(FORMDATA.get('gdps'));
        else 
          getCamp(FORMDATA.get('gdps'));
        break;
      case 'writeAlarm'+php:
        closeWindow(FORMDATA.get('windowId')+'writeAlarm');
        break;
      case 'report'+php:
        megaAlert('reported', 1000);
        closeWindow(FORMDATA.get('windowId'));
        break;
      case 'newGuide'+php:
        getGuide(data, FORMDATA.get('wikiId'));
        break;
      case 'editGuide'+php:
        getGuide(data, FORMDATA.get('wikiId'));
        break;
      case 'newWiki'+php:
        pageGuides(data);
        break;
      case 'editWiki'+php:
        pageGuides(data);
        break;
      default:
        if (data == '-1')
          return megaAlert('wrongPass')
        let serverResp = JSON.parse(data);
        thisUser = serverResp[0];
        myGdpses = [{},{},{}];
        Object.keys(serverResp[1][0]).forEach(gdps=>{
          GDPSgetChannel(gdps[0])[gdps.slice(1)] = serverResp[1][0][gdps];
        })
        myguides = [];
        myguides.push(serverResp[1][1]);
        yourWikies = serverResp[1][1];
        wikiesMini = [];
        Object.keys(yourWikies).forEach(el=>{
          wikiesMini.push(yourWikies[el][0].toString());
        });
        innerMain(profilePage());
    };
    return false;
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;

  return false;
},
uploadFiles = (form, wikiId, windowsId)=>{
  let FORMDATA = new FormData(form);
      params = '',
      postHasFiles = false,
      progressElement = getElement(windowsId+'fileProg');

  for (let [key, value] of FORMDATA.entries()) {
    if (value instanceof File) {
      postHasFiles = true;
      break;
    }
  }
  if (!postHasFiles)
    params = new URLSearchParams(FORMDATA).toString();
  else 
    params = FORMDATA;

  progressElement.style.display = '';
  helperRequest(`${sData[3]}sendWikiFiles${php}?id=${wikiId}`, params, false, progressElement)
    .then(data=>{
      Loading(1);
      closeWindow(windowsId+'uploadFiles');
      if (data == '')
        return innerGdpsPlace(`<span${getTrans('newsNone')}/span>`);
      if (data == '-1')
        return megaAlert('fileSizeAlert');
      if (data == '-2')
        return megaAlert('fileLargeAlert');
      let parsedData = JSON.parse(data);
      updateFileSize(parsedData.fileSize);
      innerGdpsPlace(renderFiles(parsedData.files, wikiId));
      return false;
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
    return false;
},
deleteFile = (wikiId, fileTitle, windowsId)=>{
  helperRequest(`${sData[3]}deleteWikiFiles${php}?id=${wikiId}&file=${fileTitle}`)
    .then(data=>{
      Loading(1);
      closeWindow(windowsId+'DELETEform');
      if (data == '-1')
        return megaAlert('fileSizeAlert');
      let parsedData = JSON.parse(data);
      updateFileSize(parsedData);
      getElement('FILE-'+fileTitle).remove();
      return false;
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
    return false;
},
updateFileSize = (value)=>{
  getElement('fileSize').setAttribute('value', value);
  getElement('fileSizeInt').innerHTML = value;
},

checkOwn = (contentId, userId, type)=>{
  let log = logAll;
  if (log === true) Consoles.log(contentId+' '+userId+' '+type);

  if (userId === thisUser.ID) {
    if (log === true) Consoles.log('fullowner');
    return 2;
  }

  if (type === 1) {
    let myCampsIds = [];

    for (let gdpsKey in myGdpses[0]) {
      myCampsIds.push(myGdpses[0][gdpsKey].ID);
      if (log === true) Consoles.log(myGdpses[0][gdpsKey]);
    };
    Consoles.log(myCampsIds);
    Consoles.log(`${myCampsIds}.includes(${contentId})`);
    if (myCampsIds.includes(contentId)) {
      if (log === true) Consoles.log('particalOwner');
      return 1;
    }
  }
  if (type === 2) {
    let myShowsIds = [];

    for (let gdpsKey in myGdpses[1]) {
      myShowsIds.push(myGdpses[1][gdpsKey].ID);
      if (log === true) Consoles.log(myGdpses[1][gdpsKey]);
    };
    Consoles.log(myShowsIds);
    Consoles.log(`${myShowsIds}.includes(${contentId})`);
    if (myShowsIds.includes(contentId)) {
      if (log === true) Consoles.log('particalOwner');
      return 1;
    }
  }
  if (log === true) Consoles.log('fullfalse');
  return 0;
},
// #endregion
// #region страницы в профилях
gProfileMini = ()=>{
  setLink('profile');
  let accStatus = thisUser.isActive ? getTrans('isActive') : getTrans('isNotact'),
    html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourProf')}/h1>`+
    `<p><span${getTrans('profName')}/span>: <span id=oldNick>${thisUser.username}</span></p>`+
    `<button onclick="editNickPre()" class=loginbtn${getTrans('edit')}/button>`+
    `<div style=position:relative id=newNick></div>`+
    `<p><span${getTrans('profId')}/span>: ${thisUser.ID}</p>`+
    `<p><span${getTrans('profRole')}/span>: ${toStringRole(thisUser.role)}</p>`+
    `<p><span${getTrans('profAccs')}/span> <span${accStatus}/span></p>`+
    (thisUser.isActive === 0 ? `<h2${getTrans('needEmailVerify')}/h2>`+
     basicButton(getTrans('enterCode1'), 'innerMain(verifyWindow())')+'<br><br><br>' : '')+
    `<button class=loginbtn onclick=gLogout()${getTrans('logout2')}/button><br><br>`+
    `<button class=loginbtn onclick=getConfInfo()${getTrans('getLogin')}/button><br><br>`+
    `<button class=loginbtn onclick="innerMain(dropWindow())"${getTrans('dropPass')}/button>`+
    '<br><br>'+basicButton('>write to support<', 'ADwrite()');
  html += 
  `</div>`;
  return html;
},
profileDevices = ()=>{
  setLink('devices');
  let html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('devices')}/h1><br>`+
    `<div id=GDPSesPlace style='display:flex;flex-direction:column;height:calc(100vh - 480px);overflow:auto' align=left>`+
    `</div>`+
  `</div>`;
  innerProfile(html);
  Loading();
  helperRequest(`${sData[5]}devices${php}`)
  .then(data=>{
    //let parsedData = JSON.parse(data);
    let parsedData = JSON.parse(data),
        html = renderDevices(parsedData);

    innerGdpsPlace(html);
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
renderDevices = (devicesJson)=>{
  let html = '',
      currentData = ['',''];
  for (let deviceId in devicesJson) {
    let device = devicesJson[deviceId];
    currentData = ['',''];
    if (device.userAgent === navigator.userAgent)
      currentData = [` <span style=opacity:50%${getTrans('currentDevice')}/span>`,",'Current'"];
    html += 
    `<div class=framegdpsOld style="width:calc(100% - 40px)" id=device${deviceId}>`+
      `<h2>${device.platform}${currentData[0]}</h2>`+
      `<p>${device.browser}</p>`+
      `<p>${device.country}, ${device.city}</p>`+
      basicButton(getTrans('delete'), `removeDevice(0,${deviceId}${currentData[1]})`)+
    `</div>`;
  }
  return html;
},
toStringRole = (id)=>{
  switch (id) {
    case 0: return getTrans('role00', 0);
    case 1: return getTrans('role01', 0);
    case 2: return getTrans('role02', 0);
    case 3: return getTrans('role03', 0);
  };
},
findsWindow = (channel)=>{
  ProjectsChannel = channel;
  let [smallString, bigString, tinyStr, cacheArr] = GDPSswitchChannel(channel);
  setLink('added'+bigString+'s');
  let gdpses = "";
  for (let gdps in cacheArr) {
    console.log(gdps);
    gdpses+=FINDrenderInProfileFull(channel, [cacheArr[gdps]]);
  };
  let html =
  `<div id=helperContentProfile>`+
    `<h1${getTrans('your'+bigString+'s')}/h1><br>`+
    `<div align=left>`+
    `<button onclick="innerProfile(addFind(${channel}))" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('add'+bigString)}/button>`+
    `<button onclick="innerProfile(newsWindow())" style=font-size:calc(var(--def-font)*1.5);margin-top:4px class=loginbtn${getTrans('addNews')}/button>`+
    `</div><br>`+
    `<div style='display:flex; flex-direction:column; height:calc(100vh - 480px); overflow:auto' align=left>`+
      gdpses+
    `</div>`+
  `</div>`;
  return html;
},
newsWindow = (contentId = 0, contentType = 'c')=>{
  let gdpses = '';
  if (contentId === 0) {
    gdpses = `<select style=width:90% class=framelabel name=gdps>`;
    for (let gdpsType in myGdpses)
      for (let gdpsKey in myGdpses[gdpsType]) {
        let Gdps = myGdpses[gdpsType][gdpsKey],
          Gid = Gdps.ID,
          newsTitle = Gdps.title;

        gdpses += `<option value=c${Gid}>${newsTitle}</option>`
      };
    gdpses += `</select><br>`;
  } else {
    gdpses = `<input type=hidden name=gdps value=${contentType}${contentId}>`;
  }
  let html = 
  `<div id=helperContentProfile>`+
    `<h1 id=blacktext${getTrans('newPost')}/h1>`+
    `<form method=post onsubmit="return enterFormData(this,'newsPost${php}')">`+
      `<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>`+
      `<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>`+
      gdpses+
      `<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}`+
    `</form>`+
  `</div>`;
  return html;
},
wikisWindow = ()=>{
  setLink('addedWikis');
  let gdpses = "";
  Object.keys(yourWikies).forEach(gdps=>{
    gdpses+=WIKIrenderInProfileFull([yourWikies[gdps]]);
  });
  let html =
  `<div id=helperContentProfile>`+
    `<h1${getTrans('yourWikis')}/h1><br> `+
    `<div align=left>`+
      `<button onclick="createWiki(1)" style=font-size:calc(var(--def-font)*1.5) class=loginbtn${getTrans('addWIki')}/button>`+
    `</div><br>`+
    profileContentDiv()+
      gdpses+
    `</div>`+
  `</div>`;
  return html;
},
getGuidesAdmin = (wikiId, page = 0)=>{
  let html = 
  `<div id=helperContentProfile>`+
    `<button style="font-size:calc(var(--def-font)*1.5)" class="loginbtn" onclick="createGuide(${wikiId},1)"${getTrans('guides01')}/button>`+
    profileContentDiv()+
      `<div id=GDPSesPlace align=left style=display:flex;flex-wrap:wrap></div>`+
    `</div>`+
  `</div>`;
  if (page === 0) {
    globalWiki = wikiId;
    innerProfile(html);
  }
  Loading();
  helperRequest(`${sData[0]}getGuidesAdmin${php}?wiki=${wikiId}&page=${page}`)
  .then(data=>{
    if (page === 0)
      setLink('wikiEditor='+wikiId);
    let parsedData = JSON.parse(data);

    html = GUIDrenderInProfileFull(parsedData, page);
    innerGdpsPlace(html, page);
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
FINDrenderInProfileFull = (channel, parsedData)=>{
  let html = '',
    Count = 0,

    gdpsData = null,
    thisId = null,
    title = null,
    description = null,
    likesCount = null,
    userId = null,
    username = null,
    pictureLink = null,
    bannerLink = null,
    renderJoinLink = null,
    PointsPre = null,
    Points = null,
    checked = null,
    connectedWiki = null,

    [smallString, bigString, tinyStr] = GDPSswitchChannel(channel);

  for (let Id in parsedData) {
    Count++;
    if (Count == 9)
      return html;
    
    gdpsData = parsedData[Id];
    thisId = gdpsData.ID;
    title = gdpsData.title;
    description = gdpsData.text;
    likesCount = gdpsData.likes;
    userId = gdpsData.author;
    username = gdpsData.username;
    pictureLink = gdpsData.img;
    bannerLink = gdpsData.ban;
    renderJoinLink = gdpsData.freejoin;
    checked = gdpsData.checked;
    connectedWiki = gdpsData.wiki;

    if (checked == '0') {
      Points = `<span${getTrans(smallString+'unckecked')}/span>`;
    } else if (checked == '-1') {
      Points = `<span${getTrans(smallString+'banned')}/span>`;
    } else {
      PointsPre = ~~(Date.now() / 1000) - gdpsData.points;
      Points = PointsPre > 0 ? `<span${getTrans('isBL')}/span>` : `<span${getTrans('wait1')}/span>${Math.abs(PointsPre)}<span${getTrans('wait2')}/wait>`;
    }
    renderJoinLink = renderJoinLink ? null : `<button class="loginbtn" onclick=getCamp(${thisId}) ${getTrans('openGdps')}/button>`;

    let coownersBtn = '';

    if (thisUser.ID == userId)
      coownersBtn = `<button onclick="coownersMenu(${thisId},${channel})" class=loginbtn style="margin-top:8px"${getTrans('coowners')}/button>`;
    else 
      coownersBtn = `<button class=loginbtn style="margin-top:8px"${getTrans('coownersNone')}/button>`;

    if (connectedWiki === 0)
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'${tinyStr}')" style="margin-top:8px"${getTrans('noConnectWiki')}/button>`;
    else 
      connectedWiki = `<button class=loginbtn onclick="connectWiki(${thisId},'${tinyStr}')" style="margin-top:8px"${getTrans('connectedWiki')}/button>`;

    html += 
    `<div class="framegdpsOld" style="width:calc(100% - 40px);" id="${thisId}">`+
      `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
      `<p style="display:inline;margin:0">`+
        `<span${getTrans('addedBy')}/span>:`+
        `<button onclick="otherProfile(${userId},'pageFind(${channel})')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `<span style=opacity:50%>ContentId: ${thisId}</span>`+
      `</p>`+
      `<div style="min-height:32px;margin:8px 0">`+
        `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
        `<p style=margin:0>${description}</p>`+
      `</div>`+
      `<button class="loginbtn" onclick=get${bigString}(${thisId}) ${getTrans('openGdps')}/button>`+
      `<button onclick="editFind(${channel},${thisId})" class=loginbtn style="margin-top:8px"${getTrans('edit'+bigString)}/button>`+
      coownersBtn+
      connectedWiki+
      `<button onclick="getJoinLog(${thisId})" class=loginbtn style="margin-top:8px"${getTrans('joins')}/button><br><br>`+
      `<span${getTrans('isJE')}/span>:<button id=JE${thisId} class="loginbtn" onclick="JEedit(${thisId})"${getTrans(!!renderJoinLink ? 'no' : 'yes')}/button><br>`+
      `<span${getTrans('isBL')}/span>:<button id=BL${thisId} class="loginbtn" ${gdpsData.checked == 1 ? `onclick="ballsUp(${thisId})"` : ''}>${Points}</button>`+
    `</div>`;
  };
  return html;
},
GUIDrenderInProfileFull = (parsedData, page = 0)=>{
  if (getElement('nextGdps'))
    getElement('nextGdps').remove();

  page++;

  let html = '',
    Count = 0,
    
    gdpsData = null,
    id = null,
    guidTitle = null,
    guidLang = null,
    date = null,
    likes = null,
    guidImg = null,
    userId = null;

  for (let Id in parsedData) {
    Count++;
    if (Count == 11) {
      innerGdpsPlace(insertBtn(`getGuidesAdmin(${globalWiki},${page})`),-1);
      return html;
    }

    gdpsData = parsedData[Id];
    id = gdpsData[0];
    guidTitle = gdpsData[1];
    guidLang = gdpsData[2];
    date = gdpsData[3];
    likes = gdpsData[4];
    guidImg = gdpsData[5];
    userId = gdpsData[6];

    html += 
    `<div class=framegdps style="width:260px;height:210px" id="${id}">`+
      `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link ${guidImg}');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
      `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img class=FGDPSimg src="${helperUrl}imgs/${guidLang}.png"></h2>`+
      `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
      `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
        basicButton(getTrans('edit'), `editGuide(${id},${globalWiki},1)`, 'margin-top:8px')+
        basicButton(getTrans('settings000'), `guideSettings(${id})`, 'margin-top:8px')+
      `</div>`+
    `</div>`;
  };
  return html;
},
guideSettings = (guideId)=>{
  if (getElement('guidTag'+guideId))
    return;
  let windowName = 'guidSettings',
      helperWindowId = openWindow(windowName,
    `<h2 id=wikiName${guideId}></h2>`+
    `<div style=display:flex>`+
      `<span style=margin-top:calc(var(--def-btn-size)*0.75)${getTrans('tagSetup01')}/span>`+
      basicInput('tagSetup01', `guidTag${guideId}`)+'<br>'+
      basicButton(getTrans('tagSetup02'), `setWikiTag(${guideId})`)+
    `</div>`+
    basicButton(getTrans('WINDOW-close'), `closeWindow('${windowsCount+windowName}')`)+'<br>'
  );
  Loading();
  helperRequest(`${sData[7]}getGuide${php}?id=${guideId}&wiki=${globalWiki}`)
    .then(data=>{
      Loading(1);
      let parsedData = JSON.parse(data),
        guideinfo = parsedData['guideinfo'];
      getElement('wikiName'+guideId).innerHTML = guideinfo[1];
      getElement('guidTag'+guideId).value = guideinfo[3];
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
setWikiTag = (guideId)=>{
  let tagName = getElement('guidTag'+guideId).value;
  Loading();
  helperRequest(`${sData[1]}setWikiTag${php}?id=${guideId}&wiki=${globalWiki}&tag=${tagName}`)
    .then(data=>{
      Loading(1);
      if (data == '-1')
        megaAlert('tagBan01');
      else if (data == '-2')
        megaAlert('tagBan02');
      else if (data == '-3')
        megaAlert('tagBan03');
      else {
        megaAlert('tagDone');
      }
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
WIKIrenderInProfileFull = (parsedData)=>{
  let html = '',
    count = 0;
    
  let gdpsData = null,
    id = null,
    title = null,
    text = null,
    img = null,
    language = null,
    date = null,
    likesCount = null,
    userId = null,
    connectedContent = null,
    forum = null;

  for (let Id in parsedData) {
    count++;
    if (count == 9)
      return html;
    
    gdpsData = parsedData[Id];
    id = gdpsData[0];
    title = gdpsData[1];
    text = gdpsData[2];
    img = gdpsData[3];
    language = gdpsData[4];
    date = gdpsData[5];
    likesCount = gdpsData[7];
    userId = gdpsData[7];
    connectedContent = gdpsData[8];
    forum = gdpsData[9];
    mainWiki = gdpsData[10];

    if (thisUser.ID == userId)
      coownersBtn = `<button onclick="coownersMenu(${id},-1)" class=loginbtn style="margin-top:8px"${getTrans('coowners')}/button>`;
    else 
      coownersBtn = `<button class=loginbtn style="margin-top:8px"${getTrans('coownersNone')}/button>`;

    if (connectedContent === 0)
      connectedContent = `<button class=loginbtn onclick="connectContent(${id})" style="margin-top:8px"${getTrans('noConnectContent')}/button>`;
    else 
      connectedContent = `<button class=loginbtn onclick="connectContent(${id})" style="margin-top:8px"${getTrans('connectedContent')}/button>`;

    if (forum === 0)
      forum = `<button class=loginbtn onclick="createForum(${id})" style="margin-top:8px"${getTrans('forumNone')}/button>`;
    else 
      forum = `<button class=loginbtn onclick="openForum(${forum})" style="margin-top:8px"${getTrans('forumHas')}/button>`;

    if (mainWiki === 0)
      mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})" style="margin-top:8px"${getTrans('mainWikiNone')}/button>`;
    else 
      mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})" style="margin-top:8px"${getTrans('mainWikiHas')}/button>`;

    html += 
    `<div class=framegdpsOld style="width:calc(100% - 40px);" id="${id}">`+
      `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
      `<span style=opacity:50%>WikiId: ${id}</span>`+
      `<div style=min-height:32px>`+
        `<img onerror="this.src='${helperUrl}imgs/hubbig.png'" align=left src="${decodeURIComponent(img)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
        `<p>${text}</p>`+
      `</div>`+
      `<div style="margin-top:15px">`+
        basicButton(getTrans('edit'), `editWiki(${id},1)`)+
        basicButton(getTrans('pages'), `getGuidesAdmin(${id})`)+
        coownersBtn+
        connectedContent+
        forum+
        mainWiki+
        basicButton(getTrans('files'), `wikiLoadFiles(${id})`)+
      `</div>`+
    `</div>`;
  };
  return html;
},
wikiLoadFiles = (wikiId)=>{
  setLink('wikiFiles='+wikiId);
  let html = 
  `<div id=helperContentProfile>`+
    `<h1><span${getTrans('files')}/span><span> ${yourWikies['w'+wikiId][1]}</span></h1>`+
    basicButton(getTrans('fileUplo'), `uploadFilesWindow(${wikiId})`)+`<br>`+
    `<progress max=16777216 value=0 id=fileSize ></progress> `+
    `<span><span id=fileSizeInt></span>/16777216</span>`+
    `<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`+
  `</div>`;
  helperRequest(`${sData[3]}getWikiFiles${php}?id=${wikiId}`)
  .then(data=>{
    Loading(1);
    if (data == '')
      return innerGdpsPlace(`<span${getTrans('newsNone')}/span>`);
    let parsedData = JSON.parse(data);
    updateFileSize(parsedData.fileSize);
    innerGdpsPlace(renderFiles(parsedData.files, wikiId));
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  innerProfile(html);
},
renderFiles = (parsedData, wikiId = 0)=>{
  let html = '';
  Consoles.log(parsedData);
  for (let fileTitle in parsedData) {
    let file = parsedData[fileTitle];
    if (typeof file == 'number')
      continue;
    Consoles.log(file);
    html += 
      `<div class=framegdpsOld id="FILE-${fileTitle}" style=width:260px;height:260px>`+
        `<div align=center>`+
          `<h2>${fileTitle}</h2>`+
          `<img src="imgs/customwiki/${wikiId}/${file[0]}" style=margin:0;max-width:160px;max-height:160px><br>`+
          emptyButton(`>${file[2]}<`, `otherProfile(${file[1]},'innerMain(profilePage());wikiLoadFiles(${wikiId})')`)+
          //`<span style=opacity:50%;font-size:calc(var(--def-font)*0.75)>https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}</span><br>`+
        `</div>`+
        basicButton(getTrans('fileGetLink'), `linkCopy('https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}')`, 'position:absolute;bottom:8px;left:8px')+
        `<button onclick="deleteFileWindow(${wikiId},'${fileTitle}')" style="position:absolute;bottom:8px;right:8px;padding:2px 4px" class="loginbtn">`+
          `<img style=margin:0 width=24px src="${helperUrl}imgs/trash.svg">`+
        `</button>`+
      `</div>`;
  }
  return html;
},
alarmsWindow = ()=>{
  let html = 
  `<div id=helperContentProfile>`+
    `<div align=center>`+
      `<h1${getTrans('alarms01')}/h1>`+
      `<div style="display:flex">`+
        `<div style="width:30%;height:400px">`+
          `<h2${getTrans('msgs')}/h2>`+
          `<div id=alarms_small>`+
          `</div>`+
        `</div>`+
        `<div style="width:70%;height:400px">`+
          `<h2${getTrans('fullMsgs')}/h2>`+
          `<div id=alarms_big>`+
          `</div>`+
        `</div>`+
      `</div>`+
    `</div>`+
  `</div>`;
  return html;
},
GetAlarms = (page = 0)=>{
  setLink('alarms');
  Loading();
  helperRequest(`${sData[0]}getAlarms${php}?page=${page}`)
  .then(data=>{
    if (data == '[]') {
      Loading(1);
      return getElement('alarms_small').innerHTML = `<span${getTrans('newsNone')}/span>`;
    }
    let parsedData = JSON.parse(data),
      html = '',
      css = '';
    parsedData.forEach(el=>{
      if (el[2] == 1)
        css = 'style=background-color:#ff0000 ';
      else 
        css = '';
      html += `<button id="btn${el[0]}" ${css}class=loginbtn onclick="getFullAlarm(${el[0]})">${el[1]}</button>`;
    });
    getElement('alarms_small').innerHTML = html;
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
getFullAlarm = (id)=>{
  Loading();
  helperRequest(`${sData[0]}getAlarm${php}?id=${id}`)
  .then(data=>{
    let alarm = JSON.parse(data),
      html = 
    `<div id=fullAlarm align=left style=margin-left:12px>`+
      `<h1>${alarm.title}</h1>`+
      `<p>${alarm.text}</p>`+
      `<span${getTrans('addedBy')}/span> - `+
      `<button class=emptybtn onclick="otherProfile(${alarm.adminId},'profilePage()')">${alarm.adminName}</button><br><br>`+
      `<button class=loginbtn onclick="removeAlarm(${alarm.ID})"${getTrans('delete')}/button>`+
    `</div>`;
    if (getElement('btn'+id))
      getElement('btn'+id).style.backgroundColor = '';
    getElement('alarms_big').innerHTML = html;
    Loading(1);
  })
  .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
dropWindow = ()=>{
  querySelectAll('[isloginwindow]').forEach(el=>{
    closeWindow(el.id);
  });
  setLink('drop');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class="frameprofile" style="width:10vw%">`+
      `<h1${getTrans('passReset')}/h1>`+
      `<input id="LGemail" class="framelabel" required ${getTrans('login05', 'input')}<br><br>`+
      `<button class=loginbtn onclick="sendDrop()"${getTrans('submit')}/button><br><br>`+
      `<button class=loginbtn onclick="innerMain(pageMain())"${getTrans('back')}/button>`+
    `</div>`+
  `</div>`;
  return html;
},
verifyWindow = ()=>{
  querySelectAll('[isloginwindow]').forEach(el=>{
    closeWindow(el.id);
  });
  setLink('verify');
  let html = pHeader()+
  `<div id=helperContent>`+
    `<div class="frameprofile" style="width:10vw%">`+
      `<h1${getTrans('enterCode2')}/h1>`+
      `<input id="LGcode" class="framelabel" required ${getTrans('enterCode3', 'input')}<br><br>`+
      `<button class=loginbtn onclick="sendVerify()"${getTrans('submit')}/button><br><br>`+
      `<button class=loginbtn onclick="innerMain(profilePage())"${getTrans('back')}/button>`+
    `</div>`+
  `</div>`;
  return html;
},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  otherProfileMini = (userId)=>{
    setLink('profiles='+userId);
    Loading();
    helperRequest(`${sData[0]}getUser${php}?id=${userId}`)
    .then(data=>{
      let userData = JSON.parse(data),
        accStatus = userData.isActive ? getTrans('isActive') : getTrans('isNotact'),
        html = 
      `<div id=helperContentProfile>`+
        `<h1><span${getTrans('profile')}/span> ${userData.username}</h1>`+
        `<p><span${getTrans('profName')}/span>: ${userData.username}</p>`+
        `<p><span${getTrans('profId')}/span>: ${userData.ID}</p>`+
        `<p><span${getTrans('profRole')}/span>: ${toStringRole(userData.role)}</p>`+
        `<p><span${getTrans('notProfAccs')}/span> ${userData.username} <span${accStatus}/span></p>`+
      `</div>`;
      innerProfile(html);
      Loading(1);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  },
  otherFindsWindow = (channel, userId)=>{
    let [smallString, bigString] = GDPSswitchChannel(channel);
    setLink('prof'+bigString+'s='+userId);
    Loading();
    helperRequest(`${sData[0]}getAdded${bigString}s${php}?id=${userId}&type=${channel}`)
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
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
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
    setLink('profWikis='+userId);
    Loading();
    helperRequest(`${sData[0]}getUserGuides${php}?id=${userId}`)
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
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
  },
  FINDrenderInProfile = (channel, parsedData)=>{
    let html = '',
      Count = 0,

      gdpsData = null,
      thisId = null,
      title = null,
      description = null,
      likesCount = null,
      userId = null,
      username = null,
      pictureLink = null,
      bannerLink = null,
      isWeeklyData = ['',''],
      checked,
      [smallString, bigString] = GDPSswitchChannel(channel);

    for (let Id in parsedData) {
      Count++;
      if (Count == 9)
        return html;

      gdpsData = parsedData[Id];
      thisId = gdpsData.ID;
      title = gdpsData.title;
      description = gdpsData.text;
      likesCount = gdpsData.likes;
      userId = gdpsData.author;
      username = gdpsData.username;
      pictureLink = gdpsData.img;
      bannerLink = gdpsData.ban;
      checked = gdpsData.checked;

      isWeeklyData = ['',''];

      html += 
      `<div class="framegdpsOld" style="${isWeeklyData[0]}width:calc(100% - 40px);" id="${thisId}">`+
        `${isWeeklyData[1]}`+
        `<h2 style="display:inline;margin-right:4px">${title}</h2>`+
        `<p style="display:inline;margin:0">`+
          `<span${getTrans('addedBy')}/span>:`+
          `<button onclick="otherProfile(${userId},'pageFind(${channel})')" style="background:0;border:0;color:var(--color-white)">${username}</button>`+
        `</p>`+
        `<div style="min-height:32px">`+
          `<img onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubbig.png'" align="left" src="${decodeURIComponent(pictureLink)}" width=32px height=32px style="border-radius:calc(var(--def-border-small)*0.75)">`+
          `<p>${description}</p>`+
        `</div>`+
        `<div style="margin-top:15px;padding-bottom:15px">`+
        `<button class="loginbtn" onclick=get${bigString}(${thisId}) ${getTrans('openGdps')}/button>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
  GUIDrenderInProfile = (parsedData)=>{
    let html = '',

      gdpsData = null,
      id = null,
      guidTitle = null,
      guidLang = null,
      date = null,
      likes = null,
      guidImg = null,
      userId = null;

    for (let Id in parsedData) {

      gdpsData = parsedData[Id];
      id = gdpsData[0];
      guidTitle = gdpsData[1];
      guidLang = gdpsData[2];
      date = gdpsData[5];
      likes = gdpsData[7];
      guidImg = gdpsData[7];
      userId = gdpsData[8];

      html += 
      `<div class=framegdps style="width:260px;height:200px" id="${id}">`+
        `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
        `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img class=FGDPSimg src="${helperUrl}imgs/${guidLang}.png"></h2>`+
        `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
        `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
          `<button onclick="getGuide(${id})" class=loginbtn style="margin-top:8px"${getTrans('moreInfo')}/button>`+
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
      guidLang = null,
      date = null,
      likes = null,
      guidImg = null,
      userId = null;

    for (let Id in parsedData) {

      gdpsData = parsedData[Id];
      id = gdpsData[0];
      guidTitle = gdpsData[1];
      guidLang = gdpsData[2];
      date = gdpsData[5];
      likes = gdpsData[7];
      guidImg = gdpsData[7];
      userId = gdpsData[8];

      html += 
      `<div class=framegdps style="width:260px;height:200px" id="${id}">`+
        `<img width=276px height=133px src="${guidImg}" onerror="Consoles.warn('broken link');this.src='${helperUrl}imgs/hubemp.png'" style="position:absolute;top:0;left:0;margin:0;border-top-left-radius:var(--def-border);border-top-right-radius:var(--def-border)">`+
        `<h2 style="z-index:1;position:inherit;margin-top:120px">${guidTitle} <img class=FGDPSimg src="${helperUrl}imgs/${guidLang}.png"></h2>`+
        `<div style="position: absolute;top: 0;left: 0;width: 276px;height: 60px;margin-top: 73px;background: linear-gradient(rgba(0,0,0,0), var(--color-profile-alpha), var(--color-profile));"></div>`+
        `<div style="bottom:12px;left:20px" class="absolute btnszone">`+
          `<button onclick="pageGuides(${id})" class=loginbtn style="margin-top:8px"${getTrans('moreInfo')}/button>`+
        `</div>`+
      `</div>`;
    };
    return html;
  },
// #endregion
// #region кастомхелпер
cssRoot = document.body.style,

RGBtoHEX = (string)=>{
  let dataValues = string.split(',');
  let newColor = '#';
  dataValues.forEach(col=>{
    let hexColor = parseInt(col).toString(16);

    if (hexColor.length > 2)
      newColor += 'ff';
    else if (hexColor.length < 2)
      newColor += '0'+hexColor;
    else 
      newColor += hexColor;
  });
  return newColor;
},
HEXtoRGB = (hex)=>{
  let preData = hex.replace('#', ''),
  dataValuesPre = preData.split(''),
  dataValues = [''],

  splitter = false,
  arrId = 0,
  colId = 0;
  dataValuesPre.forEach(el=>{
    dataValues[arrId] += el;
    if (splitter) {
      arrId += 1;
      if (arrId === 3)
        return;
      dataValues[arrId] = '';
    }
    splitter = !splitter;
  });

  dataValues.forEach(col=>{
    dataValues[colId] = parseInt(col,16);
    colId++;
  });

  return dataValues.join();
},
setColor = (name, value, SlocalValue = '')=>{
  cssRoot.setProperty(name, value);
  if (SlocalValue)
    Slocal.set(SlocalValue, value);
},
dropColorScheme = ()=>{
  let rgb = {
    r: 97,
    g: 42,
    b: 157,
  },
  bgColor =  `${parseInt(rgb.r*0.09)},${parseInt(rgb.g*0.08)},${parseInt(rgb.b*0.08)}`,
  mainColor =  `${parseInt(rgb.r   )},${parseInt(rgb.g   )},${parseInt(rgb.b   )}`,
  windowColor =`${parseInt(rgb.r*0.65)},${parseInt(rgb.g*0.75)},${parseInt(rgb.b*0.6 )}`,
  lightColor = `${parseInt(rgb.r*1.35)},${parseInt(rgb.g*0   )},${parseInt(rgb.b*1.65)}`,
  profColor =  `${parseInt(rgb.r*0.3 )},${parseInt(rgb.g*0.5 )},${parseInt(rgb.b*0.2 )}`,

  colorScheme =
    `Bg|${RGBtoHEX(bgColor)},`+
    `Bg-alpha|${RGBtoHEX(bgColor)},`+
    `Main|${RGBtoHEX(mainColor)},`+
    `Light|${RGBtoHEX(lightColor)},`+
    `Window|${RGBtoHEX(windowColor)},`+
    `Profile|${RGBtoHEX(profColor)},`+
    `Profile-alpha|${RGBtoHEX(profColor)},`+
    `Black|#13120f,`+
    `White|#ffffff/`+

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
},
setToColorScheme = ()=>{
  let colorScheme = '',
    sizeScheme = '',
    radioScheme = Slocal.get('ColorScheme').split('/')[2];
  querySelectAll('[iscolorscheme]').forEach(el=>{
    if (el.type == 'color') {
        let nameLover = '--color-'+el.name.toLowerCase(),
          hex = el.value,
          name = el.name;
        colorScheme += `,${name}|${hex}`;

        if (name.includes('-alpha'))
          hex += '99';
        setColor(nameLover, hex, 'Color'+name);
    }
    if (el.type == 'range') {
      let nameLover = '--def-'+el.name.toLowerCase(),
        val = el.value,
        name = el.name;
      sizeScheme += `,${name}|${val}`;
      setColor(nameLover, val+'px', 'Size'+name);
    }
    //if (el.type == 'radio') {
    //  let nameLover = '--rr-'+el.name.toLowerCase(),
    //    val = el.value,
    //    name = el.name;
    //  sizeScheme += `,${name}|${val}`;
    //  setColor(nameLover, val);
    //}
  });
  Slocal.set('ColorScheme',colorScheme.slice(1) + '/' + sizeScheme.slice(1) + '/' + radioScheme);
  innerProfile(gProfileMini());
},
setColorScheme = ()=>{
  Slocal.set('ColorScheme',getElement('scheme').value);
  colorGenerator();
},
clrEditPage = ()=>{
  setLink('color');
  let [Colors, Sizes, Radios] = colorGenerator(),
    colorScheme = Colors.split(','),
    sizeScheme = Sizes.split(','),
    radioScheme = Radios.split(','),
    MenuC = '',
    MenuS = '',
    MenuR = '',
    colorListeners = '',
    sizeListeners = '',
    radioListeners = '';
    //MenuR = 
    //trtd(
    //  '>Tags/Text<',
    //  radioInput('Tags', 'Tags/Text')+
    //  radioInput('Text', 'Tags/Text')
    //);

  colorScheme.forEach(el=>{
    let [name,value] = el.split('|');
    MenuC += 
    `<tr>`+
      `<td`+
        getTrans(name)+
      `/td>`+
      `<td>`+
        `<input iscolorscheme class=colorscheme class=colorscheme type=color id="color-${name}" name="${name}" value=${value}>`+
      `</td>`+
    `</tr>`;
    colorListeners += `,color-${name}`;
  });
  sizeScheme.forEach(el=>{
    let [name,value] = el.split('|');
    MenuS += 
    `<tr>`+
      `<td`+
        getTrans(name)+
      `/td>`+
      `<td>`+
        `<input iscolorscheme class="headbtn" style="padding:0;margin:0;height:48px;margin:-9px 0 -9px 0" class=colorscheme type=range min=8 max=48 step=1 id="color-${name}" name="${name}" value=${value}>`+
      `</td>`+
      `<td>`+
        ` <span id="${name}">${value}px</span>`+
      `</td>`+
    `</tr>`;
    sizeListeners += `,color-${name}`;
  });
  radioScheme.forEach(el=>{
    let [inputs,value] = el.split(':'),
    doneInputs = '',
    checked = 0;
    inputs.split(';').forEach(inp=>{
      let isChecked = checked == value ? 1 : 0;
      doneInputs += radioInput(inp, inputs, isChecked, `iscolorscheme value=${inputs}:${checked} onchange="renderSwitch(this.value,1)"`);
      checked++;
    });
    MenuR += 
    `<tr>`+
      `<td`+
        getTrans(inputs)+
      `/td>`+
      `<td id="color-${inputs}">`+
        doneInputs+
      `</td>`+
    `</tr>`;
    radioListeners += `,color-${inputs}`;
  });

  let html = 
  `<div id=helperContentProfile>`+
    `<h1${getTrans('settings001')}/h1>`+
    `<div style=position:relative id=newNick></div>`+
    `<h2${getTrans('settings005')}/h2>`+
    `<table>`+
      MenuC+
    `</table>`+
    `<h2${getTrans('settings006')}/h2>`+
    `<table>`+
      MenuS+
    `</table>`+
    `<h2${getTrans('settings009')}/h2>`+
    `<table>`+
      MenuR+
    `</table>`+
    `<button class=loginbtn onclick=setToColorScheme()${getTrans('settings002')}/button><br>`+
    `<button class=loginbtn onclick=dropColorScheme()${getTrans('settings003')}/button><br><br><br>`+
    `<div style=display:flex>`+
      `<textarea name=scheme class=framelabel style="width:calc(100% - 170px)" id=scheme>${Slocal.get('ColorScheme')}</textarea>`+
      `<button class=loginbtn onclick=setColorScheme()${getTrans('settings004')}/button><br><br>`+
    `</div><br>`+
    basicButton(getTrans('settings007'), "createBasicError(0)")+'<br>'+
    basicButton(getTrans('settings008'), "createBasicError(1)")+'<br>'+
    basicButton('>DEV PANEL<', 'debugWindow()')+
  `</div>`;

  innerProfile(html);
  colorListeners.slice(1).split(',').forEach(id=>{
    getElement(id).addEventListener('input', el=>{
      setColor('--color-'+el.target.name.toLowerCase(), el.target.value, 'Color'+el.target.name);
    })
  });
  sizeListeners.slice(1).split(',').forEach(id=>{
    let el = getElement(id);
    el.addEventListener('change', el=>{
      setColor('--def-'+el.target.name.toLowerCase(), el.target.value+'px', 'Size'+el.target.name);
    });
    el.addEventListener('input', el=>{
      getElement(el.target.name).innerHTML = el.target.value+'px';
    });
  });
  //radioListeners.slice(1).split(',').forEach(id=>{
  //  let el = getElement(id);
  //  el.addEventListener('change', el=>{
  //    let val = el.target.value;
  //    renderSwitch(val, 1);
  //  });
  //});
},
renderSwitch = (value, set = 0)=>{
  let [Colors, Sizes, Radios] = Slocal.get('ColorScheme').split('/'),
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
    Slocal.set('ColorScheme', Colors+'/'+Sizes+'/'+moreRadios.join(','));
},
colorGenerator = ()=>{
  let [Colors, Sizes, Radios] = Slocal.get('ColorScheme').split('/');

  Colors.split(',').forEach(col=>{
    let [name,hex] = col.split('|');

    if (name.includes('-alpha'))
      hex += '99';
    let SlocalName = 'Color' + name,
    CSSname = '--color-'+name.toLowerCase();
    setColor(CSSname, hex, SlocalName);
    Slocal.set(name, hex);
  });
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
  return [Colors, Sizes, Radios];
};

if (Slocal.get('ColorVer') < 5 || !Slocal.get('ColorVer')) {
  Slocal.set('ColorVer',     5);
  dropColorScheme();
};
colorGenerator();
// #endregion
// #region предстартовые проверки и модуль ловли ошибок

window.addEventListener('popstate', ()=>{
  ignore = true;
  getLink();
});

window.addEventListener('input', e=>{
  if (e.target.type !== 'text')
    return;
  if (!location.search.startsWith('?find') && !location.search.startsWith('?wikis'))
    return;
  clearTimeout(TimeOut[0]);
  TimeOut[0] = setTimeout(()=>{
    sendFinder();
  }, 300);
});

window.addEventListener('resize', setImgSize);

let globalErr = (a, b, c, d, e)=>{
    //console.log(`message: ${a}`);
    //console.log(`source: ${b}`);
    //console.log(`lineno: ${c}`);
    //console.log(`colno: ${d}`);
    //console.log(`error: ${e}`);

    returnError(
      a+
      `\nON LINE ${c} IN COLUMN ${d}`
    );

    return true;
  },
  createBasicError = type=>{
    if (type == 0)
      document.body = null;
    else if (type == 1) {
      Loading();
      helperRequest(`${sData[2]}curl${php}`)
        .then(data=>{
          JSON.parse(data);
          Loading(1);
        })
        .catch(e=>{console.error(e);getPromiseErrorPos(e)});
    }
  },
  getPromiseErrorPos = error=>{
    let errorStack = error.stack,
    errorPos = errorStack
      .split('&helper:')[1]
      .split('\n')[0]
      .split(':');
    console.log(errorPos);
    returnError(
      `PROMISE ERROR\n`+
      `${error}`+
      `\nON LINE ${errorPos[0]} IN COLUMN ${errorPos[1]}`
    , servError);
  };

window.onerror = globalErr;
window.onunhandledrejection = globalErr;
// #endregion

reStart();
