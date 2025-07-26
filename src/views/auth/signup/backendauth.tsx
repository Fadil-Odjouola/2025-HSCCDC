import deriveKeyWithSalt from "@/utility/passhash";

interface FormData {
  email: string;
  username: string;
  password: string;
}

interface ApiResponse {
  message: string;
  [key: string]: any;
}

export async function handleSubmit(
  form: FormData,
  responseMSg: (msg: string) => void,
  apikey: string
): Promise<void> {

  try {
    const { key, salt } = await deriveKeyWithSalt(form.password);

    const payload = {
      email: form.email,
      username: form.username,
      key: key,   // derived key
      salt: salt, // base64 encoded salt
    };

    const response = await fetch("https://qoverflow.api.hscc.bdpa.org/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apikey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse = await response.json();

    if (response.ok) {
      responseMSg("✅ User created successfully!");
      
    } else {
      responseMSg(`❌ Error: ${result.error || "Unknown error"}`);
      return 
    }
  } catch (error) {
    console.error(error);
    responseMSg("❌ Error creating user.");
  }
}



export async function getuserobj(
  form: string,
  apikey: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://qoverflow.api.hscc.bdpa.org/v1/users/${form}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
  }
}
{/*{answers && answers.length > 0 ? (
            answers.map((answer: any) => (
              <div
                key={answer.answer_id}
                className="border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-around items-centertext-sm text-gray-500 w-[800px] h-max border-2 border-green-500 flex-col">
                  <div className="flex items-center gap-2 flex-row justify-between border-4 border-red-600">
                    <img
                      src={answer.creator}
                      alt={answer.creator}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="border-2 flex w-[max">
                      {answer.creator}:
                    </span>
                    <div>
                      {dayjs(answer.createdAt).format("M/D/YYYY")} -{" "}
                      {dayjs(answer.createdAt).fromNow()} | Points:{" "}
                      {answer.points}
                    </div>
                  </div>
                  <div className="w-full max-w-[600px] break-words whitespace-pre-wrap h-max overflow- border-4">
                    <MarkdownRenderer body={answer.text} />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {/*answer.comments.map((c: any) => (
                    <div key={c.id} className="text-sm bg-gray-100 p-1 rounded">
                      <strong>{c.author.username}:</strong> {c.content}
                    </div>
                  ))
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400">
              <p className="text-lg font-semibold">
                No answers created yet for this question.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Be the first to share your knowledge!
              </p>
            </div>
          )} */}
export async function login(
  password: string,
  username: string,
  apikey: string,
  salt: string,
  loginstatus: (msg: boolean) => void,

): Promise<any> {

  try {
    const key = await deriveKeyWithSalt(password, salt);

    const payload = {
      key: key.key, // derived login key
    };

    const response = await fetch(
      `https://qoverflow.api.hscc.bdpa.org/v1/users/${username}/auth`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("GREAT, you are logged in");
      loginstatus(true)
      return result;
    }
  } catch (error) {
    console.error(error);
    loginstatus(false)

  }
}
