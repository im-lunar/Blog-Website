import type{ SignupInput } from "@im-lunar/medium-common";
import { useState, type ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({type}: {type: "signup" | "signin"}) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: ""
    });

    async function sendRequest() {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup": "signin"}`, postInputs);
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blogs");
        } catch(e) {

        }
    }

    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div className="w-full max-w-md px-4">
                <div className="text-center font-extrabold text-3xl">
                    {type === "signup" ? "Create Account" : "Sign in"}
                </div>
                <div className="text-center mt-2 text-slate-400">
                    {type === "signup" ? "Already have an account?" : "Don't have an account?"}
                    <Link to={type === "signup" ? "/signin" : "/signup"} className="pl-2 underline">{type === "signup" ? "Login" : "Signup"}</Link>
                </div>

                <div className="mt-4">
                    {type === "signup" && <LabelledInput label="Name" placeholder="John Snow" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} />}
                    <LabelledInput label="Email" placeholder="m@example.com" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            email: e.target.value
                        })
                    }} />
                    <LabelledInput label="Password" placeholder="*******" type={"password"} onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            password: e.target.value
                        })
                    }} />

                    <button onClick={sendRequest} type="button" className="mt-6 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">
                        {type === "signup" ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    </div>
}

interface LabelledInputType {
    label: string,
    placeholder: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    type?: string
}

function LabelledInput ({ label, placeholder, onChange, type }: LabelledInputType) {
    return <div className="mt-4">
        <label className="block mb-2.5 text-sm font-bold">{label}</label>
        <input onChange={onChange} type={type || "text"} className="border border-slate-400 rounded-lg text-sm w-full px-3 py-2.5 focus:ring-2 focus:ring-gray-400 focus:outline-none" placeholder={placeholder} required />
    </div>
}