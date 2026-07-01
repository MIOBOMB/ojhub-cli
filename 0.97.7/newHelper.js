/*
 * Перед вами код newHelper.js версии 2.1.8,
 * Фронтенд библиотека сверхлегких и мощных утилит.
 * Библиотека построена на базе фабрики
 * Которая начинается с Intl.newHelper=function(namespace){...};
 * Причина использоватся Intl.newHelper банально проста
 * Если я в 2.1.0 засирал глобалскоуп одной полу гибкой переменной
 * И парочкой addEventListener,
 * То почему бы не начать отказываться от засирания глобал скоупа
 * при скачивании библиотеки как такового
 * И да, для инициализации ньюхелпера реально нужно писать
 * Intl.newHelper(yourVar) чтобы newHelper появился в window.yourVar
 * 
 * Стиль комментариев
 * FIXME - странное поведение функции, которое желательно бы переделать
 *         ну или просто заметки для себя на будущее
 * HMM - требует уточнения
 * !!! - обратите внимание
 * See also - почитайте для понимания как устроено
 *
 * 
 * HMM: рассмотреть переход на es6 экспорт вместо вкладывания фабрики в Intl
 * HMM: рассмотреть переделку окон под iife фабрику
 * 
 * Модули пришедшие с релизом 2.1:
 * link
 * lazy
 * lang
 * http
 * html
 * storage
 * err
 * hotkeys
 * win (+wins)
 *
 * Модули удалённые после 2.1 (ищите полифиллы в конце файла):
 * $
 *
 * Новые модули, готовятсяк релизу в 2.2
 * их апи может быть чуть чуть нестабильно
 * link (пропатченный, см. window[_].link.get => dynamic)
 * form
 * pipe/pipeAsync
 * drag (портирован из win._initDrag)
 * fade (портирован из win._animate)
 * x10 (x window system - портирован и рефакторнут из кусков win)
 * toast

 *
 * Модули, имена которых зарезервированы на 2.3++
 * не используйте их неймспейсы для плагинов:
 * filezone
 * ikarus
 * tables
 * resize
 *
 * Плагины, новый паттерн который я хочу узаконить в 2.2
 * Это не _.use(), не _.plugins, не мутация прототипа
 * Простое назначение _.myPlugin = pluginFabric(_);
 * (где _ это уже вызванная фабрика ядра)
 * Как предполагается работать? также как и Intl.newHelper(namespace)
 * Фабрика плагина возвращает объект, метод, или класс, или что вам нужно
 * Вам для подключения плагина просто нужно дать плагину неймспейс внутри ядра
 * И вызвать фабрику, всё!
 *
 * О модуле таблиц!!!!
 * Я его удалил потому что создавать второй движок окон мне нахуй не надо
 * Эта блядота заняла бы у меня ещё порядка 200-400 строк просто чтобы стать
 * "хорошей альтернативой" условным react-tables или datatables
 * Если я и захочу его делать снова то ждите 2.4, может быть тогда у меня хватит ума
 * Придумать как сделать правильно, и по своему
 * А щас, пусть эта гнида горит в аду, не место недопиленному говну в ядре unix.js
 *
 * А если вам нужны именно ньюхелпер таблицы
 * Будьте добры проверить исходники 2.1.6 на npm
 * Или пилите самодельные таблицы через innerHTML или window[_].html
 * Что вам удобнее то и берите
 *
 * Я (MIOBOMB) хочу релизнуть 2.2 уже после 2.1.8,
 * ибо мне в идеале закончить тосты и Object Hub 0.98
 */

