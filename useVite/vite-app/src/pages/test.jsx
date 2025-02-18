import React from "react";

const Test = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-gray-900 text-white">
      {/* Login Section */}
      <section className="flex w-[30rem] flex-col space-y-10">
        {/* Heading */}
        <div className="text-center text-4xl font-medium">Log In</div>

        {/* Email or Username Input */}
        <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
          <input
            type="text"
            placeholder="Email or Username"
            className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
          />
        </div>

        {/* Password Input */}
        <div className="w-full transform border-b-2 bg-transparent text-lg duration-300 focus-within:border-indigo-500">
          <input
            type="password"
            placeholder="Password"
            className="w-full border-none bg-transparent outline-none placeholder:italic focus:outline-none"
          />
        </div>

        {/* Login Button */}
        <button className="transform rounded-sm bg-indigo-600 py-2 font-bold duration-300 hover:bg-indigo-400">
          LOG IN
        </button>

        {/* Forgot Password Link */}
        <a
          href="#"
          className="transform text-center font-semibold text-gray-500 duration-300 hover:text-gray-300"
        >
          FORGOT PASSWORD?
        </a>

        {/* Sign Up Link */}
        <p className="text-center text-lg">
          No account?{" "}
          <a
            href="#"
            className="font-medium text-indigo-500 underline-offset-4 hover:underline"
          >
            Create One
          </a>
        </p>
      </section>
    </main>
  );
};

export default Test;
