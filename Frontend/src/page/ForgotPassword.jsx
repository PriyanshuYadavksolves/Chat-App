import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";


const ForgotPassword = () => {
    const [falt,setFalt] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const onSubmit = async(data) =>{
    console.log(data.email)
    try {
      setFalt('')
        const res = await axios.post("http://localhost:3000/api/forgot-password",{data})
        console.log(res.data)
        toast.success("Email Sent")
    } catch (error) {
        console.log(error)
        setFalt(error.response.data.message)
    }
  }

  return (
    <>
      <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col gap-y-5 px-20 py-10 mx-auto border-solid border-2 border-black-500 rounded-2xl ">
          <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
            Forgot your password?
          </h1>
          <p className="font-light ">
            Don't fret! Just type in your email and we will send you a code to
            reset your password!
          </p>

          <form
            className=" flex flex-col gap-y-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label htmlFor="email" className="block mb-2 text-sm font-medium  ">
              Your email
            </label>
            <input
              className="border-2 rounded-md  p-1 text-sm text-blue-900 placeholder:text-xs"
              type="email"
              name="Email"
              id="Email"
              placeholder="name@company.com"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            {falt && <p className="text-red-500 text-xl text-center">{falt}</p>}

            <input
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 my-3 text-sm font-semibold  text-white hover:bg-indigo-800 hover:cursor-pointer"
            />
          </form>
        </div>
      </main>
    </>
  );
};

export default ForgotPassword;
