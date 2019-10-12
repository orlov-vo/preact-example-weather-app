import createPubSub from "./utils/createPubSub";

const pubSub = createPubSub();

window.addEventListener("click", globalClickHandler, false);
window.addEventListener("touchstart", globalClickHandler, false);
window.addEventListener("popstate", () => pubSub.pub("route", location.href));

/**
 * Get button index from mouse event
 *
 * @param event Mouse event
 * @returns Button index
 */
function getEventWhich(event: MouseEvent): number {
    return event.which === null ? event.button : event.which;
}

/**
 * Check origin for the link
 *
 * @param href Link
 * @returns True if the link has the same origin otherwise false
 */
function sameOrigin(href: string): boolean {
    let origin = `${location.protocol}//${location.hostname}`;
    if (location.port) {
        origin += `:${location.port}`;
    }

    return !!href && href.indexOf(origin) === 0;
}

/**
 * Global click handler for links
 *
 * @param event Event of mouse click or touch start
 */
function globalClickHandler(event: MouseEvent | TouchEvent) {
    // Check the event
    if (event instanceof MouseEvent && getEventWhich(event) !== 1) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.defaultPrevented) return;

    // Look up a anchor element
    let el: Node | null = event.target as Node;
    while (el && el.nodeName.toUpperCase() !== "A") {
        el = el.parentNode;
    }
    if (!el || el.nodeName.toUpperCase() !== "A") return;

    const link = el as HTMLAnchorElement;

    // Check the link
    if (!link.href) return;
    if (link.hasAttribute("download") || link.getAttribute("rel") === "external") return;
    if (link.target) return;
    if (!sameOrigin(link.href)) return;

    // If everything is OK let's go to this route
    event.preventDefault();
    push(link.href);
}

/**
 * Subscribe on change a route
 *
 * @param handler Handler for changing route
 * @returns Method for unsubscribe
 */
export function subscribe(handler: (route: string) => void) {
    return pubSub.sub("route", handler);
}

/**
 * Push next link instead current route
 *
 * @param nextLink Next link for push
 */
export function push(nextLink: string) {
    history.pushState(null, document.title, nextLink);
    pubSub.pub("route", nextLink);
}

/**
 * Replace current route with next link
 *
 * @param nextLink Next link for replace
 */
export function replace(nextLink: string) {
    history.replaceState(null, document.title, nextLink);
    pubSub.pub("route", nextLink);
}
