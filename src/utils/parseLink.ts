const anchor = document.createElement("a");

/**
 * Native parse the link with anchor element
 *
 * @param href String with the link
 * @return Parts of the link
 */
export default function parseLink(href: string) {
    anchor.href = href;

    const { hostname, pathname, search, hash } = anchor;

    return {
        hostname,
        pathname,
        search,
        hash
    };
}
