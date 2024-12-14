import { init } from "@paralleldrive/cuid2";

export const getRandomId = (length = 12) => init({ length })();
