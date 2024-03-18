import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios'
import {jwtDecode} from 'jwt-decode';

import { toast } from "react-toastify";

const ResetPassword = () => {
        const {
          register,
          handleSubmit,
          reset,
          formState: { errors },
        } = useForm();
        const onSubmit = async(data) => {
            try {
              // console.log(data);
              const res = await axios.post('http://localhost:3000/api/login',{
                data
              })
              console.log(res.data.verificationToken)
              const token = res.data.verificationToken
              const decodedToken = jwtDecode(token);
              console.log(decodedToken)
        
            //   toast.success("Email Sent Successfully")
              reset()
            } catch (error) {
              console.log(error)
            }
          };
  return (
    <>
    <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col gap-y-5 px-20 py-10 border-solid border-2 border-black-500 rounded-2xl ">
          <p className="text-center text-2xl font-bold  ">Reset Password</p>

          <form
            className="flex flex-col gap-y-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            
            <label htmlFor="Password" className="text-sm">
              Password
            </label>
              
            <input
              className="border-2 rounded-md p-1 text-sm text-blue-900 placeholder:text-xs "
              type="password"
              name="Password"
              id="Password"
              placeholder="Enter your passwoord"
              {...register("password", {
                required:"Password is required",
                minLength: {
                  value: 5,
                  message: "Password should be at-least 5 characters",
                },
              })}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}


            <input
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 my-3 text-sm font-semibold  text-white hover:bg-indigo-800 hover:cursor-pointer"
            />
          </form>

        </div>
      </main>
      
    </>
  )
}

export default ResetPassword
