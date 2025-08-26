// module

export default function stdToString (msg: any): string {

    if ("object" !== typeof msg) {
        return String(msg);
    }
    else if (msg instanceof Buffer) {
        return msg.toString("utf8");
    }
    else {
        return msg.message ? msg.message : String(msg);
    }

}
