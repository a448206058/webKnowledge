// export type Config = {
//     getTagNamespace: (x?: string) => string | void;
//     parsePlatformTagName: (x: string) => string;
// };

export default ({
    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,
})

export function noop (a, b, c) {}

export function identity(_){ _ }

// let identity = (_) => _
