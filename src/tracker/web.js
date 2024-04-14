(window => {
    const {
        screen: { width, height },
        navigator: { language },
        location,
        localStorage,
        document,
        history,
    } = window;
    const { hostname, pathname, search } = location;
    const { currentScript, referrer } = document;

    if (!currentScript) return;

    const _data = 'data-';
    const _false = 'false';
    const _true = 'true';
    const attr = currentScript.getAttribute.bind(currentScript);
    const website = attr(_data + 'website-id');
    const hostUrl = attr(_data + 'host-url');
    const tag = attr(_data + 'tag');
    const autoTrack = attr(_data + 'auto-track') !== _false;
    const excludeSearch = attr(_data + 'exclude-search') === _true;
    const domain = attr(_data + 'domains') || '';
    const domains = domain.split(',').map(n => n.trim());
    const host =
        hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -3).join('/');
    const endpoint = `${host.replace(/\/$/, '')}__COLLECT_API_ENDPOINT__`;
    const screen = `${width}x${height}`;
    const eventRegex = /data-umami-event-([\w-_]+)/;
    const eventNameAttribute = _data + 'umami-event';
    const delayDuration = 300;

    let collections = [];
    let firstTime = true;

    /* Helper functions */

    const encode = str => {
        if (!str) {
            return undefined;
        }

        try {
            const result = decodeURI(str);

            if (result !== str) {
                return result;
            }
        } catch {
            return str;
        }

        return encodeURI(str);
    };

    const parseURL = url => {
        return excludeSearch ? url.split('?')[0] : url;
    };

    const getPayload = () => ({
        title: encode(title),
        url: encode(currentUrl),
        referrer: encode(currentRef),
        tag: tag ? tag : undefined,
        t: new Date().getTime(),
    });

    /* Event handlers */

    const handlePush = (state, title, url) => {
        if (!url) return;

        currentRef = currentUrl;
        currentUrl = parseURL(url.toString());

        if (currentUrl !== currentRef) {
            setTimeout(track, delayDuration);
        }
    };

    const handlePathChanges = () => {
        const hook = (_this, method, callback) => {
            const orig = _this[method];

            return (...args) => {
                callback.apply(null, args);

                return orig.apply(_this, args);
            };
        };

        history.pushState = hook(history, 'pushState', handlePush);
        history.replaceState = hook(history, 'replaceState', handlePush);
    };

    const handleTitleChanges = () => {
        const observer = new MutationObserver(([entry]) => {
            title = entry && entry.target ? entry.target.text : undefined;
        });

        const node = document.querySelector('head > title');

        if (node) {
            observer.observe(node, {
                subtree: true,
                characterData: true,
                childList: true,
            });
        }
    };

    const handleClicks = () => {
        document.addEventListener(
            'click',
            async e => {
                const isSpecialTag = tagName => ['BUTTON', 'A'].includes(tagName);

                const trackElement = async el => {
                    const attr = el.getAttribute.bind(el);
                    const eventName = attr(eventNameAttribute);

                    if (eventName) {
                        const eventData = {};

                        el.getAttributeNames().forEach(name => {
                            const match = name.match(eventRegex);

                            if (match) {
                                eventData[match[1]] = attr(name);
                            }
                        });

                        return track(eventName, eventData);
                    }
                };

                const findParentTag = (rootElem, maxSearchDepth) => {
                    let currentElement = rootElem;
                    for (let i = 0; i < maxSearchDepth; i++) {
                        if (isSpecialTag(currentElement.tagName)) {
                            return currentElement;
                        }
                        currentElement = currentElement.parentElement;
                        if (!currentElement) {
                            return null;
                        }
                    }
                };

                const el = e.target;
                const parentElement = isSpecialTag(el.tagName) ? el : findParentTag(el, 10);

                if (parentElement) {
                    const { href, target } = parentElement;
                    const eventName = parentElement.getAttribute(eventNameAttribute);

                    if (eventName) {
                        if (parentElement.tagName === 'A') {
                            const external =
                                target === '_blank' ||
                                e.ctrlKey ||
                                e.shiftKey ||
                                e.metaKey ||
                                (e.button && e.button === 1);

                            if (eventName && href) {
                                if (!external) {
                                    e.preventDefault();
                                }
                                return trackElement(parentElement).then(() => {
                                    if (!external) location.href = href;
                                });
                            }
                        } else if (parentElement.tagName === 'BUTTON') {
                            return trackElement(parentElement);
                        }
                    }
                } else {
                    return trackElement(el);
                }
            },
            true,
        );
    };

    /* Tracking functions */

    const trackingDisabled = () =>
        (localStorage && localStorage.getItem('umami.disabled')) ||
        (domain && !domains.includes(hostname));

    const collect = (payload, type = 'event') => {
        if (trackingDisabled()) return;

        collections.push({
            payload,
            type
        })

        if(firstTime){
            firstTime = false;
            sendCollections().then(r => {})
        }
    };

    const sendCollections = async () => {
        if(collections.length === 0) return;

        let headers = {
            'Content-Type': 'application/json',
        };
        if (typeof cache !== 'undefined') {
            headers['x-umami-cache'] = cache;
        }
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    events: collections,
                    hostname,
                    screen,
                    id: website,
                    language
                }),
                headers,
            });
            const text = await res.text();

            collections = [];

            return (cache = text);
        } catch {
            /* empty */
        }
    }

    setInterval(() => sendCollections(), 5 * 1000);

    const track = (obj, data) => {
        if (typeof obj === 'string') {
            return collect({
                ...getPayload(),
                name: obj,
                data: typeof data === 'object' ? data : undefined,
            });
        } else if (typeof obj === 'object') {
            return collect(obj);
        } else if (typeof obj === 'function') {
            return collect(obj(getPayload()));
        }
        return collect(getPayload());
    };

    const identify = data => collect({ ...getPayload(), data }, 'identify');

    /* Start */

    if (!window.umami) {
        window.umami = {
            track,
            identify,
        };
    }

    let currentUrl = `${pathname}${search}`;
    let currentRef = referrer !== hostname ? referrer : '';
    let title = document.title;
    let cache;
    let initialized;

    if (autoTrack && !trackingDisabled()) {
        handlePathChanges();
        handleTitleChanges();
        handleClicks();

        const init = () => {
            if (document.readyState === 'complete' && !initialized) {
                track();
                initialized = true;
            }
        };

        document.addEventListener('readystatechange', init, true);

        init();
    }
})(window);