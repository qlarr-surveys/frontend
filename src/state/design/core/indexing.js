export const buildIndex = (state) => {
  let result = [];
  state.Survey.children?.forEach((group) => {
    result.push(group.code);
    let groupObj = state[group.code];
    if (groupObj.children && !groupObj.collapsed) {
      groupObj.children.forEach((question) => {
        if (question?.code) {
          result.push(question.code);
        }
      });
    }
  });
  return result;
};


export const buildCodeIndex = (state) => {
  let result = {};
  let groupCount = 0;
  let questionCount = 0;
  state.Survey.children?.forEach((group) => {
    groupCount++;
    result[group.code] = "P" + groupCount;
    let groupObj = state[group.code];
    if (groupObj.children) {
      groupObj.children.forEach((question) => {
        questionCount++;
        result[question.code] = "Q" + questionCount;
        let questionObj = state[question.code];
        if (questionObj.children) {
          questionObj.children.forEach((answer) => {
            result[answer.qualifiedCode] =
              "Q" + questionCount + answer.code;
          });
        }
      });
    }
  });
  return result;
};

export const splitQuestionCodes = (code) => {
  return code.split(/(A[a-z_0-9]+|Q[a-z_0-9]+)/).filter(Boolean);
};

export const mapCodeToUserFriendlyOrder = (code, index) => {
  let newCode = code;
  const gPattern = /G[a-zA-Z0-9]+/g;
  const qPattern = /Q[a-zA-Z0-9]+/g;

  const gMatches = code.match(gPattern);
  if (gMatches) {
    gMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }

  const qMatches = code.match(qPattern);
  if (qMatches) {
    qMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }
  return newCode;
};
