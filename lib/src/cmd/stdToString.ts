// module

export default function stdToString (msg: unknown): string {

    if ("object" !== typeof msg) {
        return String(msg);
    }
    else if (msg instanceof Buffer) {
        return msg.toString("utf8");
    }
    else {
        return (msg as Record<string, string>).message ? (msg as Record<string, string>).message : String(msg);
    }

}
