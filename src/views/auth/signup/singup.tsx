import { useState, useEffect } from "react";
import { handleSubmit, getuserobj, login } from "./backendauth";
import deriveKeyWithSalt from "@/utility/passhash";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [user, setUser] = useState({
    username: "",
    email: "",
    salt: "",
    password: "",
    key: "",
    answers: 0,
    points: 0,
    questions: 0,
  });
  const [responsemsg, SetResponseMessage] = useState<String>("");
  const [loginstatus, setLoginStatus] = useState<boolean | null>(null);
  const [rememberme, Setrememberme] = useState<boolean | null>(null);
  const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleChange2 = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    handleSubmit(e, form, SetResponseMessage, apikey);
  };
  const getuserinfo = async (username: string, password: string) => {
    const data = await getuserobj(username, apikey);
    const salt = data.user.salt;
    const key = await deriveKeyWithSalt(password, salt);
    const newUser = {
      username: data.user.username,
      email: data.user.email,
      password: password,
      salt: salt,
      key: key.key,
      answers: data.user.answers,
      points: data.user.points,
      questions: data.user.questions,
    };
    setUser(newUser);
    return newUser;
  };

  const loginfnc = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = await getuserinfo(user.username, user.password);
    const status = await login(
      newUser.password,
      newUser.username,
      apikey,
      newUser.salt,
      setLoginStatus
    );
    if (status.success) {
      console.log("you are logged in");
      if (rememberme) {
        sessionStorage.setItem("User_logged", JSON.stringify(newUser));
      } else {
        localStorage.setItem("User_logged", JSON.stringify(newUser));
      }
      window.location.href = "/";
    } else {
      console.log("error");
    }
  };

  return (
    <>
      <div className="w-screen h-screen  flex justify-around items-center flex-row">
        <div className="flex flex-col items-center justify-around p-3 w-max h-max  gap-5 ">
          {" "}
          {/* parent container */}
          <div className="flex   ">
            {" "}
            {/* left side*/}
            <div>
              <h1 className=" md:text-4xl font-extrabold text-gray-900 text-center tracking-tight">
                <span className="text-[#7C3CED] text-[40px]">
                  {" "}
                  Create your account{" "}
                </span>{" "}
                <br />
                <p className="text-[5000px] md:text-lg text-black text-center tracking-normal">
                  Join us and unlock exclusive features!
                </p>
              </h1>
            </div>
          </div>
          <div className="flex flex-col ">
            {" "}
            {/* right side */}
            <form
              onSubmit={onFormSubmit}
              className="flex flex-col items-center justify-center"
            >
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={form.username}
                className=" transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 pt-3 pb-3 "
                onChange={handleChange}
                required
              />{" "}
              <br />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={form.email}
                className="transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 pt-3 pb-3"
                onChange={handleChange}
                required
              />
              <br />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={form.password}
                className="transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 pt-3 pb-3"
                onChange={handleChange}
                required
              />
              <br />
              <div>
                <button
                  type="submit"
                  className="bg-[#4C1D95] hover:bg-[#6728c7] text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-linear focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-[19px]"
                >
                  Create an account
                </button>
              </div>
            </form>
            <div>
              {responsemsg == "✅ User created successfully!" ? (
                responsemsg && (
                  <div className="mt-4 px-4 py-2 rounded-lg bg-green-50 border border-green-400 text-green-700 text-center shadow transition-all duration-300">
                    <span className="font-semibold">Success:</span>{" "}
                    {responsemsg}
                    <br />
                    <span className="font-semibold">
                      Please Log in with your credintials in the login section
                    </span>
                  </div>
                )
              ) : responsemsg == "" ? null : (
                <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 border border-red-400 text-red-700 text-center shadow transition-all duration-300">
                  <span className="font-semibold"></span> {responsemsg}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[2px] h-[80vh] bg-black mx-0" />
        <div className="flex flex-col items-center justify-around p-3 w-max h-max  gap-5 ">
          {" "}
          {/* parent container */}
          <div className="flex   ">
            {" "}
            {/* left side*/}
            <div>
              <h1 className=" md:text-4xl font-extrabold text-gray-900 text-center tracking-tight">
                <span className="text-[#7C3CED] text-[40px]">
                  {" "}
                  Already got an account with us!
                </span>{" "}
                <br />
                <p className="text-[5000px] md:text-lg text-black text-center tracking-normal">
                  Welcome back!
                </p>
              </h1>
            </div>
          </div>
          <div className="flex flex-col ">
            {" "}
            {/* right side */}
            <form
              onSubmit={loginfnc}
              className="flex flex-col items-center justify-center"
            >
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={user.username}
                className=" transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 pt-3 pb-3 "
                onChange={handleChange2}
                required
              />{" "}
              <br />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}
                className="transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 pt-3 pb-3"
                onChange={handleChange2}
                required
              />
              <br />
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => Setrememberme(!rememberme)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${
                    rememberme ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                      rememberme ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-gray-700 font-medium">Remember Me</span>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-[#4C1D95] hover:bg-[#6728c7] text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-linear focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-[19px]"
                  onClick={() => {
                    console.log(loginstatus);
                  }}
                >
                  Login
                </button>
              </div>
            </form>
            <div>
              {loginstatus ? (
                <div className="mt-4 px-4 py-2 rounded-lg bg-green-50 border border-green-400 text-green-700 text-center shadow transition-all duration-300">
                  <span className="font-semibold">
                    Great, you are logged in
                  </span>
                </div>
              ) : loginstatus === false ? (
                <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 border border-red-400 text-red-700 text-center shadow transition-all duration-300">
                  <span className="font-semibold">Error</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>{" "}
      </div>
    </>
  );
}
