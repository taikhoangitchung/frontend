import {defaultColor} from "./defaultColors";

export const getAnswerButtonColor = (index) => {
    return defaultColor()[index % defaultColor().length];
};
