// ==UserScript==
// @name         Sankaku Beta WinTouch
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Enable touch navigation on Sankaku Beta with Win Tabs.
// @author       Me
// @match        https://beta.sankakucomplex.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const Nav = {
        prevBtn: null,
        nextBtn: null,
        closeBtn: null,
        initialX: null
    };

    const init = () => {
        const closeBtnClass = "MuiButtonBase-root MuiIconButton-root";
        const buttons = document.getElementsByClassName(closeBtnClass);
        if (buttons) {
            for (let button of buttons) {
                if (button.attributes["aria-label"]) {
                    if (button.attributes["aria-label"].value === "close") {
                        Nav.closeBtn = button;
                        break;
                    }
                }
            }
        }

        if (Nav.closeBtn) {
            console.log("Click close button.");
            Nav.closeBtn.click();
            Nav.closeBtn = null;
        }

        const swiperWraperClassName = 'swiper-container swiper-container-virtual swiper-container-initialized swiper-container-horizontal';
        const swiperWrapper = document.getElementsByClassName(swiperWraperClassName)[0];
        if (!swiperWrapper) {
            console.log("Swiper was not found!");

            if (/https\:\/\/beta\.sankakucomplex\.com\/post\/show/g.test(window.location.href)) {
                setTimeout(init, 0);
            }

            return;
        }

        const btnClassName = "MuiButtonBase-root MuiFab-root";
        const btns = swiperWrapper.getElementsByClassName(btnClassName);
        if (!btns || btns.length < 2) {
            console.log("Buttons were not found!");
            return;
        }

        if (!btns[1] || !btns[0]) {
            return;
        }

        Nav.prevBtn = btns[1];
        Nav.nextBtn = btns[0]

        console.log("Make the navigation buttons invisible.")
        Nav.prevBtn.style.visibility = "hidden";
        Nav.nextBtn.style.visibility = "hidden";
    };

    const handleStart = (evt) => {
        const firstTouch = evt.touches[0];
        Nav.initialX = firstTouch.clientX;
    };

    const handleMove = (evt) => {
        if (!Nav.initialX) {
            return;
        }

        var endX = evt.touches[0].clientX;
        var deltaX = endX - Nav.initialX;
        if (Math.abs(deltaX) < 150) {
            return;
        }

        if (deltaX < 0) {
            console.log("Go to next.");
            const keyboardEvent = new KeyboardEvent('keydown', { keyCode: 39, key: "ArrowRight" })
            document.dispatchEvent(keyboardEvent);
        } else {
            console.log("Go to prev.");
            const keyboardEvent = new KeyboardEvent('keydown', { keyCode: 37, key: "ArrowLeft" })
            document.dispatchEvent(keyboardEvent);
        }

        Nav.initialX = null;
    };

    const swiperWorkaround = () => {
        var sheet = document.createElement('style')
        sheet.innerHTML = ".swiper-container {touch-action: none;}";
        document.body.appendChild(sheet);
    };

    const addTouchEvents = () => {
        document.body.addEventListener("touchstart", handleStart, false);
        document.body.addEventListener("touchmove", handleMove, false);
        console.log("Added touch events.")
    };

    swiperWorkaround();
    addTouchEvents();

    const elementToObserve = document.body;
    const observer = new MutationObserver(() => {
        console.log("Body mutated.");
        init();
    });

    observer.observe(elementToObserve, { subtree: true, childList: true });
})();