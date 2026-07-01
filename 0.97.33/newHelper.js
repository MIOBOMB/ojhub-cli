class helperStorage {
	constructor(storageName) {
		this.storageName = storageName;
	}
	get(name)		{return localStorage.getItem(this.storageName+name)}
	set(name, value){return localStorage.setItem(this.storageName+name, value)}
	remove(name)	{return localStorage.removeItem(this.storageName+name)}
}

const $id = (i)=>document.getElementById(i),
$q = (i)=>document.querySelector(i),
$qa = (i)=>document.querySelectorAll(i),

$ = {
	title: 'newHelper.js',
	ver: '2.0.4',
	cfg: {
		linkActions: {},
		linkCommands: {},
		helperWindows: null, // for example use $id('yourSubWindowsElement')
		helperHider: null,
		errorWindowButtons: [
			['COPY ERROR',   `navigator.clipboard.writeText($id('errText{errID}').innerText)`],
			['FULL RESTART', `location.reload()`]
		],
		defaultHeaders: {},
		langAddr: '',
		defaultTitle: '',
	},
	link: { // warning!! use $.cfg.linkActions for pages, for modal windows and other use $cfg.linkCommands instead
		ignore: false,
		compileLink() {
			return location.search.replace('?','').split('&');
		},
		set(val, pageTitle = $.cfg.defaultTitle) {
			if (pageTitle)
				document.title = pageTitle;
			if (!this.ignore) {
				let link = this.compileLink();
				link[0] = val;
				link = link.join('&');
				history.pushState(history.state, null, '?'+link);
			}
			this.ignore = false;
		},
		add(val) {
			let link = this.compileLink();
			if (!link.includes(val)) {
				link.push(val);
				link = link.join('&');
				history.pushState(history.state, null, '?'+link);
			}
		},
		remove(val) {
			let link = this.compileLink();
			if (link.includes(val)) {
				link.splice(link.indexOf(val), 1);
				link = link.join('&');
				history.pushState(history.state, null, '?'+link);
			}
		},
		get() {
			let isFirst = true;
			this.compileLink().forEach(keyPre => {
				let [key, value] = keyPre.split('=');
				try {
					let mainRoute = $.cfg.linkActions[key],
						cmdRoute = $.cfg.linkCommands[key];
					if (isFirst)
						if (mainRoute)
							mainRoute(value);
						else 
							basePage();
					else if (cmdRoute)
						cmdRoute(value);
				} catch (e) {
					console.error(e);$.err.handlePromise(e);;
					if (isFirst)
						basePage();
				}
				isFirst = false;
			});
		},
	},
	http: {
		req(method, url, data = '', headers = {}, fileProgressElement = false) {
			return new Promise((resolve, reject)=>{
				if (url === false)
					resolve(data);

				let xhr = new XMLHttpRequest();

				xhr.open(method, url);

				let allHeaders = {
					...$.cfg.defaultHeaders,
					...headers
				};
				for (let header in allHeaders)
					xhr.setRequestHeader(header, allHeaders[header]);
				if (data instanceof FormData)
					null;
				else if (typeof data === 'string') 
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				else if (data && typeof data === 'object') {
					xhr.setRequestHeader('Content-Type', 'application/json');
					data = JSON.stringify(data);
				}

				if (fileProgressElement != false)
					xhr.upload.onprogress = (e) => {
						if (e.lengthComputable) {
							let percentage = (e.loaded / e.total);
							fileProgressElement.setAttribute('value', percentage);
						}
					};

				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4)
						if (xhr.status >= 200 && xhr.status < 300)
							resolve(xhr.response);
						else
							reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`), xhr);
				};
				xhr.onerror = ()=>{
					reject(new Error('Network error'), xhr);
				};

				if (data !== undefined)
					xhr.send(data);
				else
					xhr.send();
			});
		},
	},
	langs: {
		main: {},
	},
	lazy: {
		loaded: {},
		pending: {},
		load(url, ...args) {
			let shortUrl = url.split('?')[0];
			if (!url.includes('?'))
				url = url+'?&helper';
			else if (!url.includes('&helper'))
				url = url+'&helper';
		
			if (this.loaded[shortUrl] === true)
				return Promise.resolve(args);
			if (this.loaded[shortUrl] === false)
				return this.pending[shortUrl]
					.then(() => args)
			this.loaded[shortUrl] = false;

			let pr = new Promise((resolve, reject) => {
				let script = document.createElement("script");
				script.type = "text/javascript";

				script.onload = () => {
					this.loaded[shortUrl] = true;
					delete this.pending[shortUrl];
					console.info($.title+'> loaded script '+url)
					resolve(args);
				};

				script.onerror = () => {
					delete this.loaded[shortUrl];
					delete this.pending[shortUrl];
					reject(new Error(`Failed to load script: ${url}`));
				};

				script.src = url;
				document.getElementsByTagName("head")[0].appendChild(script);
			});
			this.pending[shortUrl] = pr;
			return pr;
		},
		register(script, funcs) {
			if (!script.includes('?'))
				script = script+'?&helper';
			else if (!script.includes('&helper'))
				script = script+'&helper';
			if (!Array.isArray(funcs))
				return new Error('Attempt to register non-array for list of scripts');
			funcs.forEach(fn=>{
				window[fn] = async (...args) => {
					let func = await this.l(script, fn);
					return func(...args);
				}
			});
			console.info($.title+'> Applied lazy '+script+' with this functions:', funcs);
		},
		async l(scr, fnName) { // internal method for $.lazy.register, do not use
			try {
				let lazyOld = window[fnName];
				await this.load(scr);
				let func = window[fnName];
				if (window[fnName] !== lazyOld)
					return func;
				else {
					let attempts = 0,
						func;
					while ((func === lazyOld || typeof func !== 'function') && attempts < 100) {
						await new Promise(resolve => setTimeout(resolve, 100));
						func = window[fnName];
						attempts++;
						console.log($.title+' $.lazy>'+func);
					}
					if (typeof func === 'function' && func !== lazyOld)
						return func;
					else if (attempts >= 100)
						throw new Error(`${$.title} $.lazy> Function ${fnName} failed to load properly (timeout)`);
					else
						return func;
				}
			} catch (e) {
				console.error(e);$.err.handlePromise(e);;
				throw e;
			}
		},
	},
	err: {
		errors: {},
		count: 0,
		posX: 24,
		posY: 60,
		log(err, addr = '') {
			console.error(err, addr);
			$.err.count++;
			if ($.err.count === 1 || !$id('errorBoxCount')) {
				document.body.insertAdjacentHTML('beforeend',
					`<div id=errorBoxCount style=z-index:5;position:fixed;bottom:50px;left:50px;background-color:rgba(0,0,0,.5);padding:12px;border-radius:calc(var(--def-border-large)*1.5)>`+
						`<span id=errorCount style=position:absolute;right:10px;top:10px>1</span>`+
						`<button style=padding:12px class=emptybtn onclick="for (let errId in $.err.errors) {if (!$id('debug'+errId))$.err.show(errId,$.err.errors[errId])}"`+
						`ondblclick="$qa('[iserror]').forEach(el=>{subWindows.close(el.id);})">`+
							'!'+
						`</button>`+
					`</div>`
				)
			} else
				$id('errorCount').innerHTML = $.err.count;
			$.err.show($.err.count, err, addr);
			$.err.errors[$.err.count] = err+addr;
			if ($id('TheLoadElem'))
				$id('TheLoadElem').remove();
		},
		show(errID, errText, addr = '') {
			subWindows.open('debug'+errID,
				`<div id=debug${errID}>`+
					`<p align=center>DEBUG INFO</p>`+
					`ERROR<br>`+
					`<div id=errText${errID}>`+
						`<pre style=width:100%;white-space:pre-line id=debugMega${errID}></pre>`+
					`</div>`+
					`<br><br>`+
					`<center id=windows${errID}>`+
					`</center>`+
				`</div>`
			, `iserror style=top:${$.err.posY}px;left:${$.err.posX}px;width:300px;height:350px`);
			let buttons = '';
			$.cfg.errorWindowButtons.forEach(btn=>{
				buttons += buttonErr(btn[0], btn[1].replace('{errID}', errID));
			});
			$id('windows'+errID).innerHTML = buttons;

			$id('debugMega'+errID).innerText = `LOCATION: ${location}\n`+errText+`\n`+
			(addr === '' ? '' : `\n${addr}`);
			$.err.posY = $.err.posY + 24;
			if ($.err.posY > (innerHeight - 125))
				$.err.posY = 60;
			$.err.posX = $.err.posX + 24;
			if ($.err.posX > (innerWidth - 250))
				$.err.posX = 24;

			function buttonErr(innerHtml, onclick) {
				return `<button style=background-color:#333 onclick="${onclick}">`+
							innerHtml+
						`</button> `
			};
		},
		handleGlobal(message, source, line, column, error){
			$.err.log(message+`\nON LINE ${line} IN COLUMN ${column}`);
			return true;
		},
		handlePromise(error) {
			let errorStack = error.stack,
			errorSrc = errorStack.split(location.origin + location.pathname)[1].split('&helper')[0].split('?')[0],
			errorPos = errorStack
				.split('&helper')[1]
				.split('\n')[0]
				.split(':');
			$.err.log(
				`PROMISE ERROR\n`+
				`${error}`+
				`\nIN ${errorSrc} ON LINE ${errorPos[0]} IN COLUMN ${errorPos[1]}`
			);
		},
		handleRejection(event) {
			const error = event.reason;
			let errorStack = error.stack,
				errorSrc = errorStack.split(location.origin + location.pathname)[1]
					.split('&helper')[0].split('?')[0],
				errorPos = errorStack
					.split('&helper')[1]
					.split('\n')[0]
					.split(':');
		
			$.err.log(
				`PROMISE ERROR\n`+
				`${error}`+
				`\nIN ${errorSrc} ON LINE ${errorPos[0]} IN COLUMN ${errorPos[1]}`
			);
			event.preventDefault();
		},
	},
};

