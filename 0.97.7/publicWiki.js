let 
MediaRender = (comicText)=>{
	let comicArray = comicText.split('\n'),
	comicArr = {};

	if (comicArray.length <= 1)
		return `<div class=comicImage><img style=max-width:100% src=${comicText}></div>`;

	for (let i = 0; i < comicArray.length; i++) {
		comicArr['p'+i] = `<div class=comicImage id=p${i}><img style=max-width:100%;max-height:80vh src=${comicArray[i]}></div> `;
	};
	console.log(JSON.stringify(comicArr));
	let comicStrPre = '';
	
	comicStrPre = Object.values(comicArr).join('');
	
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
	_.$.id('pagePlace').innerHTML = _.$.id(pageId).innerHTML;

	// логика кнопок, я хз как её насрал!!
	let pageNum = parseInt(pageId.slice(1)),
			pagePre = pageNum - 1,
			pageNxt = pageNum + 1;

	_.$.id('pageNum').innerHTML = pageNxt;
	if (_.$.id('p'+pagePre))
		_.$.id('backPage').setAttribute('onclick', `setPage('p${pagePre}')`);
	if (_.$.id('p'+pageNxt))
		_.$.id('nextPage').setAttribute('onclick', `setPage('p${pageNxt}')`);
},
wikiText = (wikitext)=>{
	if (!wikitext) return '';
	wikitext = wikitext.replace(/\\(.)/g, (match, char) => 
		'\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
	);

	// РЕАЛИЗАЦИЯ ШАБЛОНОВ
	let html = wikitext.replace(/\{\{([^}|]+)(?:\|([^}]*))?\}\}/g, (match, templateName, argsStr) => {
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
			return `<div class="template-error">TEMPLATE FAIL: ${error.message}</div>`;
		}
	});

	// Обработка заголовков (==, ===, ====)
	html = html
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
		.replaceAll(/^##\s*(.+)$/gm, '<ol>$1</ol>')	// Нумерованные
		.replaceAll(/^\*\*\s*(.+)$/gm, '<ul>$1</ul>') // Маркированные
		.replaceAll(/^#\s*(.+)$/gm, '<li>$1</li>')	// Нумерованные
		.replaceAll(/^\*\s*(.+)$/gm, '<li>$1</li>') // Маркированные

	// Ссылки ([[Статья]] или [[Статья|Текст]])
		.replaceAll(/\[\[([^|\]]+?)\]\]/g, '<a onclick="getCurrentGuideByTag(\'$1\')">$1</a>')
		.replaceAll(/\[\[([^|\]]+?)\|(.+?)\]\]/g, '<a onclick="getCurrentGuideByTag(\'$1\')">$2</a>')

	// Внешние ссылки ([https://example.com Текст])
		.replaceAll(/\[(https?:\/\/[^\s]+)\]/g, '<a href="$1">$1</a>')
		.replaceAll(/\[(https?:\/\/[^\s]+)\s(.+?)\]/g, '<a href="$1">$2</a>')
		.replaceAll(/\[\[(.*?)\]\]/gm, '<a onclick="getCurrentGuideByTag(\'$1\')">$1</a>')
		.replaceAll(/\[\[(.*?)|(.*?)\]\]/gm, '<a onclick="getCurrentGuideByTag(\'$1\')">$2</a>');

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
	html = html.replaceAll(/(<li>.*<\/li>)+/g, match=>{
		return match.includes('#') 
			? `<ol>${match}</ol>` 
			: `<ul>${match}</ul>`;
	});

	// Переносы строк -> <br> (опционально)
	html = html.replaceAll(/\n/g, '<br>');

	html = html.replace(/\\u[0-9a-fA-F]{4}/g, m => 
		String.fromCharCode(parseInt(m.slice(2), 16))
	);

	return html;
},
getGuides = (wikiId, page)=>{
	if (_.$.id('nextGdps'))
		_.$.id('nextGdps').remove();

	Loading();
	_.http.req('GET',`${nData[7]}guides?wiki=${wikiId}&page=${page}`)
		.then(data=>{
			let parsedData = JSON.parse(data),
				page2 = page++,
				html = renderGuideMini(parsedData, page2);
			innerGdpsPlace(html,1);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
renderGuideMini = (parsedData, page = 0)=>{
	page++;
	let html = '',
		Count = 0,
		preHtml = [],

		gdpsData = null;

	for (let Id in parsedData) {
		let guid = parsedData[Id];
		console.log(guid)
		if (!Array.isArray(guid)) {
			if (guid.ID != 0)
				innerGdpsPlace(insertBtn('openForum('+guid.ID+')', 'forumHas', 0),512);
			_.$.id('wikiName').innerHTML = guid.title;
			continue;
		}
		Count++;
		if (Count == 9) {
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
falseGuideInWindow = (templateName)=>{
	let args = _.$.qa('[argument]'),
			argsList = [],
			method = _.$.id(templateName+'-method').value,
			content = _.$.id(templateName+'-content').value.replaceAll('\n', '\\n');
	if (args.length !== 0) {
		args.forEach(arg=>argsList.push(arg.value));
		console.log(templateName, content, argsList);
	} else
		args = '';
	content = content.replaceAll('&', '&amp;')
									 .replaceAll('<', '&lt;')
									 .replaceAll('>', '&gt;')
									 .replaceAll('"', '&quot;')
									 .replaceAll("'", '&#039;');
	let template = new Function(...argsList, 'return '+method+'(`'+content+'`)'),
			html = '',
			guidedata = [['False', template(...argsList)]];

	console.log(template.toString(), template(...argsList), guidedata[1]);
	guidedata.forEach(div=>{
		let content = '';
		switch (div[0]) {
			case 'MediaRender':
				content = MediaRender(div[1]);
				break;
			case 'wikiText':
				content = wikiText(div[1]);
				break;
			default:
				content = Markdown(div[1]);
				break;
		}
		html +=
		`<div class=frameguide>`+
			content+
		`</div><br>`;
	});
	let subWindowId = new _.win('templateTest',
		`<div id=helperContent>
			<h1 id=title{winId}></h1>
			<div id=texts{winId}>${html}</div>
		</div>`
	, 'style=min-width:250px');
},
getCurrentGuideByTag = (guideId)=>{
	getGuide(guideId, globalWiki);
},
openForum = (forumId)=>{
	contentPreload('', '', 0, 0);
	Loading();
	helperRequest(`${sData[6]}getPosts${php}?id=${forumId}`)
		.then(data=>{
			_.link.set('forum='+forumId);
			Loading(1);

			let parsedData = JSON.parse(data),
				html = forumRenderMini(forumId, parsedData);

			innerGdpsPlace(html);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
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
			_.link.set('forumPost='+forumId+'.'+postId);
			let dataForNextButton = `${postId},4,1`,
				serverResp = JSON.parse(data),
				html = '';

			html = forumRender(serverResp.post);

			innerComments(renderComms(serverResp.comments, 4, dataForNextButton), 0);
			_.$.id('insertable').innerHTML = html;
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
},
forumRenderMini = (forumId, parsedData, page = 0)=>{
	page++;
	let html = '',
		Count = 0,
		preHtml = [],
		gdpsData = null;

	for (let Id in parsedData) {
		let guid = parsedData[Id];
		if (typeof guid !== 'object' && typeof guid === 'string') {
			_.$.id('insertable').innerHTML = '<h1>'+guid+` ${basicButton('>+<', `uploadPost(${forumId})`)}</h1>`;
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
uploadPost = (forumId)=>{
	if (_.$.q('[forumpost]'))
		return -1;
	let html = 
	`<div id=helperContentProfile>
		<h1 id=blacktext${getTrans('newPost')}/h1>
		<form method=post onsubmit="return enterFormData(this,'forumPost${php}')">
			<input style=width:90% class=framelabel type=title name=title${getTrans('addCamp01', 'input')}<br>
			<textarea style=width:90%;height:64px class=framelabel name=text ${getTrans('newsText', 'textarea')}/textarea><br>
			<input type=hidden name=forumId value=${forumId}>
			<input type=submit class="loginbtn"${getTrans('publishNews', 'inputValue')}
		</form>
	</div>`;
	return new _.win('FORUMpost',
		html
	, 'forumpost');
};

pageGuides = (wiki, backButton = '')=>{
	if (backButton !== '')
		backButton = `<div class=gdps-forum><button class=loginbtn onclick="${backButton}"${getTrans('back')}/button></div>`;

	if (typeof(wiki) === 'undefined')
		return pageWikiList();
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
	_.http.req('GET',`${nData[7]}guides?wiki=${wiki}`)
		.then(data=>{
			let parsedData = JSON.parse(data);
			_.link.set('wiki='+wiki, parsedData[0].title);
			let html = renderGuideMini(parsedData);
			innerGdpsPlace(html);
			if (parsedData[0].color != '')
				wikiApplyColor(parsedData[0].color);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
};
getGuide = (id, wikiId = 0)=>{
	globalWiki = wikiId;
	let html = pHeader()+
		`<div id=helperContent>`+
			`<h1 id=title></h1>`+
			`<div id=texts></div>`+
			`<div id=innerEDIT class=gdps-forum><button class=loginbtn onclick="pageGuides(${wikiId})"${getTrans('back')}/button></div>`+
			`<div align=center style="margin:8px">`+
				contentSendCommForm(id+',2,6')+
				`<div id=comments>`+
				`</div>`+
			`</div>`+
		`</div>`;
	innerMain(html);
	Loading();
	_.http.req('GET',`${nData[7]}guide?id=${id}&wiki=${wikiId}`)
		.then(data=>{
			if (data == '["NONE"]') {
				megaAlert('CONTENTISNULL');
				Loading(1);
				return;
			}
			let parsedData = JSON.parse(data),
				guideinfo = parsedData['guideinfo'],
				guidedataPre = parsedData['guidedata']
        			.replace(/\r\n/g, '\\n')
			        .replace(/\r/g, '\\n')
	        		.replace(/\n/g, '\\n')
			        .replace(/\t/g, '\\t'),
				guidedata = JSON.parse(guidedataPre),
				comments = parsedData['comments'],
				templates = parsedData['templates'],
				html = '';
			_.link.set('wikiPage='+id+'.'+wikiId, guideinfo[1]);

			if (!wikiTemplates[wikiId])
				wikiTemplates[wikiId] = {};

			if (Object.keys(templates).length !== 0)
				for (let template in templates) {
					console.log(template);
					if (!wikiTemplates[wikiId].hasOwnProperty(template)) {
						let t = templates[template],
						doneCode = t[1]
							.replaceAll('&', "&amp;")
							.replaceAll('<', "&lt;")
							.replaceAll('>', "&gt;")
							.replaceAll('"', "&quot;")
							.replaceAll("'", "&#039;");
						console.log(doneCode);
						wikiTemplates[wikiId][template] = function(){};
						wikiTemplates[wikiId][template] = new Function(...t[0], 'return '+t[2]+'(`'+doneCode+'`)');
						console.log(wikiTemplates[wikiId][template]);
					}
				}

			_.$.id('title').innerHTML = guideinfo[1];
			if (guideinfo[3]) 
				_.$.id('title').insertAdjacentHTML('afterend', guideinfo[2]);
			if (guideinfo[4]) 
				wikiApplyColor(guideinfo[4]);

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
						content = Markdown(div[1]);
						break;
				}
				html +=
				`<div class=frameguide>`+
					content+
				`</div><br>`;
			});
			html += guideinfo[2];

			_.$.id('texts').innerHTML = html;

			_.$.id('comments')
				.insertAdjacentHTML('beforeend',
					renderComms(comments,2,`${id},2,1`)
				);
			Loading(1);
		})
		.catch(e=>{console.error(e);_.err.handleRejection(e)});;
};
