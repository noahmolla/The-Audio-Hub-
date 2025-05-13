"use client"

import VerifyUserForm from "@/components/VerifyUserForm";

function ForgotPasswordPage() {
  return (
    <div className="
    flex flex-col items-center justify-center 
    bg-background
    container mx-auto px-4 mt-25
    "
    >
      <div className={"items-center w-75"}>
        <VerifyUserForm />
      </div>

    </div>
  );
}

export default ForgotPasswordPage;