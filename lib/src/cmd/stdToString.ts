/*
    eslint-disable @typescript-eslint/no-base-to-string
*/
// => @typescript-eslint/no-base-to-string is disabled to force stringifying a potential object

// module

export default function stdToString (msg: unknown): string {

    if ("object" !== typeof msg) {
        return String(msg);
    }
    else if (msg instanceof Buffer) {
        return msg.toString("utf8");
    }
    else if ((msg as Record<string, string>).message) {
        return (msg as Record<string, string>).message;
    }
    else {
        return String(msg);
    }

}
