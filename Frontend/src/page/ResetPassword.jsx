import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios'
import {jwtDecode} from 'jwt-decode';

import { toast } from "react-toastify";

const ResetPassword = () => {
  const params = useLocation()
  const token = params.pathname.split('/')[2]
  const navigate = useNavigate()
  const [falt,setFalt] = useState()

        const {
          register,
          handleSubmit,
          reset,
          formState: { errors },
        } = useForm();
        const onSubmit = async(data) => {
            try {
              // console.log(data);
              const res = await axios.patch('http://localhost:3000/api/reset-password/'+token,{
                data
              })
              console.log(res.data)


              toast.success("Password Reset Successfully")
              reset()
              navigate('/login')
            
            } catch (error) {
              console.log(error)
              setFalt(error.response.data.message)
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
            <label htmlFor="Otp">OTP</label>
            <input
              className="border-2 rounded-md p-1 text-sm text-blue-900 placeholder:text-xs "
              type="text"
              name="Otp"
              id="Otp"
              placeholder="Enter OTP "
              {...register("otp", {
                required:"OTP is required",
                minLength: {
                  value: 6,
                  message: "OTP should be of 6 characters",
                },
              })}
            />
            {errors.otp && <p className="text-red-500 text-xs text-center">{errors.otp.message}</p>}
            
            <label htmlFor="Password" className="text-sm">
              New Password
            </label>
              
            <input
              className="border-2 rounded-md p-1 text-sm text-blue-900 placeholder:text-xs "
              type="password"
              name="Password"
              id="Password"
              placeholder="Enter your new password"
              {...register("password", {
                required:"Password is required",
                minLength: {
                  value: 5,
                  message: "Password should be at-least 5 characters",
                },
              })}
            />
            {errors.password && <p className="text-red-500 text-xs text-center">{errors.password.message}</p>}
            {falt && <p className="text-red-500 text-md text-center">{falt}</p> }


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
