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
        // Convert text content to lowercase for case-insensitive matching
        const textContentLower = element.textContent.toLowerCase();
        if (textContentLower.includes('#bitcoin') && 
            !element.querySelector('img.bitcoin-extension-logo')) {
            
            const logo = document.createElement('img');
            logo.src = bitcoinSvgUrl;
            logo.className = 'bitcoin-extension-logo';
            logo.style.cssText = 'height: 1em; width: auto; margin-left: 0.15em; vertical-align: middle;';
            
            // Locate the first occurrence of '#bitcoin' in any case and split the text node accordingly
            const hashtagIndex = textContentLower.indexOf('#bitcoin');
            const textNode = Array.from(element.childNodes).find(node => 
                node.nodeType === Node.TEXT_NODE && 
                node.textContent.toLowerCase().indexOf('#bitcoin') === hashtagIndex
            );
            
            if (textNode) {
                // Split at the end of the hashtag and insert the logo
                const afterHashtag = textNode.splitText(hashtagIndex + 8);
                element.insertBefore(logo, afterHashtag.nextSibling); // Ensure logo is inserted right after the hashtag
            }
        }
    }

    const debouncedScanForBitcoinTags = debounce(() => {
        document.querySelectorAll('span').forEach(addBitcoinLogo);
    }, 500);

    // Set up observer for dynamic content
    const observer = new MutationObserver(debouncedScanForBitcoinTags);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    debouncedScanForBitcoinTags();
})();