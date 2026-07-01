let realColorGenerator = (
	wikiId = 0,
	colorSchemePre =
	`Bg|#090609,Bg-alpha|#090609,Main|#612a9d,Light|#8200ff,Window|#3f1f5e,Profile|#1d151f,Profile-alpha|#1d151f,Black|#120f13,White|#DFD3EB`
 )=>{
	let MenuC = '',
		colorListeners = '',
		colorScheme = '';
	try {
		colorScheme = wikiApplyColor(colorSchemePre);
		if (!colorScheme || typeof colorScheme !== 'object') {
			return megaAlert('CONTENTISNULL');
		}
	} catch (e) {
		return megaAlert('CONTENTISNULL');
	}

	for (let name in colorScheme) {
		let value = colorScheme[name];
		MenuC += 
		`<tr>`+
			`<td`+
				getTrans(name)+
			`/td>`+
			`<td>`+
				`<input iscolorscheme class=colorscheme class=colorscheme type=color id=\"color-${name}\" name=\"${name}\" value=${value}>`+
			`</td>`+
		`</tr>`;
		colorListeners += `,color-${name}`;
	}

	let html = 
		`<h2${getTrans('settings005')}/h2>`+
		`<table>`+
			MenuC+
		`</table>`+
		basicButton(getTrans('settings004'), `wikiSetColors(${wikiId})`)+
		basicButton('>DISCARD<', `wikiSetColors(${wikiId},'Bg|#090609,Bg-alpha|#090609,Main|#612a9d,Light|#8200ff,Window|#3f1f5e,Profile|#1d151f,Profile-alpha|#1d151f,Black|#120f13,White|#DFD3EB')`);
	innerWikiControl(html);

	Object.entries(colorScheme).forEach(([name, value]) => {
		setColorAlt(`--color-${name}`, value);
	});

	colorListeners.slice(1).split(',').forEach(id=>{
		$id(id).addEventListener('input', el=>{
			setColorAlt('--color-'+el.target.name.toLowerCase(), el.target.value);
		})
	});
},
wikiSetColors = (wikiId, colorScheme = '')=>{
	if (colorScheme === '') {
		$qa('[iscolorscheme]').forEach(el=>{
			if (el.type == 'color') {
					let nameLover = '--color-'+el.name.toLowerCase(),
						hex = el.value,
						name = el.name;
					colorScheme += `,${name}|${hex}`;

					if (name.includes('-alpha'))
						hex += '99';
					setColorAlt(nameLover, hex);
			}
		});
		colorScheme = colorScheme.slice(1);
	}
	Loading();
	helperRequest(`${sData[7]}colors${php}`, `wiki=${wikiId}&color=${colorScheme}`)
		.then(data=>{
			if (data != '1')
				return $.err.log(data, `${baseApp}${sData[7]}colors${php}`);
			let wiki = yourWikies['w'+wikiId];
			$id('wikiColor'+wikiId).setAttribute('onclick', `realColorGenerator(${wikiId},'${colorScheme}')`);
			getGuidesAdminControl(wiki.ID);
			wikiApplyColor(colorScheme);
			yourWikies['w'+wikiId].color = colorScheme;
			Loading(1);
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
},
wikiBtnsSwticher = (id, pureRender = false)=>{ // makeSwticher(0,'wikiswitch${id}', wikiBtnsSwticher(${id}), 'wikiswitch-${id}')
	let wiki = yourWikies['w'+id],
			userId = wiki.userId,
			coownersBtn = '',
			connectedContent = wiki.commGdps,
			forum = wiki.forumId,
			mainWiki = wiki.mainWiki;

		if (thisUser.ID == userId)
			coownersBtn = `<button onclick="coownersMenu(${id},-1)" class=loginbtn${getTrans('coowners')}/button>`;
		else 
			coownersBtn = `<button class=loginbtn${getTrans('coownersNone')}/button>`;

		if (connectedContent === 0)
			connectedContent = `<button class=loginbtn onclick="connectContent(${id})"${getTrans('noConnectContent')}/button>`;
		else 
			connectedContent = `<button class=loginbtn onclick="connectContent(${id})"${getTrans('connectedContent')}/button>`;

		if (forum === 0)
			forum = `<button class=loginbtn onclick="createForum(${id})"${getTrans('forumNone')}/button>`;
		else 
			forum = `<button class=loginbtn onclick="openForum(${forum})"${getTrans('forumHas')}/button>`;

		if (mainWiki === 0)
			mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})"${getTrans('mainWikiNone')}/button>`;
		else 
			mainWiki = `<button class=loginbtn onclick="setMainWiki(${id},${mainWiki})"${getTrans('mainWikiHas')}/button>`;

	let html = '';
	if (!pureRender)
		html = 
			`<div id=wikiswitch${id} style="padding:4px;position:absolute;border:solid var(--color-window) 1px;border-radius:var(--def-border-small);z-index:1" class=frameprofile>`+
				`<div align=left>`+
					coownersBtn+
					connectedContent+
					forum+
					mainWiki+
					basicButton(getTrans('files'), `wikiLoadFilesControl(${id})`)+
				`</div>`+
			`</div>`;
	else 
		html = 
			// connectedContent+
			// forum+
			// mainWiki+
			basicButton(getTrans('files'), `wikiLoadFilesControl(${id})`)+
			coownersBtn;
	return html;

},
getGuidesAdminControl = (wikiId, page = 0)=>{
	let html = 
	`<button style="font-size:calc(var(--def-font)*1.5)" class="loginbtn" onclick="createGuide(${wikiId},1)"${getTrans('guides01')}/button>`+
	profileContentDiv()+
		`<div id=GDPSesPlace align=left style=display:flex;flex-wrap:wrap></div>`+
	`</div>`;
	if (page === 0) {
		globalWiki = wikiId;
		innerWikiControl(html);
	}
	Loading();
	helperRequest(`${sData[0]}getGuidesAdmin${php}?wiki=${wikiId}&page=${page}`)
	.then(data=>{
		let parsedData = JSON.parse(data);

		html = GUIDrenderInProfileFull(parsedData, page);
		innerGdpsPlace(html, page);
		Loading(1);
	})
	.catch(e=>{console.error(e);$.err.handlePromise(e)});;
},
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
		imageButton(`${helperUrl}imgs/trash.svg`, `removeGuide(${guideId},${id})`, 'position:absolute;top:20px;right:20px')+
		`<textarea name=subtext[] class=guidInp style=width:100%;height:240px${textAreaHelp}${customContent !== null ? customContent[1] : ''}</textarea>`+
	`</div><br>`;

	$id('frames'+guideId)?.insertAdjacentHTML('beforeend', html);
	if ($id('framesSelector'+guideId))
		$id('framesSelector'+guideId).selectedIndex = 0;
	guideEditorFrame++;
	return html;
},
removeGuide = (guideId, id)=>{
	$id('frame'+guideId+'-'+id).remove();
},
createGuide = (wikiId, backpage = 0)=>{
	if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
	let langs = '';
	langList.forEach(lang=>{
		langs += `<option value="${lang}"${getTrans('gdpsLang'+lang)}/option>`;
	});
	let guidWin = helperSettings.openGuidesInWindow,
			html = 
	`<h1${getTrans('guides01')}/h1>`+
	// (guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `profilePage('');getGuidesAdminControl(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
	`<form id=GDPSesPlace${subWindows.count} style=padding:8px method=post onsubmit="return enterFormData(this,'newGuide${php}')">`+
		`<input name=title class=guidInp id=title${subWindows.count} style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
		`<label${getTrans('gdpsLang00')}/label> `+
		`<select id="langs${subWindows.count}" class="framelabel" name="language" required>`+
			langs+
		`</select><br>`+
		`<input name=img class=guidInp id=img${subWindows.count}${getTrans('guides05', 'input')}`+
		`<div id=frames${subWindows.count}>`+
		`</div>`+
		// `<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
		`<select id=framesSelector${subWindows.count} class=framelabel name=language required onchange=generateGuideframe(${subWindows.count},this)>`+
			`<option selected disabled hidden${getTrans('guides03')}/option>`+

			`<option value=Markdown>Markdown</option>`+
			`<option value=wikiText>wikiText</option>`+
			`<option value=MediaRender>MediaRender</option>`+
		`</select><br>`+
		`<input name=aftertext class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
		`<input type=hidden value=${wikiId} name=wikiId>`+
		`<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
	`</form>`;
	if (guidWin)
		subWindows.open('guidesEditor',html,'style=min-height:200px');
	else
		innerWikiControl(html);
		// $.link.set('wikiPageNew='+wikiId);
},
wikiControlMain = (wikiId)=>{
	let langs = '',
		wiki = yourWikies['w'+wikiId],
		wikiTitle = wiki.title,
		wikiDesc = wiki.text,
		wikiImg = wiki.ban,
		wikiLang = wiki.language,
		wikiConn = '',
		mainWiki = wiki.mainWiki;

		langList.forEach(lang=>{
			langs += `<option value="${lang}"${lang == wikiLang ? ' selected' : ''}${getTrans('gdpsLang'+lang)}/option>`;
		});
		
		if (wiki.connGdps == 0) 
			wikiConn = basicButton(getTrans('noConnectContent'), `connectContent(${wikiId})`);
		else 
			wikiConn = basicButton(getTrans('connectedContent'), `connectContent(${wikiId})`);

		// if (mainWiki == 0)
		//	 mainWiki = basicButton(getTrans('mainWikiNone'), `setMainWiki(${wikiId},${mainWiki})`);
		// else 
			mainWiki = 
		basicInput('', 'wikiMainSet', 'max-width:calc(100% - 14px)', '', mainWiki)+'<br>'+
		basicButton(getTrans('mainWikiHas'), `setMainWiki(${wikiId},${mainWiki},1)`);

		let html = 
			wikiConn+'<br><br>'+
			(false ? basicButton(getTrans('forumHas'))+'<br><br>' : '')+ // включить в 0.97.1
			mainWiki+'<br><br>'+

			basicInput('guides02', 'wname', 'max-width:calc(100% - 14px)', '', wikiTitle)+'<br>'+
			`<label${getTrans('gdpsLang00')}/label> `+
			`<select id=langs class=framelabel name=language required>`+
				langs+
			`</select><br>`+
			basicInput('guides05', 'wimg', 'max-width:calc(100% - 14px)', '', wikiImg)+'<br>'+
			`<textarea id=wdesc style="width:calc(100% - 14px);height:160px" class=framelabel${getTrans('textInput02', 'input')}${wikiDesc}</textarea>`+'<br>'+
			basicButton(getTrans('edit'), `wikiEditNew(${wikiId})`);
	return html;
},
wikiEditNew = (wikiId)=>{
	if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
	let
		title = $id('wname').value,
		text = $id('wdesc').value,
		ban = $id('wimg').value,
		language = $id('langs').value,
		post = `title=${title}&language=${language}&img=${ban}&text=${text}&wikiId=${wikiId}`;
	Loading();
	helperRequest(`${sData[1]}editWiki${php}?id=${wikiId}`, post)
		.then(data=>{
			let parsedData = JSON.parse(data);
			yourWikies['w'+parsedData.ID] = parsedData;
			Loading(1);
			getGuidesAdminControl(parsedData.ID);
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
},
wikiLoadFiles = (wikiId)=>{
	$.link.set('wikiFiles='+wikiId);
	let html = 
	`<div id=helperContentProfile>`+
		`<h1><span${getTrans('files')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
		basicButton(getTrans('fileUplo'), `uploadFilesWindow(${wikiId})`)+`<br>`+
		`<progress max=16777216 value=0 id=fileSize ></progress> `+
		`<span><span id=fileSizeInt></span>/16777216</span>`+
		`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`+
	`</div>`;
	helperRequest(`${sData[7]}filesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(`<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			updateFileSize(parsedData.fileSize);
			innerGdpsPlace(renderFiles(parsedData.files, wikiId));
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
	innerProfile(html);
},
wikiLoadFilesControl = (wikiId)=>{
	let html = 
	`<h1><span${getTrans('files')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
	basicButton(getTrans('fileUplo'), `uploadFilesWindow(${wikiId})`)+`<br>`+
	`<progress max=16777216 value=0 id=fileSize ></progress> `+
	`<span><span id=fileSizeInt></span>/16777216</span>`+
	`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`;
	helperRequest(`${sData[7]}filesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(`<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			updateFileSize(parsedData.fileSize);
			innerGdpsPlace(renderFiles(parsedData.files, wikiId));
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
	innerWikiControl(html);
},
uploadFiles = (form, wikiId, windowsId)=>{
	let FORMDATA = new FormData(form);
			params = '',
			postHasFiles = false,
			progressElement = $id(windowsId+'fileProg');

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
	helperRequest(`${sData[7]}filesSend${php}?id=${wikiId}`, params, false, progressElement)
		.then(data=>{
			Loading(1);
			subWindows.close(windowsId+'uploadFiles');
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
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
		return false;
},
uploadFilesWindow = (wikiId)=>{
	subWindows.open('uploadFiles',
		`<h1${getTrans('fileUplo')}/h1>`+
		`<form id=${subWindows.count}formFile onsubmit="return uploadFiles(this,${wikiId},${subWindows.count})">`+
			`<input class=framelabel name=title id=${subWindows.count}title${getTrans('fileTitle','input')}<br>`+
			`<progress max=1 value=0 id=${subWindows.count}fileProg style=display:none></progress><br>`+
			`<input name=files id=${subWindows.count}files type=file multiple><br>`+
			basicButton(getTrans('otmena'), `$id('${subWindows.count}formFile').setAttribute('onsubmit','return false');subWindows.close('${subWindows.count}uploadFiles')`)+
			`<input type=submit class=loginbtn${getTrans('commSend', 'inputValue')}`+
		`</form>`
	);
},
deleteFileWindow = (wikiId, fileTitle)=>{
	subWindows.open('deleteFile',
		`<p${getTrans('fileSure')}/p>`+
		basicButton(getTrans('yes'), `deleteFile(${wikiId},'${fileTitle}',${subWindows.count})`)+
		basicButton(getTrans('no'), `subWindows.close('${subWindows.count}deleteFile')`)
	);
},
deleteTemplateWindow = (wikiId, template)=>{
	subWindows.open('deleteTemplate',
		`<p${getTrans('fileSure')}/p>`+
		basicButton(getTrans('yes'), `deleteTemplate(${wikiId},'${template}',${subWindows.count})`)+
		basicButton(getTrans('no'), `subWindows.close('${subWindows.count}deleteTemplate')`)
	);
},
renderFiles = (parsedData, wikiId = 0)=>{
	let html = '';
	console.log(parsedData);
	for (let fileTitle in parsedData) {
		let file = parsedData[fileTitle];
		if (typeof file == 'number')
			continue;
		console.log(file);
		html += 
			`<div class=framegdps id="FILE-${fileTitle}" style=width:260px;height:260px>`+
				`<div align=center>`+
					`<h2>${fileTitle}</h2>`+
					`<img src="${helperUrl}imgs/customwiki/${wikiId}/${file[0]}" style=margin:0;max-width:160px;max-height:160px><br>`+
					emptyButton(`>${file[2]}<`, `otherProfile(${file[1]},'innerMain(profilePage(\`\`));wikiControl(${wikiId});wikiLoadFilesControl(${wikiId})')`)+
					// `<span style=opacity:50%;font-size:calc(var(--def-font)*0.75)>https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}</span><br>`+
				`</div>`+
				basicButton(getTrans('fileGetLink'), `linkCopy('https://objecthub.xyz/imgs/customwiki/${wikiId}/${file[0]}')`, 'position:absolute;bottom:8px;left:8px')+
				imageButton(`${helperUrl}imgs/trash.svg`, `deleteFileWindow(${wikiId},'${fileTitle}')`, 'position:absolute;bottom:8px;right:8px')+
			`</div>`;
	}
	return html;
},
wikiLoadTemplatesControl = (wikiId)=>{
	let html = 
	`<div id=helperContentProfile>`+
		`<h1><span${getTrans('templates')}/span><span> ${yourWikies['w'+wikiId].title}</span></h1>`+
		basicButton(getTrans('tempNew'), `editTemplateWindow(${wikiId})`)+`<br>`+
		`<div id=GDPSesPlace style="display:flex;flex-wrap:wrap"></div>`+
	`</div>`;
	Loading();
	helperRequest(`${sData[7]}templatesGet${php}?id=${wikiId}`)
		.then(data=>{
			Loading(1);
			if (data == '')
				return innerGdpsPlace(`<span${getTrans('newsNone')}/span>`);
			let parsedData = JSON.parse(data);
			innerGdpsPlace(renderTemplates(parsedData, wikiId));
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
	innerWikiControl(html);
},
renderTemplates = (parsedData, wikiId = 0)=>{
	let html = '';
	console.log(parsedData);
	for (let templateName in parsedData) {
		let t = parsedData[templateName];
		if (typeof t == 'number')
			continue;
		console.log(t);
		html += 
			`<div class=framegdps id="TEMP-${templateName}" style=width:160px;height:120px>`+
				`<div align=center>`+
					`<h2>${templateName}</h2>`+
					`<p>${t[2]}</p>`+
				`</div>`+
				imageButton(`${helperUrl}imgs/edit.svg`, `editTemplateWindow(${wikiId},'${templateName}')`, 'position:absolute;bottom:8px;left:8px')+
				imageButton(`${helperUrl}imgs/trash.svg`, `deleteTemplateWindow(${wikiId},'${templateName}')`, 'position:absolute;bottom:8px;right:8px')+
			`</div>`;
	}
	return html;
},
templateArgId = 0,
templateArg = (arg)=>{
	templateArgId++;
	return `<div id=${templateArgId}arg style=width:100%;display:flex>`+
		`<input argument style=width:90% class=framelabel value="${arg}">`+
		basicButton('>-<', `$id('${templateArgId}arg').remove()`, '10%')+
	`</div>`;
},
editTemplateWindow = (wikiId, templateName = '')=>{
	if ($q('[w'+wikiId+templateName+']'))
		return -1;

	let methodsPre = ['Markdown', 'wikiText'],
			methods = '',
			templateTitle = '';
	methodsPre.forEach(m=>{
		methods += `<option value=${m}>${m}</option>`;
	});

	if (templateName != '')
		templateTitle = `<h2 id=name>${templateName}</h2>`;
	else {
		templateName = ''+subWindows.count;
		templateTitle = `<input style="height:calc(var(--def-font)*2);width:calc(100% - 28px)" id=${templateName}-name class=framelabel>`;
	}
	
	let subWindowId = subWindows.open('templateEditor',
		`<h1${getTrans('tempEditor')}/h1>`+
		templateTitle+
		`<select id=${templateName}-method style="width:calc(100% - 8px)" class=framelabel name=gdps>`+
			methods+
		`</select>`+
		`<div>`+
			`<div id=${templateName}-args></div>`+
			basicButton('>+<', `$id('${templateName}-args').insertAdjacentHTML('beforeend', templateArg(''))`, 'width:calc(100% - 8px)')+
			`<p${getTrans('tempArgGuide')}/p>`+
		`</div>`+
		`<textarea style="width:calc(100% - 24px);height:calc(100% - 275px)" class=framelabel id=${templateName}-content></textarea><br>`+
		basicButton('>?<', `falseGuideInWindow('${templateName}')`)+
		basicButton(getTrans('edit'), `saveTemplate(${wikiId},'${templateName}')`)
	, 'w'+wikiId+templateName+' style=width:330px;height:450px');

	if (templateName != subWindowId) {
		Loading();
		helperRequest(`${sData[7]}templateGet${php}?id=${wikiId}&name=${templateName}`)
			.then(data=>{
				Loading(1);
				let parsedData = JSON.parse(data);
				if (Array.isArray(parsedData[0])) {
					let argsDiv = $id(templateName+'-args');
					parsedData[0].forEach(arg=>{
						argsDiv.insertAdjacentHTML('beforeend', templateArg(arg));
					})
				}
				$id(templateName+'-content').innerHTML = parsedData[1];
				$q('option[value="'+parsedData[2]+'"]').setAttribute('selected', '');
			})
			.catch(e=>{console.error(e);$.err.handlePromise(e)});;
	}
},
saveTemplate = (wikiId, templateName)=>{
	let args = $qa('[argument]'),
			argsList = [],
			method = $id(templateName+'-method').value,
			doSafe = (text)=>encodeURIComponent(text),
			content = doSafe(
				$id(templateName+'-content').value
			);
	if (args.length !== 0) {
		args.forEach(arg=>argsList.push(arg.value));
		argsList = '&arg[]='+argsList.join('&arg[]=');
		console.log(templateName, content, argsList);
	} else
		args = '';
	console.log(args);
	let realTemplateName = templateName;
	if ($id(templateName+'-name'))
		realTemplateName = $id(templateName+'-name').value;
	Loading();
	helperRequest(`${sData[7]}templateSave${php}`, `id=${wikiId}&name=${realTemplateName}&method=${method}${argsList}&content=${content}`)
		.then(data=>{
			Loading(1);
			if ($id(templateName+'-name')) {
				let parsedData = JSON.parse(data);
				subWindows.close(templateName+'templateEditor');
				innerGdpsPlace(renderTemplates(parsedData), 511);
			}
		})
		.catch(e=>{console.error(e);$.err.handlePromise(e)});;
};


editGuide = (guideId, wikiId, backpage = 0)=>{
	if (thisUser.isActive == 0)
		return accountIsntActiveAlert();
	let langs = '';
	let guidWin = helperSettings.openGuidesInWindow;
	Loading();
	helperRequest(`${sData[1]}editGuide${php}?id=${guideId}`)
	.then(data=>{
		if (data == '["NONE"]') {
			profilePage();
			megaAlert('CONTENTISNULL');
			Loading(1);
			return;
		}
		let parsedData = JSON.parse(data),
			guideinfo = parsedData['guideinfo'];

		langList.forEach(lang=>{
			langs += `<option value="${lang}"${guideinfo[3] == lang ? ' selected' : ''}${getTrans('gdpsLang'+lang)}/option>`;
		});

		innerGdpsPlace(`<input name=guidId value=${guideId} type=hidden>`,1);
		guideEditorFrame = 1;
		let guidedata = parsedData['guidedata'],
			preFrames = '';
		guidedata.forEach(guid=>{
			preFrames += newGuideFrame(guideId, guideEditorFrame, guid);
		});

		let html = 
		`<h1${getTrans('guides01')}/h1>`+
		// (guidWin == 0 ? `<button type=button class=loginbtn onclick="${backpage === 1 ? `profilePage('');getGuidesAdminControl(${wikiId})` : `pageGuides(${wikiId})`}"${getTrans('otmena')}/button><br>` : '')+
		`<form id=GDPSesPlace${guideId} style=padding:8px method=post onsubmit="return enterFormData(this,'editGuide${php}?id=${guideId}')">`+
			`<input name=title class=guidInp id=title${guideId} value="${guideinfo[1]}" style="width:calc(100% - 4px);font-size:calc(var(--def-font)*2)"${getTrans('guides02', 'input')}<br>`+
			`<label${getTrans('gdpsLang00')}/label> `+
			`<select id="langs${guideId}" class="framelabel" name="language" required>`+
				langs+
			`</select><br>`+
			`<input name=img class=guidInp value="${guideinfo[4]}" id=img${guideId}${getTrans('guides05', 'input')}`+
			`<div id=frames${guideId}>`+
				preFrames+
			`</div>`+
			// `<button type=button class=loginbtn onclick="newGuideFrame(guideEditorFrame)"${getTrans('guides03')}/button><br><br>`+
			`<select id="framesSelector${guideId}" class="framelabel" name="language" required onchange=generateGuideframe(${guideId},this)>`+
				`<option selected disabled hidden${getTrans('guides03')}/option>`+

				`<option value=Markdown>Markdown</option>`+
				`<option value=wikiText>wikiText</option>`+
				`<option value=MediaRender>MediaRender</option>`+
			`</select><br>`+
			`<input name=aftertext value="${guideinfo[2]}" id=aftertext${guideId} class=guidInp style=width:210px${getTrans('guides04', 'input')}<br>`+
			`<input type=hidden value=${wikiId} name=wikiId>`+
			`<button type=submit class=loginbtn${getTrans('commSend')}/button>`+
		`</form>`;
		if (!guidWin)
			innerWikiControl(html);
		else 
			subWindows.open('guidesEditor',html,'style=min-height:200px');
		Loading(1);
	})
	.catch(e=>{console.error(e);$.err.handlePromise(e)});;
};
wikiControl = (wikiId, innerContent = wikiControlMain)=>{
	let wiki = yourWikies['w'+wikiId];
	if (!wiki) {
		innerProfile(`<div id=wikiControlP class=framegdpsOld style="width:calc(100% - 14px);">`+
		`</div>`)
		return;
	}

	$.link.set('wikiControl='+wikiId);
	let langs = '',
		wikiTitle = wiki.title,
		html = '',
		color = wiki.color;

	if (color) {
		color = `,'${color}'`;
	} else 
		color = '';

	html = 
	`<div id=helperContentProfile style="width:calc(100% - 14px);">`+
		`<h1>`+
			`<span${getTrans('wikiControl')}/span> `+
			wikiTitle+
		`</h1>`+
		// basicButton(getTrans('edit'), `editWiki(${wikiId},1)`)+
		basicButton(getTrans('guides09'), `innerWikiControl(wikiControlMain(${wikiId}))`)+
		basicButton(getTrans('settings005'), `realColorGenerator(${wikiId}${color})`, '', 'wikiColor'+wikiId)+
		basicButton(getTrans('pages'), `getGuidesAdminControl(${wikiId})`)+
		basicButton(getTrans('templates'), `wikiLoadTemplatesControl(${wikiId})`)+
		wikiBtnsSwticher(wikiId, true)+
		`<div id=wikiControlP class=framegdpsOld style="width:calc(100% - 14px);">`+
			innerContent(wikiId)+
		`</div>`+
	`</div>`;
	innerProfile(html);
	wikiApplyColor(wiki.color);
};