// deprecated!!
/** @import { NewHelper } from './newHelper.d.ts' */
Intl.newHelper=function(_='_') {
	if (!window[_])
		window[_] = {};

	window[_].ver = '2.1.8';

	window[_].link = {
		/*
		 * МОДУЛЬ ССЫЛОК
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.7
		 * 
		 * Работает по принципу [ссылка, команды...]
		 * Пример: ?home&debug&lang=ru
		 *          ^^^^ ^^^^^^^^^^^^^
		 *      страница команды
		 * 
		 * В процессе разработки ядра 2.0 в Object hub я понял
		 * Что команды могут быть очень полезными для отладки
		 * Но в теории на них можно повешать все модальные и прочие действия
		 * 
		 * !!!: в функции get() работает весь роутинг, в т.ч. вложенный для страниц
		 * !!!: пожалуйста, относитесь к этому модулю не как к "компонентной модели"
		 *      или что у вас там в реактивном вебе.
		 *      А относитесь к нему как к серверному маршрутизатору,
		 *      вы же ведь можете сделать красивые и адекватные маршруты.
	   	 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/History_API
		 */
		basePage: ()=>{},
		defTitle: '',
		actions: {},
		commands: {},

		_i: true, // _i - блокировщик pushState в set()
		_pop() {
			/*
			 * Popstate движок
			 *
			 * Сделан он для сохранения команд в истории
			 * Это уникальная фича newHelper.js
			 *
			 * Зачем я сделал сохранение команд?
			 * Он вырос из потребностей object hub
			 * Для меня это потребность сохранять
			 * отладочные состояния в url
			 * или вызывать функции одноразки, например:
			 * - вызов модалки с конкретными данными (&user=1)
			 * - смена настроек SPA по команде (язык, тема...)
			 * - 
			 * - сброс localStorage
			 * для вас это может быть всё что угодно
			 * но если он вам не нужен - link.popInit=true
			 *
			 * popstate срабатывает когда:
			 * - пользователь прыгает по истории назад/вперёд
			 * - мы вызываем history.pushState (не replaceState)
			 * 
			 * _i различает эти случаи:
			 * true = пользователь прыгнул назад
			 * false = страница пишет свой адрес в ссылку
			 */
			// HMM: некоторые браузеры могут вызывать popstate и при реплейсе
			if (!window[_].link._i) {
				// здесь происходит перенос команд при popstate
				// читайте window[_].link.get() если хотите узнать почему
				let newUrl='?' + [window[_].link.compile()[0],...window[_].link._cmd].join('&');
				window[_].link._i=true;
				history.replaceState(null,null,newUrl);
				window[_].link.get();
			} else
				window[_].link._i=false;
		}, 
		_cmd: [],
		popInit: false,
		_init() {
			if (!window[_].link.popInit) {
				window.addEventListener('popstate', ()=>window[_].link._pop());
				window[_].link.popInit = true;
			}
		},

		compile: (e=location.search)=>e.replace('?','').split('&'),
		set(page, title = window[_].link.defTitle) {
			if (title) document.title = title;
			if (!window[_].link._i) {
				let link = window[_].link.compile();
				link[0] = page;
				history.pushState(null,null,'?'+link.join('&'));
			}
			window[_].link._i = false;
		},
		add(cmd) {
			let link = window[_].link.compile();
			if (!link.includes(cmd)) {
				link.push(cmd);
				window[_].link._cmd.push(cmd);
				history.replaceState(null,null,'?'+link.join('&'));
			}
		},
		remove(cmd) {
			let link = window[_].link.compile();
			if (link.includes(cmd)){
				let c = window[_].link._cmd;
				link.splice(link.indexOf(cmd),1);
				c.splice(c.indexOf(cmd),1);
				history.replaceState(null,null,'?'+link.join('&'));
			}
		},

		get() {
			window[_].link._init();
			/*
			 * Страницы бросают ошибку чтобы вызвать базовую страницу
			 * Команды тем временем так не делают
			 * Потому что сломанная команда не так страшна как сломанная страница
			 * И вдруг на вашем сайте висит трекер от гугла который что то пишет в url
			 * 
			 * При popstate команды берутся из хранилища _cmd, вместо самой ссылки
			 * Сделано это для переноса команд при прыжках по истории
			 */
			let links = window[_].link.compile(),
				[ firstKey, fisrtValue ] = links[0].split('='),
				cmds = links.slice(1);
			try {
				let route = firstKey.split('/'),
					dir = window[_].link.actions,
					main = dir[firstKey];
				if (!firstKey.includes('/')) {
					main(fisrtValue);
				} else {
					/*
					 * ВЛОЖЕННЫЙ РОУТЕР
					 *
					 * Фича которую я сделал случайно
					 * в поединке с бекендером-вайбкодером
					 *
					 * Заодно со скуки я сделал динамические маршруты
					 * Я офигел когда понял что они полностью рабочие
					 * Впрочем динамика работает также как и везде
					 * называете свой ключ с двоеточия и всё работает
					 *
					 * !!!:
					 * Чтобы создать вложенность вам нужно
					 * сделать объект вместо функции
					 * и обязательно добавить "/" в конце ключа
					 * и внутри объекта уже описывать либо
					 * ещё большую вложенность, либо маршруты
					 * ТАКЖЕ
					 * Если вы используете динамический роутер
					 * Ваши query параметры будут удалены
					 * А сама переменная передаваемая в функцию
					 * Станет массивом, который нужно раскрыть
					 * Количество динамики в пути - количество элементов массива
					 *
					 * Пример роутера:
					 *
					 * {
					 *   '':          ()=>mainPage(),
					 *   'account/': {
					 *     '':        ()=>profile(),
					 *     'settings':()=>settings()
					 *   },
					 *   'product':   e=>getProduct(e),
					 *   'user/': {
					 *	   ':id':     ...e=>getProfile(...e)
					 *   }
					 * }
					 *
					 * FIXME:
					 * сделать документацию
					 * или хотябы интродакшн с интерактивом
					 */
					let dynamic = [];
					for (let point of route){
						let isDyn = Object.keys(dir).find(e=>e.startsWith(':'));
						if (isDyn) {
							dynamic.push(point);
							point = isDyn;
							if (point.endsWith('/'))
								point = point.slice(0,-1);
						}
						let kDir = dir[point+'/'];
						if (kDir)
							dir = kDir;
						else {
							if (dynamic.length)
								fisrtValue = dynamic;
							dir[point](fisrtValue);
							break;
						}
					}
				}
			} catch (e) {
				window[_].link.basePage();
				throw e;
			}
			window[_].link._cmd = cmds;
			cmds.forEach(cmdPre => {
				let [ key, value ] = cmdPre.split('=');
				let cmd = window[_].link.commands[key];
				if (cmd)
					cmd(value);
				else 
					console.error(new Error(`command '${cmd}' doesn't exist!`))
			});
		},
	};

	window[_].lazy = {
		/*
		 * МОДУЛЬ ЛЕНИ
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.4
		 * 
		 * Создаёт в глобальной области видимости прокси функции
		 * Вызывающие загрузку скрипта с внещним модулем
		 * Был сделан через глобальную область, так намного проще создавать лень
		 * 
		 * !!!: Функции обёртки в register() должны быть повешаны на window
		 *      Иначе lazy._ провалится в рекурсию ошибок, не наступайте на мои грабли
		 * 
		 * HMM: будет ли легче создавать лень в легаси проектах через es6 импорты
		 *
		 * See also: 
		 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/window
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function (для _())
		 */
		loaded: {},
		load(url, ...args) {
			/*
			 * ...args передаются в Promise.resolve(args)
			 * Это позволяет делать window[_].lazy.load('script.js', 'данные', 'для', 'колбека')
			 * И потом в .then((a,b,c)=>...) получать эти аргументы
			 * 
			 * Тройное состояние скрипта в lazy.loaded:
			 * - true: уже загружен => сразу резолвим
			 * - Promise: грузится сейчас => ждём тот же промис
			 * - undefined: ещё не грузили => создаём новый промис
			 * 
			 * Это защита от двойной загрузки одного скрипта
			 */
			let key = url.split('?')[0], // отсекаем параметры, чтобы не дублировать
				state = window[_].lazy.loaded;
			if (state[key] === true)
				return Promise.resolve(args);
			if (state[key] instanceof Promise)
				return state[key].then(()=>args);
	
			let promise = new Promise((resolve,reject)=>{
				let scr = document.createElement('script');
				scr.src = url;
				scr.onload = ()=>{
					state[key] = true;
					resolve(args);
				};
				scr.onerror = ()=>{
					delete state[key];
					reject(new Error('Failed to load '+url));
				};
				document.head.append(scr);
			});
			state[key] = promise;
			return promise;
		},
		register(script, funcs) {
			for (let fn of funcs) {
				let fns = fn.split('.'),
					method = fns.pop(),
					path = window;
				for (let obj of fns) {
					if (path[obj] == undefined)
						path[obj] = {};
					path = path[obj];
				}
				path[method] = (...a)=>
					window[_].lazy._(script,fn).then(f=>f(...a));
			}
		},
		async _(scr, fn) {
			let get = path => path.split('.').reduce((obj, key) => obj?.[key], window),
				wrapper = get(fn);
	
			await window[_].lazy.load(scr); // await короче Promise.then
	
			if (wrapper !== get(fn))
				return get(fn);
			throw new Error(`Function ${fn} not loaded from ${scr}`);
		},
	};

	window[_].lang = {
		/*
		 * МОДУЛЬ ПЕРЕВОДОВ (l10n)
		 * Author: MIOBOMB (2024-2026)
		 * Contributors:
		 * - DenisC - логика метода load + патч всего модуля (2025)
		 * Last patch: 2.1.8
		 * 
		 * По слухам этот модуль лучше чем многие i18n реализации, и лучше всех l10n
		 * Всё потому что он из коробки умеет переводить страницу без перезагрузки
		 * 
		 * !!!: parse() обрабатывает ключи из vars и подставляет их значения
		 *      ваш +ключ+ становится значением, и это значение динамичное
		 *      Так удобнее отображать динамичные данные на сайтах
		 *      Например никнейм пользователя
		 *
		 * !!!: Это l10n (локализация), а не i18n (интернационализация)
		 *
		 *      i18n — подготовка кода: вынос строк в JSON, поддержка Unicode,
		 *      гибкая верстка. Делается один раз.
		 * 
		 *      l10n - перевод JSON и адаптация под язык/регион
		 * 
		 *      lang - загружает JSON, подставляет +переменные+,
		 *      даёт реактивную смену языка на странице
		 *
		 *      Чтобы частично приблизить lang к i18n используйте Intl,
		 *      Нативное апи интернационализации (даты, числа, валюты)
		 * 
		 * !!!:
		 * модуль намеренно делает небезопасный innerHTML
		 * нужно это для практичности и удобства, как пример
		 * вы можете вставлять картинки зависимые от языка
		 * (буквально <img src="..."> в ключе).
		 * В конце концов, наврядли вы вставите в json "небезопасную строку",
		 * или что смешно - пользовательские данные. (да, chatGPT, я тебе это говорю)
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset (data-trans атрибуты)
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
		 * - https://localizejs.com/articles/i18n-vs-l10n
		 */
		addr: '',
		vars: {},
		// HMM:
		// переделать main на мапу т.к. внутреннее api?
		// или сохранить оригинальное api на объекте
		main: {},
	
		load: name => fetch(window[_].lang.addr + name + '.json')
			.then(r => r.text()),
		parse: (packet, vars = window[_].lang.vars)=>
			// HMM: переделать под общий синтаксис типа {var}
			packet.replace(/\+([^+]+)\+/g, (match, key)=>{
				let v = vars[key];
				return v !== undefined ? v : match;
			}),
		async replace(name){
			const packet = await window[_].lang.load(name);
			window[_].lang.main = JSON.parse(window[_].lang.parse(packet)); // без замены языка нельзя начинать перевод
	
			for (let el of document.querySelectorAll(`[${window[_].lang.attr}]`)) {
				let key = el.dataset.trans,
					text = window[_].lang.main[key] || key,
					tag = el.tagName;
	
				if (tag === 'IMG')
					el.src = text;
				else if (['INPUT','TEXTAREA'].includes(tag))
					el[ el.type === 'submit' ? 'value' : 'placeholder' ] = text;
				else
					el.innerHTML = text;
			}
			// возвращаем для последующей обработки пакета, например для сохранения в window[_].storage
			return packet;
		},
	
		/*
		 * Получатели строки из пакета автоматически формируют HTML
		 * Это позволяет заметно упростить работу с кодом
		 * Вместо отдельного указания data-trans и lang.from
		 * вы можете написать   `<h1${window[_].lang.text('yourKey')}/h1>`
		 * А пришлось бы писать `<h1 data-trans="yourKey">${window[_].lang.from('yourKey')}</h1>`
		 * Согласитесь, и короче и удобнее ведь?
		 * Не повторяйте моих ошибок и примите это как победу в лотерее
		 * 
		 * !!!: если ключа в пакете нету, будет выброшен warning
		 */
		attr:       ` data-trans`,
		from:		i=>window[_].lang.main[i] || console.warn(`window[_].lang> ${i} is undefined`) || i,
	
		text:		i=>window[_].lang.attr+`="${i}">${window[_].lang.from(i)}<`,
		submit:		i=>window[_].lang.attr+`="${i}" value="${window[_].lang.from(i)}">`, // <input type=submit>
		input:		i=>window[_].lang.attr+`="${i}" placeholder="${window[_].lang.from(i)}">`,
		textarea:	i=>window[_].lang.attr+`="${i}" placeholder="${window[_].lang.from(i)}"><`,
		img:		i=>window[_].lang.attr+`="${i}" src="${window[_].lang.from(i)}"`,
		winTitle(i) {
			let text = window[_].lang.from(i),
				dataTrans = window[_].lang.attr+`="${i}"`;
			if (text == null || text == '') {
				text = i;
				dataTrans = '';
			}
			return `${dataTrans}>${text}<`;
		},
	};

	window[_].http = {
		/*
		 * HTTP-КЛИЕНТ
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.4
		 * 
		 * Обычная обёртка нав XHR для быстрых запросов
		 * Использую XHR вместо fetch
		 * Мне нужен прогресс загрузки (fetch его не даёт)
		 * Да и вам тоже не помешает прогресс загрузки
		 * 
		 * В defaultHeaders вы можете установить хедеры по умолчанию
		 * Как пример Authorization: 'your token'
		 * HMM: добавить возможность игнорировать дефолтные хедеры
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
		 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
		 */
		defaultHeaders: {},
		req(method, url, data = '', headers = {}, fileProgressElement = false) {
			return new Promise((resolve, reject)=>{
				let xhr = new XMLHttpRequest();
	
				xhr.open(method, url);
	
				let allHeaders = { ...window[_].http.defaultHeaders, ...headers };
				for (let header in allHeaders)
					xhr.setRequestHeader(header, allHeaders[header]);
	
				// !!!: fileProgressElement ожидает <progress> элемент без min/max
				// Потому что value от 0 до 1
				if (fileProgressElement)
					xhr.upload.onprogress= e=>{
						if (e.lengthComputable) {
							let percentage = (e.loaded / e.total);
							fileProgressElement.setAttribute('value', percentage);
						}
					};
	
				xhr.onreadystatechange= ()=>{
					if (xhr.readyState=== 4)
						if (xhr.status >= 200 && xhr.status < 300)
							resolve(xhr.response);
						else 
							reject(new Error(`${xhr.status} - ${xhr.statusText}`),xhr);
				};
				xhr.onerror = ()=>
					reject(new Error('Network error'), xhr);
	
				xhr.send(data);
			});
		},
		get: (url, headers={})=>
			window[_].http.req('GET', url, false, headers),
		post: (url, data = '', headers = {}, fileProgressElement = false)=>
			window[_].http.req('POST', url, data, headers, fileProgressElement)
	};

	window[_].html = function(strs, ...args) {
		/*
		 * Шаблонные строки в DOM
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * Позволяет писать window[_].html`<div>${content}</div>`
		 * И получать настоящий DOM-элемент, а не строку
		 * 
		 * Почему через template?
		 * - Скрипты не выполняются (никаких xss!)
		 * - Можно создать несколько элементов разом
		 * - Быстрее чем createElement для сложных структур
		 * - Банально удобнее createElement для сложных древ
		 *
		 * HMM: проверить производительность этого генератора dom
		 * HMM: проверить факт о "защите от xss" из-за on* атрибутов
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
		 */
		let fullStr = '',
			DOMs = [];
		for (let i=0; i < args.length; i++) {
			fullStr += strs[i];
			let arg = args[i];
			if (arg && arg.nodeType) {
				fullStr += `<!--${DOMs.length}-->`;
				DOMs.push(arg);
			} else {
				fullStr += arg;
			}
		}
		fullStr += strs[strs.length - 1];
	
		const template = document.createElement('template');
		template.innerHTML = fullStr;
		const content = template.content;
	
		// для создания вложенности html элементов заменяем плейсхолдеры
		const it = document.createTreeWalker(
			content,
			NodeFilter.SHOW_COMMENT
		);
		let node, i = 0;
		for (; node = it.nextNode(); )
			node.replaceWith(DOMs[i++]);
	
		if (content.children.length === 1)
			return content.firstChild;
		return content;
	};

	window[_].pipe = function(data, ...fns) {
		/*
		 * КАСТОМНЫЙ PIPE ОПЕРАТОР
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * Никакой магии, обычный синхронный |>
		 * для мутации таблиц будет самое то
		 *
		 * See also:
		 * - https://github.com/tc39/proposal-pipeline-operator/blob/main/README.md
		 */
		for (const fn of fns)
			data = fn(data);
		return data;
	};

	window[_].pipeAsync = async function(data, ...fns) {
		/*
		 * КАСТОМНЫЙ PIPE ОПЕРАТОР 2
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.7
		 * 
		 * Никакой магии, обычный асинхронный |>
		 * для получения и мутации данных сойдёт
		 *
		 * See also:
		 * - https://github.com/tc39/proposal-pipeline-operator/blob/main/README.md
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
		 */
		for (const fn of fns) {
			let waiter = await data;
			data = await fn(waiter);
		}
		return data;
	};

	window[_].form = { // TS DONE HMM no
		/*
		 * АВТОСОХРАНЕНИЕ ФОРМ
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.4
		 * 
		 * Позволяет сохранять состояние формы на случай
		 * Если в офисе внезапно выключат свет
		 * 
		 * HMM: может сделать более полноценный модуль форм
		 *      с встроенной валидацией, или чем нибуть ещё
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
		 * - https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
		 */
		read(form) {
			let data = {};
			new FormData(form).forEach((value, key)=>{
				if (data[key] !== undefined) {
					if (!Array.isArray(data[key]))
						data[key] = [data[key]];
					else 
						data[key].push(value);
				} else
					data[key] = value;
			});
			return data;
		},
		write(form, data) {
			Object.entries(data).forEach(([key,value])=>{
				let el = form.elements[key];
				if (!el)
					return;
				if (el.length)
					[...el].forEach((opt,i)=>{
						let isCheckBox = 'selected';
						if (['checkbox','radio'].includes(opt.type))
							isCheckBox = 'checked';
	
						let select = false;
						if (Array.isArray(value)) {
							if (value.includes(opt.value))
								select = true;
						} else if (opt.value == value)
							select = true;
	
						opt[isCheckBox] = select;
					});
				else
					el.value = value;
			});
			return data;
		},
	};

	window[_].storage = class {
		/* 
		 * ИЗОЛЯТОР ХРАНИЛИЩ
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.0
		 *
		 * Обычная обёртка поверх Storage экземпляра
		 * Даёт простую но надёжную изоляцию хранилищ
		 * Но нет она не даёт вам защиту от угона хранилища
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Storage
		 */
		constructor(storage, name) {
			this.s = storage;
			this.n = name;
		}
		get = key=>
			this.s.getItem(this.n + key);
		set = (key, value)=>
			this.s.setItem(this.n + key, value);
		remove = key=>
			this.s.removeItem(this.n + key);
		clear = ()=>Object.keys(this.s)
			.filter(k => k.startsWith(this.n))
				.forEach(k => this.s.removeItem(k));
	};

	window[_].err = {
		/* 
		 * МОДУЛЬ ОШИБОК
		 * Author: MIOBOMB (2024-2026)
		 * Last patch: 2.1.4
		 *
		 * Мой самописный модуль ошибок
		 * вообще он ялвяется наследием
		 * но если вам лень писать .catch после .then
		 * то почему бы и нет
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
		 */
		init() {
			window.addEventListener('error',window[_].err.handleGlobal);
			window.addEventListener('unhandledrejection',window[_].err.handleRejection);
		},
		print: (cnt,e)=>console.error(e),
	
		errors: {},
		_c: 0,
		log(err) {
			window[_].err.print(window[_].err._c,err);
			window[_].err._c++;
			window[_].err.errors[window[_].err._c]=err;
		},
		handleGlobal(message,source,line,column,error){
			console.error(message,source+':'+line+':'+column,error)
			window[_].err.log(message + `\n IN ${source} ON LINE ${line} IN COLUMN ${column}`);
		},
		handleRejection(e){
			const err = e.reason || e;
			console.error(err);
			window[_].err.log(
				`PROMISE ERROR\n`+
				`${e.stack || e}`
			);
		},
	};

	window[_].hotkeys = {
		/*
		 * ГОРЯЧИЕ КЛАВИШЫ
		 * Author: MIOBOMB (2025-2026)
		 * Last patch: 2.1.4
		 * 
		 * Реализует самый настоящий press/release интерфейс
		 * Если верить минификатору, после сжатия весит всего 790 байт
		 * 
		 * В Object Hub уже есть текстовый редактор горячих клавиш
		 * На базе этого движка, конечно давать textarea с js кодом...
		 * Не самая безопасная затея, но как факт кастомизация широчайшая
		 * 
		 * _holds работает не на массивах а на new Set()
		 * Сеты работают намного быстрее при большом объёме данных
		 * Вы же не хотите чтобы у вас тормозил поток с 100+ хоткеями
		 * Из-за простого печатанья?
		 *
		 * FIXME: Рассмотреть альтернативы e.code из-за проблем
		 *        с otg-клавиатурами на телефонах
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
		 * - https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values (список клавиш)
		 */
		keys: new Map(),
		_holds: new Set(),
		_: false,
	
		_parse: combo => combo.split('+').map(k=>k.trim()),
		_match(keys) {
			// Нужно сверять все клавишы, это же КОМБИНАЦИЯ а не отдельные куски
			for (let k of keys) if (!window[_].hotkeys._holds.has(k)) return false;
			return true;
		},
		_init() {
			if (window[_].hotkeys._)
				return;
			document.addEventListener('keydown', e=>{
				window[_].hotkeys._holds.add(e.code);// key зависит от раскладки (на Qwerty 'KeyZ' — это 'z', на Йцукен — 'я')
				// code даёт физическое положение клавиши, что важно для игр и хоткеев, и в целом универсальнее
	
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (!window[_].hotkeys._match(hotkey.keys))
						continue;
					if (hotkey.press && !hotkey.active) {
						hotkey.active = true; // active защищает от множественных срабатываний
						hotkey.press(e);
					}
				}
			});
			document.addEventListener('keyup', e=>{
				window[_].hotkeys._holds.delete(e.code);
	
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (hotkey.active && !window[_].hotkeys._match(hotkey.keys)) {
						hotkey.active=false;
						hotkey.release(e);
					}
				}
			});
			window.addEventListener('blur', e=>{
				/*
				 * При переключении в другое окно автоматического keyup не будет
				 * Поэтому сбрасываем всё принудительно, мало ли
				 */
				for (let hotkey of window[_].hotkeys.keys.values()) {
					if (hotkey.active) {
						hotkey.active = false;
						hotkey.release();
					}
				}
				window[_].hotkeys._holds.clear();
			});
			window[_].hotkeys._=true;
		},
		on(combo, press, release) {
			window[_].hotkeys._init();
			let keys = window[_].hotkeys._parse(combo);
	
			window[_].hotkeys.keys.set(combo, {
				keys,
				// press/releace по умолчанию пустышки для сокращения синаксиса
				press: press || (()=>{}),
				release: release || (()=>{}),
				active: false
			});
	
			return this;
		},
		off(combo) {
			window[_].hotkeys.keys.delete(combo);
			return this;
		},
	};

	window[_].drag = {
		/* МОДУЛЬ ДРАГГЕРА
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.7
		 *
		 * Самый обычный драггер, разве что адаптированный под движок окон
		 * Не буду врать, написал я его 2 года назад украв код с w3schools
		 * Но я провёл настолько глубокий рефакторинг что единственное напоминание:
		 * Алгоритм вычисления координат
		 *
		 * FIXME:
		 * Мультитач чувствует себя плохо на телефонах
		 * (возможно не только на них)
		 * Первые элементы начинают дрожжать и прыгать по экрану
		 * А последний взятый элемент сильно фризит
		 * Я что зря делал проброс nginx'а на 192.168.0.*?
		 * Непорядок
		 * HMM:
		 * оставить сломанный мультитач потому что
		 * мне лень его чинить + наврядли кто то
		 * всерьёз будет двигать много элементов за раз
		 *
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
		 * - https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientY
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event (почему нам нужен preventDefault)
		 * - https://www.w3schools.com/howto/howto_js_draggable.asp (основа для модуля)
		 */
		_i: false,
		active: new Map(),

		prevent: e=>e.target.closest('button,input'),
		init(dragger, mover, onStart, onStop) {
			let start=e=>{
				// Проверяем куда нажали, если бы мы не проверяли,
				// То драггер не дал бы нам нажать на кнопки или изменить имя окна
				if (window[_].drag.prevent(e)) return;
	
				e.preventDefault();
	
				window[_].drag.active.set(e.pointerId,{
					x:e.clientX,
					y:e.clientY,
					mover:mover,
					onStop:onStop
				});
	
				onStart?.(e);
			};
			if (!window[_].drag._i) {
				document.addEventListener("pointermove", (e) => window[_].drag.move(e));
				document.addEventListener("pointerup", (e) => window[_].drag.stop(e));
				document.addEventListener("pointercancel", (e) => window[_].drag.stop(e));
				window[_].drag._i = true;
			}
			dragger.onpointerdown=start;
			// превентим touchmove событие чтобы не было проблем
			// при скролле на телефонах
			dragger.ontouchmove=e=>e.preventDefault();
		},
		move(e) {
			let p=window[_].drag.active.get(e.pointerId);
			if(!p) return;
			e.preventDefault();
	
			let dx=p.x - e.clientX,
				dy=p.y - e.clientY;
	
			p.x=e.clientX;
			p.y=e.clientY;
	
			let mov = p.mover;
			mov.style.top=(mov.offsetTop - dy)+"px";
			mov.style.left=(mov.offsetLeft - dx)+"px";
		},
		stop(e) {
			window[_].drag.active.get(e.pointerId)?.onStop?.(e);
			window[_].drag.active.delete(e.pointerId);
		},
	};

	window[_].fade = function(elem, anim, actAfter = ()=>{}) {
		if (!anim)
			return actAfter();
		elem.classList.add(anim);
		elem.addEventListener('animationend', ()=>{
			elem.classList.remove(anim);
			actAfter();
		}, { once: true });
	};

	window[_].x10 = {
		/*
		 * МОДУЛЬ ОКОН (РЕАЛЬНЫЙ)
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.8
		 * 
		 * Помните прошлый и уродливый win?
		 * Я теперь понял что насрал говна и решил подсмотреть
		 * архитектуру у гениев своего времени.
		 * По итогу я создал это чудо юдо чтобы поверх него строить "оконные менеджеры"!
		 * Прошлый модуль win все ещё останется рабочим и возможно
		 * будет встроенным wm как это сделано в реальных иксах с toms window manager.
		 * В отличии от реального x.org у меня будет реализована возможность
		 * исполнять несколько оконных менеджеров в одной сессии,
		 * нужно мне это чтобы модуль toast мог просто создавать для каждого
		 * инстанса тостов свой очень тонкий wm.
		 *
		 * СОСТОЯНИЯ ОКОН
		 * Это вообще отдельная тема, которую мне стоит осветить особенно от x10.
		 * Дело в том, что я вам дарую свободу обзывать и вешать в состояния окон
		 * всё что вам вздумается! Только пожалуйста, давайте не будем творить что попало
		 * и мы примим этот "контракт" о выдаче названий состояний окон:
		 *
		 * opened - окно открыто и видно
		 * hidened - окно скрыто
		 * opening - окно в анимации открытия
		 * hiding - окно в анимации сворачивания
		 * showing - окно в анимации разворачивания
		 * moving - окно в анимации движения
		 * closing - окно входит в анимацию закрытия и скоро умрёт
		 *
		 * Да, я сам эти состояния пока не использую в win, но к какой нибуть 2.4
		 * я начну над этим работать
		 * FIXME: прописать newHelper win адекватную работу со всеми состояниями
		 * FIXME: создать x10.iterate функцию
		 *
		 * !!!: это x.org! Тупая софтина которая просто хранит окна и плюёт события!
		 *      Управлять окнами и DOM'ом окон все ещё будет оконный менеджер!
		 * 
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
		 * - https://en.wikipedia.org/wiki/X_Window_System (будет полезно понимать)
		 */
		busName: 'xws:',

		generateId() {
			let id;
			// Создаём случайный 6 символьный айди, чтобы каждый раз не совпадало
			// !!!: в теории можно задать любой айди
			// HMM: проверить при скольки окнах генератор начинает тормозить
			do id=Math.random().toString(36).substring(2,8);
			while (window[_].wins[id]);
			//while (window[_].wins.has(id));
			return id;
		},

		// метод spit() публичный, если вам нужны какие то
		// специфичные события для вашего WM - пожалуйста
		// HMM: дать ли ему нормальное название или нет
		spit(evName, data) {
			let event = new CustomEvent(window[_].x10.busName + evName, data)
			document.dispatchEvent(event);
		},

		create(name, patcher) {
			let winId = window[_].x10.generateId(),
				state = {
					id: winId,
					name: name,
					state: 'opened',
					wm: '',
				};
	
			// оконные менеджеры могут вешать свои флаги в окна
			Object.assign(state, patcher);
			window[_].wins[winId] = state;
			window[_].x10.spit('created', window[_].wins[winId]);
	
			return window[_].wins[winId];
		},

		get(winId) {
			return window[_].wins[winId];
		},

		// vim ciw отсылка лол
		ciw(winId, attr, value, events = false) {
			let winData = window[_].wins[winId];
			winData[attr] = value;
			if (events) {
				window[_].x10.spit('patched', {[attr]: value});
				window[_].x10.spit('patched:' + attr, value);
			}
		},

		setState(winId, state) {
			let winData = window[_].wins[winId];
			winData.state = state;
			window[_].x10.spit('state:' + state, winData);
			return winData;
		},

		destroy(winId) {
			window[_].x10.spit('destroyed', window[_].wins[winId]);
			delete window[_].wins[winId];
		},
	};

	window[_].toast = class {
		/* 
		 * МОДУЛЬ УВЕДОМЛЕНИЙ
		 * Author: MIOBOMB (2026)
		 * Last patch: 2.1.8
		 * 
		 * Является фабрикой оконных менеджеров, работает по такому принципу:
		 * errAlert = new window[_].toast('error', DOMelem)
		 * okAlert = new window[_].toast('ok', DOMelem)
		 * loadingAnim = new window[_].toast('loading', DOMelem, 0)
		 *
		 * Сам тонкий оконный менеджер крайне примитивный и простой,
		 * но для тостов обычно большего и не надо.
		 * 
		 * Вы также можете переопределить метод generateDOM
		 * под ваши нужны. В целом, это безопасно если иметь меру.
		 * в Object hub это уже используется повсеместно.
		 *
		 * !!!:
		 * если duration = 0 то тост будет закрыт только при вызове close()
		 * !!!:
		 * не вешайте manager'ом document.body!
		 * управление позицией окон отдано на откуп DOM и CSS,
		 * вам придётся настроить элемент менеджера и классы или стили
		 * тостов, чтобы они позиционировались адекватно
		 */
	
		constructor(name, manager, duration = 3000, attrs = '', animOpen = '', animClose = '') {
			this.name = name;
			this.wm = 'newHelper-toast-' + this.name;
			this.manager = manager;
			this.duration = duration;
			this.attrs = attrs;
			this.animOpen = animOpen;
			this.animClose = animClose;
		}
		generateDOM = (wId,content) => `<div style=overflow:auto;width:100%;height:100%>${content}</div>`.replace(/\{winId\}/g,wId)

		open(content = '') {
			let winState = window[_].x10.create(this.name, { wm: this.wm }),
			wId = winState.id,
			html = window[_].html`<div id=${wId} ${this.attrs}>
					<div style="display:flex;justify-content:space-between;align-items:center">
						${this.generateDOM(wId, content)}
					</div>
				</div>`;
			window[_].fade(html, this.animOpen);
			this.manager.append(html);
	
			// сохраним ссылку на dom чтобы достать её в close()
			// HMM: а может писать в this.elem
			window[_].x10.ciw(wId, 'elem', document.getElementById(wId));
	
			if (this.duration > 0)
				setTimeout(() => this.close(wId), this.duration)
		}
		close(winId) {
			let win = window[_].x10.get(winId), w;
			if (!win || win.wm !== this.wm)
				return;
			w = win.elem;
			window[_].fade(w, this.animClose, ()=>{
				w.remove();
				window[_].x10.destroy(winId);
			});
		}
	};

	window[_].win = {
		/* 
		 * МОДУЛЬ ОКОН
		 * Author: MIOBOMB (2023-2026)
		 * Last patch: 2.1.8
		 *
		 * если вы спросите почему ньюхелпер я отвечу
		 * winBox.js это 35 килобайт, здесь же вы получаете в 65 килобайт
		 * И более мощный движок окон и документацию уровня...
		 * А у кого нибуть вообще есть такие подробные документации в вебе?
		 * 
		 * Реализует ограниченно-гибкий движок окон, функционал:
		 * - открытие, разворот на весь экран, закрытие
		 * - сворачивание в таскбар и разворчаивание
		 * - нативный css-ресайз (resize:both)
		 * - возможность двигать окна (работает на телефонах, я проверял)
		 * - сохранение и загрузка окон по вашему выбору
		 * 
		 * теперь мне надо вспомнить я рефакторил этот код 4 раза или 7 раз
		 * 25:06:2026 - Вспомнил! раз 6 точно, +x10 значит это уже 7 раз
		 *
		 * !!!: _opn() и toggleFull() могут сломать ваши окна!
		 *      Эти функции высчитывают координаты окна, и размер окна с учётом padding'а
		 *      Ни за что не вешайте на ваши окна transform:translate()!
		 * 
		 * !!!: _opn() по умолчанию открывает окно по центру экрана
		 *      Если не идёт восстановление через write()
		 *
		 * HMM: стоит ли открывать окно в центре, или лучше дать "дефолтную функцию" позиционирования
		 *
		 * FIXME: вынести lang.winTitle из переводов для устранения "связности" кода
		 *
		 * FIXME: придумать что делать с переездом window[_].wins на new Map
		 * я уже пробовал перенос на мапу и результат...
		 * у меня сломались все окна в object hub'е
		 * по этому пусть пока хоть до 2.5 будет объект
		 * 
		 * See also:
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
		 * - https://developer.mozilla.org/en-US/docs/Web/CSS/position
		 * - https://developer.mozilla.org/en-US/docs/Web/CSS/resize
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
		 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
		 * - lang.winTitle функция
		 * - html модуль
		 * - drag модуль
		 * - fade утилита
		 * - x10 подсистема
		 */
		manager:false,
		hider:false,
		text:'',
	
		winAttrs:'',
		dragAttrs:'',
		titleAttrs:'',
		renameAttrs:'',
		btnAttrs:'',
		hiderAttrs:'',
		
		defBtns:[
			['–',w=>w.hide()],
			['=',w=>w.toggleFull()],
			['X',w=>w.close()],
		],
	
		animOpen:'',
		animClose:'',
		animHide:'',
		animShow:'',
		animFullOn:'',
		animFullOff:'',
	
	
		_winBtn(win,text,func){
			let b=window[_].html`<button ${window[_].win.btnAttrs}>${text}</button>`;
			b.addEventListener('click',()=>func(win));
			return b;
		},
		_hiderBtn(win){
			let title=win.langs!== false ? window[_].lang.winTitle(window[_].win.text+win.langs) : `>${win.name}<`,
				b=window[_].html`<button id=hider${win.id} ${window[_].win.hiderAttrs}${title}/button>`;
			b.addEventListener('click',()=>window[_].win.show(win));
			return b;
		},
		_initWin: winState=>
			window[_].drag.init(winState.drag, winState.elem, ()=>window[_].win.manager.appendChild(winState.elem)),

		open(name,content='',customAttrs=''){
			let winState = {
				wm: 'newHelper-win',
				langs:name,
				full:false,
				inRename:false,
				// Если окно новое, координаты полностью нулевые, 
				// Нужно чтобы проверять создаётся ли окно и если да то задавать координаты
				onUnfull:{top:0,left:0,width:0,height:0},
				attrs:customAttrs,
				elem:false,
				drag:false,
				content:false,
	
				setTitle(nT)	{window[_].win.setTitle(this,nT)},
				toggleFull(e)	{window[_].win.toggleFull(this)},
				close(e)		{window[_].win.close(this)},
				hide(e)			{window[_].win.hide(this)},
				show(e)			{window[_].win.show(this)},
			},
			winData = window[_].x10.create(name, winState);
			return window[_].win._opn(winData,content);
		},
		_opn(winState,content=''){
			// эти проверки жрут драгоценные байты
			// if (!window[_].win.manager || !window[_].win.hider) throw new Error('Window managers not inited');
			let wId=winState.id,
				html=
				window[_].html`<div id=${wId} ${window[_].win.winAttrs} ${winState.attrs}>
					<div style="display:flex;justify-content:space-between;align-items:center"
					${window[_].win.dragAttrs} id=DRAGGER${wId}>
						<span ${window[_].win.titleAttrs} id=title${wId}${window[_].lang.winTitle(window[_].win.text+winState.name)}/span>
						<div id=btns${wId}></div>
					</div>
					<div id=content${wId} style=overflow:auto;width:100%;height:100%>
						${content.replace(/\{winId\}/g,wId)}
					</div>
				</div>`,
				btns = html.querySelector(`#btns${wId}`);
			for(let b of window[_].win.defBtns) btns.append(window[_].win._winBtn(winState,...b));
			html.style.overflow = 'hidden';
			html.style.resize = 'both';
	
			window[_].fade(html, window[_].win.animOpen)
	
			window[_].win.manager.append(html);
	
			// AFTER INSERT LOGISC !!!!!!!!!!!!!!!!

			let mainElem = document.getElementById(wId),
				dragElem = document.getElementById('DRAGGER'+wId),
				contentElem = document.getElementById('content'+wId);
	
			let win = winState.elem = mainElem,
				contentRect = document.getElementById('content'+wId).getBoundingClientRect(),
				windowRect = win.getBoundingClientRect(),
				padX=windowRect.width - contentRect.width,padY=windowRect.height - contentRect.height;
			winState.drag = dragElem,
			winState.content = contentElem;
	
			if (winState.onUnfull.width === 0) {
				// Здесь и задаются координаты...
				// Мастера клин кода не выносите мне мозги прошу
				// Оно же работает!!!
				// 26:06:2026 - и вроде гзипается хорошо
				if (!winState.attrs.includes('top')) {
					win.style.top=win.offsetTop - (win.offsetHeight / 2) + 'px';
					win.style.left=win.offsetLeft - (win.offsetWidth / 2) + 'px';
				}
				if (!winState.attrs.includes('width'))
					win.style.width=(win.offsetWidth - padY) + 'px';
				if (!winState.attrs.includes('height'))
					win.style.height=(win.offsetHeight - padX) + 'px';
			} else
				for (let pos in winState.onUnfull)
					win.style[pos] = winState.onUnfull[pos] + 'px'
	
			dragElem.addEventListener('contextmenu', function(e) {
				e.preventDefault();
				if (e.target.closest('button')) return;
				let wT = document.getElementById('title'+wId);
				if (!winState.inRename){
					wT.innerHTML=`<input ${window[_].win.renameAttrs} id=rename${wId} value="${wT.textContent}">`;
					window[_].x10.ciw(wId,'inRename',true);
					//winState.inRename=true;
				} else {
					window[_].win.setTitle(winState,document.getElementById('rename'+wId).value);
					window[_].x10.ciw(wId,'inRename',false);
					//winState.inRename=false;
				}
			});
	
			if (winState.state === 'hidened')
				winState.hide();
			else
				window[_].win._initWin(winState);
			return winState;
		},

		setTitle(winState, newT) {
			window[_].x10.ciw(winState.id,'langs',false);
			window[_].x10.ciw(winState.id,'name',newT);
			let t=document.getElementById('title'+winState.id),
				h=document.getElementById('hider'+winState.id);
			t.innerHTML=newT;
			t.removeAttribute('data-trans');
			if (h) {
				h.innerHTML=newT;
				h.removeAttribute('data-trans');
			}
		},

		toggleFull(winState) {
			let wEl = winState.elem,
				ws = wEl.style,
				wc = wEl.classList,
				contentRect = document.getElementById('content'+winState.id).getBoundingClientRect(),
				windowRect = wEl.getBoundingClientRect(),
				padX = windowRect.width - contentRect.width,
				padY = windowRect.height - contentRect.height,
				aOn = window[_].win.animFullOn,
				aOff = window[_].win.animFullOff,
				fd = {
					top: windowRect.top,	left: windowRect.left,
					width: contentRect.width,	height: contentRect.height,
				},
				unful = ()=>{
					ws.top = old.top + 'px';
					ws.left = old.left + 'px';
					ws.width = old.width + 'px';
					ws.height = old.height + 'px';
				},
				doFul = ()=>{
					if (aOn) wc.remove(aOn);
					window[_].x10.ciw(winState.id,'full',true);
					window[_].x10.ciw(winState.id,'onUnfull',fd);
					ws.top = 0;
					ws.left = 0;
					ws.width = `calc(100% - ${padX}px)`;
					ws.height = `calc(100% - ${padY}px)`;
					winState.drag.onpointerdown = null;
				},
				doUnful = ()=>{
					if (aOff) wc.remove(aOff);
					unful();
					window[_].x10.ciw(winState.id,'full',false);
					window[_].win._initWin(winState);
				},
				old = winState.onUnfull;
			if (!winState.full)
				window[_].fade(wEl, window[_].win.animFullOn, doFul)
			else {
				unful();
				window[_].fade(wEl, window[_].win.animFullOff, doUnful);
			}
		},

		close(winState) {
			let w = winState.elem,
				remover = ()=>{
					let dr = winState.drag;
					dr.onpointerdown = dr.ontouchmove=null;
					w.remove();
					window[_].x10.destroy(winState.id);
				};
			if (w.style.display== 'none') {
				document.getElementById('hider'+winState.id).remove();
				remover();
			} else
				window[_].fade(w, window[_].win.animClose, remover);
		},

		hide(winState) {
			let wEl = winState.elem,
				wc = wEl.classList,
				anim = window[_].win.animHide,
				hider = ()=>{
					wEl.style.display = 'none';
					if (anim) wc.remove(anim);
					window[_].x10.setState(winState.id,'hidened');
					window[_].win.hider.append(window[_].win._hiderBtn(winState));
				}
			window[_].fade(wEl, window[_].win.animHide, hider);
		},

		show(winState) {
			let wEl = winState.elem,
				wc = wEl.classList,
				anim = window[_].win.animShow,
				hider = document.getElementById('hider'+winState.id),
				shower = ()=>{
					if (anim) wc.remove(anim);
					window[_].x10.setState(winState.id,'opened');
				}
			wEl.style.display = '';
			hider.remove();
			window[_].fade(wEl, window[_].win.animShow, shower);
		},

		/*
		 * о да, ниже идёт самая крутая фишка которую я готовлю к 2.2
		 * 
		 * СОХРАНЕНИЕ-ВОССТАНОВКА ОКОН
		 * Помните автоформы? Здесь я поступил лучше
		 * Вы можете полностью сохранить окна, как - решаете вы, но лучше
		 * Вместо колбека я теперь просто делаю разовый читатель, так намного гибче
		 * Плюсом я делаю разовый восстановитель который возвращает все окна
		 * Так тоже в разы гибче, авось у вас в окнах были вебсокеты и их нужно восстановить
		 * Проще записать результат а потом прогнать проверку по data-ws атрибутам
		 * Или как вы ещё придумаете
		 * 
		 * !!!: Оно работает настолько гибко что в теории можно сделать виртуальные рабочие столы
		 *
		 * FIXME: добавить проверку принадлежности WM
		 */
		read(){
			let store = {};
			for (let winId in window[_].wins) {
			let winPre = window[_].wins[winId];
			//for (let [winId, winPre] of window[_].wins) {
				let win = { ...winPre },
					size=win.onUnfull,
					wEl = win.elem,
					contentRect=win.content.getBoundingClientRect(),
					windowRect=wEl.getBoundingClientRect();
				win.realContent=win.content.innerHTML;
				size.top=windowRect.top;
				size.left=windowRect.left;
				size.height=wEl.offsetHeight - (windowRect.height - contentRect.height);
				size.width=wEl.offsetWidth - (windowRect.width - contentRect.width);
				delete win.elem;
				delete win.drag;
				delete win.content;
				store[winId] = win;
			}
			return store;
		},
		write(state){
			for (let winId in state) {
				let win=state[winId],
				content=win.realContent;
				delete win.realContent;
				window[_].wins[winId] = win;
				//window[_].wins.set(winId, win);
				window[_].win._opn(win,content);
			}
			return window[_].wins;
		},
	};

	window[_].wins = {};
	//wins: new Map(),

	return window[_];
};

/* полифиллы к удалённым модулям
 * (сделаны в формате плагинов)
 * DOM хелпер ($), удалён в 2.1.X:
window[_].$ = {
	D: document,
	id: i=>					document.getElementById(i),
	q: (i,p=document)=>		p.querySelector(i),
	qa: (i,p=document)=>	p.querySelectorAll(i),

	on: (el,ev,fn,opts)=>	el.addEventListener(ev,fn,opts),
	off: (el,ev,fn,opts)=>	el.removeEventListener(ev,fn,opts),

	cliRect: e=>			e.getBoundingClientRect(), // сокращение чтобы не писать 25+ символов
}
 * Причины удаления:
 * 1. в процессе разработки 2.2 я понял что мне не нужен
 *    "сверхлегкий исходный код", а нужен крайне сжатый min+gzip
 * 2. в следствие пункта 1 я удалил весь синтаксический сахар
 *    потому что "document." гзипается заметно лучше
 */
