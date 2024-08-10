import userValidator from "./userValidator.js";
import nbValidator from "./nbValidator.js";

export default function validatorFactorer(name) {
  let fc;
  switch (name) {
    case "nbForm":
      fc = nbValidator;
      break;
    case "register":
      fc = userValidator;
      break;
  }

  return fc;
}
