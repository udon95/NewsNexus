import React, { useState } from "react";
import { EyeOff, Eye } from "lucide-react";

const PasswordInput = ({ value, onChange, className = "", name, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${className} focus-border-2  focus-within:border-black focus-within:ring-2  rounded-lg`} {...props}>
      
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        className="pr-10 outline-none border-0 "
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
};

export default PasswordInput;
