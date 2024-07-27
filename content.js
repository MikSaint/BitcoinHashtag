// Created by @oneSaint on July 26, 2024

(function() {
    const bitcoinSvgUrl = chrome.runtime.getURL("bitcoin.svg");

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function addBitcoinLogo(element) {
        // Use a regex to match #Bitcoin as a whole word, case-insensitive
        const bitcoinHashtagRegex = /#Bitcoin\b/i;
        const match = element.textContent.match(bitcoinHashtagRegex);
        
        if (match && !element.querySelector('img.bitcoin-extension-logo')) {
            const logo = document.createElement('img');
            logo.src = bitcoinSvgUrl;
            logo.className = 'bitcoin-extension-logo';
            logo.style.cssText = 'height: 1em; width: auto; margin-left: 0.15em; vertical-align: middle; margin-right: 0.05em';
            
            // Find the exact text node containing the hashtag
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.match(bitcoinHashtagRegex)) {
                    const index = node.textContent.indexOf(match[0]) + match[0].length;
                    const afterHashtag = node.splitText(index);
                    node.parentNode.insertBefore(logo, afterHashtag);
                    break;
                }
            }
        }
    }

    const debouncedScanForBitcoinTags = debounce(() => {
        // Only target elements that are likely to contain hashtags
        document.querySelectorAll('a[href^="/hashtag/"], span').forEach(addBitcoinLogo);
    }, 500);

    // Set up observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('/hashtag/')) {
                            addBitcoinLogo(node);
                        } else if (node.tagName === 'SPAN') {
                            addBitcoinLogo(node);
                        } else {
                            node.querySelectorAll('a[href^="/hashtag/"], span').forEach(addBitcoinLogo);
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    debouncedScanForBitcoinTags();
})();