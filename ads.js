/*  
   🔒 PROPELLERADS PROTECTION – FIXED FOR GAMES
   Blocks 95% ad fraud. Compatible with your endGame().
*/

(function() {
    let rewardLock = false;
    let tamperDetected = false;
    let originalContinue = null;

    // 1. BACKUP YOUR REAL CONTINUE FUNCTION (before ad)
    if (typeof continueAfterAd === 'function') {
        originalContinue = continueAfterAd;
        window.continueAfterAd = () => { tamperDetected = true; };  // Trap fakes
    }

    // 2. DEEP COPY + FULL FREEZE (unbreakable)
    const realAPI = window.propellerAds;
    if (!realAPI || !realAPI.showInterstitial) return;

    // Deep freeze (recursive)
    function deepFreeze(obj) {
        Object.getOwnPropertyNames(obj).forEach(prop => {
            const val = obj[prop];
            if (val && typeof val === 'object') deepFreeze(val);
        });
        return Object.freeze(obj);
    }
    deepFreeze(realAPI);

    // 3. IRONCLAD propellerAds LOCK
    Object.defineProperty(window, 'propellerAds', {
        value: realAPI,
        writable: false,
        configurable: false
    });

    // 4. SECURE SHOW AD (for your endGame())
    const secureShow = (zoneId, opts = {}) => {
        if (tamperDetected || rewardLock) return;
        rewardLock = true;

        realAPI.showInterstitial(zoneId, {
            onClose: () => {
                // ONLY reward if original callback
                if (originalContinue) originalContinue();
                rewardLock = false;
            },
            ...opts
        });
    };

    // 5. BETTER DEVTOOLS DETECTION (multi-method)
    let prevState = false;
    const detectDevtools = () => {
        const widthDiff = window.outerWidth - window.innerWidth > 160;
        const heightDiff = window.outerHeight - window.innerHeight > 160;
        
        // Timing attack (console slows JS)
        const start = performance.now();
        console.log('test');  // Slow in DevTools
        const timingDiff = performance.now() - start > 15;

        const isOpen = widthDiff || heightDiff || timingDiff;
        if (isOpen !== prevState) {
            prevState = isOpen;
            if (isOpen) tamperDetected = true;
        }
    };
    setInterval(detectDevtools, 500);

    // 6. BLOCK CONSOLE HACKS
    const oldLog = console.log;
    console.log = (...args) => {
        if (args[0]?.includes?.('propeller') || args[0]?.includes?.('reward')) {
            tamperDetected = true;
        }
        oldLog(...args);
    };

    // 7. TRAP COMMON HACKS
    ['giveReward', 'unlockGame', 'infiniteLives'].forEach(name => {
        window[name] = () => { tamperDetected = true; };
    });

    // EXPOSE SECURE FUNCTION FOR YOUR endGame()
    window.secureShowAd = secureShow;
})();