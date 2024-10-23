importScripts("../libs/axios.min.js");
importScripts("./rsa-encrypt.js");
// import axios from "../libs/axios.min.js";
// import encrypt from "./rsa-encrypt.js";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.headers.post["Content-Type"] = "application/json";

let isLoggedIn = false;
let userInfo = null;
let publicKey = null;

const getIsLoggedIn = () => {
  chrome.storage.local.get(["isLoggedIn"]).then((res) => {
    if (res.isLoggedIn === undefined) {
      chrome.storage.local.set({ isLoggedIn: false }).then(() => {});
    } else {
      isLoggedIn = res.isLoggedIn;
    }
  });
};
const getUserInfo = () => {
  chrome.storage.local.get(["userInfo"]).then((res) => {
    if (res.userInfo === undefined) {
      chrome.storage.local.set({ userInfo: null }).then(() => {});
    } else {
      userInfo = res.userInfo;
    }
  });
};
const getPublicKey = () => {
  chrome.storage.local.get(["publicKey"]).then((res) => {
    if (res.publicKey === undefined) {
      chrome.storage.local.set({ publicKey: null }).then(() => {});
    } else {
      publicKey = res.publicKey;
    }
  });
};

getIsLoggedIn();
getUserInfo();
getPublicKey();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "login") {
    axios
      .post("login", { queryFace: request.faceData })
      .then(async (res) => {
        userInfo = res.data.userInfo;
        publicKey = res.data.publicKey;
        chrome.storage.local
          .set({ userInfo: res.data.userInfo, publicKey: res.data.publicKey })
          .then(async () => {
            getUserInfo();
            if (userInfo.uname !== "No match") {
              chrome.storage.local.set({ isLoggedIn: true }).then(async () => {
                isLoggedIn = true;
                getIsLoggedIn();
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                  chrome.tabs
                    .sendMessage(tab.id, {
                      action: "userHasLoggedIn",
                      isLoggedIn: isLoggedIn,
                      userInfo: userInfo,
                    })
                    .then((res) => {})
                    .catch((err) => {
                      console.log(err);
                    });
                }
              });
            }
            sendResponse({ loginResponse: userInfo.uname });
          });
      })
      .catch((err) => {
        console.log(err);
      });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "loginState") {
    chrome.storage.local.get(["isLoggedIn", "userInfo"]).then((res) => {
      userInfo = res.userInfo === undefined ? null : res.userInfo;
      isLoggedIn = res.isLoggedIn === undefined ? false : res.isLoggedIn;
      var uname = null;
      if (
        userInfo !== null &&
        userInfo !== undefined &&
        userInfo.uname !== "No match" &&
        isLoggedIn
      ) {
        uname = userInfo.uname;
      }
      sendResponse({ loginState: isLoggedIn, uname: uname });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "loggedInUname") {
    chrome.storage.local.get("userInfo").then((res) => {
      userInfo = res.userInfo;
      let unameRes = userInfo == null ? userInfo : userInfo.uname;
      sendResponse({ loggedInUname: unameRes });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "allCredentials") {
    chrome.storage.local.get("userInfo").then((res) => {
      userInfo = res.userInfo;
      let allCredentials = [];
      if (
        userInfo !== null &&
        userInfo.credentials !== null &&
        userInfo.credentials.length > 0
      ) {
        allCredentials = userInfo.credentials;
      }
      sendResponse({ allCredentials: allCredentials });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "register") {
    axios
      .post("register", request.postData)
      .then((res) => {
        sendResponse({ msg: res.data.msg });
      })
      .catch((err) => {
        console.log(err);
      });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "loginInfo") {
    chrome.storage.local.get(["isLoggedIn", "userInfo"]).then((res) => {
      userInfo = res.userInfo;
      isLoggedIn = res.isLoggedIn;
      sendResponse({ isLoggedIn: isLoggedIn, userInfo: userInfo });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "save credential") {
    if (publicKey == null) {
      axios
        .get("key")
        .then((res) => {
          chrome.storage.local
            .set({ publicKey: res.data.publicKey })
            .then(() => {
              publicKey = res.data.publicKey;
              getPublicKey();
              let credData = request.credential;
              let credDataProperties = Object.keys(credData);
              let encryptedCredData = {};
              for (const key of credDataProperties) {
                if (key == "url") {
                  let encryptedURL = encrypt(publicKey, credData[key]);
                  encryptedCredData.url = encryptedURL;
                } else if (key == "fields") {
                  encryptedCredData.fields = [];
                  for (let field of credData[key]) {
                    let encryptedFieldObj = {};
                    let fieldKeys = Object.keys(field);
                    for (let fieldKey of fieldKeys) {
                      let encryptedFieldKey = encrypt(publicKey, fieldKey);
                      encryptedFieldObj[encryptedFieldKey] = encrypt(
                        publicKey,
                        field[fieldKey]
                      );
                    }
                    encryptedCredData.fields.push(encryptedFieldObj);
                  }
                }
              }
              axios
                .put("credential", {
                  user: request.user,
                  credData: encryptedCredData,
                })
                .then(async (res) => {
                  chrome.storage.local
                    .set({ userInfo: res.data.userInfo })
                    .then(() => {
                      userInfo = res.data.userInfo;
                      getUserInfo();
                      chrome.storage.local
                        .set({ isLoggedIn: true })
                        .then(async () => {
                          isLoggedIn = true;
                          getIsLoggedIn();
                          const tabs = await chrome.tabs.query({});
                          for (const tab of tabs) {
                            chrome.tabs
                              .sendMessage(tab.id, {
                                action: "userHasLoggedIn",
                                isLoggedIn: isLoggedIn,
                                userInfo: userInfo,
                              })
                              .then((res) => {})
                              .catch((err) => {
                                console.log(err);
                              });
                          }
                        });
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let credData = request.credential;
      let credDataProperties = Object.keys(credData);
      let encryptedCredData = {};
      for (const key of credDataProperties) {
        if (key == "url") {
          let encryptedURL = encrypt(publicKey, credData[key]);
          encryptedCredData.url = encryptedURL;
        } else if (key == "fields") {
          encryptedCredData.fields = [];
          for (let field of credData[key]) {
            let encryptedFieldObj = {};
            let fieldKeys = Object.keys(field);
            for (let fieldKey of fieldKeys) {
              let encryptedFieldKey = encrypt(publicKey, fieldKey);
              encryptedFieldObj[encryptedFieldKey] = encrypt(
                publicKey,
                field[fieldKey]
              );
            }
            encryptedCredData.fields.push(encryptedFieldObj);
          }
        }
      }
      axios
        .put("credential", {
          user: request.user,
          credData: encryptedCredData,
        })
        .then(async (res) => {
          chrome.storage.local.set({ userInfo: res.data.userInfo }).then(() => {
            userInfo = res.data.userInfo;
            getUserInfo();
            chrome.storage.local.set({ isLogged: true }).then(async () => {
              isLoggedIn = true;
              getIsLoggedIn();
              const tabs = await chrome.tabs.query({});
              for (const tab of tabs) {
                chrome.tabs
                  .sendMessage(tab.id, {
                    action: "userHasLoggedIn",
                    isLoggedIn: isLoggedIn,
                    userInfo: userInfo,
                  })
                  .then((res) => {})
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "deleteCreds") {
    if (publicKey == null) {
      axios
        .get("key")
        .then((res) => {
          chrome.storage.local
            .set({ publicKey: res.data.publicKey })
            .then(() => {
              publicKey = res.data.publicKey;
              getPublicKey();
              let encryptedURL = encrypt(publicKey, request.url);
              let encryptedUser = encrypt(publicKey, userInfo.uname);
              axios
                .delete("credential", {
                  data: { user: encryptedUser, url: encryptedURL },
                })
                .then((res) => {
                  chrome.storage.local
                    .set({ userInfo: res.data.userInfo })
                    .then(() => {
                      userInfo = res.data.userInfo;
                      getUserInfo();
                      sendResponse({ credentials: userInfo.credentials });
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let encryptedURL = encrypt(publicKey, request.url);
      let encryptedUser = encrypt(publicKey, userInfo.uname);
      axios
        .delete("credential", {
          data: { user: encryptedUser, url: encryptedURL },
        })
        .then((res) => {
          chrome.storage.local.set({ userInfo: res.data.userInfo }).then(() => {
            userInfo = res.data.userInfo;
            getUserInfo();
            sendResponse({ credentials: userInfo.credentials });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "updatePic") {
    chrome.storage.local.get(["userInfo", "publicKey"]).then((res) => {
      console.log("Storage get data:", res.userInfo, res.publicKey);

      publicKey = res.publicKey;
      const user = encrypt(publicKey, res.userInfo.uname);
      axios
        .put("account", { user: user, newFaceData: request.newFaceData })
        .then((res) => {
          chrome.storage.local
            .set({ userInfo: res.data.userInfo })
            .then(async () => {
              userInfo = res.data.userInfo;
              getUserInfo();
              const tabs = await chrome.tabs.query({});
              for (const tab of tabs) {
                chrome.tabs
                  .sendMessage(tab.id, {
                    action: "userHasLoggedIn",
                    isLoggedIn: isLoggedIn,
                    userInfo: userInfo,
                  })
                  .then((res) => {})
                  .catch((err) => {
                    console.log(err);
                  });
              }
              sendResponse({ updated: true });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "deleteAcc") {
    chrome.storage.local.get(["userInfo", "publicKey"]).then((res) => {
      publicKey = res.publicKey;
      let user = encrypt(publicKey, res.userInfo.uname);
      axios
        .delete("account", {
          data: { user: user },
        })
        .then((res) => {
          if (res.data.deleted == true) {
            chrome.storage.local.remove(
              ["isLoggedIn", "userInfo", "publicKey"],
              async () => {
                isLoggedIn = false;
                userInfo = null;
                publicKey = null;
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                  chrome.tabs
                    .sendMessage(tab.id, {
                      action: "logout",
                    })
                    .then((res) => {})
                    .catch((err) => {
                      console.log(err);
                    });
                }
                sendResponse({ deleted: true });
              }
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "logout") {
    chrome.storage.local.remove(
      ["isLoggedIn", "userInfo", "publicKey"],
      async () => {
        isLoggedIn = false;
        userInfo = null;
        publicKey = null;
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "logout",
            })
            .then((res) => {})
            .catch((err) => {
              console.log(err);
            });
        }
        sendResponse({ loggedOut: true });
      }
    );
    return true;
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove(["isLoggedIn", "userInfo", "publicKey"], () => {
    console.log("Cleared data on last tab close.");
  });
});
