import SignUpForm from "@/components/SignUpForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="
            flex flex-col items-center justify-center 
            bg-background
            container mx-auto px-4 mt-25
            "
        >
            <div className={"items-center w-75"}>
                <SignUpForm/> 
            </div>
            <div className={"flex items-center gap-4 justify-center mt-3"}> 
                <p className={"text-sm leading-none m-0"}>Already have an account?</p>
                <Button variant={"outline"} className="">
                    <Link
                        href="/sign_in_sign_up/sign-in"
                        className="
                                flex              
                                items-center       
                                justify-center     
                                h-full            
                                aspect-square      
                                p-0               
                                rounded-none     
                        "
                    >
                        Sign In Here
                    </Link>
                </Button>
            </div>
        </div>
    );
}