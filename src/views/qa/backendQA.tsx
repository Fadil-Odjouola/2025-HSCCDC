export async function getQAquestion(
  questionsID: string | undefined,
  apikey: string
) {
  try {
    const response = await fetch(
      `
https://qoverflow.api.hscc.bdpa.org/v1/questions/${questionsID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result: any = await response.json();

    if (result.success) {
      console.log("you got all of your questions");
      return result;
    } else {
      console.log(`ERROR: ${result.error}`);
      return result;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getQAanswers(
  questionsID: string | undefined,
  apikey: string
) {
  try {
    const response = await fetch(
      `
https://qoverflow.api.hscc.bdpa.org/v1/questions/${questionsID}/answers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result: any = await response.json();
    console.log(result);

    if (result.success) {
      console.log("you got all of your questions");
      return result;
    } else {
      console.log(`ERROR: ${result.error}`);
      return result;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getQAcomments(
  questionsID: string | undefined,
  apikey: string
) {
  try {
    const response = await fetch(
      `
https://qoverflow.api.hscc.bdpa.org/v1/questions/${questionsID}/comments`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result: any = await response.json();
    console.log(result);

    if (result.success) {
      console.log("you got all of your questions");
      return result;
    } else {
      console.log(`ERROR: ${result.error}`);
      return result;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function createAnswer(
  questionsID: string | undefined,
  creator: string,
  text: string,
  apikey: string
) {
  const payload = {
    creator: creator,
    text: text,
  };
  try {
    const response = await fetch(
      `
https://qoverflow.api.hscc.bdpa.org/v1/questions/${questionsID}/answers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result: any = await response.json();
    console.log(result);

    if (result.success) {
      console.log("you successfully created an answer");
      return result;
    } else {
      console.log(`ERROR: ${result.error}`);
      return result;
    }
  } catch (err) {
    console.log(err);
  }
}
