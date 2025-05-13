import SignInForm from "@/components/SignInForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div
      className="
            flex flex-col items-center justify-center 
            bg-background
            container mx-auto px-4 mt-25
            "
    >
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <Link href="/" className="flex flex-col items-center gap-4">
          <Image
            src="/logoAudioHub.png"
            alt="Audio Hub Logo"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Welcome to The Audio Hub
          </h1>
        </Link>
        <p className="text-lg text-muted-foreground mt-2">
          Paste, manage, and play your audio file paths in one place.
        </p>
      </div>

      {/* Sign-In Form */}
      <div className={"items-center w-75"}>
        <SignInForm />
      </div>

      {/* Sign-Up Redirect */}
      <div className={"flex items-center gap-4 justify-center mt-3"}>
        <Link
          href="/forgot_password/verify-user"
          className="text-sm leading-none m-0 text-blue-500"
        >
          Forgot Password?
        </Link>
      </div>
      <div className={"flex items-center gap-4 justify-center mt-3"}>
        <p className={"text-sm leading-none m-0"}>New to The Audio Hub?</p>
        <Button variant={"outline"} className="">
          <Link
            href="/sign_in_sign_up/sign-up"
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
            Sign Up
          </Link>
        </Button>
      </div>

    </div>
  );
}