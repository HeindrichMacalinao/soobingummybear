(function appBootstrap() {
    const UI_TIMINGS = {
        loadingDurationMs: 1300,
        transitionMs: 500
    };

    const details = window.SITE_CONTENT || {};

    const loadingOverlay = document.getElementById('loading-overlay');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const closedScreen = document.getElementById('closed-screen');
    const mainWindow = document.getElementById('main-window');

    const startButton = document.getElementById('start-btn');
    const reopenButton = document.getElementById('reopen-btn');

    const buttons = Array.from(document.querySelectorAll('.button'));
    const titleEl = document.getElementById('detail-title');
    const bodyEl = document.getElementById('dynamic-body');
    const addressEl = document.getElementById('address-text');

    const minimizeBtn = document.getElementById('win-minimize');
    const maximizeBtn = document.getElementById('win-maximize');
    const closeBtn = document.getElementById('win-close');

    const backBtn = document.getElementById('nav-back');
    const forwardBtn = document.getElementById('nav-forward');

    let currentActiveTab = 'faqs';
    let currentScreen = 'menu';
    let backHistory = [];
    let forwardHistory = [];
    let isNavigatingHistory = false;

    const audio = window.createAudioEngine(() => loadingOverlay.hidden);

    function showMainMenu() {
        currentScreen = 'menu';
        mainWindow.classList.remove('loaded');

        setTimeout(() => {
            mainWindow.hidden = true;
            mainMenuScreen.hidden = false;
            void mainMenuScreen.offsetWidth;
            mainMenuScreen.classList.add('show');
            addressEl.textContent = 'https://soobingummybear.com/';
            updateNavigationArrows();
            startButton.focus();
        }, UI_TIMINGS.transitionMs);
    }

    function updateNavigationArrows() {
        backBtn.disabled = backHistory.length === 0;
        forwardBtn.disabled = forwardHistory.length === 0;
    }

    function setActive(target) {
        const info = details[target];
        if (!info) return;

        if (!isNavigatingHistory && currentScreen === 'browser' && target !== currentActiveTab) {
            backHistory.push({ screen: 'browser', tab: currentActiveTab });
            forwardHistory = [];
        }

        currentActiveTab = target;

        bodyEl.classList.remove('tab-fade-in');
        void bodyEl.offsetWidth;

        titleEl.textContent = info.title;
        bodyEl.innerHTML = info.html;
        addressEl.textContent = `https://soobingummybear.com/${target}`;
        bodyEl.classList.add('tab-fade-in');

        buttons.forEach((button) => {
            const isActive = button.dataset.target === target;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
            button.tabIndex = isActive ? 0 : -1;
            if (isActive) {
                bodyEl.setAttribute('aria-labelledby', button.id);
            }
        });

        updateNavigationArrows();
    }

    function startApp() {
        audio.playAppOpen();

        if (!isNavigatingHistory) {
            backHistory.push({ screen: 'menu' });
            forwardHistory = [];
        }

        currentScreen = 'browser';
        mainMenuScreen.classList.remove('show');

        setTimeout(() => {
            mainMenuScreen.hidden = true;
            mainWindow.hidden = false;
            void mainWindow.offsetWidth;
            mainWindow.classList.add('loaded');
            setActive(currentActiveTab);
            const activeButton = buttons.find((button) => button.dataset.target === currentActiveTab);
            if (activeButton) {
                activeButton.focus();
            }
        }, UI_TIMINGS.transitionMs);
    }

    function reopenWindow() {
        audio.playAppOpen();
        closedScreen.hidden = true;
        isNavigatingHistory = true;

        if (currentScreen === 'menu') {
            showMainMenu();
        } else {
            startApp();
        }
    }

    function wireInteractions() {
        const initializeAudioFromGesture = () => audio.initAudio();
        window.addEventListener('touchstart', initializeAudioFromGesture, { once: true });
        window.addEventListener('mousedown', initializeAudioFromGesture, { once: true });
        window.addEventListener('mousemove', initializeAudioFromGesture, { once: true });
        window.addEventListener('keydown', initializeAudioFromGesture, { once: true });

        document.body.addEventListener('mouseover', (event) => {
            const target = event.target;
            if (
                target &&
                (target.tagName === 'BUTTON' ||
                    target.classList.contains('button') ||
                    target.closest('.portrait-wrapper') ||
                    target.classList.contains('username-badge') ||
                    target.tagName === 'LI')
            ) {
                audio.playHover();
            }
        });

        startButton.addEventListener('click', startApp);
        reopenButton.addEventListener('click', reopenWindow);

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                audio.playTabClick();
                isNavigatingHistory = false;
                setActive(button.dataset.target);
            });
        });

        backBtn.addEventListener('click', () => {
            audio.playTabClick();
            if (backHistory.length === 0) return;

            isNavigatingHistory = true;

            if (currentScreen === 'browser') {
                forwardHistory.push({ screen: 'browser', tab: currentActiveTab });
            } else {
                forwardHistory.push({ screen: 'menu' });
            }

            const previousState = backHistory.pop();

            if (previousState.screen === 'menu') {
                showMainMenu();
                return;
            }

            currentActiveTab = previousState.tab;
            if (currentScreen === 'menu') {
                startApp();
            } else {
                setActive(currentActiveTab);
            }
        });

        forwardBtn.addEventListener('click', () => {
            audio.playTabClick();
            if (forwardHistory.length === 0) return;

            isNavigatingHistory = true;

            if (currentScreen === 'browser') {
                backHistory.push({ screen: 'browser', tab: currentActiveTab });
            } else {
                backHistory.push({ screen: 'menu' });
            }

            const nextState = forwardHistory.pop();

            if (nextState.screen === 'menu') {
                showMainMenu();
                return;
            }

            currentActiveTab = nextState.tab;
            if (currentScreen === 'menu') {
                startApp();
            } else {
                setActive(currentActiveTab);
            }
        });

        minimizeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (mainWindow.classList.contains('minimized')) {
                audio.playAppOpen();
            } else {
                audio.playAppClose();
            }
            mainWindow.classList.toggle('minimized');
        });

        maximizeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            mainWindow.classList.remove('minimized');
            mainWindow.classList.toggle('maximized');

            if (mainWindow.classList.contains('maximized')) {
                audio.playAppOpen();
            } else {
                audio.playAppClose();
            }

            maximizeBtn.textContent = mainWindow.classList.contains('maximized') ? '⧈' : '⧉';
        });

        closeBtn.addEventListener('click', (event) => {
            audio.playAppTerminate();
            event.stopPropagation();
            mainWindow.classList.remove('loaded');

            setTimeout(() => {
                mainWindow.hidden = true;
                closedScreen.hidden = false;
                reopenButton.focus();
            }, UI_TIMINGS.transitionMs);
        });
    }

    function setupTabsAccessibility() {
        buttons.forEach((button) => {
            button.id = `tab-${button.dataset.target}`;
            button.setAttribute('aria-controls', 'dynamic-body');
            button.setAttribute('aria-selected', 'false');
            button.tabIndex = -1;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupTabsAccessibility();
        wireInteractions();

        setTimeout(() => {
            audio.stopLoadingTicking();
            loadingOverlay.style.opacity = '0';

            setTimeout(() => {
                loadingOverlay.hidden = true;
                mainMenuScreen.hidden = false;
                mainMenuScreen.classList.add('show');
                startButton.focus();
            }, UI_TIMINGS.transitionMs);
        }, UI_TIMINGS.loadingDurationMs);
    });
})();
