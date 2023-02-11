function Validator(options) {
  let selectorRules = {};
  function getParent(inputElement, selector) {
    while (inputElement.parentElement) {
      if (inputElement.parentElement.matches(selector)) {
        return inputElement.parentElement;
      }
      inputElement = inputElement.parentElement;
    }
  }
  function validate(inputElement, rule) {
    const rules = selectorRules[rule.selector];
    const errorElement = getParent(
      inputElement,
      options.groupSelector
    ).querySelector(options.errorMessageSelector);
    let errorMessage;
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(`${rule.selector}:checked`)?.value
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) {
        break;
      }
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.groupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.groupSelector).classList.remove(
        "invalid"
      );
    }
    return errorMessage;
  }
  const formElement = document.querySelector(options.form);
  if (formElement) {
    const submitBtn = formElement.querySelector(`${options.form} .button`);
    submitBtn.onclick = () => {
      let isFormValid = true;
      options.rules.forEach((rule) => {
        const inputElements = formElement.querySelectorAll(rule.selector);
        Array.from(inputElements).forEach((inputElement) => {
          const errorMessage = validate(inputElement, rule);
          if (errorMessage) {
            isFormValid = false;
          }
        });
      });
      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          const inputs = formElement.querySelectorAll("[name]:not([disabled])");
          const data = Array.from(inputs).reduce((acc, cur) => {
            switch (cur.type) {
              case "radio":
                acc[cur.name] = formElement.querySelector(
                  `input[name=${cur.name}]:checked`
                ).value;
                break;
              case "checkbox":
                if (cur.matches(":checked")) {
                  if (Array.isArray(acc[cur.name])) {
                    acc[cur.name].push(cur.value);
                  } else {
                    acc[cur.name] = [cur.value];
                  }
                }
                break;
              case "file":
                acc[cur.name] = cur.files;
                break;
              default:
                acc[cur.name] = cur.value;
            }
            return acc;
          }, {});
          options.onSubmit(data);
        } else {
          formElement.onsubmit();
        }
      }
    };
    options.rules.forEach((rule) => {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          const errorElement = getParent(
            inputElement,
            options.groupSelector
          ).querySelector(options.errorMessageSelector);
          inputElement.onblur = () => {
            validate(inputElement, rule);
          };
          inputElement.oninput = () => {
            errorElement.innerText = "";
            getParent(inputElement, options.groupSelector).classList.remove(
              "invalid"
            );
          };
          inputElement.onchange = () => {
            validate(inputElement, rule);
          };
        }
      });
    });
  }
}

Validator.isRequired = (selector, message) => {
  return {
    selector,
    test: (value) => {
      return value ? undefined : message || "Please fill in this field!";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector,
    test: (value) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || `This field must be repeated exactly!`;
    },
  };
};

Validator.minLength = (selector, min, message) => {
  return {
    selector,
    test: (value) => {
      return value.length >= min
        ? undefined
        : message || `This field must be at least ${min} characters!`;
    },
  };
};

Validator.isConfirmed = (selector, passConfirmation, message) => {
  return {
    selector,
    test: (value) => {
      return value === passConfirmation()
        ? undefined
        : message || `Please enter this field in correct format!`;
    },
  };
};

Validator({
  form: ".sign-in-htm",
  groupSelector: ".group",
  errorMessageSelector: ".message",
  rules: [
    Validator.isRequired("#sign-in-user", "Please fill in your username!"),
    Validator.isRequired("#sign-in-pass", "Please fill in your password!"),
    Validator.minLength(
      "#sign-in-pass",
      6,
      "Password must be at least 6 characters!"
    ),
  ],
  onSubmit(data) {
    console.log(data);
  },
});
Validator({
  form: ".sign-up-htm",
  groupSelector: ".group",
  errorMessageSelector: ".message",
  rules: [
    Validator.isRequired("#sign-up-user", "Please fill in your username!"),
    Validator.isRequired("#sign-up-pass", "Please fill in your password!"),
    Validator.isRequired("#pass-confirmation", "Please repeat your password!"),
    Validator.isRequired("#email", "Please fill in your email!"),
    Validator.isEmail("#email", "Please enter email in correct format!"),
    Validator.minLength(
      "#sign-in-pass",
      6,
      "Password must be at least 6 characters!"
    ),
    Validator.isConfirmed(
      "#pass-confirmation",
      () => {
        return document.querySelector(".sign-up-htm #sign-up-pass").value;
      },
      "Password must be repeated exactly!"
    ),
  ],
  onSubmit(data) {
    console.log(data);
  },
});
