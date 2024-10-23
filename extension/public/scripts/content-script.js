let autofillNodes = [];
let isLoggedIn = null;
let userInfo = null;
let ctaElement = null;
let signInBtn = null;
let initialURL = window.location.href;
let urlToSave = initialURL;

/**
 * Function to extend a part of xpath expression depending on the parameters.
 * @param {*} attr string representing attribute
 * @param {*} val string representing the value to check in the attribute
 * @returns part of the string xpath expression
 */
const buildXpathSubExp = function (attr, val) {
  let subExp = ` or (contains(translate(@${attr}, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${val}'))`;
  return subExp;
};

/**
 * Function to build the total xpath expression to identify login fields
 * @returns xpath expression string
 */
const buildTotalXpath = function () {
  let pathExp =
    "//input[(contains(translate(@type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'email'))";
  let attrs = [
    "type",
    "class",
    "id",
    "name",
    "data-testid",
    "placeholder",
    "aria-label",
    "autocomplete",
  ];
  let vals = [
    "login",
    "log in",
    "log-in",
    "signin",
    "sign in",
    "sign-in",
    "username",
    "user name",
    "user-name",
    "uname",
    "u-name",
    "email",
    "e-mail",
    "password",
    "pass word",
    "pass-word",
    "pw",
  ];
  for (let attr of attrs) {
    for (let val of vals) {
      pathExp += buildXpathSubExp(attr, val);
    }
  }
  pathExp += "]";
  return pathExp;
};

/**
 * Function to determine in autofill is necessary for the webpage
 * @returns boolean value
 */
