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
