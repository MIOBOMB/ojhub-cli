/*
 * МОДУЛЬ ФАЛЬШИВОГО КУРСОРА
 * Версия 1.0.0
 * 
 * Управление с клавиатуры в стиле Vim:
 * h,j,k,l - движение
 * Backspace - правая кнопка мыши
 * Enter - левая кнопка мыши
 * + (возле Backspace) - увеличить скорость
 * - (возле Backspace) - уменьшить скорость
 * 
 * !!!: Модуль автоматически вешает объект курсора в _.curs
 *      Все события мыши эмулируются через нативный MouseEvent
 * 
 * ???: Стоит ли добавить поддержку колёсика мыши?
 * 
 * НЕСТАБИЛЬНОЕ API:
 * _.curs.setSpeed() - изменение скорости на лету
 * _.curs.warpTo() - телепортация курсора
 */

window.curFabric = (function(_) {

    // Настройки по умолчанию
    const DEFAULT_SPEED = 3;
    const MIN_SPEED = 1;
    const MAX_SPEED = 20;

    // Состояние курсора
    let cursor = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        speed: DEFAULT_SPEED,
        visible: true,
        pressed: false,      // Зажата левая кнопка
        pressedRight: false, // Зажата правая кнопка
        pressTimer: null,    // Таймер для определения короткого нажатия
        moveState: {         // Состояние движения
            left: false,
            right: false,
            up: false,
            down: false
        }
    };

    // Создаём визуальный элемент курсора
    const cursorElem = _.html`<div style="
            position: fixed;
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 999999;
            left: ${cursor.x}px;
            top: ${cursor.y}px;
            transform: translate(-50%, -50%);
            transition: all 0.02s linear;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
        ">
            <svg width="20" height="20" viewBox="0 0 20 20">
                <polygon points="2,2 18,2 18,18 2,18" 
                         fill="white" 
                         stroke="black" 
                         stroke-width="1.5"
                         stroke-dasharray="4 2"/>
                <circle cx="10" cy="10" r="3" fill="black" opacity="0.3"/>
            </svg>
        </div>
    `;

	console.log(cursorElem);
    document.body.appendChild(cursorElem);

    // Обновление позиции курсора на экране
    function updateCursorPosition() {
        cursorElem.style.left = cursor.x + 'px';
        cursorElem.style.top = cursor.y + 'px';
    }

    // Эмуляция события мыши
    function emitMouseEvent(type, button = 0, buttons = 0) {
        const target = document.elementFromPoint(cursor.x, cursor.y);
        if (!target) return;

        const event = new MouseEvent(type, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: cursor.x,
            clientY: cursor.y,
            screenX: cursor.x,
            screenY: cursor.y,
            button: button,
            buttons: buttons
        });

        target.dispatchEvent(event);
    }

    // Обработка короткого нажатия (mouseup без зажатия)
    function handleShortPress(button) {
        if (button === 0) { // Левая кнопка
            emitMouseEvent('click', 0, 0);
        } else if (button === 2) { // Правая кнопка
            emitMouseEvent('contextmenu', 2, 0);
        }
    }

    // Движение курсора (вызывается в RAF)
    function moveLoop() {
        let moved = false;
        const state = cursor.moveState;

        if (state.left) {
            cursor.x = Math.max(0, cursor.x - cursor.speed);
            moved = true;
        }
        if (state.right) {
            cursor.x = Math.min(window.innerWidth, cursor.x + cursor.speed);
            moved = true;
        }
        if (state.up) {
            cursor.y = Math.max(0, cursor.y - cursor.speed);
            moved = true;
        }
        if (state.down) {
            cursor.y = Math.min(window.innerHeight, cursor.y + cursor.speed);
            moved = true;
        }

        if (moved) {
            updateCursorPosition();
            // Генерируем mousemove во время движения
            emitMouseEvent('mousemove', 0, 
                (cursor.pressed ? 1 : 0) | (cursor.pressedRight ? 2 : 0));
        }

        requestAnimationFrame(moveLoop);
    }

    // Запускаем цикл движения
    requestAnimationFrame(moveLoop);

    // ==================== ГОРЯЧИЕ КЛАВИШИ ====================

    // Движение (Vim-стиль)
    _.hotkeys
        .on('KeyH', 
            () => { cursor.moveState.left = true; },  // press
            () => { cursor.moveState.left = false; }  // release
        )
        .on('KeyJ',
            () => { cursor.moveState.down = true; },
            () => { cursor.moveState.down = false; }
        )
        .on('KeyK',
            () => { cursor.moveState.up = true; },
            () => { cursor.moveState.up = false; }
        )
        .on('KeyL',
            () => { cursor.moveState.right = true; },
            () => { cursor.moveState.right = false; }
        );

    // Левая кнопка мыши (Enter)
    _.hotkeys.on('Enter',
        (e) => {
            // Защита от множественных срабатываний
            if (cursor.pressed) return;

            cursor.pressed = true;
            
            // Таймер для определения короткого нажатия
            cursor.pressTimer = setTimeout(() => {
                cursor.pressTimer = null;
            }, 200);

            // Mouse down событие
            emitMouseEvent('mousedown', 0, 1);
        },
        () => {
            if (!cursor.pressed) return;
            
            // Mouse up событие
            emitMouseEvent('mouseup', 0, 0);
            
            // Если таймер ещё не сработал - это короткое нажатие
            if (cursor.pressTimer) {
                clearTimeout(cursor.pressTimer);
                handleShortPress(0);
            }
            
            cursor.pressed = false;
            cursor.pressTimer = null;
        }
    );

    // Правая кнопка мыши (Backspace)
    _.hotkeys.on('Backspace',
        (e) => {
            e.preventDefault(); // Предотвращаем навигацию назад
            if (cursor.pressedRight) return;

            cursor.pressedRight = true;
            
            cursor.pressTimer = setTimeout(() => {
                cursor.pressTimer = null;
            }, 200);

            emitMouseEvent('mousedown', 2, 2);
        },
        () => {
            if (!cursor.pressedRight) return;
            
            emitMouseEvent('mouseup', 2, 0);
            
            if (cursor.pressTimer) {
                clearTimeout(cursor.pressTimer);
                handleShortPress(2);
            }
            
            cursor.pressedRight = false;
            cursor.pressTimer = null;
        }
    );

    // Изменение скорости (+/- возле Backspace)
    _.hotkeys.on('Equal',  // + (без Shift)
        () => {
            cursor.speed = Math.min(MAX_SPEED, cursor.speed + 2);
        },
        () => {}  // release не нужен
    );

    _.hotkeys.on('Minus',  // -
        () => {
            cursor.speed = Math.max(MIN_SPEED, cursor.speed - 2);
        },
        () => {}
    );

    // Альтернатива для + с Shift (на некоторых раскладках)
    _.hotkeys.on('Shift+Equal',
        () => {
            cursor.speed = Math.min(MAX_SPEED, cursor.speed + 2);
        },
        () => {}
    );

    // ==================== ПУБЛИЧНОЕ API ====================

    let pubCursor = {
        // Текущее состояние
        get pos() { return { x: cursor.x, y: cursor.y }; },
        get speed() { return cursor.speed; },
        
        // Управление
        setSpeed: (newSpeed) => {
            cursor.speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
        },
        
        warpTo: (x, y) => {
            cursor.x = Math.max(0, Math.min(window.innerWidth, x));
            cursor.y = Math.max(0, Math.min(window.innerHeight, y));
            updateCursorPosition();
            emitMouseEvent('mousemove', 0, 
                (cursor.pressed ? 1 : 0) | (cursor.pressedRight ? 2 : 0));
        },
        
        show: () => {
            cursor.visible = true;
            cursorElem.style.display = '';
        },
        
        hide: () => {
            cursor.visible = false;
            cursorElem.style.display = 'none';
        },
        
        // Эмуляция кликов вручную
        click: (button = 0) => {
            emitMouseEvent('mousedown', button, button === 0 ? 1 : 2);
            emitMouseEvent('mouseup', button, 0);
            if (button === 0) emitMouseEvent('click', 0, 0);
            if (button === 2) emitMouseEvent('contextmenu', 2, 0);
        }
    };

    // Обновляем позицию при изменении размера окна
    window.addEventListener('resize', () => {
        cursor.x = Math.min(cursor.x, window.innerWidth);
        cursor.y = Math.min(cursor.y, window.innerHeight);
        updateCursorPosition();
    });

    // Предотвращаем скролл от нажатий hjkl
	window.addEventListener('keydown', (e) => {
        if (['KeyH','KeyJ','KeyK','KeyL','Backspace'].includes(e.code)) {
            e.preventDefault();
        }
    });

    console.info('fakeCursor> Загружен! Скорость:', cursor.speed, 'пикс/кадр');
    console.info('fakeCursor> Управление: h,j,k,l | Enter(ЛКМ) | Backspace(ПКМ) | +/- скорость');

	return pubCursor;
});
