import cloneDeep from "lodash.clonedeep";

export const buildIndex = (state) => {
  let retrunRestult = [];
  state.Survey.children?.forEach((group) => {
    retrunRestult.push(group.code);
    let groupObj = state[group.code];
    if (groupObj.children && !groupObj.collapsed) {
      groupObj.children.forEach((question) => {
        if (question?.code) {
          retrunRestult.push(question.code);
        }
      });
    }
  });
  return retrunRestult;
};

export const buildCodeIndex = (state) => {
  let retrunRestult = {};
  let groupCount = 0;
  let questionCount = 0;
  state.Survey.children?.forEach((group) => {
    groupCount++;
    retrunRestult[group.code] = "P" + groupCount;
    let groupObj = state[group.code];
    if (groupObj.children) {
      groupObj.children.forEach((question) => {
        questionCount++;
        retrunRestult[question.code] = "Q" + questionCount;
        let questionObj = state[question.code];
        if (questionObj.children) {
          questionObj.children.forEach((answer) => {
            retrunRestult[answer.qualifiedCode] =
              "Q" + questionCount + answer.code;
          });
        }
      });
    }
  });
  return retrunRestult;
};

export const splitQuestionCodes = (code) => {
  return code.split(/(A[a-z_0-9]+|Q[a-z_0-9]+)/).filter(Boolean);
};

export const mapCodeToUserFriendlyOrder = (code, index) => {
  let newCode = cloneDeep(code);
  // Pattern for G followed by alphanumeric characters
  const gPattern = /G[a-zA-Z0-9]+/g;

  // Pattern for Q followed by alphanumeric characters
  const qPattern = /Q[a-zA-Z0-9]+/g;

  // Find all G matches
  const gMatches = code.match(gPattern);
  if (gMatches) {
    gMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }

  // Find all Q matches
  const qMatches = code.match(qPattern);
  if (qMatches) {
    qMatches.forEach((match) => {
      newCode = newCode.replace(match, index[match]);
    });
  }
  // Return counts for reference
  return newCode;
};