const determineIfAutofillNecessary = function () {
  console.log("HERE2");

  let prevAutofillNodes = [...autofillNodes];

  let currentUrl = document.location.href;

  let signupKeywords = [
    "signup",
    "sign_up",
    "sign-up",
    "register",
    "join",
    "create",
    "get started",
    "get-started",
    "get_started",
    "enroll",
  ];

  for (let keyword of signupKeywords) {
    if (currentUrl.toLowerCase().includes(keyword)) {
      return false;
    }
  }

  const xpathExp = buildTotalXpath();

  let nodes = document.evaluate(
    xpathExp,
    document,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null
  );
  let node = nodes.iterateNext();
  if (node == null) {
    return false;
  }
  while (node !== null) {
    if (!autofillNodes.includes(node) && isNodeVisible(node)) {
      autofillNodes.push(node);
    }
    try {
      node = nodes.iterateNext();
    } catch (err) {
      node = null;
    }
  }
  checkInputElementsEdgeCases();

  if (autofillNodes.length > 0) {
    for (let i = 0; i < autofillNodes.length; i++) {
      if (!isNodeVisible(autofillNodes[i])) {
        autofillNodes.splice(i, 1);
      }
    }
  }

  console.log("Condition 1:", autofillNodes.length > 0);
  console.log("Condition 2:", autofillNodes.length > prevAutofillNodes.length);

  console.log("PrevNodes:", prevAutofillNodes);
  console.log("Nodes:", autofillNodes);

  if (
    autofillNodes.length > 0 &&
    autofillNodes.length > prevAutofillNodes.length
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * Function to check if the login fields retrieved fall in edge case
 */
function checkInputElementsEdgeCases() {
  if (autofillNodes.length == 1) {
    let node = autofillNodes[0];
    let nodeType = node.type;
    if (nodeType.toLowerCase() == "password") {
      let xpathExpression = "preceding::input[1]";
      let edgeCaseNodes = document.evaluate(
        xpathExpression,
        node,
        null,
        XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
        null
      );
      let edgeCaseNode = edgeCaseNodes.iterateNext();
      while (edgeCaseNode !== null) {
        autofillNodes.push(edgeCaseNode);
        edgeCaseNode = edgeCaseNodes.iterateNext();
      }
    }
  }
}

function isNodeVisible(node) {
  const style = window.getComputedStyle(node);

  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    node.getAttribute("aria-hidden") === "true" ||
    node.type === "hidden" ||
    node.id.toLowerCase().includes("hidden") ||
    node.className.toLowerCase().includes("hidden") ||
    node.name.toLowerCase().includes("hidden") ||
    !node
  ) {
    return false;
  }

  if (node.type === "password") {
    return true;
  }
  const rect = node.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getValidNode(nodes, allowDisabled = false) {
  let node = nodes.iterateNext();
  let validSignIn = null;
  if (node == null) {
    return null;
  }
  let nodeAttrs = [
    "class",
    "id",
    "name",
    "value",
    "innerHTML",
    "aria-label",
    "data-testid",
    "autocomplete",
    "textContent",
  ];
  let registerKeywords = [
    "signup",
    "sign_up",
    "sign-up",
    "register",
    "join",
    "create",
    "get started",
    "get-started",
    "get_started",
    "enroll",
    "new",
    "with",
    "reveal",
    "show",
  ];
  let signInKeywords = [
    "login",
    "log in",
    "log-in",
    "signin",
    "sign in",
    "sign-in",
    "continue",
    "next",
    "submit",
  ];
  while (node !== null) {
    let isValidNode = isNodeVisible(node);
    {
      if (allowDisabled)
        isValidNode =
          node.getAttribute("aria-disabled") !== "true" ? isValidNode : false;
    }
    isValidNode = node.type !== "checkbox" ? isValidNode : false;
    for (let attr of nodeAttrs) {
      let attrValue = "";
      if (attr == "textContent" || attr == "innerHTML") {
        attrValue = node[attr];
      } else {
        attrValue = node.getAttribute(attr);
      }
      if (attrValue !== null && attrValue !== "" && attrValue !== undefined) {
        for (let keyword of registerKeywords) {
          if (attrValue.toLowerCase().includes(keyword)) {
            isValidNode = false;
            break;
          }
        }
        if (isValidNode)
          for (let keyword of signInKeywords) {
            if (attrValue.toLowerCase().includes(keyword)) {
              return node;
            }
          }
      }
      if (!isValidNode) {
        break;
      }
    }
    if (isValidNode) {
      return node;
    } else {
      node = nodes.iterateNext();
    }
  }
  return null;
}

function findSignInBtn() {
  function buildXpathChildTextMatch(val) {
    let subXpath = `or (contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${val}'))`;
    return subXpath;
  }

  function buildBtnXpathTotal() {
    let signInKeyWords = [
      "signin",
      "sign-in",
      "sign in",
      "login",
      "log-in",
      "login",
      "next",
      "continue",
      "submit",
    ];
    let nodeAttrs = [
      "class",
      "id",
      "name",
      "value",
      "aria-label",
      "data-testid",
      "autocomplete",
      "type",
    ];
    let xpathBtn =
      "//input[(contains(translate(@class, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'signin'))";
    for (let attr of nodeAttrs) {
      for (let val of signInKeyWords) {
        xpathBtn += buildXpathSubExp(attr, val);
      }
    }
    for (let val of signInKeyWords) {
      xpathBtn += buildXpathChildTextMatch(val);
    }
    xpathBtn += "]";
    xpathBtn +=
      " | //button[(contains(translate(@class, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'signin'))";
    for (let attr of nodeAttrs) {
      for (let val of signInKeyWords) {
        xpathBtn += buildXpathSubExp(attr, val);
      }
    }
    for (let val of signInKeyWords) {
      xpathBtn += buildXpathChildTextMatch(val);
    }
    xpathBtn += "]";
    return xpathBtn;
  }

  let initialXpathExp =
    "//input[contains(@type, 'submit')] | //button[contains(@type, 'submit')]";
  let btnNodes = document.evaluate(
    initialXpathExp,
    document,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null
  );

  validSignIn = getValidNode(btnNodes);

  if (validSignIn == null) {
    for (let node of autofillNodes) {
      if (node.type == "password") {
        let btnsFound = document.evaluate(
          "following::input[1]|following::button[1]",
          node,
          null,
          XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
          null
        );
        validSignIn = getValidNode(btnsFound);
      }
    }
  }

  if (validSignIn == null) {
    let xpathExp = buildBtnXpathTotal();
    let btnNodes = document.evaluate(
      xpathExp,
      document,
      null,
      XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
      null
    );
    validSignIn = getValidNode(btnNodes);
  }
  if (validSignIn == null) {
    let xpathExp = buildBtnXpathTotal();
    let btnNodes = document.evaluate(
      xpathExp,
      document,
      null,
      XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
      null
    );
    validSignIn = getValidNode(btnNodes, true);
  }

  signInBtn = validSignIn;

  console.log("signInbtn:", signInBtn);
}

function appendSavePromptToDoc() {
  if (ctaElement == null) {
    ctaElement = document.createElement("div");
    ctaElement.style.position = "fixed";
    ctaElement.style.top = "5px";
    ctaElement.style.right = "5px";
    ctaElement.style.backgroundColor = "#f1c40f";
    ctaElement.style.padding = "10px";
    ctaElement.style.borderRadius = "5px";
    ctaElement.style.zIndex = "1000";
    ctaElement.style.display = "flex";
    ctaElement.style.alignItems = "center";

    const closeIcon = document.createElement("span");
    closeIcon.innerHTML = "&times;"; // Cross icon
    closeIcon.style.cursor = "pointer";
    closeIcon.style.fontSize = "23px";
    closeIcon.style.fontWeight = "bold";
    closeIcon.style.color = "black";
    closeIcon.style.paddingBottom = "3px";

    closeIcon.addEventListener("mouseover", () => {
      closeIcon.style.color = "white";
    });

    closeIcon.addEventListener("mouseout", () => {
      closeIcon.style.color = "black";
    });

    closeIcon.addEventListener("click", () => {
      document.body.removeChild(ctaElement);
      ctaElement = null;
    });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save credentials?";
    saveButton.style.cursor = "pointer"; // Pointer cursor only on the button
    saveButton.style.padding = "5px 10px";
    saveButton.style.border = "none";
    saveButton.style.marginRight = "10px";
    saveButton.style.backgroundColor = "black"; // Button color
    saveButton.style.color = "#f1c40f";
    saveButton.style.borderRadius = "3px";
    saveButton.style.fontWeight = "bold";
    saveButton.style.border = "2px solid black";

    saveButton.addEventListener("mouseover", () => {
      saveButton.style.color = "black";
      saveButton.style.backgroundColor = "#f1c40f";
    });

    saveButton.addEventListener("mouseout", () => {
      saveButton.style.color = "#f1c40f";
      saveButton.style.backgroundColor = "black";
    });

    saveButton.addEventListener("click", () => {
      if (signInBtn == null) {
        findSignInBtn();
        if (signInBtn !== null) {
          signInBtn.addEventListener("click", () => {
            const thisURL = new URL(window.location.href);
            let credData = {
              url: thisURL.origin + thisURL.pathname,
            };
            let fields = [];
            let notEmpty = true;
            for (node of autofillNodes) {
              let field = { type: node.type };
              let attrsToNote = [
                "name",
                "data-testid",
                "placeholder",
                "aria-label",
                "autocomplete",
              ];
              for (let attr of attrsToNote) {
                if (node.getAttribute(attr)) {
                  field[attr] = node.getAttribute(attr);
                }
              }
              if (node.value.length < 1) {
                notEmpty = false;
                break;
              }
              field["value"] = node.value;
              fields.push(field);
            }
            if (notEmpty) {
              credData.fields = fields;
              chrome.runtime.sendMessage({
                action: "save credential",
                user: userInfo.uname,
                credential: credData,
              });
            }
          });
        }
      }
      document.body.removeChild(ctaElement);
      ctaElement = null;
    });

    ctaElement.appendChild(saveButton);
    ctaElement.appendChild(closeIcon);
    document.body.appendChild(ctaElement);
  }
}

function performAutoFill(autofillCredential) {
  console.log("performing autofill");

  let fieldKeys = [];
  for (const fieldObj of autofillCredential.fields) {
    fieldKeys.push(...Object.keys(fieldObj));
  }
  let nodeMaps = new Map();
  for (let node of autofillNodes) {
    let maxMatches = 0;

    for (let field of autofillCredential.fields) {
      let numMatches = 0;

      for (let fieldKey of fieldKeys) {
        if (
          fieldKey !== "value" &&
          node.getAttribute(fieldKey) &&
          field.hasOwnProperty(fieldKey) &&
          node.getAttribute(fieldKey) === field[fieldKey]
        ) {
          numMatches += 1;
        }
      }
      if (numMatches > maxMatches) {
        maxMatches = numMatches;
        nodeMaps.set(node, field);
      }
    }
  }
  console.log("map:", nodeMaps);
  for (let node of autofillNodes) {
    console.log(node);

    try {
      if (node.value != null && nodeMaps.get(node).value) {
        node.value = nodeMaps.get(node).value;
        const event = new Event("input", {
          bubbles: true,
          cancelable: true,
        });

        node.dispatchEvent(event);
      }
    } catch (err) {
      console.log(err);

      continue;
    }
  }
}

/**
 * Function which performs all the necessary actions in a webpage
 */
function actOnWebpage() {
  if (autofillNodes.length > 0) {
    if (userInfo.credentials.length < 1) {
      // if no saved credentials
      appendSavePromptToDoc();
    } else {
      let credentials = userInfo.credentials;
      let tempURL = new URL(window.location.href);
      let urlToCompare = tempURL.origin + tempURL.pathname;
      let canAutofill = false;
      let autoFillCredential = null;
      for (let credential of credentials) {
        let credUrl = credential.url;
        if (credUrl === urlToCompare) {
          if (credential.fields.length < 2) {
            console.log("HERE1");
            if (autofillNodes.length > credential.fields.length) {
              appendSavePromptToDoc();
            } else {
              let fieldKeys = [];
              for (const fieldObj of credential.fields) {
                fieldKeys.push(...Object.keys(fieldObj));
              }
              for (let node of autofillNodes) {
                for (let field of credential.fields) {
                  for (let fieldKey of fieldKeys) {
                    if (fieldKey !== "value" && fieldKey !== "type") {
                      if (
                        node.getAttribute(fieldKey) &&
                        field.hasOwnProperty(fieldKey) &&
                        node.getAttribute(fieldKey) === field[fieldKey]
                      ) {
                        continue;
                      } else {
                        appendSavePromptToDoc();
                      }
                    }
                  }
                }
              }
            }

            // let necessary = determineIfAutofillNecessary();

            // if (necessary) {
            //   appendSavePromptToDoc();
            // }
          }
          canAutofill = true;
          autoFillCredential = credential;
          break;
        }
      }
      if (canAutofill) {
        performAutoFill(autoFillCredential);
      } else {
        appendSavePromptToDoc();
      }
    }
  }
}

function onDOMUpdate(mutationsList) {
  let currentURL = window.location.href;

  if (currentURL !== initialURL) {
    initialURL = currentURL;
    urlToSave = currentURL;
    autofillNodes = [];
    if (signInBtn !== null) {
      signInBtn = null;
    }
    if (ctaElement !== null) {
      document.body.removeChild(ctaElement);
      ctaElement = null;
    }
    let necessary = determineIfAutofillNecessary();

    if (necessary) {
      chrome.runtime
        .sendMessage({ action: "loginInfo" })
        .then((res) => {
          if (res.isLoggedIn) {
            isLoggedIn = res.isLoggedIn;
            userInfo = res.userInfo;
            actOnWebpage();
          } else {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("Autofill not necessary");
    }
  }
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "INPUT") {
          // comment from here
          // autofillNodes = [];
          // if (signInBtn !== null) {
          //     signInBtn = null;
          // }
          // if (ctaElement !== null) {
          //     document.body.removeChild(ctaElement);
          //     ctaElement = null;
          // }
          //comment till here
          let necessary = determineIfAutofillNecessary();
          if (necessary) {
            chrome.runtime
              .sendMessage({ action: "loginInfo" })
              .then((res) => {
                if (res.isLoggedIn) {
                  isLoggedIn = res.isLoggedIn;
                  userInfo = res.userInfo;
                  actOnWebpage();
                } else {
                }
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log("Autofill not necessary");
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const inputs = node.querySelectorAll("input");
          if (inputs.length > 0) {
            // comment from here
            // autofillNodes = [];
            // if (signInBtn !== null) {
            //   signInBtn = null;
            // }
            // if (ctaElement !== null) {
            //   document.body.removeChild(ctaElement);
            //   ctaElement = null;
            // }
            // comment till here
            let necessary = determineIfAutofillNecessary();

            if (necessary) {
              chrome.runtime
                .sendMessage({ action: "loginInfo" })
                .then((res) => {
                  if (res.isLoggedIn) {
                    isLoggedIn = res.isLoggedIn;
                    userInfo = res.userInfo;
                    actOnWebpage();
                  } else {
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              console.log("Autofill not necessary");
            }
          }
        }
      });
    }
  }
}

const observer = new MutationObserver(onDOMUpdate);

const observerConfig = { childList: true, subtree: true };

observer.observe(document.body, observerConfig);

window.setTimeout(() => {
  let necessary = determineIfAutofillNecessary();
  if (necessary) {
    chrome.runtime
      .sendMessage({ action: "loginInfo" })
      .then((res) => {
        if (res.isLoggedIn) {
          isLoggedIn = res.isLoggedIn;
          userInfo = res.userInfo;
          actOnWebpage();
        } else {
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("Autofill not necessary");
  }
}, 1500);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "userHasLoggedIn") {
    autofillNodes = [];
    ctaElement = null;
    signInBtn = null;
    initialURL = window.location.href;
    urlToSave = initialURL;
    necessary = determineIfAutofillNecessary();
    if (necessary) {
      isLoggedIn = request.isLoggedIn;
      userInfo = request.userInfo;
      console.log("UserInfo", userInfo);

      actOnWebpage();
    } else {
      console.log("Autofill not necessary");
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "logout") {
    autofillNodes = [];
    ctaElement = null;
    signInBtn = null;
    initialURL = window.location.href;
    urlToSave = initialURL;
    isLoggedIn = null;
    userInfo = null;
  }
});