window.onerror = $.err.handleGlobal;
window.onunhandledrejection = $.err.handleRejection;

let

// #region language
getTrans = (id, renderType = 'text')=>{
	let getText = $.langs.main[id],
			prefix = ` data-trans="${id}"`;
	if (getText == undefined || getText == '')
		if (renderType == 'window') {
			getText = id;
			prefix = '';
		} else {
			getText = `<code>getTrans('${id}','${renderType}')</code>`;
			console.warn($.title+'> langPacket key '+id+' is undefined');
		}
	try {
		switch (renderType) {
			case 'window':
			case 'text':		return `${prefix}>${getText}<`;
			case 'textButton':	return `${prefix}>${getText}`;
			case 'inputValue':	return `${prefix} value="${getText}">`;
			case 'input':		return `${prefix} placeholder="${getText}">`;
			case 'textarea':	return `${prefix} placeholder="${getText}"><`;
			case 'img':			return `${prefix} src="${getText}"`;
			default:			return getText;
		}
	} catch (err) {
		$.err.log(err);
		return id;
	}
},
replaceLang = (lang)=>{
	loadLanguage(lang)
		.then(data=>{
			console.time(this);
			let dataTrans = $qa('[data-trans]');
			for (let el of dataTrans) {
				let key = el.getAttribute('data-trans'),
				langValue = $.langs.main[key];
				if (langValue == '')
					langValue = `<code>getTrans('${key}')</code>`;

				switch (el.tagName) {
					case 'IMG':
						el.setAttribute('src', langValue);
						break;
					case 'INPUT':
					case 'TEXTAREA':
						el.setAttribute('placeholder', langValue);
						break;
					default:
						el.innerHTML = langValue;
				}
			}
			console.timeEnd(this);
		})
},
applyLanguage = (langStr)=>{
	return langStr; // use .replaceAll('+var+', var)
},
doLangSetup = (newData)=>{
	$.langs.main = JSON.parse(applyLanguage(newData));
},
loadLanguage = (name, autosetup = true)=>{
	return new Promise((resolve, reject)=>{
		helperRequest($.cfg.langAddr+name+'.json', false, {'Cache-Control':'no-cache, no-store, max-age=0'}) // $.cfg.langAddr custom string
			.then(data=>{

				let newData = data;

				if (autosetup) {
					doLangSetup(newData);
				}
				resolve(newData);
			})
	})
},
// #endregion
// #region subWindows
subWindows = {
	count: 0,
	subws: {},
	resizing: '',
	generateId() {
		let id;
		do {
			id = Math.random().toString(36).substring(2, 8);
		} while (subWindows.subws[id]);

		return id;
	},
	open: (subWinName, htmlContent, customAttrs = '')=>{
		let subWinId = subWindows.generateId(),//subWindows.count+subWinName,
		html =
		`<div class="upperWindow frameprofile ANIM-create2" id=${subWinId} ${customAttrs}>`+
			`<div id=RSZb-${subWinId} style=cursor:n-resize;position:absolute;width:100%;height:6px;bottom:-1px;left:-1px></div>`+
			`<div id=RSZl-${subWinId} style=cursor:w-resize;position:absolute;width:6px;height:100%;left:-1px;top:-1px></div>`+
			`<div id=RSZr-${subWinId} style=cursor:e-resize;position:absolute;width:6px;height:100%;right:-1px;top:-1px></div>`+
			`<div id=RSZt-${subWinId} style=cursor:s-resize;position:absolute;width:100%;height:6px;top:-5px;left:-1px></div>`+
			`<div id=RSZtl-${subWinId} style=cursor:nw-resize;position:absolute;width:6px;height:6px;top:-5px;left:-1px></div>`+
			`<div id=RSZtr-${subWinId} style=cursor:ne-resize;position:absolute;width:6px;height:6px;top:-5px;right:-1px></div>`+
			`<div id=RSZbl-${subWinId} style=cursor:sw-resize;position:absolute;width:6px;height:6px;bottom:-1px;left:-1px></div>`+
			`<div id=RSZbr-${subWinId} style=cursor:se-resize;position:absolute;width:6px;height:6px;bottom:-1px;right:-1px></div>`+
			`<div align=right class=underWindow clicktime=0 ondblclick=subWindows.switchFullMode('${subWinId}') id=DRAGGER${subWinId}>`+
				`<div style=position:absolute;left:2px${getTrans('WINDOW-'+subWinName,'window')}/div>`+
				windowButton('–', `subWindows.hide('${subWinId}','${subWinName}')`, `font-weight:bold`)+
				windowButton('X', `subWindows.close('${subWinId}')`, `font-weight:bold`)+
			`</div>`+
			`<div id=content-${subWinId} style=overflow:auto;width:100%;height:100%>`+
				htmlContent+
			`</div>`+
		`</div>`;
		$.cfg.helperWindows.insertAdjacentHTML('beforeend', html);

		let subWindow = $id(subWinId);
		if (!customAttrs.includes('top')) {
			let topValue = subWindow.offsetTop - (subWindow.offsetHeight / 2) + 'px',
			leftValue = subWindow.offsetLeft - (subWindow.offsetWidth / 2) + 'px';
			subWindow.style.top = parseInt(topValue) >= 0 ? topValue : '0px';
			subWindow.style.left = parseInt(leftValue) >= 0 ? leftValue : '0px';
		}
		if (!customAttrs.includes('width'))
			subWindow.style.height = (subWindow.offsetHeight - 50) + 'px';
		if (!customAttrs.includes('height'))
			subWindow.style.width = (subWindow.offsetWidth - 50) + 'px';

		subWindow.onanimationend = ()=>{
			subWindow.classList.remove('ANIM-create2');
			subWindow.onanimationend = null;
		};
		subWindows.subws[subWinId] = {
			state:'opened',
			element:$id(subWinId),
			dragger:$id('DRAGGER'+subWinId)
		};
		subWindows.initDragger(subWinId);
		subWindows.initResizer(subWinId);
		return subWindows.count++;
	},
	initDragger: (subWinId)=>{
		let subWindow = subWindows.subws[subWinId].element,
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
				subWindows.switchFullMode(subWindow.id);
			target.setAttribute('clicktime', Date.now());

			$.cfg.helperWindows.appendChild(subWindow);

			e.preventDefault();
			pos3 = e.clientX || e.touches[0].clientX;
			pos4 = e.clientY || e.touches[0].clientY;

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

			subWindow.style.top = (subWindow.offsetTop - pos2) + "px";
			subWindow.style.left = (subWindow.offsetLeft - pos1) + "px";
		},

		stopDrag = ()=>{
			document.onmouseup = null;
			document.ontouchend = null;

			document.onmousemove = null;
			document.ontouchmove = null;
		};

		let draggerElement = $id(`DRAGGER${subWinId}`);

		draggerElement.onmousedown = startDrag;
		draggerElement.ontouchstart = startDrag;
	},
	initResizer: (subWinId)=>{
		let subWindow = subWindows.subws[subWinId].element,
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

			$.cfg.helperWindows.appendChild(subWindow);

			e.preventDefault();
			pos3 = e.clientX || e.touches[0].clientX;
			pos4 = e.clientY || e.touches[0].clientY;

			document.onmouseup = stopResize;
			document.ontouchend = stopResize;

			subWindows.resizing = target.id.substring(3, 5);
			document.onmousemove = resizeMove;
			document.ontouchmove = resizeMove;
		},

		resizeMove = e=>{
			e.preventDefault();

			let clientX = e.clientX || e.touches[0].clientX,
				clientY = e.clientY || e.touches[0].clientY;

			pos1 = pos3 - clientX;
			pos2 = pos4 - clientY;
			pos3 = clientX;
			pos4 = clientY;

			let dir = subWindows.resizing;
			if (dir.includes('t')) {
				subWindow.style.top = (subWindow.offsetTop - pos2) + "px";
				subWindow.style.height = (subWindow.offsetHeight - padding + pos2) + "px";
			}
			if (dir.includes('b'))
				subWindow.style.height = (subWindow.offsetHeight - padding - pos2) + "px";
			if (dir.includes('l')) {
				subWindow.style.left = (subWindow.offsetLeft - pos1) + "px";
				subWindow.style.width = (subWindow.offsetWidth - padding + pos1) + "px";
			}
			if (dir.includes('r'))
				subWindow.style.width = (subWindow.offsetWidth - padding - pos1) + "px";
		},

		stopResize = ()=>{
			document.onmouseup = null;
			document.ontouchend = null;

			subWindows.resizing = '';
			document.onmousemove = null;
			document.ontouchmove = null;
		};

		const sizeElements = [`RSZt-`, `RSZb-`, `RSZl-`, `RSZr-`, `RSZtl-`, `RSZtr-`, `RSZbl-`, `RSZbr-`];
		sizeElements.forEach(id=>{
			let el = $id(id+subWindow.id);
			if (el) {
				el.onmousedown = startResize;
				el.ontouchstart = startResize;
			}
		});
	},
	close: (subWinId)=>{
		if (!subWinId)
			return;
		let subWindow = subWindows.subws[subWinId].element,
			winClasses = subWindow.classList;
		if (subWindow)
			if (subWindow.style.display == 'none') {
				$id('hider'+subWindow.id).remove();
				subWindow.remove();
			}
			if (!winClasses.contains('ANIM-full2'))
				winClasses.add('ANIM-stop2');
			else {
				winClasses.remove('ANIM-full2');
				winClasses.add('ANIM-unfullstop2');
			}
		if (winClasses.contains('ANIM-fullhide2'))
			winClasses.remove('ANIM-fullhide2');

		subWindow.onanimationend = ()=>{
			[
				'DRAGGER'+subWinId,
				'RSZb-'+subWinId,
				'RSZl-'+subWinId,
				'RSZr-'+subWinId,
				'RSZt-'+subWinId,
				'RSZtl-'+subWinId,
				'RSZtr-'+subWinId,
				'RSZbl-'+subWinId,
				'RSZbr-'+subWinId
			].forEach(el=>{
				$id(el).onmousedown = null;
				$id(el).ontouchstart = null;
			});
			subWindow.remove();
			delete subWindows.subws[subWinId];
		};
	},
	hide: (subWinId, subWinName)=>{
		let subWindow = subWindows.subws[subWinId].element,
			animName = 'ANIM-hide2',
			winClasses = subWindow.classList
		if (winClasses.contains('ANIM-fullhide2'))
			winClasses.remove('ANIM-fullhide2');
		if (winClasses.contains('ANIM-full2')) {
			winClasses.remove('ANIM-full2');
			animName = 'ANIM-unfullhide2';
		}
		if (subWindow)
			winClasses.add(animName);

		subWindow.onanimationend = ()=>{
			subWindow.style.display = 'none';
			if (animName != 'ANIM-unfullhide2')
				winClasses.remove(animName);
			$.cfg.helperHider.insertAdjacentHTML('beforeend', basicButton(`${getTrans('WINDOW-'+subWinName,'window')}`, `subWindows.unhide('${subWinId}')`, ``, `hider${subWinId}`));
			subWindow.onanimationend = null;
		};
		subWindows.subws[subWinId].state = 'hidened';
	},
	unhide: (subWinId)=>{
		let subWindow = subWindows.subws[subWinId].element,
			hider = $id('hider'+subWinId),
			winClasses = subWindow.classList;
		if (subWindow) {
			if (!winClasses.contains('ANIM-unfullhide2'))
				winClasses.add('ANIM-recreate2');
			else {
				winClasses.remove('ANIM-unfullhide2');
				winClasses.add('ANIM-fullhide2');
				winClasses.add('ANIM-full2');
			}
			subWindow.style.display = '';
		}
		if (hider)
			hider.remove();

		subWindow.onanimationend = ()=>{
			if (!winClasses.contains('ANIM-fullhide2')) {
				winClasses.remove('ANIM-recreate2');
				subWindows.subws[subWinId].state = 'opened';
			} else {
				subWindows.subws[subWinId].state = 'openedF';
				// Window.classList.remove('ANIM-fullhide2');
			}
			subWindow.onanimationend = null;
		};
	},
	switchFullMode: (subWinId)=>{
		let subWindow = subWindows.subws[subWinId].element,
		dragger = subWindows.subws[subWinId].dragger,
		winClasses = subWindow.classList;

		if (winClasses.contains('ANIM-fullhide2'))
			winClasses.remove('ANIM-fullhide2');
		if (winClasses.contains('ANIM-full2')) {
			winClasses.remove('ANIM-full2');
			winClasses.add('ANIM-unfull2');
			subWindow.onanimationend = ()=>{
				winClasses.remove('ANIM-unfull2');
				subWindows.initDragger(subWinId,'');		
				subWindow.onanimationend = null;
				subWindows.subws[subWinId].state = 'opened';
			}
		} else {
			dragger.onmousedown = null;
			dragger.ontouchstart = null;
			subWindow.style.height = (subWindow.offsetHeight - 50) + 'px';
			subWindow.style.width = (subWindow.offsetWidth - 50) + 'px';
			winClasses.add('ANIM-full2');
			subWindow.onanimationend = ()=>{
				dragger.onmousedown = null;
				dragger.ontouchstart = null;
				subWindow.onanimationend = null;
				subWindows.subws[subWinId].state = 'openedF';
			}
		}
	},
},
windowButton = (text, func = '', style = '')=>{
	return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
},
basicButton = (text = '', func = '', style = '', id = '', Class = '')=>{
	return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
};
// #endregion
loadScript = (u, ...a) => $.lazy.load(u, ...a)