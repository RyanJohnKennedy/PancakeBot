import { ping } from "./ping";
import { totd } from "./totd";
import { totdMonth } from "./totd-month";

export const commands = {
    ping,
    totd,
    "totd-month": totdMonth,
};
